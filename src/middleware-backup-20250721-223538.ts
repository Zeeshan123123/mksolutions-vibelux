import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, apiRateLimits } from "./middleware/rate-limit";
import { csrfProtection, attachCSRFToken, rotateCSRFToken } from "./middleware/csrf";
import { applyCSPHeaders } from "./middleware/csp";
import { SecurityConfig, getUserRole, hasPermission, UserRole, Permissions, logSecurityEvent } from "./lib/security-config";
import { redirects } from "./lib/redirects";
import { withAccessControl, PROTECTED_ROUTES as SUBSCRIPTION_ROUTES } from "./lib/auth/access-control";
import { apiRateLimitMiddleware } from "./middleware/api-rate-limit";

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

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  "/control-center",
  "/admin",
  "/settings",
  "/database",
  "/monitoring",
  "/analytics",
  "/design/advanced",
  "/electrical",
  "/maintenance",
  "/account"
];

// Admin-only routes that require special permissions
const ADMIN_ONLY_ROUTES = [
  "/admin",
  "/control-center",
  "/database",
  "/monitoring",
  "/analytics/admin"
];

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks(.*)",
  "/api/user/subscription", // Allow subscription API
  "/api/admin/impersonation/status", // Allow impersonation status check
  // Note: /api/admin/setup and /api/admin/grant-access are properly secured with auth + secret
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
  "/api/health", // Health check endpoint
]);

// Define API routes that need rate limiting
const isApiRoute = (req: NextRequest) => req.nextUrl.pathname.startsWith('/api/');
const isAiRoute = (req: NextRequest) => req.nextUrl.pathname.includes('/ai/') || req.nextUrl.pathname.includes('/claude/');
const isAuthRoute = (req: NextRequest) => req.nextUrl.pathname.includes('/auth/') || req.nextUrl.pathname.includes('/sign-');
const isUploadRoute = (req: NextRequest) => req.nextUrl.pathname.includes('/upload') || req.nextUrl.pathname.includes('/image');

// Define routes that trigger CSRF token rotation
const isTokenRotationRoute = (req: NextRequest) => {
  const pathname = req.nextUrl.pathname;
  return pathname.includes('/sign-in') || pathname.includes('/sign-out') || pathname.includes('/sign-up');
};

// Use centralized security configuration
const OWNER_EMAILS = SecurityConfig.ownerEmails;
const ADMIN_EMAILS = SecurityConfig.adminEmails;

// Helper to check if route is protected
const isProtectedRoute = (pathname: string) => {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
};

// Helper to check if route is admin-only
const isAdminRoute = (pathname: string) => {
  return ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));
};

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;
  
  // Temporarily simplified middleware to fix infinite loops
  
  // Handle redirects for consolidated pages
  if (redirects[pathname as keyof typeof redirects]) {
    return NextResponse.redirect(new URL(redirects[pathname as keyof typeof redirects], req.url));
  }
  
  // Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth().protect();
  }

  // Handle response
  let response = NextResponse.next();
  
  // Apply CSP headers to all responses
  response = await applyCSPHeaders(req, response);
  
  return response;
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)", 
    "/", 
    "/(api|trpc)(.*)",
    // Add subscription-protected routes
    "/design/advanced/:path*",
    "/analytics/advanced/:path*",
    "/research/:path*",
    "/bms/:path*",
    "/robotics/:path*",
    "/multi-site/:path*",
    "/food-safety/:path*",
    "/business-intelligence/:path*",
  ],
};