// Signed, expiring session tokens, shared by the admin dashboard and the
// Scholarship Committee area.
//
// A token is "<expiry-ms>.<hex HMAC-SHA256 of the expiry>". Anyone can read it,
// nobody can forge or extend one without the secrets, so a cookie holding it is
// proof that this server issued it. The signing key is derived from a purpose
// label plus secrets the server already has, so a token for one area is useless
// in another, and changing a password invalidates every session it issued.
//
// Uses Web Crypto so it runs in both the Node route handlers and the Edge
// middleware.

const encoder = new TextEncoder()

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string): Uint8Array | null {
  if (hex.length === 0 || hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) return null
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return out
}

function signingKey(purpose: string, secrets: string[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(JSON.stringify([purpose, ...secrets])),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function issueToken(
  purpose: string,
  secrets: string[],
  ttlSeconds: number,
  now: number = Date.now()
): Promise<string> {
  const expiresAt = String(now + ttlSeconds * 1000)
  const key = await signingKey(purpose, secrets)
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(expiresAt))
  return `${expiresAt}.${toHex(signature)}`
}

export async function verifyToken(
  token: string | undefined,
  purpose: string,
  secrets: string[],
  now: number = Date.now()
): Promise<boolean> {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [expiresAt, signatureHex] = parts
  if (!/^\d+$/.test(expiresAt)) return false

  const signature = fromHex(signatureHex)
  if (!signature) return false

  const key = await signingKey(purpose, secrets)
  // subtle.verify compares the MAC in constant time.
  const valid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(expiresAt))
  return valid && Number(expiresAt) > now
}

/** Constant-time string comparison (both sides hashed first, so length does not leak). */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ])
  const x = new Uint8Array(ha)
  const y = new Uint8Array(hb)
  let diff = 0
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i]
  return diff === 0
}
