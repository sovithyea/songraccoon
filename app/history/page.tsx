'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { SearchHistory } from '@/types'
import MobileNav from '@/components/MobileNav'

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(isoString).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

export default function HistoryPage() {
  const router = useRouter()
  const [searches, setSearches] = useState<SearchHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const meRes = await fetch('/api/auth/me')
        const meData = await meRes.json()

        if (!meData.loggedIn) {
          setIsLoggedIn(false)
          setLoading(false)
          return
        }
        setIsLoggedIn(true)

        const r = await fetch('/api/history')
        const json = await r.json()
        setSearches(json.searches ?? [])
        setLoading(false)
      } catch {
        setIsLoggedIn(false)
        setLoading(false)
      }
    }
    run()
  }, [])

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
        <span
          onClick={() => router.push('/')}
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--sand)', cursor: 'pointer' }}
        >
          ← Back
        </span>
      </nav>

      {/* Body */}
      <div style={{ flex: 1, width: '100%', maxWidth: 680, margin: '0 auto', padding: '48px 40px' }}>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--rust)',
            marginBottom: '32px',
          }}
        >
          — Your searches
        </p>

        {isLoggedIn === false && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontStyle: 'italic', fontSize: '20px', color: 'var(--sand)' }}>
              Connect Spotify to see your search history
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
                alignSelf: 'flex-start',
              }}
            >
              Connect Spotify
            </button>
          </div>
        )}

        {isLoggedIn === true && loading && (
          <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontStyle: 'italic', fontSize: '18px', color: 'var(--sand)' }}>
            Loading your history...
          </p>
        )}

        {isLoggedIn === true && !loading && searches.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '15px', color: 'var(--sand)' }}>
              No searches yet — find some songs first
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
                alignSelf: 'flex-start',
              }}
            >
              Find songs →
            </button>
          </div>
        )}

        {isLoggedIn === true && !loading && searches.length > 0 && (
          <div>
            {searches.map((search) => {
              const isExpanded = expandedId === search.id
              return (
                <div
                  key={search.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: isExpanded ? '#140F0A' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#140F0A')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = isExpanded ? '#140F0A' : 'transparent')}
                  onClick={() => setExpandedId(isExpanded ? null : search.id)}
                >
                  {/* Header row */}
                  <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontFamily: "'Fraunces', serif",
                          fontStyle: 'italic',
                          fontWeight: 300,
                          fontSize: '16px',
                          color: 'var(--cream)',
                          margin: '0 0 6px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        &ldquo;{search.prompt}&rdquo;
                      </p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--sand)', letterSpacing: '0.08em', margin: 0 }}>
                        {search.track_count} track{search.track_count === 1 ? '' : 's'} · {formatRelativeTime(search.created_at)}
                      </p>
                    </div>
                    <span style={{ color: 'var(--rust)', fontSize: '12px', flexShrink: 0 }}>
                      {isExpanded ? '▴' : '▾'}
                    </span>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div onClick={(e) => e.stopPropagation()}>
                      {search.tracks && search.tracks.length > 0 && (
                        <div
                          className="sr-history-grid"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '8px',
                            paddingBottom: '8px',
                          }}
                        >
                          {search.tracks.map((track) => (
                            <div
                              key={track.id}
                              onClick={() => window.open(track.external_urls.spotify, '_blank')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                padding: '8px',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '2px',
                              }}
                            >
                              {track.album.images[0]?.url && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={track.album.images[0].url}
                                  alt={track.name}
                                  width={40}
                                  height={40}
                                  style={{ flexShrink: 0, objectFit: 'cover' }}
                                />
                              )}
                              <div style={{ minWidth: 0 }}>
                                <p
                                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rust)')}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--cream)')}
                                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--cream)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', transition: 'color 0.15s' }}
                                >
                                  {track.name}
                                </p>
                                <p
                                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rust)')}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--sand)')}
                                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--sand)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', transition: 'color 0.15s' }}
                                >
                                  {track.artists.map((a) => a.name).join(', ')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          sessionStorage.setItem('prefill_prompt', search.prompt)
                          router.push('/')
                        }}
                        style={{
                          marginTop: '12px',
                          marginBottom: '16px',
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 500,
                          fontSize: '11px',
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: 'var(--cream)',
                          background: 'var(--rust)',
                          border: 'none',
                          borderRadius: '2px',
                          padding: '6px 14px',
                          cursor: 'pointer',
                        }}
                      >
                        Search again →
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="mobile-nav-spacer" />
      <MobileNav className="mobile-nav" />
    </main>
  )
}
