'use client'

import { useState, useEffect } from 'react'
import SpotifyLoginButton from '@/components/SpotifyLoginButton'
import PromptInput from '@/components/PromptInput'
import TrackGrid from '@/components/TrackGrid'
import { addTracksToPlaylist, saveAllToPlaylist, addToLikedSongs } from '@/lib/spotify'
import type { Track, PlayMode } from '@/types'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState<PlayMode>('mainstream')
  const [vibeReason, setVibeReason] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem('access_token')
    if (token) {
      setAccessToken(token)
      setIsLoggedIn(true)
    }
    function checkWidth() { setIsMobile(window.innerWidth <= 768) }
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
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
        body: JSON.stringify({ suggestions, access_token: accessToken }),
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

  async function handleAdd(track: Track) {
    console.log('[handleAdd] accessToken:', accessToken ? accessToken.slice(0, 12) + '…' : 'null')
    if (!accessToken) {
      setError('Connect Spotify to save tracks')
      return
    }
    try {
      const playlistId = sessionStorage.getItem('active_playlist_id')
      if (playlistId) {
        await addTracksToPlaylist([`spotify:track:${track.id}`], playlistId, accessToken)
      } else {
        await addToLikedSongs(track.id, accessToken)
      }
    } catch {
      setError('Failed to add track')
    }
  }

  async function handleSaveAll() {
    if (!accessToken) {
      setError('Connect Spotify to save tracks')
      return
    }
    setSaving(true)
    try {
      const playlistId = await saveAllToPlaylist(tracks, prompt, accessToken)
      sessionStorage.setItem('active_playlist_id', playlistId)
    } catch {
      setError('Failed to save playlist')
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    setAccessToken(null)
    setIsLoggedIn(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 48px',
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
          <span style={{ display: 'flex', alignItems: 'baseline', gap: '5px', cursor: 'not-allowed', userSelect: 'none' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--border-2)' }}>History</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', color: 'var(--rust)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>soon</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: '5px', cursor: 'not-allowed', userSelect: 'none' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--border-2)' }}>Taste report</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', color: 'var(--rust)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>soon</span>
          </span>
          <SpotifyLoginButton isLoggedIn={isLoggedIn} accessToken={accessToken} onLogout={handleLogout} />
        </div>
      </nav>

      {/* Body */}
      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        flexDirection: isMobile ? 'column' : 'row',
      }}>

        {/* Left column */}
        <div style={{
          width: isMobile ? '100%' : '40%',
          padding: isMobile ? '40px 24px' : '56px 48px',
          borderRight: isMobile ? 'none' : '1px solid var(--border)',
          overflowY: 'auto',
        }}>
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
        <div style={{
          width: isMobile ? '100%' : '60%',
          padding: isMobile ? '40px 24px' : '56px 48px',
          overflowY: 'auto',
        }}>
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

                {isLoggedIn && (
                  <button
                    onClick={handleSaveAll}
                    disabled={saving}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 500,
                      fontSize: '12px',
                      letterSpacing: '0.08em',
                      color: 'var(--cream)',
                      background: saving ? 'var(--border-2)' : 'var(--rust)',
                      border: 'none',
                      borderRadius: '2px',
                      padding: '9px 18px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1,
                      transition: 'opacity 0.15s, background 0.15s',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save all to Spotify'}
                  </button>
                )}
              </div>

              <TrackGrid
                tracks={tracks}
                accessToken={accessToken}
                onAdd={handleAdd}
              />
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
