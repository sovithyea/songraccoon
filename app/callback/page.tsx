'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CallbackPage() {
  const router = useRouter()
  useEffect(() => {
    router.push('/')
  }, [router])
  return (
    <p style={{ color: 'var(--cream)', padding: 40, fontFamily: 'DM Sans' }}>
      Redirecting...
    </p>
  )
}
