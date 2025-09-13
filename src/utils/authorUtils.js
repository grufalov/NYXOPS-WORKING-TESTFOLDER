// Helper function to get clean author names for notes
export const getAuthorName = (note, userProfiles = {}) => {
  // First try author_name if present
  if (note.author_name && note.author_name.trim()) {
    return note.author_name.trim();
  }
  
  // Then try to map author_id to profiles.full_name
  if (note.author_id && userProfiles[note.author_id]?.full_name) {
    return userProfiles[note.author_id].full_name;
  }
  
  // Then try created_by (common field name) to profiles
  if (note.created_by && userProfiles[note.created_by]?.full_name) {
    return userProfiles[note.created_by].full_name;
  }
  
  // Then try the author field (which might be email)
  if (note.author && note.author.trim()) {
    const author = note.author.trim();
    
    // If it's an email, prettify the local part
    if (author.includes('@')) {
      const localPart = author.split('@')[0];
      // Convert periods and underscores to spaces, then title case
      const prettified = localPart
        .replace(/[._]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      return prettified;
    }
    
    return author;
  }
  
  // Fallback
  return 'Unknown User';
};
