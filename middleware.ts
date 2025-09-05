import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: Record<string, unknown>) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: Record<string, unknown>) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const pathname = request.nextUrl.pathname

    // Define protected routes - make sure to include all admin paths
    const adminRoutes = ['/dashboard', '/projects']
    const authRoutes = ['/login']

    // Check if current path is an admin route (including nested paths)
    const isAdminRoute = adminRoutes.some(route =>
        pathname.startsWith(route)
    )
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    // Special handling for root path
    const isRootPath = pathname === '/'
    const hasGuestParam = request.nextUrl.searchParams.has('guest')

    // If user is not authenticated
    if (!user) {
        // If trying to access admin routes, redirect to login
        if (isAdminRoute) {
            const redirectUrl = new URL('/login', request.url)
            // Add original path as redirect parameter
            redirectUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(redirectUrl)
        }

        // If on root path without guest param, redirect to login
        if (isRootPath && !hasGuestParam) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Allow access to auth routes and guest routes
        return response
    }

    // If user is authenticated
    if (user) {
        // If trying to access auth routes, redirect to dashboard
        if (isAuthRoute) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        // Allow access to all other routes for authenticated users
        return response
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
