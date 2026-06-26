import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/validateOrigin'
import { requireSpotifyAuth } from '@/lib/auth'
import { claudeRatelimit } from '@/lib/ratelimit'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are a music curator with encyclopedic knowledge of songs across all genres and eras. When given a description of a mood, feeling, memory, or moment, you suggest 8 real songs that fit perfectly.

You must respond with ONLY a valid JSON object — no markdown, no explanation.

Return exactly this shape:
{
  "suggestions": [
    {
      "title": "exact song title",
      "artist": "exact artist name as it appears on Spotify",
      "reason": "why this fits — max 12 words, specific and evocative"
    }
  ],
  "vibe_reason": "overall vibe in max 15 words"
}

Rules:
- Suggest REAL, well-known songs that actually exist on Spotify
- Use the exact artist name as it appears on Spotify
- Vary the suggestions — mix of eras, tempos, energies that all fit the vibe
- No AI-generated music, no "slowed + reverb" versions, no lofi remixes
- No songs by: Suno, Udio, or any AI music generators
- The "reason" must be specific to THIS song, not generic
  Bad: "fits the late night vibe"
  Good: "Thom Yorke's falsetto feels like empty 3am streets"
- For mainstream mode: include recognisable artists (top 40, well-known indie)
- For niche mode: include deeper cuts, lesser-known artists, b-sides
- The suggestions array must always have exactly 8 items

Examples of good reasons:
- "Piano and silence make this feel like holding your breath"
- "That guitar line is exactly what streetlights look like"
- "Lorde's vowels stretch time — perfect for this kind of alone"`

export async function POST(request: Request) {
  // 1. Origin check
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 2. Auth check
  const authResult = await requireSpotifyAuth(request)
  if (authResult instanceof NextResponse) return authResult
  const { accessToken } = authResult

  // 3. Rate limiting by Spotify user ID (skipped if Upstash not configured)
  // Get Spotify user ID for per-user rate limiting
  let identifier = 'unknown'
  try {
    const meRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const me = await meRes.json()
    identifier = me.id ?? 'unknown'
  } catch {
    // fallback to IP if user fetch fails
    const forwarded = request.headers.get('x-forwarded-for')
    identifier = forwarded?.split(',')[0].trim() ?? 'unknown'
  }

  if (claudeRatelimit) {
    const { success, limit, reset, remaining } = await claudeRatelimit.limit(identifier)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests — try again in a few minutes' },
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

    // 4. Input validation
    const { prompt, mode } = body
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
    }
    if (prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt cannot be empty' }, { status: 400 })
    }
    if (prompt.length > 500) {
      return NextResponse.json(
        { error: 'Prompt too long — keep it under 500 characters' },
        { status: 400 }
      )
    }
    const safeMode = mode === 'niche' ? 'niche' : 'mainstream'

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Prompt: "${prompt}"\nMode: ${safeMode}`,
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    console.log('[Claude] raw response:', raw.slice(0, 200))

    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(text)

    if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length === 0) {
      throw new Error('Invalid suggestions array')
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[Claude] error:', err)
    return NextResponse.json({ error: "Couldn't read that vibe — try rephrasing" }, { status: 500 })
  }
}
