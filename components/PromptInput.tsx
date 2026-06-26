'use client'

import type { PlayMode } from '@/types'

interface QuickTag {
  label: string
  prompt: string
}

const QUICK_TAGS: QuickTag[] = [
  { label: 'Late night drive', prompt: 'driving alone late at night, streetlights, no destination' },
  { label: 'Golden hour', prompt: 'warm golden hour, summer afternoon, slow and hazy' },
  { label: 'Heartbreak', prompt: 'quiet heartbreak, sitting alone, trying not to feel it' },
  { label: 'Study flow', prompt: 'deep focus, late night studying, calm and productive' },
  { label: 'Rainy Sunday', prompt: 'rainy sunday morning, coffee, nowhere to be' },
]

interface Props {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  loading: boolean
  mode: PlayMode
  onModeChange: (m: PlayMode) => void
}

export default function PromptInput({ value, onChange, onSubmit, loading, mode, onModeChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <label
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--sand)',
        }}
      >
        Describe a feeling
      </label>

      <textarea
        className="sr-prompt-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (!loading && value.trim()) onSubmit()
          }
        }}
        placeholder="a grey afternoon with nowhere to be..."
        rows={3}
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 300,
          fontStyle: 'italic',
          fontSize: '18px',
          color: 'var(--cream)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '16px',
          resize: 'none',
          outline: 'none',
          transition: 'border-color 0.15s',
          width: '100%',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--border-2)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
      />

      {/* Quick tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {QUICK_TAGS.map((tag) => (
          <button
            key={tag.label}
            onClick={() => onChange(tag.prompt)}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              fontSize: '12px',
              color: 'var(--sand)',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '2px',
              padding: '5px 12px',
              cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--cream)'
              e.currentTarget.style.borderColor = 'var(--border-2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--sand)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* Mainstream / Niche toggle */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {(['mainstream', 'niche'] as const).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: mode === m ? 500 : 400,
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: mode === m ? 'var(--cream)' : 'var(--sand)',
              background: mode === m ? 'var(--rust)' : 'transparent',
              border: '1px solid',
              borderColor: mode === m ? 'var(--rust)' : 'var(--border)',
              borderRadius: '2px',
              padding: '4px 12px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      <button
        className="sr-find-btn"
        onClick={onSubmit}
        disabled={loading || !value.trim()}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          fontSize: '13px',
          letterSpacing: '0.08em',
          color: 'var(--cream)',
          background: loading || !value.trim() ? 'var(--border-2)' : 'var(--rust)',
          border: 'none',
          borderRadius: '2px',
          padding: '12px 24px',
          cursor: loading || !value.trim() ? 'not-allowed' : 'pointer',
          alignSelf: 'flex-start',
          transition: 'opacity 0.15s, background 0.15s',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Finding...' : 'Find songs →'}
      </button>
    </div>
  )
}
