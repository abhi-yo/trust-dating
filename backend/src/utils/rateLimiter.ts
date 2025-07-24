export class RateLimiter {
  private static instance: RateLimiter;
  private requests: Map<string, RequestData[]> = new Map();
  private readonly cleanupInterval: NodeJS.Timeout;

  private constructor() {
    // Clean up old requests every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  checkLimit(identifier: string, endpoint: string, limits: RateLimit): RateLimitResult {
    const key = `${identifier}:${endpoint}`;
    const now = Date.now();
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const requests = this.requests.get(key)!;
    
    // Remove expired requests
    const validRequests = requests.filter(req => now - req.timestamp < limits.windowMs);
    this.requests.set(key, validRequests);

    // Check if limit exceeded
    if (validRequests.length >= limits.maxRequests) {
      const oldestRequest = validRequests[0];
      const resetTime = oldestRequest.timestamp + limits.windowMs;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter: resetTime - now
      };
    }

    // Add current request
    validRequests.push({ timestamp: now });
    
    return {
      allowed: true,
      remaining: limits.maxRequests - validRequests.length,
      resetTime: now + limits.windowMs,
      retryAfter: 0
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(req => now - req.timestamp < maxAge);
      
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
  }

  // Predefined rate limits for different operations
  static readonly LIMITS = {
    TRUST_ANALYSIS: { maxRequests: 10, windowMs: 60000 }, // 10 per minute
    CHAT_ANALYSIS: { maxRequests: 20, windowMs: 60000 }, // 20 per minute
    ACTIVITY_SUGGESTIONS: { maxRequests: 30, windowMs: 60000 }, // 30 per minute
    SCREENSHOT: { maxRequests: 5, windowMs: 60000 }, // 5 per minute
    FILE_SAVE: { maxRequests: 10, windowMs: 60000 } // 10 per minute
  };
}

interface RequestData {
  timestamp: number;
}

interface RateLimit {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter: number;
}
