import { NextResponse } from 'next/server'
import type { SongSuggestion } from '@/types'

let cachedToken: { value: string; expiresAt: number } | null = null

async function getClientToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - 30_000 > Date.now()) {
    return cachedToken.value
  }

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  })

  if (!res.ok) throw new Error('Spotify client credentials failed')

  const data = await res.json()
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 }
  return cachedToken.value
}

export async function POST(request: Request) {
  try {
    const body: { suggestions: SongSuggestion[]; access_token: string | null } = await request.json()
    const { suggestions, access_token } = body

    if (!suggestions || suggestions.length === 0) {
      return NextResponse.json({ error: 'No suggestions provided' }, { status: 400 })
    }

    const token = access_token || await getClientToken()

    const results = await Promise.all(
      suggestions.map(async (suggestion) => {
        const query = `track:${suggestion.title} artist:${suggestion.artist}`
        try {
          const res = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          const data = await res.json()
          const track = data.tracks?.items?.[0]
          if (!track) return null
          return {
            id: track.id,
            name: track.name,
            artists: track.artists,
            album: track.album,
            external_urls: track.external_urls,
            preview_url: track.preview_url ?? null,
            reason: suggestion.reason,
          }
        } catch {
          return null
        }
      })
    )

    const tracks = results.filter(Boolean)
    console.log('[Spotify] suggestions:', suggestions.length, '| matched:', tracks.length)

    if (tracks.length === 0) {
      return NextResponse.json({ error: 'Nothing matched — try a different prompt' })
    }

    return NextResponse.json({ tracks })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Spotify search] error:', msg)
    return NextResponse.json({ error: `Search failed: ${msg}` }, { status: 500 })
  }
}
