import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { adminHandler, ok } from '@/lib/email/admin-route'

export const dynamic = 'force-dynamic'

// The designed appeal emails in /emails, offered as starting points in the
// campaign editor. next.config.mjs includes them in this route's bundle.

const DIR = path.join(process.cwd(), 'emails')

export const GET = adminHandler(async () => {
  let files: string[] = []
  try { files = (await readdir(DIR)).filter((f) => f.endsWith('.html')).sort() } catch { /* none bundled */ }
  const templates = await Promise.all(files.map(async (file) => {
    const html = await readFile(path.join(DIR, file), 'utf8')
    const subject = html.match(/Subject line ideas:\s*\n\s*•\s*(.+)/)?.[1]?.trim() ?? ''
    return { name: file.replace(/\.html$/, '').replace(/-/g, ' '), file, subject, html }
  }))
  return ok({ templates })
})
