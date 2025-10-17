import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Public routes (marketing/auth) — allow all nested auth paths too
const isPublicRoute = createRouteMatcher([
  '/',
  '/solutions(.*)',
  '/features(.*)',
  '/pricing(.*)',
  '/docs(.*)',
  '/demo(.*)',
  '/cad-integration(.*)',
  '/sustainability(.*)',
  '/integrations(.*)',
  '/marketplace(.*)',
  '/affiliates(.*)',
  '/affiliate(.*)',
  '/how-it-works(.*)',
  '/changelog(.*)',
  '/faq(.*)',
  '/contact(.*)',
  '/about(.*)',
  '/blog(.*)',

  // 🔑 IMPORTANT: make all auth routes public, including nested steps
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/verify-email-address',
]);

// App areas that require auth (expand as needed)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/facilities(.*)',
  '/projects(.*)',
  '/lighting-designs(.*)',
  '/energy-savings(.*)',
  '/revenue-share(.*)',
  '/settings(.*)',
]);

/*
export default clerkMiddleware(async (auth, req) => {
  // If the route is public, do nothing
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // If it's a protected route, enforce auth
  if (isProtectedRoute(req)) {
    await auth().protect();
  }

  // Otherwise just continue
  return NextResponse.next();
});
*/

export default clerkMiddleware(async (auth, req) => {
  const { pathname, origin } = req.nextUrl;

  // 👇 If someone hits /verify-email-address, send them to the Clerk step
  if (pathname === '/verify-email-address') {
    return NextResponse.redirect(`${origin}/sign-up/verify-email-address`);
  }

  if (isPublicRoute(req)) return NextResponse.next();
  if (isProtectedRoute(req)) await auth().protect();
  return NextResponse.next();
});


/*
export const config = {
  matcher: [
    // Run on everything except static files and Next internals
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
*/

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};