import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Palette, 
  Eye, 
  EyeOff,
  HelpCircle
} from 'lucide-react';

/**
 * Enhanced MarkdownToolbar Component for Advisory Issues v1.5
 * Provides formatting tools for markdown editing with color support
 */
const MarkdownToolbarV15 = ({ 
  onAction, 
  showPreview, 
  onTogglePreview, 
  isDarkTheme = true,
  disabled = false 
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const colors = [
    { name: 'Red', value: '#e69a96' },
    { name: 'Blue', value: '#8a87d6' },
    { name: 'Green', value: '#f3f4fd' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Purple', value: '#8a87d6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#8a87d6' },
    { name: 'Gray', value: '#6b7280' }
  ];
  
  const toolbarButtons = [
    {
      id: 'bold',
      icon: Bold,
      label: 'Bold',
      shortcut: 'Ctrl+B',
      action: 'bold'
    },
    {
      id: 'italic',
      icon: Italic,
      label: 'Italic',
      shortcut: 'Ctrl+I',
      action: 'italic'
    },
    { type: 'separator' },
    {
      id: 'heading1',
      icon: Heading1,
      label: 'Heading 1',
      shortcut: 'Ctrl+1',
      action: 'heading1'
    },
    {
      id: 'heading2',
      icon: Heading2,
      label: 'Heading 2',
      shortcut: 'Ctrl+2',
      action: 'heading2'
    },
    {
      id: 'heading3',
      icon: Heading3,
      label: 'Heading 3',
      shortcut: 'Ctrl+3',
      action: 'heading3'
    },
    { type: 'separator' },
    {
      id: 'bulletList',
      icon: List,
      label: 'Bullet List',
      shortcut: 'Ctrl+Shift+8',
      action: 'bulletList'
    },
    {
      id: 'numberedList',
      icon: ListOrdered,
      label: 'Numbered List',
      shortcut: 'Ctrl+Shift+7',
      action: 'numberedList'
    },
    { type: 'separator' },
    {
      id: 'color',
      icon: Palette,
      label: 'Text Color',
      action: 'color',
      special: true
    }
  ];
  
  const handleAction = (action, customColor = null) => {
    if (disabled) return;
    onAction?.(action, customColor);
  };
  
  const handleColorSelect = (color) => {
    handleAction('color', color);
    setShowColorPicker(false);
  };
  
  return (
    <div className={`flex items-center gap-1 p-2 border-b ${
      isDarkTheme 
        ? 'border-slate-600 bg-[#424250]' 
        : 'border-gray-200 bg-[#e3e3f5]'
    }`}>
      {/* Main toolbar buttons */}
      <div className="flex items-center gap-1">
        {toolbarButtons.map((button, index) => {
          if (button.type === 'separator') {
            return (
              <div
                key={`separator-${index}`}
                className={`w-px h-6 mx-1 ${
                  isDarkTheme ? 'bg-slate-600' : 'bg-gray-300'
                }`}
              />
            );
          }
          
          const Icon = button.icon;
          
          if (button.special && button.id === 'color') {
            return (
              <div key={button.id} className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  disabled={disabled}
                  className={`p-2 rounded-md transition-colors ${
                    disabled 
                      ? 'opacity-50 cursor-not-allowed'
                      : isDarkTheme
                        ? 'hover:bg-[#8a87d6] text-slate-300 hover:text-white'
                        : 'hover:bg-[#f3f4fd] text-gray-600 hover:text-gray-900'
                  }`}
                  title={`${button.label}${button.shortcut ? ` (${button.shortcut})` : ''}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
                
                {showColorPicker && (
                  <div className={`absolute top-full left-0 mt-1 p-2 rounded-lg shadow-lg border z-10 ${
                    isDarkTheme 
                      ? 'bg-[#424250] border-slate-600' 
                      : 'bg-[#f3f4fd] border-gray-200'
                  }`}>
                    <div className="grid grid-cols-4 gap-1">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => handleColorSelect(color.value)}
                          className="w-6 h-6 rounded border-2 border-transparent hover:border-white transition-colors"
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-300 dark:border-slate-600">
                      <input
                        type="color"
                        onChange={(e) => handleColorSelect(e.target.value)}
                        className="w-full h-6 rounded border-0 bg-transparent cursor-pointer"
                        title="Custom color"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <button
              key={button.id}
              type="button"
              onClick={() => handleAction(button.action)}
              disabled={disabled}
              className={`p-2 rounded-md transition-colors ${
                disabled 
                  ? 'opacity-50 cursor-not-allowed'
                  : isDarkTheme
                    ? 'hover:bg-[#8a87d6] text-slate-300 hover:text-white'
                    : 'hover:bg-[#f3f4fd] text-gray-600 hover:text-gray-900'
              }`}
              title={`${button.label}${button.shortcut ? ` (${button.shortcut})` : ''}`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
      
      {/* Right side controls */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Preview toggle */}
        <button
          type="button"
          onClick={onTogglePreview}
          disabled={disabled}
          className={`p-2 rounded-md transition-colors ${
            showPreview
              ? isDarkTheme
                ? 'bg-[#8a87d6] text-white'
                : 'bg-[#8a87d6] text-white'
              : disabled 
                ? 'opacity-50 cursor-not-allowed'
                : isDarkTheme
                  ? 'hover:bg-[#8a87d6] text-slate-300 hover:text-white'
                  : 'hover:bg-[#f3f4fd] text-gray-600 hover:text-gray-900'
          }`}
          title={showPreview ? 'Hide Preview' : 'Show Preview'}
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        
        {/* Help toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            disabled={disabled}
            className={`p-2 rounded-md transition-colors ${
              showHelp
                ? isDarkTheme
                  ? 'bg-[#8a87d6] text-white'
                  : 'bg-[#8a87d6] text-white'
                : disabled 
                  ? 'opacity-50 cursor-not-allowed'
                  : isDarkTheme
                    ? 'hover:bg-[#8a87d6] text-slate-300 hover:text-white'
                    : 'hover:bg-[#f3f4fd] text-gray-600 hover:text-gray-900'
            }`}
            title="Markdown Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          
          {showHelp && (
            <div className={`absolute top-full right-0 mt-1 p-4 w-80 rounded-lg shadow-lg border z-10 ${
              isDarkTheme 
                ? 'bg-[#424250] border-slate-600 text-slate-200' 
                : 'bg-[#f3f4fd] border-gray-200 text-gray-800'
            }`}>
              <h3 className="font-semibold mb-3">Markdown Formatting</h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <code className={`px-1 rounded ${isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#ffffff]'}`}>
                      **bold**
                    </code>
                  </div>
                  <div>
                    <strong>bold</strong>
                  </div>
                  
                  <div>
                    <code className={`px-1 rounded ${isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#ffffff]'}`}>
                      *italic*
                    </code>
                  </div>
                  <div>
                    <em>italic</em>
                  </div>
                  
                  <div>
                    <code className={`px-1 rounded ${isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#ffffff]'}`}>
                      # Heading 1
                    </code>
                  </div>
                  <div className="font-semibold text-lg">Heading 1</div>
                  
                  <div>
                    <code className={`px-1 rounded ${isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#ffffff]'}`}>
                      ## Heading 2
                    </code>
                  </div>
                  <div className="font-semibold">Heading 2</div>
                  
                  <div>
                    <code className={`px-1 rounded ${isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#ffffff]'}`}>
                      - List item
                    </code>
                  </div>
                  <div>• List item</div>
                  
                  <div>
                    <code className={`px-1 rounded ${isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#ffffff]'}`}>
                      1. Numbered
                    </code>
                  </div>
                  <div>1. Numbered</div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-300 dark:border-slate-600">
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    <div>Colors: Use the color picker or HTML spans</div>
                    <code className="text-xs">
                      &lt;span style="color: #red"&gt;text&lt;/span&gt;
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Click outside handler for dropdowns */}
      {(showColorPicker || showHelp) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowColorPicker(false);
            setShowHelp(false);
          }}
        />
      )}
    </div>
  );
};

export default MarkdownToolbarV15;

