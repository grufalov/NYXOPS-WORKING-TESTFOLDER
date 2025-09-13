import React, { useState, useEffect, useRef } from 'react';
import { StickyNote, Eye, EyeOff, Maximize2, Minimize2, Save, Clock } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import { createAutoSaveFunction, sanitizeInput } from '../utils/myDeskHelpers.js';
import MarkdownToolbar from './MarkdownToolbar.jsx';

const ScratchpadSection = ({ content, setContent, user, isDarkTheme }) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-save function with debouncing
  const autoSave = useRef(
    createAutoSaveFunction(async (newContent) => {
      await saveNotes(newContent);
    }, 3000) // 3 second delay for auto-save
  );

  useEffect(() => {
    // Load last saved timestamp
    loadLastActivity();
  }, []);

  const loadLastActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('my_desk_notes')
        .select('last_activity')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setLastSaved(new Date(data.last_activity));
      }
    } catch (error) {
      console.error('Error loading last activity:', error);
    }
  };

  const saveNotes = async (newContent) => {
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('my_desk_notes')
        .upsert({
          user_id: user.id,
          content: sanitizeInput(newContent),
          last_activity: now
        });

      if (error) throw error;

      setLastSaved(new Date(now));
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
    setIsSaving(false);
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
    
    // Trigger auto-save
    autoSave.current(newContent);
  };

  const handleManualSave = () => {
    saveNotes(content);
  };

  const applyMarkdownAction = (action, ...args) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const result = action(content, { start, end }, ...args);
    
    setContent(result.text);
    setHasUnsavedChanges(true);
    
    // Restore selection
    setTimeout(() => {
      textarea.setSelectionRange(result.newSelection.start, result.newSelection.end);
      textarea.focus();
    }, 0);
    
    // Trigger auto-save
    autoSave.current(result.text);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    
    if (!isFullscreen) {
      // Entering fullscreen
      if (containerRef.current) {
        containerRef.current.style.position = 'fixed';
        containerRef.current.style.top = '0';
        containerRef.current.style.left = '0';
        containerRef.current.style.right = '0';
        containerRef.current.style.bottom = '0';
        containerRef.current.style.zIndex = '50';
        containerRef.current.style.backgroundColor = isDarkTheme ? '#1f2937' : '#ffffff';
      }
    } else {
      // Exiting fullscreen
      if (containerRef.current) {
        containerRef.current.style.position = '';
        containerRef.current.style.top = '';
        containerRef.current.style.left = '';
        containerRef.current.style.right = '';
        containerRef.current.style.bottom = '';
        containerRef.current.style.zIndex = '';
        containerRef.current.style.backgroundColor = '';
      }
    }
  };

  const renderMarkdown = (text) => {
    // Simple markdown rendering for preview
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\n/g, '<br>');
  };

  const characterCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div ref={containerRef} className={`space-y-4 ${isFullscreen ? 'p-6' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <StickyNote className="w-5 h-5 text-[#8a87d6]" />
          <h3 className="text-lg font-semibold">Personal Notes</h3>
          {hasUnsavedChanges && (
            <div className="w-2 h-2 bg-[#8a87d6] rounded-full" title="Unsaved changes" />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Save Status */}
          {isSaving ? (
            <div className="flex items-center space-x-1 text-sm text-[#8a87d6]">
              <div className="w-3 h-3 border-2 border-[#8a87d6] border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </div>
          ) : lastSaved ? (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          ) : null}
          
          {/* Manual Save Button */}
          <button
            onClick={handleManualSave}
            disabled={!hasUnsavedChanges || isSaving}
            className={`p-2 rounded-md transition-colors ${
              hasUnsavedChanges && !isSaving
                ? 'bg-[#8a87d6] hover:bg-[#8a87d6] text-white'
                : isDarkTheme
                  ? 'bg-[#424250] text-gray-400 cursor-not-allowed'
                  : 'bg-[#f3f4fd] text-gray-400 cursor-not-allowed'
            }`}
            title="Save Now"
          >
            <Save className="w-4 h-4" />
          </button>
          
          {/* Preview Toggle */}
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`p-2 rounded-md transition-colors ${
              isPreviewMode
                ? 'bg-[#8a87d6] dark:bg-[#8a87d6]/30 text-[#8a87d6] dark:text-[#8a87d6]'
                : isDarkTheme
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-[#424250]'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-[#f3f4fd]'
            }`}
            title={isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
          >
            {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          
          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-md transition-colors ${isDarkTheme ? 'text-gray-400 hover:text-gray-200 hover:bg-[#424250]' : 'text-gray-600 hover:text-gray-800 hover:bg-[#f3f4fd]'}`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Markdown Toolbar */}
      {!isPreviewMode && (
        <MarkdownToolbar
          onAction={applyMarkdownAction}
          isDarkTheme={isDarkTheme}
          disabled={isPreviewMode}
        />
      )}

      {/* Editor/Preview Area */}
      <div className={`border rounded-md ${isDarkTheme ? 'border-gray-600' : 'border-gray-300'} ${isFullscreen ? 'flex-1' : ''}`}>
        {isPreviewMode ? (
          // Preview Mode
          <div
            className={`p-4 prose prose-sm max-w-none ${isDarkTheme ? 'prose-invert' : ''} ${
              isFullscreen ? 'h-full overflow-y-auto' : 'min-h-[300px] max-h-[500px] overflow-y-auto'
            }`}
            dangerouslySetInnerHTML={{
              __html: content ? renderMarkdown(content) : '<p class="text-gray-500">No content yet. Switch to edit mode to start writing.</p>'
            }}
          />
        ) : (
          // Edit Mode
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Start writing your notes... Supports Markdown formatting!"
            className={`w-full p-4 border-none rounded-md resize-none ${
              isDarkTheme
                ? 'bg-[#424250] text-white placeholder-gray-400'
                : 'bg-[#f3f4fd] text-gray-900 placeholder-gray-500'
            } focus:outline-none ${
              isFullscreen ? 'h-full' : 'min-h-[300px] max-h-[500px]'
            }`}
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
          />
        )}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>{characterCount} characters</span>
          <span>{wordCount} words</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isPreviewMode && (
            <span>Markdown enabled</span>
          )}
          {hasUnsavedChanges && (
            <span className="text-[#8a87d6]">Unsaved changes</span>
          )}
        </div>
      </div>

      {/* Markdown Help */}
      {!isPreviewMode && !isFullscreen && content.length === 0 && (
        <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'} space-y-1`}>
          <p><strong>Markdown shortcuts:</strong></p>
          <p>**bold** *italic* ~~strikethrough~~ `code` # heading</p>
          <p>- bullet list | 1. numbered list | [link](url)</p>
        </div>
      )}
    </div>
  );
};

export default ScratchpadSection;

