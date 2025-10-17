// Server-safe imports wrapper
// This file ensures that browser-only modules are not imported during SSR/build

export const isBrowser = typeof window !== 'undefined';
export const isServer = !isBrowser;

// Dynamic import wrapper for browser-only modules
export async function importBrowserOnly<T>(
  importFn: () => Promise<T>
): Promise<T | null> {
  if (isBrowser) {
    return await importFn();
  }
  return null;
}

// Safe global accessors
export const safeWindow = isBrowser ? window : undefined;
export const safeDocument = isBrowser ? document : undefined;
export const safeNavigator = isBrowser ? navigator : undefined;
export const safeLocation = isBrowser ? window.location : undefined;

// Mock addEventListener for server
export const safeAddEventListener = isBrowser 
  ? window.addEventListener.bind(window)
  : () => {};