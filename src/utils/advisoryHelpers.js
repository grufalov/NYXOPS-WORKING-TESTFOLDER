import { formatDateDisplay } from './formatDate.js';

/**
 * Advisory Issues Helper Functions for v1.5
 * Business logic and utility functions for advisory issues
 */

/**
 * Calculate age in days for an advisory issue
 * @param {string} createdAt - ISO date string
 * @returns {number} - Age in days
 */
export const calculateAge = (createdAt) => {
  if (!createdAt) return 0;
  
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - created);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Get simplified status for v1.5 (Open/Closed)
 * @param {string} status - Current status
 * @returns {string} - Simplified status
 */
export const getSimplifiedStatus = (status) => {
  if (!status) return 'open';
  
  const openStatuses = ['open', 'monitoring', 'ready_to_escalate'];
  const closedStatuses = ['escalated', 'closed'];
  
  if (openStatuses.includes(status.toLowerCase())) return 'open';
  if (closedStatuses.includes(status.toLowerCase())) return 'closed';
  
  // Default to open for unknown statuses
  return 'open';
};

/**
 * Get status display properties
 * @param {string} status - Status value
 * @returns {Object} - Status display properties
 */
export const getStatusDisplay = (status) => {
  const simplified = getSimplifiedStatus(status);
  
  const statusConfig = {
    open: {
      label: 'Open',
      color: 'text-[#e69a96]',
      bgColor: 'bg-[#f3f4fd]',
      darkColor: 'dark:text-[#e69a96]',
      darkBgColor: 'dark:bg-[#f3f4fd]/20'
    },
    closed: {
      label: 'Closed',
      color: 'text-gray-600',
      bgColor: 'bg-[#f3f4fd]',
      darkColor: 'dark:text-gray-400',
      darkBgColor: 'dark:bg-[#424250]/20'
    }
  };
  
  return statusConfig[simplified] || statusConfig.open;
};

/**
 * Search and filter advisory issues
 * @param {Array} issues - Array of advisory issues
 * @param {string} searchQuery - Search query string
 * @param {Object} filters - Filter options
 * @returns {Array} - Filtered issues
 */
export const searchAndFilterIssues = (issues, searchQuery, filters = {}) => {
  let filteredIssues = [...issues];
  
  // Apply text search
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filteredIssues = filteredIssues.filter(issue => {
      const title = (issue.title || '').toLowerCase();
      const description = (issue.description || issue.background || '').toLowerCase();
      const owner = (issue.owner || issue.business_stakeholder || '').toLowerCase();
      
      return title.includes(query) || 
             description.includes(query) || 
             owner.includes(query);
    });
  }
  
  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    filteredIssues = filteredIssues.filter(issue => {
      const simplified = getSimplifiedStatus(issue.status);
      return simplified === filters.status;
    });
  }
  
  // Apply owner filter
  if (filters.owner && filters.owner.trim()) {
    const ownerQuery = filters.owner.toLowerCase().trim();
    filteredIssues = filteredIssues.filter(issue => {
      const owner = (issue.owner || issue.business_stakeholder || '').toLowerCase();
      return owner.includes(ownerQuery);
    });
  }
  
  // Apply promoted filter
  if (filters.promoted !== undefined) {
    filteredIssues = filteredIssues.filter(issue => 
      Boolean(issue.promoted) === Boolean(filters.promoted)
    );
  }
  
  // Apply age filter
  if (filters.ageRange) {
    filteredIssues = filteredIssues.filter(issue => {
      const age = calculateAge(issue.created_at);
      switch (filters.ageRange) {
        case 'new': return age <= 7;
        case 'medium': return age > 7 && age <= 30;
        case 'old': return age > 30;
        default: return true;
      }
    });
  }
  
  return filteredIssues;
};

/**
 * Highlight search terms in text
 * @param {string} text - Text to highlight
 * @param {string} searchQuery - Search query
 * @returns {string} - Text with highlighted terms
 */
