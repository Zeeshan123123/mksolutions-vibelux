import { headers } from 'next/headers';
import { getNonce } from '@/middleware/csp';
import { getCSPConfig, buildCSP } from '@/lib/csp/config';

/**
 * Server component that renders a CSP meta tag for static pages
 * This is useful for pages that might be statically generated
 */
export async function CSPMetaTag() {
  const headersList = await headers();
  const nonce = getNonce(headersList) || '';
  
  // Get CSP configuration based on environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  const cspConfig = getCSPConfig(isDevelopment);
  
  // Build CSP header string
  const cspHeader = buildCSP(cspConfig, nonce);
  
  return (
    <>
      <meta 
        httpEquiv="Content-Security-Policy" 
        content={cspHeader}
      />
      {/* Store nonce in a meta tag for client-side access if needed */}
      <meta name="csp-nonce" content={nonce} />
    </>
  );
}

/**
 * Client-side hook to get CSP nonce from meta tag
 * Use this in client components that need the nonce but can't use NonceProvider
 */
export function useCSPNonceFromMeta(): string | null {
  if (typeof window === 'undefined') return null;
  
  const metaTag = document.querySelector('meta[name="csp-nonce"]');
  return metaTag?.getAttribute('content') || null;
}