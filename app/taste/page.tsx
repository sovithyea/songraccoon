'use client'

import { useState, useEffect, useCallback, CSSProperties } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { TasteReport, TopArtist, TopTrack } from '@/types'
import MobileNav from '@/components/MobileNav'

const LOADING_MSGS = [
  'Analyzing your questionable choices...',
  'Consulting the music gods...',
  'Judging you appropriately...',
  'Almost done destroying you...',
]

interface AuthInfo {
  displayName: string
  avatar: string | null
}

interface TopData {
  artists: TopArtist[]
  tracks: TopTrack[]
}

const eyebrowStyle: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 500,
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--rust)',
  marginBottom: '20px',
}

const sectionLabelStyle: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 500,
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--rust)',
  marginBottom: '8px',
}

const bodyTextStyle: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 300,
  fontSize: '14px',
  color: 'var(--sand)',
  lineHeight: 1.6,
}

export default function TastePage() {
  console.log('[Taste] component mounting')

  if (typeof window === 'undefined') return null

  try {
    return <TastePageInner />
  } catch (err) {
    console.error('[Taste] render error:', err)
    return (
      <div style={{ padding: 40, color: 'var(--cream)', fontFamily: 'DM Sans, sans-serif' }}>
        Something went wrong loading the taste page.
        <br />
        <button onClick={() => window.location.reload()} style={{ marginTop: 16, cursor: 'pointer' }}>
          Reload
        </button>
      </div>
    )
  }
}

