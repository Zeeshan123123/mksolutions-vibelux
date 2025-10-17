import { headers } from 'next/headers';
import { getNonce } from '@/middleware/csp';
import { NonceProvider } from '@/components/NonceProvider';

export async function NonceInjector({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const nonce = getNonce(headersList) || '';
  
  return <NonceProvider nonce={nonce}>{children}</NonceProvider>;
}