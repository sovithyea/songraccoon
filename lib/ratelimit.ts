import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let claudeRatelimit: Ratelimit | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  claudeRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, '15 m'),
    analytics: true,
    prefix: 'songraccoon:claude',
  })
}

export { claudeRatelimit }
