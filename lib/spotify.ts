export async function getCurrentUser(accessToken: string): Promise<{
  id: string
  display_name: string
  images: { url: string }[]
}> {
  const res = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('Failed to fetch user profile')
  return res.json()
}
