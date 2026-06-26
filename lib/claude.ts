import type { ClaudeResponse, PlayMode } from '@/types'

export async function interpretPrompt(prompt: string, mode: PlayMode = 'mainstream'): Promise<ClaudeResponse> {
  const res = await fetch('/api/claude/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, mode }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Interpretation failed')
  return data as ClaudeResponse
}
