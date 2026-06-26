import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/validateOrigin'
import { requireSpotifyAuth } from '@/lib/auth'
import { claudeRatelimit } from '@/lib/ratelimit'
import type { TopArtist, TopTrack } from '@/types'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are a witty, sharp music critic who analyzes someone's Spotify listening history and delivers a personal taste report.

You must respond with ONLY a valid JSON object — no markdown, no explanation.

Return exactly this shape:
{
  "verdict": "string — 2-3 sentences, the opening statement. Specific, personal, references their actual artists. Max 60 words.",
  "signature_vibe": ["tag1", "tag2", "tag3", "tag4"],
  "what_this_says": "string — 2-3 sentences about their personality based on their music. Reference specific artists by name.",
  "guilty_pleasures": "string — 1-2 sentences about surprising or contradictory patterns in their taste. If no guilty pleasures detected, invent a plausible one based on their genres.",
  "redeeming_qualities": "string — 1-2 sentences of genuine compliments. Be specific."
}

signature_vibe: exactly 4 short tags (2-4 words each) that capture their musical personality.

TONE RULES:
- If tone is "roast": be savage, specific, and funny. Call out patterns ruthlessly.
  Still accurate, never mean-spirited about the person — only about their taste.
  Example verdict: "You've listened to Sufjan Stevens so many times Spotify has started suggesting grief counselors. You describe your personality as 'I feel things deeply' and you are not wrong, unfortunately."

- If tone is "nice": be warm, genuine, and complimentary. Find the best interpretation of every pattern. Still specific and interesting — not generic praise.
  Example verdict: "Your taste is the musical equivalent of a well-worn journal — intimate, considered, and quietly brilliant. You listen to full albums. This alone puts you in rare company."

RULES:
- Always reference specific artist names from their data
- Never be generic ("you like indie music") — always specific ("you have listened to Bon Iver's Holocene enough times to have it memorized")
- signature_vibe tags should be witty, not bland
  Good: "Cries in indie", "Emotionally unavailable", "Full album listener"
  Bad: "Music lover", "Indie fan", "Emotional"
- guilty_pleasures must reference something real or plausible from their data
- Keep verdict under 60 words — punchy, not rambling`

export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  console.log('[TasteJudge] cookies:', request.headers.get('cookie')?.slice(0, 100))

  const authResult = await requireSpotifyAuth(request)
  console.log('[TasteJudge] auth result:', authResult instanceof NextResponse ? 'unauthorized' : 'ok')
  if (authResult instanceof NextResponse) return authResult

  if (claudeRatelimit) {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0].trim() ?? 'unknown'
    const { success, limit, reset, remaining } = await claudeRatelimit.limit(ip)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests — try again in a few minutes', limit, reset, remaining },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      )
    }
  }

  try {
    const body = await request.json()
    const { artists, tracks, tone } = body

    if (!Array.isArray(artists) || artists.length < 1 || artists.length > 10) {
      return NextResponse.json({ error: 'Invalid artists data' }, { status: 400 })
    }
    if (!Array.isArray(tracks) || tracks.length < 1 || tracks.length > 10) {
      return NextResponse.json({ error: 'Invalid tracks data' }, { status: 400 })
    }
    if (tone !== 'roast' && tone !== 'nice') {
      return NextResponse.json({ error: 'Invalid tone' }, { status: 400 })
    }

    const artistLines = (artists as TopArtist[])
      .map((a, i) => `${i + 1}. ${a.name} (genres: ${a.genres.slice(0, 2).join(', ')}, popularity: ${a.popularity})`)
      .join('\n')

    const trackLines = (tracks as TopTrack[])
      .map((t, i) => `${i + 1}. ${t.name} by ${t.artists.map((a) => a.name).join(', ')}`)
      .join('\n')

    let message
    try {
      message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Top artists:\n${artistLines}\n\nTop tracks:\n${trackLines}\n\nTone: ${tone}`,
          },
        ],
      })
    } catch (err) {
      console.error('[TasteJudge] Claude error:', err)
      return NextResponse.json(
        { error: 'Failed to generate taste report', detail: err instanceof Error ? err.message : 'unknown' },
        { status: 500 }
      )
    }

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(text)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[TasteJudge] error:', err)
    return NextResponse.json(
      { error: 'Failed to generate taste report', detail: err instanceof Error ? err.message : 'unknown' },
      { status: 500 }
    )
  }
}
