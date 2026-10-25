// Turns a campaign's HTML into the message one recipient receives: merge
// fields filled in, links routed through click tracking, an open pixel, and an
// unsubscribe link. Pure functions, no I/O, so they are easy to test.

export interface Recipient {
  email: string
  first_name?: string | null
  last_name?: string | null
}

export function publicBaseUrl(): string {
  return (process.env.EMAIL_PUBLIC_BASE_URL || 'https://dpefoundation.org').replace(/\/+$/, '')
}

/** Org-wide merge fields that are the same for everyone, resolved before link tracking. */
export function globalFields(): Record<string, string> {
  const base = publicBaseUrl()
  return {
    DONATE_URL: `${base}/donate`,
    DESIGNATION_FORM_URL: `${base}/donate/designation-form`,
  }
}

const escapeHtml = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

// {{Name}} or {{Name|fallback}}. Names are case-insensitive.
const MERGE = /\{\{\s*([A-Za-z_]+)\s*(?:\|([^}]*))?\}\}/g

function merge(html: string, values: Record<string, string>, escape: boolean): string {
  const lookup = new Map(Object.entries(values).map(([k, v]) => [k.toLowerCase(), v]))
  return html.replace(MERGE, (whole, name: string, fallback?: string) => {
    const value = lookup.get(name.toLowerCase())
    if (value === undefined) return whole
    const chosen = value.trim() ? value : (fallback ?? '').trim()
    return escape ? escapeHtml(chosen) : chosen
  })
}

/**
 * Remove HTML comments (the templates carry long editing notes at the top),
 * but keep Outlook conditional comments, which the layout depends on.
 */
export function stripComments(html: string): string {
  return html.replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
}

const HREF = /(href\s*=\s*)(["'])(https?:\/\/[^"']+)\2/gi

/** The distinct http(s) links in a campaign, in order. These are the ones that get click tracking. */
export function extractLinks(html: string): string[] {
  const resolved = merge(stripComments(html), globalFields(), false)
  const links: string[] = []
  for (const match of Array.from(resolved.matchAll(HREF))) {
    const url = match[3].replace(/&amp;/g, '&')
    if (!url.includes('{{') && !links.includes(url)) links.push(url)
  }
  return links
}

export interface Rendered { html: string; text: string; unsubscribeUrl: string }

export function renderForRecipient(
  html: string,
  recipient: Recipient,
  token: string,
  links: string[],
  options: { track?: boolean } = {}
): Rendered {
  const base = publicBaseUrl()
  const track = options.track ?? true
  const unsubscribeUrl = `${base}/e/u/${token}`

  let out = merge(stripComments(html), globalFields(), false)

  if (track) {
    out = out.replace(HREF, (whole, attr: string, quote: string, url: string) => {
      const index = links.indexOf(url.replace(/&amp;/g, '&'))
      return index === -1 ? whole : `${attr}${quote}${base}/e/c/${token}/${index}${quote}`
    })
  }

  const hadUnsubscribe = /\{\{\s*UnsubscribeURL\s*\}\}/i.test(out)
  out = merge(out, {
    FirstName: recipient.first_name ?? '',
    LastName: recipient.last_name ?? '',
    Email: recipient.email,
    UnsubscribeURL: unsubscribeUrl,
  }, true)

  // Every message must offer a way out. Templates that don't place their own
  // link get a plain footer.
  if (!hadUnsubscribe) {
    const footer =
      `<p style="font-family:Georgia,serif;font-size:12px;color:#777;text-align:center;margin:24px 0">` +
      `Delta Phi Epsilon Foundation &middot; 3222 N Street NW, Washington, DC 20007<br>` +
      `<a href="${unsubscribeUrl}" style="color:#777">Unsubscribe</a></p>`
    out = /<\/body>/i.test(out) ? out.replace(/<\/body>/i, `${footer}</body>`) : out + footer
  }

  if (track) {
    const pixel = `<img src="${base}/e/o/${token}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0">`
    out = /<\/body>/i.test(out) ? out.replace(/<\/body>/i, `${pixel}</body>`) : out + pixel
  }

  return { html: out, text: htmlToText(out), unsubscribeUrl }
}

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'", nbsp: ' ', middot: '·', rarr: '→', larr: '←',
  mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…', copy: '©', zwnj: '', '#8203': '',
}

/** A readable plain-text alternative. Spam filters penalise HTML-only mail. */
export function htmlToText(html: string): string {
  let t = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(head|style|script|title)[\s\S]*?<\/\1>/gi, '')
    // Hidden preheader blocks would otherwise lead the text version.
    .replace(/<div[^>]*display\s*:\s*none[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<a\s[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi, (_m, _q, href: string, label: string) => {
      const text = label.replace(/<[^>]+>/g, '').trim()
      return text && text !== href ? `${text} (${href})` : href
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|h[1-6]|li|table)>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
  t = t.replace(/&(#?\w+);/g, (whole, name: string) => {
    if (name in ENTITIES) return ENTITIES[name]
    if (/^#\d+$/.test(name)) return String.fromCodePoint(Number(name.slice(1)))
    return whole
  })
  return t
    .split('\n').map((line) => line.replace(/[ \t ]+/g, ' ').trim()).join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
