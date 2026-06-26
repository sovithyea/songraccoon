import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#1C1410',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 20% 80%, #2E1E0E 0%, transparent 50%), radial-gradient(circle at 80% 20%, #1A0F08 0%, transparent 50%)',
        }} />

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          lineHeight: 1,
          marginBottom: '48px',
        }}>
          <span style={{
            fontFamily: 'serif',
            fontSize: '72px',
            fontWeight: 400,
            color: '#EDE0C8',
            letterSpacing: '0.08em',
          }}>
            SONG
          </span>
          <span style={{
            fontFamily: 'serif',
            fontSize: '72px',
            fontWeight: 400,
            color: 'transparent',
            WebkitTextStroke: '2px #B5673A',
            letterSpacing: '0.08em',
          }}>
            RACCOON
          </span>
        </div>

        <p style={{
          fontFamily: 'serif',
          fontStyle: 'italic',
          fontSize: '32px',
          color: '#6B5A46',
          margin: 0,
          fontWeight: 300,
        }}>
          Describe a feeling. Find the songs.
        </p>

        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '80px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            fontSize: '14px',
            letterSpacing: '0.2em',
            color: '#B5673A',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
          }}>
            songraccoon.vercel.app
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
