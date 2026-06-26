import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const codeVerifier = cookieStore.get('pkce_verifier')?.value
    console.log('[Callback] all cookies:', cookieStore.getAll().map((c) => c.name))
    console.log('[Callback] pkce_verifier found:', !!codeVerifier)

    if (!codeVerifier) {
      return NextResponse.json({ error: 'Missing verifier' }, { status: 400 })
    }

    const { code } = await request.json()

    console.log('[Callback] received code:', !!code)

    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 })
    }

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const redirectUri = `${appUrl}/callback`

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

    console.log('[Callback] token exchange response status:', tokenRes.status)

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error('[auth/callback] token exchange failed:', err)
      return NextResponse.json({ error: 'Token exchange failed' }, { status: 400 })
    }

    const data = await tokenRes.json()
    console.log('[Callback] token data keys:', Object.keys(data))

    if (data.error) {
      console.error('[Callback] Spotify token error:', data.error)
      return NextResponse.json({ error: data.error }, { status: 400 })
    }

    const expiresAt = Date.now() + data.expires_in * 1000

    const response = NextResponse.json({ success: true })

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

    console.log('[Callback] cookies set, redirecting to /')

    // Store in Supabase if configured (non-fatal)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { createSupabaseServerClient } = await import('@/lib/supabase/server')
        const supabase = await createSupabaseServerClient()
        const userRes = await fetch('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${data.access_token}` },
        })
        if (userRes.ok) {
          const user = await userRes.json()
          await supabase.from('spotify_sessions').upsert(
            {
              spotify_user_id: user.id,
              display_name: user.display_name,
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              expires_at: expiresAt,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'spotify_user_id' }
          )
        }
      } catch (e) {
        console.warn('[auth/callback] Supabase store failed (non-fatal):', e)
      }
    }

    return response
  } catch (err) {
    console.error('[auth/callback] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
