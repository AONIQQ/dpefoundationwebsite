// Reads Gmail's delivery-failure reports (DSNs) found in the sending mailbox.

const ADDRESS = /[A-Za-z0-9._%+'-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/

/** Recipients a delivery-failure report says failed permanently. */
export function parseBounce(headers: Record<string, string>, text: string): { emails: string[]; detail: string } | null {
  const subject = headers['subject'] ?? ''
  // Gmail retries temporary failures on its own and reports them as "Delay".
  if (/delay/i.test(subject)) return null
  const emails = new Set<string>()
  for (const part of (headers['x-failed-recipients'] ?? '').split(',')) {
    const m = part.match(ADDRESS)
    if (m) emails.add(m[0].toLowerCase())
  }
  const statuses = Array.from(text.matchAll(/^Status:\s*([245])\.\d+\.\d+/gim)).map((m) => m[1])
  if (statuses.length && !statuses.includes('5')) return null
  for (const m of Array.from(text.matchAll(/^(?:Final|Original)-Recipient:\s*rfc822;\s*(.+)$/gim))) {
    const addr = m[1].match(ADDRESS)
    if (addr) emails.add(addr[0].toLowerCase())
  }
  if (!emails.size) return null
  const diagnostic = text.match(/^Diagnostic-Code:\s*(.+)$/im)?.[1] ?? subject
  return { emails: Array.from(emails), detail: diagnostic.trim() }
}
