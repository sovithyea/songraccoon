'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Track } from '@/types'

interface Props {
  track: Track
  reason?: string
}

export default function TrackCard({ track, reason }: Props) {
  const [hovered, setHovered] = useState(false)

  const albumImage = track.album.images[0]?.url ?? null

  return (
    <div
      onClick={() => window.open(track.external_urls.spotify, '_blank')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        borderRadius: '3px',
        background: 'var(--surface)',
        border: '1px solid',
        borderColor: hovered ? 'var(--border-2)' : 'var(--border)',
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          {albumImage ? (
            <Image
              src={albumImage}
              alt={`${track.name} album art`}
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--border)' }} />
          )}
        </div>

        {/* Hover overlay — shows reason (desktop only) */}
        {hovered && reason && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(20, 15, 10, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              padding: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '12px',
                color: 'var(--cream)',
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              &ldquo;{reason}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Track info */}
      <div style={{ padding: '10px 12px 12px', flexShrink: 0 }}>
        <p
          onClick={(e) => {
            e.stopPropagation()
            window.open(track.external_urls.spotify, '_blank')
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rust)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--cream)')}
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 300,
            fontSize: '13px',
            color: 'var(--cream)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            transition: 'color 0.15s',
          }}
        >
          {track.name}
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 400,
            fontSize: '11px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--sand)',
            marginTop: '3px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {track.artists.map((artist, i) => (
            <span key={artist.name}>
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(`https://open.spotify.com/search/${encodeURIComponent(artist.name)}`, '_blank')
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rust)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--sand)')}
                style={{ cursor: 'pointer', transition: 'color 0.15s' }}
              >
                {artist.name}
              </span>
              {i < track.artists.length - 1 && ', '}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}
