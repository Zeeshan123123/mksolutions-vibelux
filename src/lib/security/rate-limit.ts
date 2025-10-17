type Counter = { count: number; resetAt: number }

const memoryStore: Map<string, Counter> = new Map()

export interface RateLimitResult {
  ok: boolean
  remaining: number
  resetAt: number
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const now = Date.now()
  const bucket = memoryStore.get(key)
  if (!bucket || bucket.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs }
  }
  if (bucket.count < limit) {
    bucket.count += 1
    return { ok: true, remaining: limit - bucket.count, resetAt: bucket.resetAt }
  }
  return { ok: false, remaining: 0, resetAt: bucket.resetAt }
}

export function rateLimitHeaders(result: RateLimitResult, limit: number): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(Math.max(0, result.remaining)),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  }
}

export function redact(text: string, maxLen = 500): string {
  let t = text || ''
  if (t.length > maxLen) t = t.slice(0, maxLen) + '…'
  // Remove emails/URLs
  t = t.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
  t = t.replace(/https?:\/\/[\w.-]+(?:\/[\w\-._~:/?#[\]@!$&'()*+,;=.]+)?/gi, '[redacted-url]')
  return t
}


