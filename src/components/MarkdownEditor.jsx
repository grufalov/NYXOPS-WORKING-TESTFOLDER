import React, { useState, useRef, useEffect } from 'react';
import { insertMarkdownFormatting, handleMarkdownShortcuts } from '../utils/markdownHelpers.js';
import MarkdownToolbarV15 from './MarkdownToolbarV15.jsx';

/**
 * MarkdownEditor Component for Advisory Issues v1.5
 * Enhanced text editor with markdown formatting support
 */
const MarkdownEditor = ({
  value = '',
  onChange,
  onBlur,
  placeholder = 'Write your note...',
  disabled = false,
  autoFocus = false,
  minHeight = 120,
  maxHeight = 400,
  showToolbar = true,
  showPreview = false,
  onTogglePreview,
  isDarkTheme = true,
  className = ''
}) => {
  const textareaRef = useRef(null);
  const [internalShowPreview, setInternalShowPreview] = useState(showPreview);
  
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);
  
  const handleToolbarAction = (action, customColor = null) => {
    if (!textareaRef.current || disabled) return;
    
    const actionMap = {
      bold: { prefix: '**', suffix: '**', placeholder: 'bold text' },
      italic: { prefix: '*', suffix: '*', placeholder: 'italic text' },
      heading1: { prefix: '# ', suffix: '', placeholder: 'Heading 1' },
      heading2: { prefix: '## ', suffix: '', placeholder: 'Heading 2' },
      heading3: { prefix: '### ', suffix: '', placeholder: 'Heading 3' },
      bulletList: { prefix: '- ', suffix: '', placeholder: 'List item' },
      numberedList: { prefix: '1. ', suffix: '', placeholder: 'List item' },
      color: {
        prefix: customColor ? `<span style="color: ${customColor}">` : '<span style="color: #ff0000">',
        suffix: '</span>',
        placeholder: 'colored text'
      }
    };
    
    const actionConfig = actionMap[action];
    if (!actionConfig) return;
    
    insertMarkdownFormatting(textareaRef.current, actionConfig, customColor);
  };
  
  const handleKeyDown = (e) => {
    if (disabled) return;
    
    // Handle markdown shortcuts
    if (handleMarkdownShortcuts(e, textareaRef.current)) {
      return;
    }
    
    // Handle tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      
      if (e.shiftKey) {
        // Shift+Tab: Remove indentation
        const lines = value.split('\n');
        const startLine = value.substring(0, start).split('\n').length - 1;
        const endLine = value.substring(0, end).split('\n').length - 1;
        
        let newValue = lines.map((line, index) => {
          if (index >= startLine && index <= endLine && line.startsWith('  ')) {
            return line.substring(2);
          }
          return line;
        }).join('\n');
        
        onChange?.(newValue);
      } else {
        // Tab: Add indentation
        const before = value.substring(0, start);
        const after = value.substring(end);
        const newValue = before + '  ' + after;
        
        onChange?.(newValue);
        
        // Update cursor position
        setTimeout(() => {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }, 0);
      }
    }
  };
  
  const handleInput = (e) => {
    if (disabled) return;
    onChange?.(e.target.value);
  };
  
  const handleTogglePreview = () => {
    const newShowPreview = !internalShowPreview;
    setInternalShowPreview(newShowPreview);
    onTogglePreview?.(newShowPreview);
  };
  
  return (
    <div className={`markdown-editor ${className}`}>
      {showToolbar && (
        <MarkdownToolbarV15
          onAction={handleToolbarAction}
          showPreview={internalShowPreview}
          onTogglePreview={handleTogglePreview}
          isDarkTheme={isDarkTheme}
          disabled={disabled}
        />
      )}
      
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border-0 resize-none focus:outline-none focus:ring-0 ${
            isDarkTheme
              ? 'text-white placeholder-slate-400'
              : 'text-gray-900 placeholder-gray-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{
            minHeight: `${minHeight}px`,
            maxHeight: `${maxHeight}px`,
            backgroundColor: isDarkTheme ? '#30313e' : '#f3f4fd'
          }}
          rows={Math.min(Math.max(3, value.split('\n').length + 1), 20)}
        />
        
        {/* Character count and shortcuts hint */}
        <div className={`flex items-center justify-between px-3 py-2 text-xs border-t ${
          isDarkTheme
            ? 'border-slate-600 text-slate-400 bg-[#424250]'
            : 'border-gray-200 text-gray-500 bg-[#e3e3f5]'
        }`}>
          <div className="flex items-center space-x-4">
            <span>{value.length} characters</span>
            <span>{value.split('\n').length} lines</span>
            {value.trim() && (
              <span>{value.trim().split(/\s+/).length} words</span>
            )}
          </div>
          
          {!disabled && (
            <div className="text-xs opacity-75">
              Ctrl+B: Bold, Ctrl+I: Italic, Tab: Indent
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;

