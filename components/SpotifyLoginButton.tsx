'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/pkce'
import { getCurrentUser } from '@/lib/spotify'

interface Props {
  isLoggedIn: boolean
  accessToken: string | null
  onLogout: () => void
}

interface SpotifyUser {
  display_name: string
  images: { url: string }[]
}

export default function SpotifyLoginButton({ isLoggedIn, accessToken, onLogout }: Props) {
  const [user, setUser] = useState<SpotifyUser | null>(null)

  useEffect(() => {
    if (isLoggedIn && accessToken) {
      getCurrentUser(accessToken)
        .then(setUser)
        .catch(() => setUser(null))
    }
  }, [isLoggedIn, accessToken])

  async function handleLogin() {
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)

    sessionStorage.setItem('code_verifier', verifier)

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const redirectUri = `${appUrl}/callback`

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: 'playlist-modify-public playlist-modify-private playlist-read-private user-library-modify',
      code_challenge_method: 'S256',
      code_challenge: challenge,
    })

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
  }

  function handleLogout() {
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('refresh_token')
    sessionStorage.removeItem('expires_at')
    setUser(null)
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
      {user?.images?.[0]?.url && (
        <Image
          src={user.images[0].url}
          alt={user.display_name}
          width={28}
          height={28}
          style={{ borderRadius: '50%' }}
        />
      )}
      <span style={{ fontSize: '13px', color: 'var(--sand)' }}>
        {user?.display_name ?? 'Connected'}
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
