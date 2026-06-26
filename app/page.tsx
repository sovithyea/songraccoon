'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SpotifyLoginButton from '@/components/SpotifyLoginButton'
import PromptInput from '@/components/PromptInput'
import TrackGrid from '@/components/TrackGrid'
import type { Track, PlayMode } from '@/types'
import MobileNav from '@/components/MobileNav'

export default function Home() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<PlayMode>('mainstream')
  const [vibeReason, setVibeReason] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setIsLoggedIn(data.loggedIn === true))
      .catch(() => setIsLoggedIn(false))

    const prefill = sessionStorage.getItem('prefill_prompt')
    if (prefill) {
      setPrompt(prefill)
      sessionStorage.removeItem('prefill_prompt')
    }

    const params = new URLSearchParams(window.location.search)
    if (params.get('auth_error')) {
      setError('Spotify login failed — please try again')
      window.history.replaceState({}, '', '/')
    }
  }, [])

  async function handleFind() {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setTracks([])

    try {
      const interpretRes = await fetch('/api/claude/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode }),
      })
      const { suggestions, vibe_reason, error: interpretError } = await interpretRes.json()
      if (interpretError) throw new Error(interpretError)
      console.log('[Page] Claude suggestions:', suggestions?.length, '| vibe:', vibe_reason)
      setVibeReason(vibe_reason ?? '')

      const recommendRes = await fetch('/api/spotify/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestions }),
      })
      const { tracks: newTracks, error: recommendError } = await recommendRes.json()
      if (recommendError) throw new Error(recommendError)
      console.log('[Page] Spotify matched:', newTracks?.length)

      setTracks(newTracks ?? [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      setTracks([])
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    setIsLoggedIn(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav
        className="sr-nav"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 400,
              fontSize: '22px',
              letterSpacing: '0.08em',
              color: 'var(--cream)',
            }}
          >
            SONG
          </span>
          <span
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 400,
              fontSize: '22px',
              color: 'transparent',
              WebkitTextStroke: '1.5px #B5673A',
            }}
          >
            RACCOON
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span className="sr-nav-item" style={{ display: 'flex', alignItems: 'baseline', gap: '5px', cursor: 'not-allowed', userSelect: 'none' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--border-2)' }}>History</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', color: 'var(--rust)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>soon</span>
          </span>
          <span
            className="sr-nav-item"
            onClick={() => router.push('/taste')}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--cream)' }}>Taste report</span>
          </span>
          <SpotifyLoginButton isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        </div>
      </nav>

      {/* Body */}
      <div className="sr-layout">

        {/* Left column */}
        <div className="sr-left">
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--rust)',
              marginBottom: '20px',
            }}
          >
            Music discovery
          </p>
          <h1
            className="sr-hero-title"
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 300,
              fontSize: '48px',
              lineHeight: 1.1,
              color: 'var(--cream)',
              marginBottom: '16px',
            }}
          >
            What does{' '}
            <em style={{ fontStyle: 'italic' }}>right now</em>{' '}
            sound like?
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              fontSize: '15px',
              color: 'var(--sand)',
              lineHeight: 1.6,
              marginBottom: '40px',
            }}
          >
            Describe a feeling, memory, or moment. SongRaccoon finds tracks that fit.
          </p>

          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleFind}
            loading={loading}
            mode={mode}
            onModeChange={setMode}
          />

          {error && (
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: 'var(--rust)',
                marginTop: '16px',
              }}
            >
              {error}
            </p>
          )}
        </div>

        {/* Right column */}
        <div className="sr-right">
          {tracks.length > 0 && (
            <div style={{ animation: 'fadeUp 0.35s ease forwards' }}>
              <style>{`
                @keyframes fadeUp {
                  from { opacity: 0; transform: translateY(12px); }
                  to   { opacity: 1; transform: translateY(0); }
                }
              `}</style>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                }}
              >
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                    fontSize: '11px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--sand)',
                  }}
                >
                  {tracks.length} tracks found
                </p>
              </div>

              <TrackGrid tracks={tracks} />
            </div>
          )}
        </div>

      </div>

      <div className="mobile-nav-spacer" />
      <MobileNav className="mobile-nav" />
    </main>
  )
}
