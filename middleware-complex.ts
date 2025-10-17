import { NextRequest, NextResponse } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { rateLimitMiddleware } from './src/middleware/rate-limit'
import { csrfMiddleware } from './src/middleware/csrf'
import { apiAuthMiddleware } from './src/middleware/api-auth'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/facilities(.*)',
  '/projects(.*)',
  '/lighting-designs(.*)',
  '/energy-savings(.*)',
  '/revenue-share(.*)',
  '/settings(.*)'
])

const isAPIRoute = createRouteMatcher([
  '/api/facilities(.*)',
  '/api/projects(.*)',
  '/api/lighting-designs(.*)',
  '/api/energy-savings(.*)',
  '/api/revenue-share(.*)',
  '/api/team(.*)',
  '/api/user(.*)',
  '/api/ai(.*)',
  '/api/sensor-data(.*)',
  '/api/pest-detection(.*)',
  '/api/accounting(.*)',
  '/api/fixture-recommendation(.*)',
  '/api/energy-optimization(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  // Apply rate limiting first
  const rateLimitResponse = await rateLimitMiddleware(req)
  if (rateLimitResponse.status !== 200) {
    return rateLimitResponse
  }

  // Apply CSRF protection for state-changing requests
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    const csrfResponse = await csrfMiddleware(req)
    if (csrfResponse && csrfResponse.status !== 200) {
      return csrfResponse
    }
  }

  // Apply API authentication for API routes
  if (isAPIRoute(req)) {
    const apiAuthResponse = await apiAuthMiddleware(req)
    if (apiAuthResponse.status !== 200) {
      return apiAuthResponse
    }
  }

  // Then apply authentication for protected routes
  if (isProtectedRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      // Redirect to sign-in page
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}