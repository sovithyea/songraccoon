# SongRaccoon

AI-powered music discovery. Describe a feeling, get a playlist.

## Setup

**1. Clone + install**
```bash
git clone https://github.com/sovithyea/songraccoon
cd songraccoon
npm install
```

**2. Configure environment**
```bash
cp .env.local.example .env.local
```
Fill in `.env.local`:
- `SPOTIFY_CLIENT_ID` + `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` — from [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- `ANTHROPIC_API_KEY` — from [Anthropic Console](https://console.anthropic.com)
- `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` for local dev

**3. Add redirect URI in Spotify Dashboard**

In your Spotify app settings, add:
```
http://localhost:3000/callback
```
For production, also add your deployed URL:
```
https://your-domain.com/callback
```

**4. Run**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS v4
- Spotify Web API — PKCE OAuth + Recommendations
- Anthropic Claude API — natural language → music params
