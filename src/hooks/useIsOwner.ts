'use client';

import { useUser } from '@clerk/nextjs';

// Define owner email(s) - you can add multiple if needed
const OWNER_EMAILS = [
  'blake@vibelux.ai',
  // Add any other admin emails here
];

export function useIsOwner() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded || !user) {
    return { isOwner: false, isLoaded };
  }
  
  // Check if the current user's email is in the owner list
  const primaryEmail = user.primaryEmailAddress?.emailAddress;
  const isOwner = primaryEmail ? OWNER_EMAILS.includes(primaryEmail) : false;
  
  // Also check if user has admin role in metadata
  const hasAdminRole = user.publicMetadata?.role === 'admin';
  
  return {
    isOwner: isOwner || hasAdminRole,
    isLoaded,
    userEmail: primaryEmail,
  };
}