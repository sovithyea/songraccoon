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

    fetch('/api/auth/callback/spotify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
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
