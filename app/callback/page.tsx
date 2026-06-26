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

    let codeVerifier = sessionStorage.getItem('code_verifier')
    if (!codeVerifier) {
      codeVerifier = localStorage.getItem('code_verifier')
      console.log('[Callback] used localStorage fallback:', !!codeVerifier)
    }
    if (!codeVerifier) {
      const match = document.cookie.match(/pkce_verifier=([^;]+)/)
      codeVerifier = match ? decodeURIComponent(match[1]) : null
      console.log('[Callback] used cookie fallback:', !!codeVerifier)
    }
    if (!codeVerifier) {
      console.error('[Callback] No code_verifier found in sessionStorage, localStorage, or cookie')
      router.push('/?auth_error=true')
      return
    }

    fetch('/api/auth/callback/spotify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, codeVerifier }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          sessionStorage.removeItem('code_verifier')
          localStorage.removeItem('code_verifier')
          document.cookie = 'pkce_verifier=; path=/; max-age=0'
          router.push('/')
        } else {
          console.error('[Callback] server exchange failed:', data.error)
          router.push('/?auth_error=true')
        }
      })
      .catch((err) => {
        console.error('[Callback] fetch error:', err)
        router.push('/?auth_error=true')
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
