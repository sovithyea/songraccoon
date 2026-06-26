'use client'

import { useRouter, usePathname } from 'next/navigation'

interface Props {
  className?: string
}

export default function MobileNav({ className }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const tabs = [
    { label: 'Discover', path: '/', icon: '♪' },
    { label: 'History', path: '/history', icon: '◷' },
    { label: 'Taste', path: '/taste', icon: '✦' },
  ]

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#140F0A',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        zIndex: 99,
        paddingTop: '8px',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.path}
          onClick={() => router.push(tab.path)}
          style={{
            flex: 1,
            padding: '12px 0',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span style={{ fontSize: '16px', color: pathname === tab.path ? 'var(--rust)' : '#6B5A46' }}>
            {tab.icon}
          </span>
          <span
            style={{
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: pathname === tab.path ? 'var(--rust)' : '#6B5A46',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  )
}
