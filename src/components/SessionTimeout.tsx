'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

export function SessionTimeout() {
  const { signOut, isSignedIn } = useAuth();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();

  const resetTimers = () => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    if (!isSignedIn) return;

    // Set warning timer
    warningRef.current = setTimeout(() => {
      if (confirm('Your session will expire in 5 minutes. Would you like to stay signed in?')) {
        resetTimers();
      }
    }, SESSION_TIMEOUT - WARNING_TIME);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      signOut(() => {
        router.push('/sign-in');
      });
    }, SESSION_TIMEOUT);
  };

  useEffect(() => {
    if (!isSignedIn) return;

    // Events that reset the timer
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetTimers();
    };

    // Set initial timers
    resetTimers();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [isSignedIn]);

  return null; // This component doesn't render anything
}