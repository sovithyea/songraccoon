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

  function handleRowClick(search: SearchHistory) {
    sessionStorage.setItem('prefill_prompt', search.prompt)
    router.push('/')
  }

  const connectBtn = (
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
  )

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
            {connectBtn}
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
            {searches.map((search) => (
              <div
                key={search.id}
                onClick={() => handleRowClick(search)}
                style={{
                  padding: '20px 0',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  background: 'transparent',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#140F0A')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
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
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '11px',
                      color: 'var(--sand)',
                      letterSpacing: '0.08em',
                      margin: 0,
                    }}
                  >
                    {search.track_count} track{search.track_count === 1 ? '' : 's'} · {formatRelativeTime(search.created_at)}
                  </p>
                </div>
                <span style={{ color: 'var(--rust)', fontSize: '16px', flexShrink: 0 }}>→</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mobile-nav-spacer" />
      <MobileNav className="mobile-nav" />
    </main>
  )
}
