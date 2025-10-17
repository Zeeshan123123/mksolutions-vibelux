'use client';

import React from 'react';
import { logger } from '@/lib/client-logger';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class CartErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('system', 'Cart Error Boundary caught an error:', error, errorInfo );
  }

  render() {
    if (this.state.hasError) {
      // If it's a cart-specific error, provide a fallback
      if (this.state.error?.message?.includes('useCart')) {
        return this.props.fallback || null;
      }
      
      // Re-throw other errors
      throw this.state.error;
    }

    return this.props.children;
  }
}