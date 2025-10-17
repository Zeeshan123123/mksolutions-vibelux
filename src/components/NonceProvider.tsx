'use client';

import { createContext, useContext } from 'react';

interface NonceContextType {
  nonce: string;
}

const NonceContext = createContext<NonceContextType | undefined>(undefined);

export function NonceProvider({
  children,
  nonce,
}: {
  children: React.ReactNode;
  nonce: string;
}) {
  return (
    <NonceContext.Provider value={{ nonce }}>
      {children}
    </NonceContext.Provider>
  );
}

export function useNonce(): string {
  const context = useContext(NonceContext);
  if (!context) {
    throw new Error('useNonce must be used within a NonceProvider');
  }
  return context.nonce;
}

// Script component that automatically applies nonce
export function NonceScript({
  children,
  ...props
}: React.HTMLAttributes<HTMLScriptElement> & { children?: string }) {
  const nonce = useNonce();
  
  if (children) {
    return (
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: children }}
        {...props}
      />
    );
  }
  
  return <script nonce={nonce} {...props} />;
}

// Style component that automatically applies nonce
export function NonceStyle({
  children,
  ...props
}: React.HTMLAttributes<HTMLStyleElement> & { children: string }) {
  const nonce = useNonce();
  
  return (
    <style
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: children }}
      {...props}
    />
  );
}