export const highlightSearchTerms = (text, searchQuery) => {
  if (!text || !searchQuery || !searchQuery.trim()) {
    return text || '';
  }
  
  const query = searchQuery.trim();
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
};

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} - Escaped string
 */
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Sort advisory issues by specified criteria
 * @param {Array} issues - Array of issues to sort
 * @param {string} sortBy - Sort field
 * @param {string} sortOrder - Sort order ('asc' or 'desc')
 * @returns {Array} - Sorted issues
 */
export const sortIssues = (issues, sortBy = 'created_at', sortOrder = 'desc') => {
  const sortedIssues = [...issues];
  
  sortedIssues.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = (a.title || '').toLowerCase();
        bValue = (b.title || '').toLowerCase();
        break;
      case 'status':
        aValue = getSimplifiedStatus(a.status);
        bValue = getSimplifiedStatus(b.status);
        break;
      case 'owner':
        aValue = (a.owner || a.business_stakeholder || '').toLowerCase();
        bValue = (b.owner || b.business_stakeholder || '').toLowerCase();
        break;
      case 'age':
        aValue = calculateAge(a.created_at);
        bValue = calculateAge(b.created_at);
        break;
      case 'last_activity':
        aValue = new Date(a.last_activity_date || a.updated_at || a.created_at);
        bValue = new Date(b.last_activity_date || b.updated_at || b.created_at);
        break;
      case 'created_at':
      default:
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
        break;
    }
    
    let comparison = 0;
    if (aValue > bValue) comparison = 1;
    if (aValue < bValue) comparison = -1;
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
  
  return sortedIssues;
};

/**
 * Get summary statistics for advisory issues
 * @param {Array} issues - Array of advisory issues
 * @returns {Object} - Summary statistics
 */
export const getIssueSummary = (issues) => {
  const total = issues.length;
  const open = issues.filter(issue => getSimplifiedStatus(issue.status) === 'open').length;
  const closed = issues.filter(issue => getSimplifiedStatus(issue.status) === 'closed').length;
  const promoted = issues.filter(issue => issue.promoted).length;
  
  // Age distribution
  const ages = issues.map(issue => calculateAge(issue.created_at));
  const avgAge = ages.length > 0 ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : 0;
  const oldestAge = Math.max(...ages, 0);
  
  // Recent activity
  const recentlyActive = issues.filter(issue => {
    const lastActivity = new Date(issue.last_activity_date || issue.updated_at || issue.created_at);
    const daysSinceActivity = Math.floor((new Date() - lastActivity) / (1000 * 60 * 60 * 24));
    return daysSinceActivity <= 7;
  }).length;
  
  return {
    total,
    open,
    closed,
    promoted,
    avgAge,
    oldestAge,
    recentlyActive,
    openPercentage: total > 0 ? Math.round((open / total) * 100) : 0,
    promotedPercentage: total > 0 ? Math.round((promoted / total) * 100) : 0
  };
};

/**
 * Validate advisory issue data
 * @param {Object} issueData - Issue data to validate
 * @returns {Object} - Validation result
 */
