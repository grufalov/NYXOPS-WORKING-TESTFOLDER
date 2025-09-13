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
    const wrappedText = `<span class="${fontSizeClass}">${selectedText}</span>`;
    
    // Apply the change through onAction
    onAction((text, selection) => ({
      text: text.slice(0, start) + wrappedText + text.slice(end),
      newSelection: { start: start, end: start + wrappedText.length }
    }));
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
    const colorOption = textColorOptions?.find(opt => opt.value === newColor);
    const colorClass = colorOption ? colorOption.colorClass : (isDarkTheme ? 'text-white' : 'text-gray-900');
    const wrappedText = `<span class="${colorClass}">${selectedText}</span>`;
    
    // Apply the change through onAction
    onAction((text, selection) => ({
      text: text.slice(0, start) + wrappedText + text.slice(end),
      newSelection: { start: start, end: start + wrappedText.length }
    }));
  };

  const toolbarItems = [
    {
      id: 'bold',
      icon: Bold,
      title: 'Bold (Ctrl+B)',
      action: () => onAction(markdownActions.bold)
    },
    {
      id: 'italic',
      icon: Italic,
      title: 'Italic (Ctrl+I)',
      action: () => onAction(markdownActions.italic)
    },
    {
      id: 'strikethrough',
      icon: Strikethrough,
      title: 'Strikethrough',
      action: (text, selection) => {
        if (selection.start === selection.end) {
          return {
            text: text.slice(0, selection.start) + '~~strikethrough~~' + text.slice(selection.end),
            newSelection: { start: selection.start + 2, end: selection.start + 15 }
          };
        } else {
          const selectedText = text.slice(selection.start, selection.end);
          return {
            text: text.slice(0, selection.start) + `~~${selectedText}~~` + text.slice(selection.end),
            newSelection: { start: selection.start, end: selection.end + 4 }
          };
        }
      }
    },
    { id: 'divider1', type: 'divider' },
    // Font controls will be inserted here as custom elements
    { id: 'font-controls', type: 'font-controls' },
    { id: 'divider2', type: 'divider' },
    {
      id: 'h1',
      icon: Heading1,
      title: 'Heading 1',
      action: () => onAction(markdownActions.header, 1)
    },
    {
      id: 'h2',
      icon: Heading2,
      title: 'Heading 2',
      action: () => onAction(markdownActions.header, 2)
    },
    {
      id: 'h3',
      icon: Heading3,
      title: 'Heading 3',
      action: () => onAction(markdownActions.header, 3)
    },
    { id: 'divider3', type: 'divider' },
    {
      id: 'bulletList',
      icon: List,
      title: 'Bullet List',
      action: () => onAction(markdownActions.list, false)
    },
    {
      id: 'numberedList',
      icon: ListOrdered,
      title: 'Numbered List',
      action: () => onAction(markdownActions.list, true)
    },
    { id: 'divider4', type: 'divider' },
    {
      id: 'code',
      icon: Code,
      title: 'Inline Code',
      action: (text, selection) => {
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
      }
    },
    {
      id: 'link',
      icon: Link,
      title: 'Link',
      action: (text, selection) => {
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
      }
    }
  ];

  const handleToolbarAction = (item) => {
    if (disabled || !item.action) return;
    
    if (typeof item.action === 'function') {
      if (item.action.length > 0) {
        // Action expects parameters (text, selection, etc.)
        onAction(item.action);
      } else {
        // Action is a simple function call
        item.action();
      }
    }
  };

  return (
    <div className={`flex items-center flex-wrap gap-1 p-2 border rounded-md relative ${
      isDarkTheme ? 'border-gray-600 bg-[#424250]/50' : 'border-gray-200 bg-[#e3e3f5]'
    }`}>
      {toolbarItems.map((item) => {
        if (item.type === 'divider') {
          return (
            <div
              key={item.id}
              className={`w-px h-6 mx-1 ${isDarkTheme ? 'bg-gray-600' : 'bg-gray-300'}`}
            />
          );
        }

        if (item.type === 'font-controls') {
          return (
            <div key={item.id} className="flex items-center gap-1">
              {/* Font Size Control */}
              <div className="relative">
                <select
                  value={fontSize || 'text-sm'}
                  onChange={(e) => applyFontSizeToSelection(e.target.value)}
                  disabled={disabled}
                  className={`text-xs px-2 py-1 rounded border ${
                    isDarkTheme 
                      ? 'bg-[#8a87d6] border-slate-600 text-white' 
                      : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Font Size"
                >
                  {fontSizeOptions?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  )) || [
                    <option key="text-xs" value="text-xs">XS</option>,
                    <option key="text-sm" value="text-sm">S</option>,
                    <option key="text-base" value="text-base">M</option>,
                    <option key="text-lg" value="text-lg">L</option>,
                    <option key="text-xl" value="text-xl">XL</option>
                  ]}
                </select>
              </div>

              {/* Color Control */}
              <div className="relative" ref={fontControlsRef}>
                <button
                  onClick={() => setShowFontControls(!showFontControls)}
                  disabled={disabled}
                  className={`p-2 rounded-md transition-colors ${
                    disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : isDarkTheme
                        ? 'text-gray-300 hover:text-white hover:bg-[#8a87d6]'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-[#ffffff]'
                  }`}
                  title="Text Color"
                >
                  <Palette className="w-4 h-4" />
                </button>
                
                {showFontControls && (
                  <div className={`absolute top-full left-0 mt-1 p-2 rounded-lg shadow-lg border z-50 ${
                    isDarkTheme ? 'bg-[#424250] border-slate-600' : 'bg-[#f3f4fd] border-gray-200'
                  }`}>
                    <div className="grid grid-cols-4 gap-1">
                      {(textColorOptions || [
                        { value: 'default', label: 'Default', colorClass: isDarkTheme ? 'text-white' : 'text-gray-900' },
                        { value: 'red', label: 'Red', colorClass: 'text-[#e69a96]' },
                        { value: 'blue', label: 'Blue', colorClass: 'text-[#8a87d6]' },
                        { value: 'green', label: 'Green', colorClass: 'text-[#e69a96]' },
                        { value: 'purple', label: 'Purple', colorClass: 'text-[#8a87d6]' },
                        { value: 'orange', label: 'Orange', colorClass: 'text-[#8a87d6]' },
                        { value: 'teal', label: 'Teal', colorClass: 'text-teal-500' },
                        { value: 'gray', label: 'Gray', colorClass: 'text-gray-500' }
                      ]).map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            applyColorToSelection(option.value);
                            setShowFontControls(false);
                          }}
                          className={`w-6 h-6 rounded border-2 ${
                            textColor === option.value 
                              ? 'border-[#8a87d6]' 
                              : 'border-transparent'
                          }`}
                          title={option.label}
                        >
                          <div className={`w-full h-full rounded ${
                            option.colorClass.includes('text-') 
                              ? `bg-${option.colorClass.split('-')[1]}-500` 
                              : (isDarkTheme ? 'bg-[#f3f4fd]' : 'bg-[#424250]')
                          }`}></div>
                        </button>
                      ))}
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

