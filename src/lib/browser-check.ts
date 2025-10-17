// Browser environment check utility
export const isBrowser = typeof window !== 'undefined';
export const isServer = !isBrowser;

// Safe window access
export const safeWindow = isBrowser ? window : undefined;

// Safe document access
export const safeDocument = isBrowser ? document : undefined;

// Safe navigator access
export const safeNavigator = isBrowser ? navigator : undefined;

// Safe location access
export const safeLocation = isBrowser ? window.location : undefined;