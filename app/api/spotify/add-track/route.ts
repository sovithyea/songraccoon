import { NextResponse } from 'next/server'
import { requireSpotifyAuth } from '@/lib/auth'
import { addTracksToPlaylist, addToLikedSongs } from '@/lib/spotify'

export async function POST(request: Request) {
  const authResult = await requireSpotifyAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const { trackId, playlistId } = await request.json()

  if (!trackId || typeof trackId !== 'string') {
    return NextResponse.json({ error: 'Invalid trackId' }, { status: 400 })
  }

  try {
    if (playlistId && typeof playlistId === 'string') {
      await addTracksToPlaylist([`spotify:track:${trackId}`], playlistId, authResult.accessToken)
    } else {
      await addToLikedSongs(trackId, authResult.accessToken)
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[add-track] error:', err)
    return NextResponse.json({ error: 'Failed to add track' }, { status: 500 })
  }
}
