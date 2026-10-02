import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { get, head } from '@vercel/blob'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-auth'
import { filePath } from '@/lib/file-storage'
export const dynamic = 'force-dynamic'
export async function GET(request: Request) {
  const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' }
  if (!(await verifyAdminToken(cookies().get(ADMIN_COOKIE)?.value))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
  const params = new URL(request.url).searchParams
  const pathname = filePath(params.get('bucket'), params.get('path'))
  if (!pathname) return NextResponse.json({ error: 'Invalid file' }, { status: 400, headers })
  try {
    if (params.get('download') !== '1') {
      await head(pathname)
      params.set('download', '1')
      return NextResponse.json({ url: `/api/admin/files?${params}` }, { headers })
    }
    const result = await get(pathname, { access: 'private' })
    if (result?.statusCode !== 200) return NextResponse.json({ error: 'File unavailable' }, { status: 404, headers })
    return new NextResponse(result.stream, { headers: { ...headers, 'Content-Type': result.blob.contentType, 'Content-Disposition': `${params.get('attachment') === '1' ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(pathname.split('/').pop()!)}` } })
  } catch { return NextResponse.json({ error: 'File unavailable' }, { status: 404, headers }) }
}
