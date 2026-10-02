import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to login page and API routes without authentication
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Check for authentication for other admin routes
  if (pathname.startsWith('/admin')) {
    if (await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)) {
      return NextResponse.next()
    } else {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // For all other routes, proceed normally
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/(.*)', '/api/admin/(.*)'],
}
