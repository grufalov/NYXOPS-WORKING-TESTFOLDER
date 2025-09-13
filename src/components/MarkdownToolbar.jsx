import React, { useState, useEffect, useRef } from 'react';
import { Bold, Italic, Strikethrough, Code, Link, List, ListOrdered, Heading1, Heading2, Heading3, Type, Palette, ChevronDown } from 'lucide-react';
import { markdownActions } from '../utils/myDeskHelpers.js';

const MarkdownToolbar = ({ 
  onAction, 
  isDarkTheme, 
  disabled = false,
  fontSize,
  setFontSize,
  textColor,
  setTextColor,
  fontSizeOptions,
  textColorOptions,
  textareaRef
}) => {
  const [showFontControls, setShowFontControls] = useState(false);
  const fontControlsRef = useRef(null);

  // Close font controls when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fontControlsRef.current && !fontControlsRef.current.contains(event.target)) {
        setShowFontControls(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to apply font size to selected text only
  const applyFontSizeToSelection = (newFontSize) => {
    if (!textareaRef?.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    if (start === end) {
      // No selection, just update global font size
      setFontSize(newFontSize);
      return;
    }
    
    const selectedText = text.slice(start, end);
    const fontSizeClass = newFontSize;
    
    // Remove existing font size classes from selection
    let cleanText = selectedText.replace(/<span[^>]*style="[^"]*font-size:[^;"]*;?[^"]*"[^>]*>/g, '');
    cleanText = cleanText.replace(/<\/span>/g, '');
    
    // Wrap selection with new font size
    const wrappedText = `<span style="font-size: ${fontSizeClass};">${cleanText}</span>`;
    
    // Replace the selected text
    const newText = text.slice(0, start) + wrappedText + text.slice(end);
    
    // Update textarea directly and trigger content change
    textarea.value = newText;
    textarea.focus();
    
    // Move cursor after the inserted text
    const newPosition = start + wrappedText.length;
    textarea.setSelectionRange(newPosition, newPosition);
    
    // Trigger content change directly instead of using onAction
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
  };

  // Function to apply color to selected text only
  const applyColorToSelection = (newColor) => {
    if (!textareaRef?.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    if (start === end) {
      // No selection, just update global color
      setTextColor(newColor);
      return;
    }
    
    const selectedText = text.slice(start, end);
    
    // Remove existing color classes from selection
    let cleanText = selectedText.replace(/<span[^>]*style="[^"]*color:[^;"]*;?[^"]*"[^>]*>/g, '');
    cleanText = cleanText.replace(/<\/span>/g, '');
    
    // Wrap selection with new color
    const wrappedText = `<span style="color: ${newColor};">${cleanText}</span>`;
    
    // Replace the selected text
    const newText = text.slice(0, start) + wrappedText + text.slice(end);
    
    // Update textarea directly and trigger content change
    textarea.value = newText;
    textarea.focus();
    
    // Move cursor after the inserted text
    const newPosition = start + wrappedText.length;
    textarea.setSelectionRange(newPosition, newPosition);
    
    // Trigger content change directly instead of using onAction
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
  };

  const handleToolbarAction = (item) => {
    if (disabled) return;
    
    if (onAction && markdownActions[item.action]) {
      // Call the markdown action function
      onAction(markdownActions[item.action], item.data);
    }
  };

  const toolbarItems = [
    { id: 'bold', icon: Bold, action: 'bold', title: 'Bold (Ctrl+B)' },
    { id: 'italic', icon: Italic, action: 'italic', title: 'Italic (Ctrl+I)' },
    { id: 'strikethrough', icon: Strikethrough, action: 'strikethrough', title: 'Strikethrough' },
    { id: 'code', icon: Code, action: 'code', title: 'Code' },
    { id: 'link', icon: Link, action: 'link', title: 'Link' },
    { id: 'list', icon: List, action: 'list', title: 'Bullet List' },
    { id: 'orderedList', icon: ListOrdered, action: 'orderedList', title: 'Numbered List' },
    { id: 'h1', icon: Heading1, action: 'h1', title: 'Heading 1' },
    { id: 'h2', icon: Heading2, action: 'h2', title: 'Heading 2' },
    { id: 'h3', icon: Heading3, action: 'h3', title: 'Heading 3' },
  ];

  return (
    <div className={`flex items-center space-x-1 p-2 border-b ${
      isDarkTheme ? 'border-gray-700 bg-[#424250]' : 'border-gray-200 bg-[#e3e3f5]'
    }`}>
      {toolbarItems.map((item) => {
        // Font controls section - placed within the toolbar items
        if (item.id === 'h3') {
          return (
            <div key="font-controls-group" className="flex items-center space-x-1">
              {/* H3 Button */}
              <button
                onClick={() => handleToolbarAction(item)}
                disabled={disabled}
                title={item.title}
                className={`p-2 rounded-md transition-colors ${
                  disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : isDarkTheme
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-[#424250]'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-[#f3f4fd]'
                }`}
              >
                <item.icon className="w-4 h-4" />
              </button>

              {/* Divider */}
              <div className={`w-px h-6 ${isDarkTheme ? 'bg-gray-600' : 'bg-gray-300'}`} />

              {/* Font Controls */}
              <div className="relative" ref={fontControlsRef}>
                <button
                  onClick={() => setShowFontControls(!showFontControls)}
                  disabled={disabled}
                  title="Font Controls"
                  className={`p-2 rounded-md transition-colors flex items-center space-x-1 ${
                    disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : isDarkTheme
                        ? 'text-gray-300 hover:text-white hover:bg-[#8a87d6]'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-[#ffffff]'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <Palette className="w-3 h-3" />
                  <ChevronDown className={`w-3 h-3 transition-transform ${showFontControls ? 'rotate-180' : ''}`} />
                </button>

                {showFontControls && (
                  <div className={`absolute top-full left-0 mt-1 p-3 rounded-lg shadow-lg border z-50 ${
                    isDarkTheme 
                      ? 'bg-[#424250] border-gray-600' 
                      : 'bg-[#f3f4fd] border-gray-200'
                  }`} style={{ minWidth: '200px' }}>
                    {/* Font Size */}
                    <div className="mb-3">
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Font Size
                      </label>
                      <select
                        value={fontSize}
                        onChange={(e) => applyFontSizeToSelection(e.target.value)}
                        className={`w-full px-2 py-1 text-sm rounded border ${
                          isDarkTheme
                            ? 'bg-[#424250] border-gray-600 text-gray-200'
                            : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                        }`}
                      >
                        {fontSizeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Text Color */}
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Text Color
                      </label>
                      <div className="grid grid-cols-6 gap-1">
                        {textColorOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => applyColorToSelection(option.value)}
                            title={option.label}
                            className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${
                              textColor === option.value 
                                ? 'border-[#8a87d6] ring-2 ring-[#8a87d6] ring-opacity-50' 
                                : isDarkTheme ? 'border-gray-600' : 'border-gray-300'
                            }`}
                          >
                            <div className={`w-full h-full rounded ${
                              option.colorClass 
                                ? `bg-${option.colorClass.split('-')[1]}-500` 
                                : (isDarkTheme ? 'bg-[#f3f4fd]' : 'bg-[#424250]')
                            }`}></div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }

        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => handleToolbarAction(item)}
            disabled={disabled}
            title={item.title}
            className={`p-2 rounded-md transition-colors ${
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : isDarkTheme
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-[#424250]'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-[#f3f4fd]'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Keyboard Shortcuts Help */}
      <div className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'} hidden sm:block`}>
        Ctrl+B/I for bold/italic
      </div>
    </div>
  );
};

export default MarkdownToolbar;

