
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    console.log('Middleware processing:', request.nextUrl.pathname)

    // Check if the route is /dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        const authCookie = request.cookies.get('admin_session')
        console.log('Session cookie found:', !!authCookie)

        // If no session cookie, redirect to login
        if (!authCookie) {
            console.log('No session, redirecting to login')
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/dashboard/:path*',
}
