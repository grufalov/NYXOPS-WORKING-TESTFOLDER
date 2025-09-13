import MarkdownIt from 'markdown-it';

/**
 * Markdown Utilities for Advisory Issues v1.5
 * Enhanced markdown processing with formatting support
 */

// Configure markdown-it with custom options
const md = new MarkdownIt({
  html: true,        // Enable HTML tags
  linkify: true,     // Auto-convert URLs to links
  typographer: true, // Enable smart quotes and other typographic replacements
  breaks: true       // Convert line breaks to <br>
});

/**
 * Parse markdown content to HTML
 * @param {string} content - Raw markdown content
 * @returns {string} - Parsed HTML
 */
export const parseMarkdown = (content) => {
  if (!content) return '';
  
  try {
    // Apply color spans first (before markdown parsing)
    const withColors = processColorSpans(content);
    
    // Parse with markdown-it
    let html = md.render(withColors);
    
    // Post-process for additional formatting
    html = processCustomFormatting(html);
    
    return html;
  } catch (error) {
    console.warn('Markdown parsing error:', error);
    return escapeHtml(content);
  }
};

/**
 * Process color spans in markdown content
 * Converts <span style="color: #xxx">text</span> to proper HTML
 * @param {string} content - Markdown content
 * @returns {string} - Content with processed color spans
 */
const processColorSpans = (content) => {
  // Match color spans with various formats
  const colorRegex = /<span\s+style=["']color:\s*(#[a-fA-F0-9]{3,6}|rgb\([^)]+\)|[a-zA-Z]+)["']>([^<]*)<\/span>/gi;
  
  return content.replace(colorRegex, (match, color, text) => {
    // Sanitize color value
    const sanitizedColor = sanitizeColor(color);
    if (sanitizedColor) {
      return `<span style="color: ${sanitizedColor};">${escapeHtml(text)}</span>`;
    }
    return escapeHtml(text);
  });
};

/**
 * Sanitize color values to prevent XSS
 * @param {string} color - Color value to sanitize
 * @returns {string|null} - Sanitized color or null if invalid
 */
const sanitizeColor = (color) => {
  // Allow hex colors
  if (/^#[a-fA-F0-9]{3,6}$/.test(color)) {
    return color;
  }
  
  // Allow RGB/RGBA
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/i.test(color)) {
    return color;
  }
  
  // Allow named colors (basic set)
  const allowedColors = [
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
    'black', 'white', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'navy',
    'teal', 'silver', 'maroon', 'olive', 'aqua', 'fuchsia'
  ];
  
  if (allowedColors.includes(color.toLowerCase())) {
    return color.toLowerCase();
  }
  
  return null;
};

/**
 * Process custom formatting after markdown parsing
 * @param {string} html - HTML content from markdown
 * @returns {string} - Enhanced HTML content
 */
const processCustomFormatting = (html) => {
  // Add classes to elements for styling
  html = html.replace(/<h([1-6])>/g, '<h$1 class="markdown-heading">');
  html = html.replace(/<ul>/g, '<ul class="markdown-list">');
  html = html.replace(/<ol>/g, '<ol class="markdown-list">');
  html = html.replace(/<blockquote>/g, '<blockquote class="markdown-quote">');
  html = html.replace(/<code>/g, '<code class="markdown-code">');
  
  return html;
};

/**
 * Escape HTML characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Toolbar actions for markdown formatting
 */
export const markdownActions = {
  bold: {
    name: 'Bold',
    icon: 'Bold',
    shortcut: 'Ctrl+B',
    prefix: '**',
    suffix: '**',
    placeholder: 'bold text'
  },
  italic: {
    name: 'Italic',
    icon: 'Italic',
    shortcut: 'Ctrl+I',
    prefix: '*',
    suffix: '*',
    placeholder: 'italic text'
  },
  heading1: {
    name: 'Heading 1',
    icon: 'Heading1',
    shortcut: 'Ctrl+1',
    prefix: '# ',
    suffix: '',
    placeholder: 'Heading 1'
  },
  heading2: {
    name: 'Heading 2',
    icon: 'Heading2',
    shortcut: 'Ctrl+2',
    prefix: '## ',
    suffix: '',
    placeholder: 'Heading 2'
  },
  heading3: {
    name: 'Heading 3',
    icon: 'Heading3',
    shortcut: 'Ctrl+3',
    prefix: '### ',
    suffix: '',
    placeholder: 'Heading 3'
  },
  bulletList: {
    name: 'Bullet List',
    icon: 'List',
    shortcut: 'Ctrl+Shift+8',
    prefix: '- ',
    suffix: '',
    placeholder: 'List item'
  },
  numberedList: {
    name: 'Numbered List',
    icon: 'ListOrdered',
    shortcut: 'Ctrl+Shift+7',
    prefix: '1. ',
    suffix: '',
    placeholder: 'List item'
  },
  color: {
    name: 'Text Color',
    icon: 'Palette',
    shortcut: '',
    prefix: '<span style="color: #ff0000">',
    suffix: '</span>',
    placeholder: 'colored text'
  }
};

/**
 * Insert markdown formatting at cursor position
 * @param {HTMLTextAreaElement} textarea - Textarea element
 * @param {Object} action - Markdown action object
 * @param {string} customColor - Custom color for color action
 */
