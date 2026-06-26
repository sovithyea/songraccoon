'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Track } from '@/types'

interface Props {
  track: Track
  accessToken: string | null
  onAdd: (track: Track) => void
  reason?: string
}

export default function TrackCard({ track, accessToken, onAdd, reason }: Props) {
  const [hovered, setHovered] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)

  const albumImage = track.album.images[0]?.url ?? null
  const artistNames = track.artists.map((a) => a.name).join(', ')

  return (
    <div
      onClick={() => window.open(track.external_urls.spotify, '_blank')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        cursor: 'pointer',
        borderRadius: '3px',
        overflow: 'hidden',
        background: 'var(--surface)',
        border: '1px solid',
        borderColor: hovered ? 'var(--border-2)' : 'var(--border)',
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1' }}>
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

        {/* Embed toggle button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowEmbed((v) => !v)
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
            fontSize: showEmbed ? '13px' : '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
          }}
        >
          {showEmbed ? '✕' : '▶'}
        </button>

        {/* Hover overlay */}
        {hovered && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(20, 15, 10, 0.75)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              zIndex: 1,
              padding: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {reason && (
              <p
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: '12px',
                  color: 'var(--cream)',
                  textAlign: 'center',
                  maxWidth: '85%',
                  lineHeight: 1.5,
                  margin: '0 0 4px',
                }}
              >
                &ldquo;{reason}&rdquo;
              </p>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAdd(track)
              }}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--cream)',
                background: 'var(--rust)',
                border: 'none',
                borderRadius: '2px',
                padding: '8px 14px',
                cursor: accessToken ? 'pointer' : 'not-allowed',
                opacity: accessToken ? 1 : 0.6,
              }}
            >
              + Add to playlist
            </button>
          </div>
        )}
      </div>

      {/* Spotify embed */}
      {showEmbed && (
        <div onClick={(e) => e.stopPropagation()} style={{ padding: '0 8px 8px' }}>
          <iframe
            src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`}
            width="100%"
            height="80"
            frameBorder={0}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ display: 'block', marginTop: 8, borderRadius: '4px' }}
          />
        </div>
      )}

      {/* Track info */}
      <div style={{ padding: '10px 12px 12px' }}>
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
