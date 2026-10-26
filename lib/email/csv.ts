// Minimal RFC 4180 CSV parsing for contact imports (quoted fields, escaped
// quotes, CRLF), plus guessing which columns hold the email and names.

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  const src = text.replace(/^﻿/, '')
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { field += '"'; i++ }
      else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { row.push(field); field = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some((f) => f.trim())) rows.push(row)
      row = []
    } else field += ch
  }
  row.push(field)
  if (row.some((f) => f.trim())) rows.push(row)
  return rows
}

export interface ColumnMap { email: number; first: number; last: number; full: number }

const find = (header: string[], patterns: RegExp[]) => header.findIndex((h) => patterns.some((p) => p.test(h.trim())))

/** Best guess at the columns, from the header row (or the data, if there's no header). */
export function guessColumns(rows: string[][]): { map: ColumnMap; hasHeader: boolean } {
  const header = (rows[0] ?? []).map((h) => h.toLowerCase())
  const hasHeader = !header.some((h) => h.includes('@'))
  if (!hasHeader) {
    const email = (rows[0] ?? []).findIndex((v) => v.includes('@'))
    return { map: { email, first: -1, last: -1, full: -1 }, hasHeader }
  }
  return {
    hasHeader,
    map: {
      email: find(header, [/^e-?mail/, /email address/, /^address$/]),
      first: find(header, [/^first/, /given/, /^fname/]),
      last: find(header, [/^last/, /surname/, /family/, /^lname/]),
      full: find(header, [/^(full )?name$/, /^contact( name)?$/]),
    },
  }
}

export function rowsToContacts(rows: string[][], map: ColumnMap, hasHeader: boolean) {
  return rows.slice(hasHeader ? 1 : 0).map((r) => {
    let first = map.first >= 0 ? r[map.first]?.trim() ?? '' : ''
    let last = map.last >= 0 ? r[map.last]?.trim() ?? '' : ''
    if (!first && !last && map.full >= 0) {
      const parts = (r[map.full] ?? '').trim().split(/\s+/)
      first = parts.shift() ?? ''
      last = parts.join(' ')
    }
    return { email: (map.email >= 0 ? r[map.email] ?? '' : '').trim(), first_name: first, last_name: last }
  }).filter((c) => c.email)
}
