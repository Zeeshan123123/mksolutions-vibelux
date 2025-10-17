import { useEffect, useRef } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

export function useHotkeys(
  keys: string,
  callback: KeyHandler,
  deps: any[] = []
) {
  const callbackRef = useRef<KeyHandler>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const keyPatterns = keys.split(',').map(key => key.trim());
    
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKey = generateKeyString(event);
      
      if (keyPatterns.some(pattern => matchesKeyPattern(pressedKey, pattern))) {
        callbackRef.current(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [keys, ...deps]);
}

function generateKeyString(event: KeyboardEvent): string {
  const parts: string[] = [];
  
  if (event.ctrlKey || event.metaKey) parts.push('cmd');
  if (event.shiftKey) parts.push('shift');
  if (event.altKey) parts.push('alt');
  
  // Handle special keys
  let key = event.key.toLowerCase();
  if (key === ' ') key = 'space';
  if (key === 'arrowup') key = 'up';
  if (key === 'arrowdown') key = 'down';
  if (key === 'arrowleft') key = 'left';
  if (key === 'arrowright') key = 'right';
  
  parts.push(key);
  
  return parts.join('+');
}

function matchesKeyPattern(pressedKey: string, pattern: string): boolean {
  // Normalize pattern
  pattern = pattern.toLowerCase().trim();
  
  // Handle cmd/ctrl equivalence
  const normalizedPressed = pressedKey.replace('cmd', 'ctrl');
  const normalizedPattern = pattern.replace('cmd', 'ctrl');
  
  return normalizedPressed === normalizedPattern;
}