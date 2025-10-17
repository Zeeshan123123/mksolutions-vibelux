'use client';

import { CartProvider } from '@/contexts/CartContext';
import { CartErrorBoundary } from '@/components/CartErrorBoundary';

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartErrorBoundary>
      <CartProvider>
        {children}
      </CartProvider>
    </CartErrorBoundary>
  );
}