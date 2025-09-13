/**
 * Feature flags configuration
 * Controls visibility and behavior of optional features
 */

export const FEATURES = {
  // File attachments feature - controls UI, modals, exports, and storage operations
  ATTACHMENTS: false, // Set to true to re-enable attachments feature
  
  // Roles at Risk feature - centralizes tracking of aging/blocked/hard-to-fill roles
  ROLES_AT_RISK: true, // Enable the new Roles at Risk feature
  
  // Advisory Issues v1.5 - hybrid table layout, enhanced markdown, export functionality
  ADVISORY_V15: import.meta.env.VITE_ADVISORY_V15 === 'true' || import.meta.env.DEV, // Enable v1.5 features
};

/**
 * Check if a feature is enabled
 * @param {string} featureName - Name of the feature to check
 * @returns {boolean} - Whether the feature is enabled
 */
export const isFeatureEnabled = (featureName) => {
  return FEATURES[featureName] === true;
};