function TastePageInner() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null)
  const [topData, setTopData] = useState<TopData | null>(null)
  const [report, setReport] = useState<TasteReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [tone, setTone] = useState<'roast' | 'nice'>('roast')
  const [error, setError] = useState<string | null>(null)
  const [msgIndex, setMsgIndex] = useState(0)
  const [copied, setCopied] = useState(false)

  const generateReport = useCallback(async (currentTone: 'roast' | 'nice', data: TopData) => {
    setGenerating(true)
    setReport(null)
    setError(null)
    try {
      const res = await fetch('/api/taste-judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artists: data.artists, tracks: data.tracks, tone: currentTone }),
      })
      const result = await res.json()
      if (result.error) throw new Error(result.error)
      console.log('[Taste] report:', result)
      setReport(result)
    } catch (err) {
      console.error('[Taste] generate error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }, [])

  useEffect(() => {
    const run = async () => {
      try {
        const meRes = await fetch('/api/auth/me')
        const meData = await meRes.json()
        console.log('[Taste] auth check:', meData)

        if (!meData.loggedIn) {
          setIsLoggedIn(false)
          setLoading(false)
          return
        }
        setIsLoggedIn(true)
        setAuthInfo({ displayName: meData.displayName, avatar: meData.avatar ?? null })

        const topRes = await fetch('/api/spotify/top')
        if (!topRes.ok) {
          setError('Could not load your Spotify data. Try reconnecting.')
          setLoading(false)
          return
        }
        const topJson = await topRes.json()
        console.log('[Taste] top data:', topJson)

        if (topJson.error) {
          setError('Could not load your Spotify data. Try reconnecting.')
          setLoading(false)
          return
        }
        setTopData(topJson)
        setLoading(false)
        generateReport('roast', topJson)
      } catch (err) {
        console.error('[Taste] mount error:', err)
        setError('Could not load your Spotify data. Try reconnecting.')
        setLoading(false)
      }
    }
    run()
  }, [generateReport])

  useEffect(() => {
    if (!generating) return
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MSGS.length)
    }, 1500)
    return () => clearInterval(id)
  }, [generating])

  function handleToneChange(newTone: 'roast' | 'nice') {
    if (generating || !topData) return
    setTone(newTone)
    generateReport(newTone, topData)
  }

  function handleFindSongs() {
    if (!report) return
    sessionStorage.setItem('prefill_prompt', report.signature_vibe.slice(0, 2).join(', '))
    router.push('/')
  }

  async function handleCopy() {
    if (!report) return
    const text = [
      'My SongRaccoon Taste Report 🦝',
      '',
      `"${report.verdict}"`,
      '',
      `Signature vibe: ${report.signature_vibe.join(' · ')}`,
      '',
      report.what_this_says,
      '',
      `Guilty pleasures: ${report.guilty_pleasures}`,
      '',
      `Redeeming qualities: ${report.redeeming_qualities}`,
      '',
      'Get your taste judged at songraccoon.vercel.app',
    ].join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const artistSlots = Array.from({ length: 6 }, (_, i) => (topData?.artists ?? [])[i] ?? null)

  const showError = !loading && !generating && error

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
        <button
          onClick={() => router.push('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', lineHeight: 1 }}
        >
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: '22px', letterSpacing: '0.08em', color: 'var(--cream)' }}>
            SONG
          </span>
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: '22px', color: 'transparent', WebkitTextStroke: '1.5px #B5673A' }}>
            RACCOON
          </span>
        </button>
        <span className="sr-nav-item" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--cream)' }}>
          Taste report
        </span>
      </nav>

      {/* Body */}
      <div className="sr-layout">
        {/* Left column */}
        <div className="sr-left">
          <p style={eyebrowStyle}>— Taste report</p>

          {authInfo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              {authInfo.avatar && (
                <Image
                  src={authInfo.avatar}
                  alt={authInfo.displayName}
                  width={28}
                  height={28}
                  style={{ borderRadius: '50%' }}
                />
              )}
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--sand)' }}>
                {authInfo.displayName}
              </span>
            </div>
          )}

          {topData && (
            <>
              {/* 2×3 artist art grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '20px' }}>
                {artistSlots.map((artist, i) => (
                  <div
                    key={i}
                    style={{ position: 'relative', width: '100%', paddingBottom: '100%', overflow: 'hidden', borderRadius: '3px', background: 'var(--border)' }}
                  >
                    {artist?.images?.[0]?.url && (
                      <Image
                        src={artist.images[0].url}
                        alt={artist.name}
                        fill
                        sizes="15vw"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <p style={{ ...sectionLabelStyle, marginBottom: '12px' }}>Your top artists</p>
              <ol style={{ paddingLeft: '16px', margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(topData.artists ?? []).slice(0, 8).map((a, i) => (
                  <li key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--sand)' }}>
                    <span style={{ color: 'var(--cream)' }}>{a.name}</span>
                    {a.genres?.[0] && (
                      <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.6 }}>
                        {a.genres[0]}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </>
          )}

          {topData && (
            <div>
              <p style={sectionLabelStyle}>Tone</p>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['roast', 'nice'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleToneChange(t)}
                    disabled={generating}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: tone === t ? 500 : 400,
                      fontSize: '11px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: tone === t ? 'var(--cream)' : 'var(--sand)',
                      background: tone === t ? 'var(--rust)' : 'transparent',
                      border: '1px solid',
                      borderColor: tone === t ? 'var(--rust)' : 'var(--border)',
                      borderRadius: '2px',
                      padding: '4px 12px',
                      cursor: generating ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s',
                      opacity: generating ? 0.6 : 1,
                    }}
                  >
                    {t === 'roast' ? 'Destroy me' : 'Be nice'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="sr-right">
          {isLoggedIn === false && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontStyle: 'italic', fontSize: '20px', color: 'var(--sand)' }}>
                Connect Spotify to get your taste report
              </p>
              <button
                onClick={() => router.push('/')}
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
                }}
              >
                Connect Spotify
              </button>
            </div>
          )}

          {isLoggedIn === true && loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontStyle: 'italic', fontSize: '18px', color: 'var(--sand)' }}>
                Pulling your Spotify data...
              </p>
            </div>
          )}

          {isLoggedIn === true && !loading && generating && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontStyle: 'italic', fontSize: '18px', color: 'var(--sand)' }}>
                {LOADING_MSGS[msgIndex]}
              </p>
            </div>
          )}

          {isLoggedIn === true && showError && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', textAlign: 'center' }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--rust)' }}>{error}</p>
              <button
                onClick={() => router.push('/')}
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
                }}
              >
                Reconnect Spotify
              </button>
            </div>
          )}

          {isLoggedIn === true && !loading && !generating && !error && report && (
            <div>
              <p style={eyebrowStyle}>— Your taste, judged</p>

              <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontStyle: 'italic', fontSize: '22px', lineHeight: 1.5, color: 'var(--cream)', marginBottom: '24px' }}>
                &ldquo;{report.verdict}&rdquo;
              </p>

              <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '24px' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div>
                  <p style={sectionLabelStyle}>Your signature vibe</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(report.signature_vibe ?? []).map((tag, i) => (
                      <span
                        key={i}
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          padding: '5px 12px',
                          color: 'var(--cream)',
                          borderRadius: '2px',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={sectionLabelStyle}>What this says about you</p>
                  <p style={bodyTextStyle}>{report.what_this_says}</p>
                </div>

                <div>
                  <p style={sectionLabelStyle}>Guilty pleasures detected</p>
                  <p style={bodyTextStyle}>{report.guilty_pleasures}</p>
                </div>

                <div>
                  <p style={sectionLabelStyle}>Redeeming qualities</p>
                  <p style={bodyTextStyle}>{report.redeeming_qualities}</p>
                </div>
              </div>

              <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleFindSongs}
                  style={{
                    flex: 1,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                    fontSize: '13px',
                    letterSpacing: '0.08em',
                    color: 'var(--cream)',
                    background: 'var(--rust)',
                    border: 'none',
                    borderRadius: '2px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Find songs based on my taste →
                </button>
                <button
                  onClick={handleCopy}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 400,
                    fontSize: '13px',
                    letterSpacing: '0.08em',
                    color: 'var(--sand)',
                    background: 'transparent',
                    border: '1px solid var(--border-2)',
                    borderRadius: '2px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
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
                  {copied ? 'Copied ✓' : 'Copy report'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mobile-nav-spacer" />
      <MobileNav className="mobile-nav" />
    </main>
  )
}
