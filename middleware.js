// middleware.js
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
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
        remove(name, options) {
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

  const path = request.nextUrl.pathname

  // ONLY protect /admin routes
  if (path.startsWith('/admin')) {
    const { data: { user } } = await supabase.auth.getUser()

    // No user -> redirect to login
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check if user exists in admin_users table
    try {
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      // If user NOT in admin_users table, redirect to login
      if (!adminUser) {
        // Optionally log them out
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (error) {
      console.error('Middleware error:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Allow access to all other routes
  return response
}

// Only run middleware on /admin routes
export const config = {
  matcher: '/admin/:path*',
}