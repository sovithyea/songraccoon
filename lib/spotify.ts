import type { Track } from '@/types'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

export async function getCurrentUser(accessToken: string): Promise<{
  id: string
  display_name: string
  images: { url: string }[]
}> {
  const res = await fetch(`${SPOTIFY_API_BASE}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('Failed to fetch user profile')
  return res.json()
}

export async function createPlaylist(
  userId: string,
  name: string,
  accessToken: string
): Promise<string> {
  const res = await fetch(`${SPOTIFY_API_BASE}/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, public: false }),
  })
  if (!res.ok) throw new Error('Failed to create playlist')
  const data = await res.json()
  return data.id
}

export async function addTracksToPlaylist(
  trackUris: string[],
  playlistId: string,
  accessToken: string
): Promise<void> {
  const res = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: trackUris }),
  })
  if (!res.ok) throw new Error('Failed to add tracks to playlist')
}

export async function addToLikedSongs(
  trackId: string,
  accessToken: string
): Promise<void> {
  const res = await fetch(`${SPOTIFY_API_BASE}/me/tracks`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids: [trackId] }),
  })
  if (!res.ok) throw new Error('Failed to add to Liked Songs')
}

export async function saveAllToPlaylist(
  tracks: Track[],
  promptSnippet: string,
  accessToken: string
): Promise<string> {
  const user = await getCurrentUser(accessToken)
  const playlistName = `SongRaccoon — ${promptSnippet.slice(0, 40)}`
  const playlistId = await createPlaylist(user.id, playlistName, accessToken)
  const uris = tracks.map((t) => `spotify:track:${t.id}`)
  await addTracksToPlaylist(uris, playlistId, accessToken)
  return playlistId
}
