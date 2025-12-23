
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Check if the route is /dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        const authCookie = request.cookies.get('admin_session')

        // If no session cookie, redirect to login
        if (!authCookie) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/dashboard/:path*',
}
