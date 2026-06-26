'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function CallbackHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const exchanged = useRef(false)

  useEffect(() => {
    if (exchanged.current) return
    exchanged.current = true

    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error || !code) {
      console.error('[Callback] Spotify auth error:', error)
      router.push('/')
      return
    }

    const verifier = sessionStorage.getItem('code_verifier')
    if (!verifier) {
      console.error('[Callback] No code_verifier in sessionStorage')
      router.push('/')
      return
    }

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const redirectUri = `${appUrl}/callback`

    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: verifier,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('[Callback] token exchange success')
        sessionStorage.setItem('access_token', data.access_token)
        sessionStorage.setItem('refresh_token', data.refresh_token)
        sessionStorage.setItem('expires_at', String(Date.now() + data.expires_in * 1000))
        sessionStorage.removeItem('code_verifier')
        router.push('/')
      })
      .catch((err) => {
        console.error('[Callback] token exchange failed:', err)
        router.push('/')
      })
  }, [searchParams, router])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}
    >
      <p
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 300,
          fontStyle: 'italic',
          fontSize: '20px',
          color: 'var(--sand)',
        }}
      >
        Connecting...
      </p>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  )
}
