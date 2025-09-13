/**
 * Formats a date input into "D Mon YYYY" format (e.g., "5 Aug 2025", "17 Sep 2025")
 * @param {Date|string|number} dateInput - Date object, ISO string, or timestamp
 * @returns {string} Formatted date string or empty string for invalid input
 */
export function formatDateDisplay(dateInput) {
  if (!dateInput) {
    return '';
  }

  let date;
  try {
    // Handle different input types
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
      date = new Date(dateInput);
    } else {
      return '';
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }

    // Format using Intl.DateTimeFormat for proper locale-aware month abbreviations
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short', 
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.warn('formatDateDisplay: Invalid date input', dateInput, error);
    return '';
  }
}
