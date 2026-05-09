import { Request, Response, NextFunction } from 'express';

// Simple LRU Cache implementation
class LRUCache<V> {
  private cache: Map<string, { value: V; expiresAt: number }>;
  private maxItems: number;

  constructor(maxItems = 100) {
    this.cache = new Map();
    this.maxItems = maxItems;
  }

  get(key: string): V | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    
    // Refresh position to simulate LRU
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  set(key: string, value: V, ttlSeconds: number) {
    if (this.cache.size >= this.maxItems) {
      // Delete oldest item (first in Map iteration)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    
    this.cache.set(key, { value, expiresAt: Date.now() + (ttlSeconds * 1000) });
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

// Global cache instance
export const requestCache = new LRUCache<{body: any, contentType: string}>(200);

/**
 * Creates an Express middleware that caches API responses in memory.
 * Best used for read-heavy, slow-to-compute endpoints (like dashboard stats).
 * 
 * Cache key is generated from the URL path + query string + authenticated user ID/branch.
 * 
 * @param ttlSeconds How long to cache the response
 * @param keyBuilder Optional custom key builder function
 */
export function apiCache(ttlSeconds: number, keyBuilder?: (req: Request) => string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching if requested by client
    if (req.headers['x-no-cache'] || req.query.fresh) {
      return next();
    }

    // Build a unique cache key for this request + user context
    const buildKey = () => {
      if (keyBuilder) return keyBuilder(req);
      
      const userId = req.user?.id || 'anonymous';
      const branchId = req.headers['x-branch-id'] || 'default-branch';
      return `${userId}:${branchId}:${req.originalUrl}`;
    };

    const cacheKey = buildKey();
    const cachedResponse = requestCache.get(cacheKey);

    if (cachedResponse) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Content-Type', cachedResponse.contentType);
      return res.status(200).send(cachedResponse.body);
    }

    res.setHeader('X-Cache', 'MISS');

    // Intercept res.json and res.send to save the response
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // @ts-ignore
    res.json = (body: any) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        requestCache.set(cacheKey, { 
          body: JSON.stringify(body), 
          contentType: 'application/json; charset=utf-8' 
        }, ttlSeconds);
      }
      return originalJson(body);
    };

    // @ts-ignore
    res.send = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const contentType = res.get('Content-Type') || 'application/json; charset=utf-8';
        requestCache.set(cacheKey, { body, contentType }, ttlSeconds);
      }
      return originalSend(body);
    };

    next();
  };
}

/**
 * Helper to manually invalidate all cached items matching a prefix
 */
export function invalidateCache(prefix: string) {
   // A simple flush for the whole cache is safer and avoids memory/iteration complexities.
   // Often when a mutation happens, clearing the cache completely is the simplest way 
   // to ensure fresh data for all users, especially since traffic is low (in an HR portal).
   requestCache.clear();
}
