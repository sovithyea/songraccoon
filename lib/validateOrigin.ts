export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'

  if (!origin && !referer) return true

  const allowed = [appUrl, 'http://localhost:3000', 'http://localhost:3001']

  if (origin) return allowed.includes(origin)
  if (referer) return allowed.some((o) => referer.startsWith(o))
  return false
}
