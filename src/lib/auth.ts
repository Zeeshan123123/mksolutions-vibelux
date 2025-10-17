// Authentication utilities
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// Re-export auth from Clerk for convenience
export { auth } from '@clerk/nextjs/server';

// Export getAuth function for compatibility
export const getAuth = auth;

export async function authenticateRequest(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { 
        isAuthenticated: false, 
        userId: null,
        error: 'Unauthorized' 
      };
    }

    return { 
      isAuthenticated: true, 
      userId,
      error: null 
    };
  } catch (error) {
    logger.error('api', 'Authentication error:', error );
    return { 
      isAuthenticated: false, 
      userId: null,
      error: 'Authentication failed' 
    };
  }
}

export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  return userId;
}

export function isAuthorized(userId: string, resourceOwnerId: string): boolean {
  return userId === resourceOwnerId;
}

// NextAuth compatibility layer for routes expecting authOptions
// This is a placeholder since we're using Clerk instead of NextAuth
export const authOptions = {
  providers: [],
  callbacks: {
    async session({ session, token }: any) {
      return session;
    },
    async jwt({ token, user }: any) {
      return token;
    }
  },
  pages: {
    signIn: '/sign-in',
    signOut: '/sign-out',
    error: '/auth/error',
  }
};

// NextAuth compatibility function - converts Clerk auth to NextAuth-like session
export async function getServerSession(options?: any) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }
    
    // Return a NextAuth-compatible session object
    return {
      user: {
        id: userId,
        email: '', // Would need to fetch from Clerk if needed
        name: '', // Would need to fetch from Clerk if needed
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };
  } catch (error) {
    logger.error('api', 'getServerSession error:', error );
    return null;
  }
}