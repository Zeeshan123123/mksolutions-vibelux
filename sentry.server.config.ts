// This file configures the initialization of Sentry on the server side.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Disable in development
  enabled: process.env.NODE_ENV === "production",

  // Filter out known server errors
  ignoreErrors: [
    // Database connection errors during build
    "PrismaClientInitializationError",
    // API rate limits
    "429",
    "Too Many Requests",
  ],

  beforeSend(event, hint) {
    // Don't send events during build
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return null;
    }

    // Filter out health check endpoints
    if (event.request?.url?.includes("/api/health")) {
      return null;
    }

    return event;
  },
});