export const validateIssueData = (issueData) => {
  const errors = [];
  
  // Required fields
  if (!issueData.title || !issueData.title.trim()) {
    errors.push('Title is required');
  } else if (issueData.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  
  // Optional field validation
  if (issueData.description && issueData.description.length > 5000) {
    errors.push('Description must be less than 5000 characters');
  }
  
  if (issueData.owner && issueData.owner.length > 100) {
    errors.push('Owner name must be less than 100 characters');
  }
  
  // Status validation
  const validStatuses = ['open', 'closed', 'monitoring', 'ready_to_escalate', 'escalated'];
  if (issueData.status && !validStatuses.includes(issueData.status)) {
    errors.push('Invalid status value');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Prepare issue data for promotion to case
 * @param {Object} issue - Advisory issue object
 * @returns {Object} - Case data template
 */
export const preparePromotionData = (issue) => {
  return {
    subject: issue.title || '',
    description: issue.description || issue.background || '',
    owner: issue.owner || issue.business_stakeholder || '',
    status: 'open',
    priority: 'medium',
    type: 'issue',
    origin_advisory_issue_id: issue.id,
    notes: `Promoted from Advisory Issue: ${issue.title}\n\nOriginal Description: ${issue.description || issue.background || 'No description'}`
  };
};

/**
 * Format promotion metadata
 * @param {Object} issue - Advisory issue with promotion data
 * @returns {string} - Formatted promotion info
 */
export const formatPromotionInfo = (issue) => {
  if (!issue.promoted) return '';
  
  const promotedDate = issue.promoted_at ? formatDateDisplay(issue.promoted_at) : 'Unknown date';
  const promotedBy = issue.promoted_by_name || 'Unknown user';
  
  return `Promoted on ${promotedDate} by ${promotedBy}`;
};

/**
 * Get note count for an issue
 * @param {Object} issue - Advisory issue object
 * @returns {number} - Number of notes
 */
export const getNoteCount = (issue) => {
  return issue.advisory_issue_notes?.length || 0;
};

/**
 * Get latest note for an issue
 * @param {Object} issue - Advisory issue object
 * @returns {Object|null} - Latest note or null
 */
export const getLatestNote = (issue) => {
  const notes = issue.advisory_issue_notes;
  if (!notes || notes.length === 0) return null;
  
  return notes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
};

/**
 * Format age display
 * @param {number} ageInDays - Age in days
 * @returns {string} - Formatted age string
 */
export const formatAge = (ageInDays) => {
  if (ageInDays === 0) return 'Today';
  if (ageInDays === 1) return '1 day';
  if (ageInDays < 7) return `${ageInDays} days`;
  if (ageInDays < 30) {
    const weeks = Math.floor(ageInDays / 7);
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  }
  if (ageInDays < 365) {
    const months = Math.floor(ageInDays / 30);
    return months === 1 ? '1 month' : `${months} months`;
  }
  
  const years = Math.floor(ageInDays / 365);
  return years === 1 ? '1 year' : `${years} years`;
};

/**
 * Get age color class based on age
 * @param {number} ageInDays - Age in days
 * @returns {string} - CSS class for age color
 */
export const getAgeColorClass = (ageInDays) => {
  if (ageInDays <= 7) return 'text-[#e69a96] dark:text-[#e69a96]';
  if (ageInDays <= 30) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-[#e69a96] dark:text-[#e69a96]';
};

/**
 * Generate export filename with timestamp
 * @param {string} prefix - Filename prefix
 * @param {string} extension - File extension
 * @returns {string} - Generated filename
 */
export const generateExportFilename = (prefix = 'advisory_issues', extension = 'json') => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${prefix}_${timestamp}.${extension}`;
};

/**
 * Check if issue needs attention (old or no recent activity)
 * @param {Object} issue - Advisory issue object
 * @returns {boolean} - Whether issue needs attention
 */
export const needsAttention = (issue) => {
  const age = calculateAge(issue.created_at);
  const lastActivity = new Date(issue.last_activity_date || issue.updated_at || issue.created_at);
  const daysSinceActivity = Math.floor((new Date() - lastActivity) / (1000 * 60 * 60 * 24));
  
  // Needs attention if:
  // - Open and older than 30 days, or
  // - Open and no activity in 14 days
  const isOpen = getSimplifiedStatus(issue.status) === 'open';
  return isOpen && (age > 30 || daysSinceActivity > 14);
};

/**
 * Get table column configuration for responsive display
 * @param {boolean} isMobile - Whether displaying on mobile
 * @returns {Array} - Column configuration
 */
export const getTableColumns = (isMobile = false) => {
  const allColumns = [
    { key: 'title', label: 'Title', sortable: true, required: true },
    { key: 'status', label: 'Status', sortable: true, required: true },
    { key: 'owner', label: 'Owner', sortable: true, required: false },
    { key: 'age', label: 'Age', sortable: true, required: false },
    { key: 'last_activity', label: 'Last Activity', sortable: true, required: false },
    { key: 'notes', label: 'Notes', sortable: false, required: false },
    { key: 'actions', label: 'Actions', sortable: false, required: true }
  ];
  
  if (isMobile) {
    return allColumns.filter(col => col.required);
  }
  
  return allColumns;
};
