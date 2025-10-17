// This file configures the initialization of Sentry on the client side.
// The config you add here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Replay configuration
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter out known errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    // Random network errors
    "Network request failed",
    "NetworkError",
    "Failed to fetch",
    // Clerk auth errors during development
    "Clerk: ",
  ],

  beforeSend(event, hint) {
    // Filter out events in development
    if (process.env.NODE_ENV === "development") {
      return null;
    }

    // Filter out events from localhost
    if (event.request?.url?.includes("localhost")) {
      return null;
    }

    return event;
  },
});