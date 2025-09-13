import { supabase } from '../supabaseClient.js';

/**
 * Helper functions for My Desk operations
 */

// Task count and limit helpers
export const getActiveTaskCount = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_active_task_count', { user_uuid: userId });

    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.error('Error getting active task count:', error);
    return 0;
  }
};

export const checkTaskLimit = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('check_user_task_limit', { user_uuid: userId });

    if (error) throw error;
    return data || { count: 0, warning: false, limit_reached: false };
  } catch (error) {
    console.error('Error checking task limit:', error);
    return { count: 0, warning: false, limit_reached: false };
  }
};

// Auto-save helpers
export const createAutoSaveFunction = (saveFunction, delay = 500) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      saveFunction(...args);
    }, delay);
  };
};

// PIN utilities
export const getPinValidationRules = () => ({
  minLength: 4,
  maxLength: 6,
  pattern: /^\d+$/,
  errorMessages: {
    length: 'PIN must be 4-6 digits',
    pattern: 'PIN must contain only numbers',
    mismatch: 'PINs do not match'
  }
});

export const validatePin = (pin, confirmPin = null) => {
  const rules = getPinValidationRules();
  
  if (pin.length < rules.minLength || pin.length > rules.maxLength) {
    return { isValid: false, error: rules.errorMessages.length };
  }
  
  if (!rules.pattern.test(pin)) {
    return { isValid: false, error: rules.errorMessages.pattern };
  }
  
  if (confirmPin !== null && pin !== confirmPin) {
    return { isValid: false, error: rules.errorMessages.mismatch };
  }
  
  return { isValid: true, error: null };
};

// Date helpers
export const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

export const getYesterdayDateString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

export const isNewDay = (lastResetDate) => {
  const today = getTodayDateString();
  return !lastResetDate || lastResetDate !== today;
};

// Tag helpers
export const extractTagsFromTasks = (tasks) => {
  const allTags = tasks.reduce((tags, task) => {
    if (task.tags && Array.isArray(task.tags)) {
      return [...tags, ...task.tags];
    }
    return tags;
  }, []);
  
  return [...new Set(allTags)].sort();
};

export const parseTagString = (tagString) => {
  if (!tagString) return [];
  
  return tagString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .slice(0, 10); // Limit to 10 tags
};

export const formatTagsForDisplay = (tags) => {
  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return '';
  }
  
  return tags.join(', ');
};

// Priority helpers
export const getPriorityConfig = () => ({
  low: {
    label: 'Low',
    color: 'green',
    bgColor: 'bg-[#f3f4fd] dark:bg-[#f3f4fd]/20',
    textColor: 'text-[#e69a96] dark:text-[#e69a96]',
    borderColor: 'border-[#f3f4fd] dark:border-[#f3f4fd]',
    sortOrder: 3
  },
  medium: {
    label: 'Medium',
    color: 'yellow',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    textColor: 'text-yellow-800 dark:text-yellow-300',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    sortOrder: 2
  },
  high: {
    label: 'High',
    color: 'red',
    bgColor: 'bg-[#e69a96] dark:bg-[#e69a96]/20',
    textColor: 'text-[#e69a96] dark:text-[#e69a96]',
    borderColor: 'border-[#e69a96] dark:border-[#e69a96]',
    sortOrder: 1
  }
});

export const getPriorityStyles = (priority) => {
  const config = getPriorityConfig();
  return config[priority] || config.medium;
};

export const sortTasksByPriority = (tasks) => {
  const config = getPriorityConfig();
  
  return [...tasks].sort((a, b) => {
    const aPriority = config[a.priority] || config.medium;
    const bPriority = config[b.priority] || config.medium;
    
    // First sort by completion status (incomplete first)
    if (a.is_completed !== b.is_completed) {
      return a.is_completed ? 1 : -1;
    }
    
    // Then by priority (high to low)
    if (aPriority.sortOrder !== bPriority.sortOrder) {
      return aPriority.sortOrder - bPriority.sortOrder;
    }
    
    // Finally by creation date (newest first)
    return new Date(b.created_at) - new Date(a.created_at);
  });
};

// Text processing helpers
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const sanitizeInput = (input) => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .substring(0, 1000); // Limit length
};

