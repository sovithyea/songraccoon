import { NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/validateOrigin'
import { requireSpotifyAuth } from '@/lib/auth'

async function getSpotifyUserId(accessToken: string): Promise<string> {
  const res = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  return data.id
}

function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createClient } = require('@supabase/supabase-js')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function GET(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const authResult = await requireSpotifyAuth(request)
  if (authResult instanceof NextResponse) return authResult
  const { accessToken } = authResult

  try {
    const userId = await getSpotifyUserId(accessToken)
    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json({ searches: [] })
    }

    const { data, error } = await supabase
      .from('searches')
      .select('id, prompt, track_count, created_at')
      .eq('spotify_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('[History GET] Supabase error:', error)
      return NextResponse.json({ searches: [] })
    }

    return NextResponse.json({ searches: data ?? [] })
  } catch (err) {
    console.error('[History GET] error:', err)
    return NextResponse.json({ searches: [] })
  }
}

export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const authResult = await requireSpotifyAuth(request)
  if (authResult instanceof NextResponse) return authResult
  const { accessToken } = authResult

  try {
    const body = await request.json()
    const { prompt, track_count } = body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0 || prompt.length > 500) {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
    }
    if (typeof track_count !== 'number' || track_count < 0 || track_count > 20) {
      return NextResponse.json({ error: 'Invalid track_count' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ success: true })
    }

    const userId = await getSpotifyUserId(accessToken)

    const { error } = await supabase.from('searches').insert({
      spotify_user_id: userId,
      prompt: prompt.trim(),
      track_count,
    })

    if (error) {
      console.error('[History POST] Supabase error:', error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[History POST] error:', err)
    return NextResponse.json({ success: true })
  }
}
