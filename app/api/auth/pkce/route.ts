import { NextResponse } from 'next/server'
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/pkce'

export async function POST() {
  const verifier = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)

  const response = NextResponse.json({ codeChallenge: challenge })
  response.cookies.set('pkce_verifier', verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 300,
    path: '/',
  })
  return response
}