// Markdown helpers
export const markdownActions = {
  bold: (text, selection) => {
    if (selection.start === selection.end) {
      return {
        text: text.slice(0, selection.start) + '**bold text**' + text.slice(selection.end),
        newSelection: { start: selection.start + 2, end: selection.start + 11 }
      };
    } else {
      const selectedText = text.slice(selection.start, selection.end);
      return {
        text: text.slice(0, selection.start) + `**${selectedText}**` + text.slice(selection.end),
        newSelection: { start: selection.start, end: selection.end + 4 }
      };
    }
  },
  
  italic: (text, selection) => {
    if (selection.start === selection.end) {
      return {
        text: text.slice(0, selection.start) + '*italic text*' + text.slice(selection.end),
        newSelection: { start: selection.start + 1, end: selection.start + 12 }
      };
    } else {
      const selectedText = text.slice(selection.start, selection.end);
      return {
        text: text.slice(0, selection.start) + `*${selectedText}*` + text.slice(selection.end),
        newSelection: { start: selection.start, end: selection.end + 2 }
      };
    }
  },

  strikethrough: (text, selection) => {
    if (selection.start === selection.end) {
      return {
        text: text.slice(0, selection.start) + '~~strikethrough text~~' + text.slice(selection.end),
        newSelection: { start: selection.start + 2, end: selection.start + 20 }
      };
    } else {
      const selectedText = text.slice(selection.start, selection.end);
      return {
        text: text.slice(0, selection.start) + `~~${selectedText}~~` + text.slice(selection.end),
        newSelection: { start: selection.start, end: selection.end + 4 }
      };
    }
  },

  code: (text, selection) => {
    if (selection.start === selection.end) {
      return {
        text: text.slice(0, selection.start) + '`code`' + text.slice(selection.end),
        newSelection: { start: selection.start + 1, end: selection.start + 5 }
      };
    } else {
      const selectedText = text.slice(selection.start, selection.end);
      return {
        text: text.slice(0, selection.start) + `\`${selectedText}\`` + text.slice(selection.end),
        newSelection: { start: selection.start, end: selection.end + 2 }
      };
    }
  },

  link: (text, selection) => {
    if (selection.start === selection.end) {
      return {
        text: text.slice(0, selection.start) + '[link text](url)' + text.slice(selection.end),
        newSelection: { start: selection.start + 1, end: selection.start + 10 }
      };
    } else {
      const selectedText = text.slice(selection.start, selection.end);
      return {
        text: text.slice(0, selection.start) + `[${selectedText}](url)` + text.slice(selection.end),
        newSelection: { start: selection.end + 3, end: selection.end + 6 }
      };
    }
  },
  
  header: (text, selection, level = 1) => {
    const prefix = '#'.repeat(level) + ' ';
    const lineStart = text.lastIndexOf('\n', selection.start - 1) + 1;
    
    return {
      text: text.slice(0, lineStart) + prefix + text.slice(lineStart),
      newSelection: { start: selection.start + prefix.length, end: selection.end + prefix.length }
    };
  },

  h1: (text, selection) => {
    return markdownActions.header(text, selection, 1);
  },

  h2: (text, selection) => {
    return markdownActions.header(text, selection, 2);
  },

  h3: (text, selection) => {
    return markdownActions.header(text, selection, 3);
  },
  
  list: (text, selection, ordered = false) => {
    const prefix = ordered ? '1. ' : '- ';
    const lineStart = text.lastIndexOf('\n', selection.start - 1) + 1;
    
    return {
      text: text.slice(0, lineStart) + prefix + text.slice(lineStart),
      newSelection: { start: selection.start + prefix.length, end: selection.end + prefix.length }
    };
  },

  orderedList: (text, selection) => {
    return markdownActions.list(text, selection, true);
  }
};

// Local storage helpers
export const getMyDeskCache = (userId, key) => {
  try {
    const cacheKey = `mydesk_${userId}_${key}`;
    const cached = localStorage.getItem(cacheKey);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

export const setMyDeskCache = (userId, key, data) => {
  try {
    const cacheKey = `mydesk_${userId}_${key}`;
    localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
};

export const clearMyDeskCache = (userId) => {
  try {
    const keys = Object.keys(localStorage);
    const prefix = `mydesk_${userId}_`;
    
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

// Export helpers for My Desk (future use)
export const prepareMyDeskExportData = (data) => {
  const { checklistItems, tasks, notes, quickCapture } = data;
  
  return {
    exported_at: new Date().toISOString(),
    checklist: checklistItems.map(item => ({
      text: item.item_text,
      completed: item.is_completed,
      created: item.created_at
    })),
    tasks: tasks.filter(task => !task.is_deleted).map(task => ({
      title: task.title,
      description: task.description,
      priority: task.priority,
      tags: task.tags,
      completed: task.is_completed,
      created: task.created_at,
      updated: task.updated_at
    })),
    notes: {
      content: notes,
      last_updated: new Date().toISOString()
    },
    quick_capture: quickCapture.map(item => ({
      content: item.content,
      processed: item.is_processed,
      created: item.created_at
    }))
  };
};

// Error handling helpers
export const handleMyDeskError = (error, context = 'My Desk operation') => {
  console.error(`${context}:`, error);
  
  // Common error types and user-friendly messages
  const errorMessages = {
    '23505': 'This item already exists.',
    '42501': 'You do not have permission to perform this action.',
    'PGRST301': 'Database connection error. Please try again.',
    'PGRST116': 'No data found.',
    'NETWORK_ERROR': 'Network connection error. Please check your internet connection.'
  };
  
  const userMessage = errorMessages[error.code] || 
                     errorMessages[error.message] || 
                     'An unexpected error occurred. Please try again.';
  
  return {
    error: true,
    message: userMessage,
    technical: error.message || error.toString()
  };
};

// Performance helpers
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};
