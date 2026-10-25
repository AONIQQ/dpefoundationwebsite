import { createSign } from 'node:crypto'

// Gmail API access for the Foundation's own Google Workspace mailbox.
//
// A Google Cloud service account with domain-wide delegation acts as the
// sending user (EMAIL_SENDER, e.g. info@dpefoundation.org). No third-party
// email service: messages go out through Gmail itself, so they inherit the
// domain's SPF/DKIM, land in that mailbox's Sent folder, and replies come
// back to its inbox.
//
// Env:
//   GOOGLE_SERVICE_ACCOUNT_JSON  the service account key file contents
//   EMAIL_SENDER                 the Workspace user to send as

const SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly']
const API = 'https://gmail.googleapis.com/gmail/v1/users/me'

interface ServiceAccount { client_email: string; private_key: string }

function serviceAccount(): ServiceAccount | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return typeof parsed.client_email === 'string' && typeof parsed.private_key === 'string' ? parsed : null
  } catch {
    return null
  }
}

export function senderAddress(): string | null {
  const sender = process.env.EMAIL_SENDER?.trim().toLowerCase()
  return sender || null
}

export function gmailConfigured(): boolean {
  return serviceAccount() !== null && senderAddress() !== null
}

const b64url = (data: string | Buffer) => Buffer.from(data).toString('base64url')

let cached: { token: string; expiresAt: number } | undefined

async function accessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token
  const account = serviceAccount()
  const sender = senderAddress()
  if (!account || !sender) throw new Error('Gmail sending is not configured')

  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = b64url(JSON.stringify({
    iss: account.client_email,
    sub: sender,
    scope: SCOPES.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }))
  const signature = createSign('RSA-SHA256').update(`${header}.${claims}`).sign(account.private_key)
  const assertion = `${header}.${claims}.${b64url(signature)}`

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || typeof body.access_token !== 'string') {
    throw new GmailAuthError(`Google sign-in failed: ${body.error_description || body.error || response.status}`)
  }
  cached = { token: body.access_token, expiresAt: Date.now() + Number(body.expires_in ?? 3600) * 1000 }
  return cached.token
}

/**
 * The service account could not get a token at all: bad key, missing or wrong
 * domain-wide delegation, or a token-endpoint outage. Nothing reached Gmail,
 * so the recipient must stay queued rather than being marked failed.
 */
export class GmailAuthError extends Error {}

export class GmailError extends Error {
  constructor(message: string, readonly status: number) { super(message) }
  /** Rate limits and server errors are worth retrying later; the rest are not. */
  get transient() { return this.status === 429 || this.status >= 500 }
}

async function gmail<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json', ...init?.headers },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new GmailError(body?.error?.message || `Gmail API error ${response.status}`, response.status)
  return body as T
}

/** Send an RFC 5322 message. Returns Gmail's message and thread ids. */
export async function sendRaw(mime: string): Promise<{ id: string; threadId: string }> {
  return gmail('/messages/send', { method: 'POST', body: JSON.stringify({ raw: b64url(mime) }) })
}

export async function searchMessages(q: string, maxResults = 100): Promise<{ id: string; threadId: string }[]> {
  const params = new URLSearchParams({ q, maxResults: String(maxResults) })
  const body = await gmail<{ messages?: { id: string; threadId: string }[] }>(`/messages?${params}`)
  return body.messages ?? []
}

export interface GmailMessage {
  id: string
  threadId: string
  snippet?: string
  headers: Record<string, string>
  /** Decoded text of every text/* part, for parsing bounce reports. */
  text: string
}

interface Part { mimeType?: string; headers?: { name: string; value: string }[]; body?: { data?: string }; parts?: Part[] }

export async function getMessage(id: string): Promise<GmailMessage> {
  const message = await gmail<{ id: string; threadId: string; snippet?: string; payload?: Part }>(`/messages/${id}?format=full`)
  const headers: Record<string, string> = {}
  for (const h of message.payload?.headers ?? []) headers[h.name.toLowerCase()] = h.value
  const texts: string[] = []
  const walk = (part?: Part) => {
    if (!part) return
    if (part.body?.data && (part.mimeType?.startsWith('text/') || part.mimeType?.startsWith('message/'))) {
      texts.push(Buffer.from(part.body.data, 'base64url').toString('utf8'))
    }
    part.parts?.forEach(walk)
  }
  walk(message.payload)
  return { id: message.id, threadId: message.threadId, snippet: message.snippet, headers, text: texts.join('\n') }
}
