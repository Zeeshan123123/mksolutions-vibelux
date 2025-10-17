import { headers } from 'next/headers';
import { getNonce } from '@/middleware/csp';

// Server-side function to get nonce
export async function getServerNonce(): Promise<string> {
  const headersList = await headers();
  return getNonce(headersList) || '';
}

// Helper to create inline script with nonce
export function createInlineScript(code: string, nonce: string): string {
  return `<script nonce="${nonce}">${code}</script>`;
}

// Helper to create inline style with nonce
export function createInlineStyle(css: string, nonce: string): string {
  return `<style nonce="${nonce}">${css}</style>`;
}

// Common third-party scripts that need to be updated
export const THIRD_PARTY_SCRIPTS = {
  // Google Analytics (if used)
  googleAnalytics: (measurementId: string, nonce: string) => `
    <script nonce="${nonce}">
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    </script>
  `,
  
  // Clerk initialization (if needed inline)
  clerkInit: (nonce: string) => `
    <script nonce="${nonce}">
      window.__clerk_frontend_api = '${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}';
    </script>
  `,
};