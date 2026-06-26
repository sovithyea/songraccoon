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
  const [tapped, setTapped] = useState(false)

  const albumImage = track.album.images[0]?.url ?? null
  const artistNames = track.artists.map((a) => a.name).join(', ')

  return (
    <div
      onClick={() => window.open(track.external_urls.spotify, '_blank')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchEnd={(e) => {
        e.preventDefault()
        setTapped((prev) => !prev)
      }}
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

        {/* Play button — always visible, bottom-left */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            window.open(`https://open.spotify.com/track/${track.id}`, '_blank')
          }}
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'rgba(20,15,10,0.85)',
            border: '1px solid rgba(181,103,58,0.5)',
            color: 'var(--cream)',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
          }}
        >
          ▶
        </button>

        {/* Hover overlay — shows reason */}
        {(hovered || tapped) && reason && (
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
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 300,
            fontSize: '13px',
            color: 'var(--cream)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
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
          {artistNames}
        </p>
      </div>
    </div>
  )
}
