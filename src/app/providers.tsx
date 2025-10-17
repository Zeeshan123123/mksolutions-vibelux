/*
// commented old code
'use client'

import { useEffect, useState } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { usePathname, useRouter } from 'next/navigation'
import { NonceProvider } from '@/components/NonceProvider'
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider'
import { NotificationProvider } from '@/components/ui/NotificationSystem'
import { AuthProvider } from '@/contexts/AuthContext'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { CartProvider } from '@/contexts/CartContext'

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Generate a client-side nonce for CSP-aware components
  const [nonce, setNonce] = useState('')
  
  useEffect(() => {
    setMounted(true)
    setNonce(Math.random().toString(36).slice(2))
  }, [])

  // Prevent hydration mismatches by only rendering after mount
  if (!mounted) {
    return null
  }

  // Simplified Clerk configuration - let it use defaults
  const clerkProps = {
    signInUrl: '/sign-in',
    signUpUrl: '/sign-up',
    afterSignInUrl: pathname || '/dashboard',
    afterSignUpUrl: pathname || '/dashboard',
  }

  return (
    <ClerkProvider {...clerkProps}>
      <NonceProvider nonce={nonce}>
        <AuthProvider>
          <SubscriptionProvider>
            <CartProvider>
              <AccessibilityProvider>
                <NotificationProvider>
                  {children}
                </NotificationProvider>
              </AccessibilityProvider>
            </CartProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </NonceProvider>
    </ClerkProvider>
  )
}
*/

'use client';

import { useEffect, useState } from 'react';
import { NonceProvider } from '@/components/NonceProvider';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';
import { NotificationProvider } from '@/components/ui/NotificationSystem';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { CartProvider } from '@/contexts/CartContext';

// ✅ NOTE: No ClerkProvider here. It's only in app/layout.tsx.

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [nonce, setNonce] = useState('');

  useEffect(() => {
    setMounted(true);
    setNonce(Math.random().toString(36).slice(2));
  }, []);

  // Prevent hydration mismatches by only rendering after mount
  if (!mounted) return null;

  return (
    <NonceProvider nonce={nonce}>
      <AuthProvider>
        <SubscriptionProvider>
          <CartProvider>
            <AccessibilityProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </AccessibilityProvider>
          </CartProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </NonceProvider>
  );
}
