import React from 'react';
import { parseMarkdown } from '../utils/markdownHelpers.js';

/**
 * MarkdownPreview Component for Advisory Issues v1.5
 * Renders markdown content with live preview
 */
const MarkdownPreview = ({
  content = '',
  isDarkTheme = true,
  className = '',
  maxHeight = 400,
  showBorder = true
}) => {
  const parsedContent = parseMarkdown(content);
  
  if (!content.trim()) {
    return (
      <div className={`flex items-center justify-center py-8 ${
        showBorder ? `border rounded-lg ${
          isDarkTheme ? 'border-slate-600' : 'border-gray-200'
        }` : ''
      } ${className}`}>
        <div className={`text-center ${
          isDarkTheme ? 'text-slate-400' : 'text-gray-500'
        }`}>
          <div className="text-sm font-medium mb-1">Nothing to preview</div>
          <div className="text-xs">Start typing to see a live preview</div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`markdown-preview overflow-y-auto ${
        showBorder ? `border rounded-lg ${
          isDarkTheme ? 'border-slate-600' : 'border-gray-200'
        }` : ''
      } ${className}`}
      style={{ maxHeight: `${maxHeight}px` }}
    >
      <div 
        className={`p-4 prose prose-sm max-w-none ${
          isDarkTheme 
            ? 'prose-invert text-slate-200' 
            : 'text-gray-900'
        }`}
        dangerouslySetInnerHTML={{ __html: parsedContent }}
        style={{
          // Custom CSS for markdown elements
          '--markdown-heading-color': isDarkTheme ? '#e2e8f0' : '#1f2937',
          '--markdown-text-color': isDarkTheme ? '#f3f4fd' : '#374151',
          '--markdown-border-color': isDarkTheme ? '#475569' : '#d1d5db',
          '--markdown-code-bg': isDarkTheme ? '#424250' : '#f3f4f6',
          '--markdown-quote-border': isDarkTheme ? '#6366f1' : '#8a87d6'
        }}
      />
      
      <style jsx>{`
        .markdown-preview .markdown-heading {
          color: var(--markdown-heading-color);
          font-weight: 600;
          margin: 1em 0 0.5em 0;
          line-height: 1.25;
        }
        
        .markdown-preview h1.markdown-heading {
          font-size: 1.5em;
          border-bottom: 2px solid var(--markdown-border-color);
          padding-bottom: 0.25em;
        }
        
        .markdown-preview h2.markdown-heading {
          font-size: 1.25em;
          border-bottom: 1px solid var(--markdown-border-color);
          padding-bottom: 0.125em;
        }
        
        .markdown-preview h3.markdown-heading {
          font-size: 1.1em;
        }
        
        .markdown-preview .markdown-list {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }
        
        .markdown-preview .markdown-list li {
          margin: 0.25em 0;
          color: var(--markdown-text-color);
        }
        
        .markdown-preview .markdown-quote {
          border-left: 4px solid var(--markdown-quote-border);
          margin: 1em 0;
          padding: 0.5em 1em;
          background-color: var(--markdown-code-bg);
          font-style: italic;
        }
        
        .markdown-preview .markdown-code {
          background-color: var(--markdown-code-bg);
          padding: 0.125em 0.25em;
          border-radius: 0.25em;
          font-size: 0.875em;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        
        .markdown-preview p {
          margin: 0.75em 0;
          line-height: 1.6;
          color: var(--markdown-text-color);
        }
        
        .markdown-preview strong {
          font-weight: 600;
          color: var(--markdown-heading-color);
        }
        
        .markdown-preview em {
          font-style: italic;
        }
        
        .markdown-preview a {
          color: ${isDarkTheme ? '#60a5fa' : '#8a87d6'};
          text-decoration: underline;
        }
        
        .markdown-preview a:hover {
          color: ${isDarkTheme ? '#93c5fd' : '#8a87d6'};
        }
        
        /* Color spans styling */
        .markdown-preview span[style*="color"] {
          font-weight: 500;
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .markdown-preview {
            font-size: 0.875em;
          }
          
          .markdown-preview h1.markdown-heading {
            font-size: 1.25em;
          }
          
          .markdown-preview h2.markdown-heading {
            font-size: 1.125em;
          }
          
          .markdown-preview h3.markdown-heading {
            font-size: 1em;
          }
        }
      `}</style>
    </div>
  );
};

export default MarkdownPreview;
