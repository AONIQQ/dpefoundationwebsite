import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { UPLOAD_BUCKETS } from '@/lib/file-storage'
import { clientIp, tooManyRequests } from '@/lib/rate-limit'
import { writesPaused } from '@/lib/data-store'
export async function POST(request: Request) {
  try {
    const body = await request.json() as HandleUploadBody
    const response = await handleUpload({
      body, request,
      onBeforeGenerateToken: async (pathname) => {
        if (writesPaused()) throw new Error('Uploads are temporarily paused')
        if (tooManyRequests(`file-upload:${clientIp(request)}`, 15, 600000)) throw new Error('Please try again in a few minutes')
        const [bucket, name, extra] = pathname.split('/')
        if (!(UPLOAD_BUCKETS as readonly string[]).includes(bucket) || extra !== undefined || !/^[a-f0-9-]{36}\.(pdf|doc|docx)$/.test(name)) throw new Error('Invalid upload path')
        return { allowedContentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], maximumSizeInBytes: 20 * 1024 * 1024, addRandomSuffix: false, allowOverwrite: false, validUntil: Date.now() + 5 * 60 * 1000 }
      },
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } })
  } catch { return NextResponse.json({ error: 'Unable to authorize upload. Please check the file and try again.' }, { status: 400 }) }
}
