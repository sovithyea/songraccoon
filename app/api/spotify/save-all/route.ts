import { NextResponse } from 'next/server'
import { requireSpotifyAuth } from '@/lib/auth'
import { saveAllToPlaylist } from '@/lib/spotify'
import type { Track } from '@/types'

export async function POST(request: Request) {
  const authResult = await requireSpotifyAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const { tracks, prompt } = await request.json()

  if (!Array.isArray(tracks) || tracks.length === 0) {
    return NextResponse.json({ error: 'Invalid tracks' }, { status: 400 })
  }
  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
  }

  try {
    const playlistId = await saveAllToPlaylist(tracks as Track[], prompt, authResult.accessToken)
    return NextResponse.json({ playlistId })
  } catch (err) {
    console.error('[save-all] error:', err)
    return NextResponse.json({ error: 'Failed to save playlist' }, { status: 500 })
  }
}
