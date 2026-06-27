import { NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/validateOrigin'
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
  // 1. Origin check
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()

    // 3. Input validation
    const { suggestions } = body

    if (!Array.isArray(suggestions)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    if (suggestions.length === 0 || suggestions.length > 10) {
      return NextResponse.json({ error: 'Invalid suggestions count' }, { status: 400 })
    }

    const validSuggestions: SongSuggestion[] = suggestions.filter(
      (s) =>
        s &&
        typeof s.title === 'string' &&
        typeof s.artist === 'string' &&
        s.title.length > 0 &&
        s.title.length < 200 &&
        s.artist.length > 0 &&
        s.artist.length < 200
    )

    if (validSuggestions.length === 0) {
      return NextResponse.json({ error: 'No valid suggestions' }, { status: 400 })
    }

    // Use client credentials for search (user token not needed for public search)
    const token = await getClientToken()

    const results = await Promise.all(
      validSuggestions.map(async (suggestion) => {
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
    console.log('[Spotify] suggestions:', validSuggestions.length, '| matched:', tracks.length)

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
