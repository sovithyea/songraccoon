import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error || !code) {
    console.error('[Complete] Spotify auth error:', error)
    return NextResponse.redirect(new URL('/?auth_error=true', request.url))
  }

  const cookieStore = await cookies()
  const codeVerifier = cookieStore.get('pkce_verifier')?.value
  console.log('[Complete] all cookie names:', cookieStore.getAll().map((c) => c.name))
  console.log('[Complete] pkce_verifier found:', !!codeVerifier)

  if (!codeVerifier) {
    console.error('[Complete] Missing pkce_verifier cookie')
    return NextResponse.redirect(new URL('/?auth_error=true', request.url))
  }

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'
  const redirectUri = `${appUrl}/api/auth/complete`

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier,
    }),
  })

  console.log('[Complete] token exchange status:', tokenRes.status)

  const data = await tokenRes.json()

  if (!tokenRes.ok || data.error) {
    console.error('[Complete] token exchange failed:', data.error ?? tokenRes.status)
    return NextResponse.redirect(new URL('/?auth_error=true', request.url))
  }

  const expiresAt = Date.now() + data.expires_in * 1000
  const response = NextResponse.redirect(new URL('/', request.url))

  response.cookies.set('pkce_verifier', '', { maxAge: 0, path: '/' })
  response.cookies.set('spotify_access_token', data.access_token, {
    ...COOKIE_OPTS,
    maxAge: data.expires_in,
  })
  response.cookies.set('spotify_refresh_token', data.refresh_token, {
    ...COOKIE_OPTS,
    maxAge: 60 * 60 * 24 * 30,
  })
  response.cookies.set('spotify_expires_at', String(expiresAt), {
    ...COOKIE_OPTS,
    maxAge: data.expires_in,
  })

  console.log('[Complete] cookies set on redirect response')

  return response
}
