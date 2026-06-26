import { NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/validateOrigin'
import { requireSpotifyAuth } from '@/lib/auth'

export async function GET(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const authResult = await requireSpotifyAuth(request)
  if (authResult instanceof NextResponse) return authResult
  const { accessToken } = authResult

  const [artistsRes, tracksRes] = await Promise.all([
    fetch('https://api.spotify.com/v1/me/top/artists?limit=10&time_range=medium_term', {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    fetch('https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=medium_term', {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
  ])

  if (!artistsRes.ok || !tracksRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch your Spotify data' }, { status: 500 })
  }

  const { items: rawArtists } = await artistsRes.json()
  const { items: rawTracks } = await tracksRes.json()

  return NextResponse.json({
    artists: rawArtists.map((a: { name: string; genres: string[]; images: { url: string }[]; popularity: number }) => ({
      name: a.name,
      genres: a.genres,
      images: a.images,
      popularity: a.popularity,
    })),
    tracks: rawTracks.map((t: { name: string; artists: { name: string }[]; album: { name: string; images: { url: string }[] }; popularity: number }) => ({
      name: t.name,
      artists: t.artists.map((a) => ({ name: a.name })),
      album: {
        name: t.album.name,
        images: t.album.images,
      },
      popularity: t.popularity,
    })),
  })
}
