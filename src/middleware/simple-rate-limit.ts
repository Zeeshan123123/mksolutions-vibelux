// Simple rate limiter for middleware
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(
  identifier: string, 
  pathname: string,
  options = { requests: 1000, window: 60000 } // 1000 requests per minute default
) {
  const key = `${identifier}:${pathname}`;
  const now = Date.now();
  
  const record = requestCounts.get(key);
  
  if (!record || now > record.resetTime) {
    // Create new record
    const resetTime = now + options.window;
    requestCounts.set(key, { count: 1, resetTime });
    return { 
      success: true, 
      remaining: options.requests - 1, 
      reset: resetTime 
    };
  }
  
  // Check if limit exceeded
  if (record.count >= options.requests) {
    return { 
      success: false, 
      remaining: 0, 
      reset: record.resetTime 
    };
  }
  
  // Increment count
  record.count++;
  return { 
    success: true, 
    remaining: options.requests - record.count, 
    reset: record.resetTime 
  };
}

// Clean up old entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const entries = Array.from(requestCounts.entries());
    for (const [key, record] of entries) {
      if (now > record.resetTime + 60000) { // Clean up entries older than 1 minute past reset
        requestCounts.delete(key);
      }
    }
  }, 60000); // Run cleanup every minute
}