/**
 * Memory-based error bus for centralized error handling
 * Keeps last 50 errors, clears on app reload
 */

class ErrorBus {
  constructor() {
    this.errors = [];
    this.subscribers = new Set();
    this.maxErrors = 50;
  }

  pushError({ source, message, meta = {} }) {
    const error = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      source,
      message,
      meta
    };

    this.errors.unshift(error);
    
    // Keep only last 50 errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Notify subscribers
    this.notifySubscribers();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  getErrors() {
    return [...this.errors];
  }

  getErrorCount() {
    return this.errors.length;
  }

  clear() {
    this.errors = [];
    this.notifySubscribers();
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.errors);
      } catch (err) {
        console.error('Error in errorBus subscriber:', err);
      }
    });
  }
}

// Export singleton instance
export const errorBus = new ErrorBus();
