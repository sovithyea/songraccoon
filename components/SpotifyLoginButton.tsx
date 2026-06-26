'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/pkce'

interface Props {
  isLoggedIn: boolean
  onLogout: () => void
}

interface AuthInfo {
  displayName: string
  avatar: string | null
}

export default function SpotifyLoginButton({ isLoggedIn, onLogout }: Props) {
  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null)

  useEffect(() => {
    if (!isLoggedIn) {
      setAuthInfo(null)
      return
    }
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.loggedIn) {
          setAuthInfo({ displayName: data.displayName, avatar: data.avatar })
        }
      })
      .catch(() => setAuthInfo(null))
  }, [isLoggedIn])

  async function handleLogin() {
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    sessionStorage.setItem('code_verifier', verifier)
    localStorage.setItem('code_verifier', verifier)
    document.cookie = `pkce_verifier=${verifier}; path=/; max-age=300; SameSite=Lax`

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const redirectUri = `${appUrl}/callback`

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: 'user-top-read user-read-private user-read-email',
      code_challenge_method: 'S256',
      code_challenge: challenge,
    })

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setAuthInfo(null)
    onLogout()
  }

  if (!isLoggedIn) {
    return (
      <button
        onClick={handleLogin}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--cream)',
          background: 'var(--rust)',
          border: 'none',
          borderRadius: '2px',
          padding: '8px 16px',
          cursor: 'pointer',
          transition: 'opacity 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        Connect Spotify
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {authInfo?.avatar && (
        <Image
          src={authInfo.avatar}
          alt={authInfo.displayName}
          width={28}
          height={28}
          style={{ borderRadius: '50%' }}
        />
      )}
      <span style={{ fontSize: '13px', color: 'var(--sand)' }}>
        {authInfo?.displayName ?? 'Connected'}
      </span>
      <button
        onClick={handleLogout}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          fontSize: '11px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--sand)',
          background: 'transparent',
          border: '1px solid var(--border-2)',
          borderRadius: '2px',
          padding: '5px 10px',
          cursor: 'pointer',
          transition: 'color 0.15s, border-color 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--cream)'
          e.currentTarget.style.borderColor = 'var(--sand)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--sand)'
          e.currentTarget.style.borderColor = 'var(--border-2)'
        }}
      >
        Disconnect
      </button>
    </div>
  )
}
