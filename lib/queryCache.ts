/**
 * Simple in-memory cache for query results
 * Useful for caching frequently accessed data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class QueryCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 60000) { // Default 60 seconds
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get cached data if it exists and is not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Auto-cleanup after TTL
    if (ttl || this.defaultTTL) {
      setTimeout(() => {
        this.cache.delete(key);
      }, ttl || this.defaultTTL);
    }
  }

  /**
   * Clear specific key from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultTTL) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const queryCache = new QueryCache(60000); // 60 seconds default

// Export class for custom instances
export default QueryCache;
