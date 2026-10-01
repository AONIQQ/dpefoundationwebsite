// Best-effort, in-memory limiter. On a serverless host each instance keeps its
// own counts, so this slows down casual abuse (password guessing, a script
// hammering the comment box) rather than guaranteeing a hard cap.

const MAX_KEYS = 5000

// Insertion order doubles as recency order: a key is re-inserted every time it
// is used, so the first key in the map is always the least recently active.
const hits = new Map<string, number[]>()

export function tooManyRequests(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= limit) {
    hits.set(key, recent)
    return true
  }
  recent.push(now)
  hits.delete(key)
  hits.set(key, recent)

  // Hard cap, even if every key is still active (e.g. abuse from thousands of
  // addresses): evict the least recently active keys. The map, and the work
  // done per request, stay bounded.
  while (hits.size > MAX_KEYS) {
    const oldest = hits.keys().next().value
    if (oldest === undefined) break
    hits.delete(oldest)
  }
  return false
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}
