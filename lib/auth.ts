import { NextResponse } from 'next/server'

export async function requireSpotifyAuth(
  request: Request
): Promise<{ accessToken: string } | NextResponse> {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const token = parseCookie(cookieHeader, 'spotify_access_token')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return { accessToken: token }
}

function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}
