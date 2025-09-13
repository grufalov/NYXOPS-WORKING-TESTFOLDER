// Utility for managing recent values cache for comboboxes
// Stores and retrieves recently used values for Recruiter and Practice fields

const CACHE_EXPIRY_DAYS = 30;
const MAX_RECENT_VALUES = 15;

const getCacheKey = (field) => `rolesAtRisk.recent.${field}.v1`;

const isExpired = (timestamp) => {
  const now = Date.now();
  const expiry = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  return (now - timestamp) > expiry;
};

export const getRecentValues = (field) => {
  try {
    const cacheKey = getCacheKey(field);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      return [];
    }
    
    const parsed = JSON.parse(cached);
    
    // Filter out expired entries
    const validEntries = parsed.filter(entry => 
      entry.timestamp && !isExpired(entry.timestamp)
    );
    
    // Sort by most recent usage
    validEntries.sort((a, b) => b.timestamp - a.timestamp);
    
    // Return just the values, limited to max count
    return validEntries
      .slice(0, MAX_RECENT_VALUES)
      .map(entry => entry.value);
      
  } catch (error) {
    console.error('Error loading recent values:', error);
    return [];
  }
};

export const addRecentValue = (field, value) => {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return;
  }
  
  try {
    const cacheKey = getCacheKey(field);
    const existing = getRecentValues(field);
    
    // Remove the value if it already exists
    const filtered = existing.filter(item => 
      item.toLowerCase() !== value.toLowerCase()
    );
    
    // Add the new value at the beginning
    const updated = [value.trim(), ...filtered].slice(0, MAX_RECENT_VALUES);
    
    // Convert to timestamped format for storage
    const timestamped = updated.map(val => ({
      value: val,
      timestamp: Date.now()
    }));
    
    localStorage.setItem(cacheKey, JSON.stringify(timestamped));
    
  } catch (error) {
    console.error('Error saving recent value:', error);
  }
};

export const clearRecentValues = (field) => {
  try {
    const cacheKey = getCacheKey(field);
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.error('Error clearing recent values:', error);
  }
};

export const cleanupExpiredValues = () => {
  try {
    const fields = ['recruiter', 'practice'];
    
    fields.forEach(field => {
      const cacheKey = getCacheKey(field);
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const parsed = JSON.parse(cached);
        const validEntries = parsed.filter(entry => 
          entry.timestamp && !isExpired(entry.timestamp)
        );
        
        if (validEntries.length !== parsed.length) {
          if (validEntries.length > 0) {
            localStorage.setItem(cacheKey, JSON.stringify(validEntries));
          } else {
            localStorage.removeItem(cacheKey);
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Error cleaning up expired values:', error);
  }
};

// Auto-cleanup on module load
cleanupExpiredValues();
