import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export async function GET() {
  const cookieStore = await cookies()
  let accessToken = cookieStore.get('spotify_access_token')?.value
  const refreshToken = cookieStore.get('spotify_refresh_token')?.value
  const expiresAt = cookieStore.get('spotify_expires_at')?.value

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ loggedIn: false })
  }

  const cookiesToSet: Array<{ name: string; value: string; maxAge: number }> = []

  const needsRefresh =
    !accessToken || (expiresAt && Number(expiresAt) - 60_000 < Date.now())

  if (needsRefresh && refreshToken) {
    try {
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
        }),
      })
      if (!res.ok) return NextResponse.json({ loggedIn: false })

      const data = await res.json()
      accessToken = data.access_token
      const newExpiresAt = Date.now() + data.expires_in * 1000

      cookiesToSet.push({ name: 'spotify_access_token', value: accessToken!, maxAge: data.expires_in })
      cookiesToSet.push({ name: 'spotify_expires_at', value: String(newExpiresAt), maxAge: data.expires_in })
      if (data.refresh_token) {
        cookiesToSet.push({ name: 'spotify_refresh_token', value: data.refresh_token, maxAge: 60 * 60 * 24 * 30 })
      }
    } catch {
      return NextResponse.json({ loggedIn: false })
    }
  }

  try {
    const res = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return NextResponse.json({ loggedIn: false })

    const user = await res.json()
    const response = NextResponse.json({
      loggedIn: true,
      displayName: user.display_name ?? 'Connected',
      avatar: user.images?.[0]?.url ?? null,
      userId: user.id,
    })

    for (const c of cookiesToSet) {
      response.cookies.set(c.name, c.value, { ...COOKIE_OPTS, maxAge: c.maxAge })
    }

    return response
  } catch {
    return NextResponse.json({ loggedIn: false })
  }
}