export const insertMarkdownFormatting = (textarea, action, customColor = null) => {
  if (!textarea) return;
  
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  
  let prefix = action.prefix;
  let suffix = action.suffix;
  
  // Handle color action with custom color
  if (action.name === 'Text Color' && customColor) {
    prefix = `<span style="color: ${customColor}">`;
    suffix = '</span>';
  }
  
  // Determine text to wrap
  const textToWrap = selectedText || action.placeholder;
  
  // Handle line-based formatting (headings, lists)
  if (['heading1', 'heading2', 'heading3', 'bulletList', 'numberedList'].includes(action.name.toLowerCase().replace(/\s/g, ''))) {
    const lines = textarea.value.split('\n');
    const startLine = textarea.value.substring(0, start).split('\n').length - 1;
    const endLine = textarea.value.substring(0, end).split('\n').length - 1;
    
    for (let i = startLine; i <= endLine; i++) {
      if (lines[i] !== undefined) {
        lines[i] = prefix + lines[i];
      }
    }
    
    textarea.value = lines.join('\n');
    textarea.selectionStart = start + prefix.length;
    textarea.selectionEnd = end + prefix.length * (endLine - startLine + 1);
  } else {
    // Inline formatting
    const newText = prefix + textToWrap + suffix;
    const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    
    textarea.value = newValue;
    
    // Set cursor position
    if (selectedText) {
      textarea.selectionStart = start + prefix.length;
      textarea.selectionEnd = start + prefix.length + selectedText.length;
    } else {
      textarea.selectionStart = textarea.selectionEnd = start + prefix.length + action.placeholder.length;
    }
  }
  
  textarea.focus();
  
  // Trigger input event for React
  const event = new Event('input', { bubbles: true });
  textarea.dispatchEvent(event);
};

/**
 * Handle keyboard shortcuts for markdown formatting
 * @param {KeyboardEvent} event - Keyboard event
 * @param {HTMLTextAreaElement} textarea - Textarea element
 * @returns {boolean} - Whether the shortcut was handled
 */
export const handleMarkdownShortcuts = (event, textarea) => {
  if (!event.ctrlKey && !event.metaKey) return false;
  
  const shortcuts = {
    'KeyB': markdownActions.bold,
    'KeyI': markdownActions.italic,
    'Digit1': markdownActions.heading1,
    'Digit2': markdownActions.heading2,
    'Digit3': markdownActions.heading3
  };
  
  if (event.shiftKey) {
    const shiftShortcuts = {
      'Digit8': markdownActions.bulletList,
      'Digit7': markdownActions.numberedList
    };
    
    if (shiftShortcuts[event.code]) {
      event.preventDefault();
      insertMarkdownFormatting(textarea, shiftShortcuts[event.code]);
      return true;
    }
  } else if (shortcuts[event.code]) {
    event.preventDefault();
    insertMarkdownFormatting(textarea, shortcuts[event.code]);
    return true;
  }
  
  return false;
};

/**
 * Strip markdown formatting from text
 * @param {string} content - Markdown content
 * @returns {string} - Plain text
 */
export const stripMarkdown = (content) => {
  if (!content) return '';
  
  return content
    .replace(/\*\*(.*?)\*\*/g, '$1')           // Bold
    .replace(/\*(.*?)\*/g, '$1')               // Italic
    .replace(/#{1,6}\s+(.*)/g, '$1')           // Headings
    .replace(/[-*+]\s+(.*)/g, '$1')            // Bullet lists
    .replace(/\d+\.\s+(.*)/g, '$1')            // Numbered lists
    .replace(/<span[^>]*>(.*?)<\/span>/g, '$1') // Color spans
    .replace(/<[^>]+>/g, '')                   // Any remaining HTML
    .trim();
};

/**
 * Get plain text preview of markdown content
 * @param {string} content - Markdown content
 * @param {number} maxLength - Maximum length of preview
 * @returns {string} - Plain text preview
 */
export const getMarkdownPreview = (content, maxLength = 100) => {
  const plainText = stripMarkdown(content);
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + '...';
};

/**
 * Count words in markdown content
 * @param {string} content - Markdown content
 * @returns {number} - Word count
 */
export const getWordCount = (content) => {
  const plainText = stripMarkdown(content);
  return plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
};

/**
 * Validate markdown content for potential issues
 * @param {string} content - Markdown content
 * @returns {Object} - Validation result with warnings
 */
export const validateMarkdown = (content) => {
  const warnings = [];
  
  if (!content) {
    return { valid: true, warnings: [] };
  }
  
  // Check for unclosed spans
  const openSpans = (content.match(/<span[^>]*>/g) || []).length;
  const closeSpans = (content.match(/<\/span>/g) || []).length;
  if (openSpans !== closeSpans) {
    warnings.push('Unclosed color formatting detected');
  }
  
  // Check for very long content
  if (content.length > 5000) {
    warnings.push('Content is very long and may impact performance');
  }
  
  // Check for potential XSS
  if (/<script/i.test(content) || /javascript:/i.test(content)) {
    warnings.push('Potentially unsafe content detected');
  }
  
  return {
    valid: warnings.length === 0,
    warnings
  };
};
