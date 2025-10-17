import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "./middleware/rate-limit";
import { csrfProtection, attachCSRFToken } from "./middleware/csrf";
import { applyCSPHeaders } from "./middleware/csp";
import { redirects } from "./lib/redirects";
import { apiRateLimitMiddleware } from "./middleware/api-rate-limit";
import { apiAuthMiddleware } from "./middleware/api-auth";
import { applySecurityHeaders } from "./middleware/security-headers";

// Development-only routes that should be blocked in production
const DEV_ONLY_ROUTES = [
  "/developer-tools",
  "/debug-js",
  "/debug",
  "/test-sentry",
  "/test-minimal",
  "/test-deploy",
  "/dev",
  "/button-audit",
  "/canvas-test",
  "/demo-ai-design",
  "/demo-sidebar"
];

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks(.*)",
  "/api/health",
  "/sign-in",
  "/sign-up",
  "/pricing",
  "/features",
  "/about",
  "/privacy",
  "/terms",
  "/support",
  "/faq",
  "/contact",
  "/how-it-works",
  "/glossary",
  "/pricing-simple",
  "/getting-started",
  "/demo/ml", // Allow ML demo
]);

// Helper functions
const isApiRoute = (pathname: string) => pathname.startsWith('/api/');
const isWebhookRoute = (pathname: string) => pathname.startsWith('/api/webhooks/');
const isHealthRoute = (pathname: string) => pathname === '/api/health';
const isStaticAsset = (pathname: string) => pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/);

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;
  const isDev = process.env.NODE_ENV === 'development';
  
  // Skip middleware for static assets to prevent loops
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }
  
  // Block dev-only routes in production
  if (!isDev && DEV_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  // Handle redirects for consolidated pages
  if (redirects[pathname as keyof typeof redirects]) {
    return NextResponse.redirect(new URL(redirects[pathname as keyof typeof redirects], req.url));
  }
  
  // Initialize response
  let response = NextResponse.next();
  
  try {
    // Apply security headers first (except for webhooks)
    if (!isWebhookRoute(pathname)) {
      response = await applySecurityHeaders(req, response);
      response = await applyCSPHeaders(req, response);
    }
    
    // Skip auth for public routes and health checks
    if (!isPublicRoute(req) && !isHealthRoute(pathname)) {
      // Protect route with Clerk auth
      await auth().protect();
      
      // Apply CSRF protection for non-GET requests
      if (req.method !== 'GET' && req.method !== 'HEAD' && !isApiRoute(pathname)) {
        const csrfResult = await csrfProtection(req);
        if (!csrfResult.valid) {
          return new NextResponse('Invalid CSRF token', { status: 403 });
        }
        // Attach new CSRF token to response
        response = await attachCSRFToken(req, response);
      }
    }
    
    // API-specific middleware
    if (isApiRoute(pathname) && !isWebhookRoute(pathname) && !isHealthRoute(pathname)) {
      // Apply API authentication
      const apiAuth = await apiAuthMiddleware(req);
      if (apiAuth.status !== 200) {
        return apiAuth;
      }
      
      // Apply API rate limiting
      const rateLimitResult = await apiRateLimitMiddleware(req);
      if (rateLimitResult.status === 429) {
        return rateLimitResult;
      }
    }
    
    // General rate limiting for all non-static routes
    if (!isStaticAsset(pathname)) {
      const identifier = req.ip || req.headers.get('x-forwarded-for') || 'anonymous';
      const { success, remaining, reset } = await rateLimit(identifier, pathname);
      
      if (!success) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        });
      }
      
      // Add rate limit headers to successful responses
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', reset.toString());
    }
    
  } catch (error) {
    console.error('Middleware error:', error);
    // Don't throw, return response to prevent loops
  }
  
  return response;
});

export const config = {
  matcher: [
    // Match all routes except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};