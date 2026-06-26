export type PlayMode = 'mainstream' | 'niche'

export interface SongSuggestion {
  title: string
  artist: string
  reason: string
}

export interface ClaudeResponse {
  suggestions: SongSuggestion[]
  vibe_reason: string
}

export interface Track {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string; width: number; height: number }[]
  }
  external_urls: { spotify: string }
  preview_url: string | null
  reason?: string
}

export interface TasteReport {
  verdict: string
  signature_vibe: string[]
  what_this_says: string
  guilty_pleasures: string
  redeeming_qualities: string
}

export interface TopArtist {
  name: string
  genres: string[]
  images: { url: string }[]
  popularity: number
}

export interface TopTrack {
  name: string
  artists: { name: string }[]
  album: { name: string; images: { url: string }[] }
  popularity: number
}

export interface SearchHistory {
  id: string
  prompt: string
  track_count: number
  created_at: string
}
