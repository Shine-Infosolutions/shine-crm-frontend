// Performance monitoring utility for dashboard
export const performanceMonitor = {
  startTime: null,
  
  start() {
    this.startTime = performance.now();
  },
  
  end(label = 'Dashboard Load') {
    if (this.startTime) {
      const duration = performance.now() - this.startTime;
      console.log(`${label}: ${duration.toFixed(2)}ms`);
      this.startTime = null;
      return duration;
    }
    return 0;
  },
  
  measure(fn, label) {
    return async (...args) => {
      this.start();
      try {
        const result = await fn(...args);
        this.end(label);
        return result;
      } catch (error) {
        this.end(`${label} (Error)`);
        throw error;
      }
    };
  }
};

// Request deduplication utility
export const requestDeduplicator = {
  activeRequests: new Map(),
  
  deduplicate(key, requestFn) {
    if (this.activeRequests.has(key)) {
      return this.activeRequests.get(key);
    }
    
    const promise = requestFn().finally(() => {
      this.activeRequests.delete(key);
    });
    
    this.activeRequests.set(key, promise);
    return promise;
  },
  
  clear() {
    this.activeRequests.clear();
  }
};