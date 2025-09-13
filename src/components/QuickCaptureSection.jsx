import React, { useState, useEffect, useRef } from 'react';
import { PenTool, Send, ArrowRight, Clock, X, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import { createAutoSaveFunction, sanitizeInput } from '../utils/myDeskHelpers.js';

const QuickCaptureSection = ({ items, setItems, onConvertToTask, user, isDarkTheme }) => {
  const [currentInput, setCurrentInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef = useRef(null);

  // Auto-save function with debouncing
  const autoSave = useRef(
    createAutoSaveFunction(async (content) => {
      if (content.trim()) {
        await saveQuickCapture(content);
      }
    }, 2000)
  );

  useEffect(() => {
    // Auto-focus on mount
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const saveQuickCapture = async (content) => {
    if (!content.trim()) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('my_desk_quick_capture')
        .insert({
          user_id: user.id,
          content: sanitizeInput(content)
        })
        .select()
        .single();

      if (error) throw error;

      setItems([data, ...items]);
      setCurrentInput('');
    } catch (error) {
      console.error('Error saving quick capture:', error);
    }
    setSaving(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCurrentInput(value);
    
    // Trigger auto-save
    autoSave.current(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSaveAsTask();
    }
  };

  const handleSaveAsTask = async () => {
    if (!currentInput.trim()) return;

    try {
      // Convert to task via parent callback
      await onConvertToTask(currentInput.trim());
      
      // Clear input
      setCurrentInput('');
      
      // Mark as processed if it was saved to quick capture
      const recentItem = items.find(item => item.content === currentInput.trim());
      if (recentItem) {
        await markAsProcessed(recentItem.id);
      }
    } catch (error) {
      console.error('Error converting to task:', error);
    }
  };

  const markAsProcessed = async (id) => {
    try {
      const { error } = await supabase
        .from('my_desk_quick_capture')
        .update({ is_processed: true })
        .eq('id', id);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === id ? { ...item, is_processed: true } : item
      ));
    } catch (error) {
      console.error('Error marking as processed:', error);
    }
  };

  const deleteItem = async (id) => {
    try {
      const { error } = await supabase
        .from('my_desk_quick_capture')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting quick capture item:', error);
    }
  };

  const convertToTask = async (item) => {
    try {
      await onConvertToTask(item.content);
      await markAsProcessed(item.id);
    } catch (error) {
      console.error('Error converting item to task:', error);
    }
  };

  const unprocessedItems = items.filter(item => !item.is_processed);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <PenTool className="w-5 h-5 text-[#8a87d6]" />
          <h3 className="text-lg font-semibold">Quick Capture</h3>
        </div>
        <div className="flex items-center space-x-2">
          {unprocessedItems.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`text-sm px-2 py-1 rounded-md transition-colors ${
                showHistory 
                  ? 'bg-[#8a87d6] dark:bg-[#8a87d6]/30 text-[#8a87d6] dark:text-[#8a87d6]'
                  : isDarkTheme ? 'bg-[#424250] text-gray-300 hover:bg-gray-600' : 'bg-[#f3f4fd] text-gray-600 hover:bg-gray-300'
              }`}
            >
              {unprocessedItems.length} saved
            </button>
          )}
          {saving && (
            <div className="flex items-center space-x-1 text-sm text-[#8a87d6]">
              <div className="w-3 h-3 border-2 border-[#8a87d6] border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={currentInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Quickly capture thoughts, ideas, or notes... (Ctrl+Enter to save as task)"
            className={`w-full p-3 border rounded-md resize-none transition-all duration-200 ${
              isDarkTheme
                ? 'bg-[#424250] border-gray-600 text-white placeholder-gray-400 focus:border-[#8a87d6]'
                : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8a87d6]'
            } focus:outline-none focus:ring-2 focus:ring-[#8a87d6] focus:ring-opacity-20`}
            rows={3}
            style={{ minHeight: '80px', maxHeight: '200px' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
            }}
          />
        </div>

        {/* Action Buttons */}
        {currentInput.trim() && (
          <div className="flex space-x-2">
            <button
              onClick={() => saveQuickCapture(currentInput)}
              disabled={saving}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isDarkTheme
                  ? 'bg-[#424250] text-gray-300 hover:bg-gray-600 disabled:opacity-50'
                  : 'bg-[#f3f4fd] text-gray-700 hover:bg-gray-300 disabled:opacity-50'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Save Note</span>
            </button>
            
            <button
              onClick={handleSaveAsTask}
              className="flex items-center space-x-2 px-3 py-2 bg-[#8a87d6] hover:bg-[#8a87d6] text-white rounded-md text-sm font-medium transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Save as Task</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Capture History */}
      {showHistory && unprocessedItems.length > 0 && (
        <div className={`border rounded-md p-4 space-y-3 ${isDarkTheme ? 'border-gray-600 bg-[#424250]/50' : 'border-gray-200 bg-[#e3e3f5]'}`}>
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Recent Captures</h4>
            <button
              onClick={() => setShowHistory(false)}
              className={`p-1 rounded-md hover:bg-[#f3f4fd] dark:hover:bg-[#424250] transition-colors ${isDarkTheme ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {unprocessedItems.slice(0, 10).map(item => (
              <div
                key={item.id}
                className={`p-3 rounded-md border group hover:border-[#8a87d6] dark:hover:border-[#8a87d6] transition-colors ${isDarkTheme ? 'bg-[#424250] border-gray-600' : 'bg-[#f3f4fd] border-gray-200'}`}
              >
                <div className="flex items-start justify-between space-x-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${isDarkTheme ? 'text-gray-200' : 'text-gray-800'}`}>
                      {item.content}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => convertToTask(item)}
                      className="p-1 rounded-md hover:bg-[#8a87d6] dark:hover:bg-[#8a87d6]/30 text-[#8a87d6] dark:text-[#8a87d6] transition-colors"
                      title="Convert to Task"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1 rounded-md hover:bg-[#e69a96] dark:hover:bg-[#e69a96]/30 text-[#e69a96] dark:text-[#e69a96] transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {unprocessedItems.length === 0 && !currentInput && (
        <div className={`text-center py-8 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
          <PenTool className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Start typing to capture your thoughts</p>
          <p className="text-sm mt-1">Press Ctrl+Enter to save as a task</p>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
        <p>💡 Tips: Enter = new line, Ctrl+Enter = save as task, auto-saves every 2 seconds</p>
      </div>
    </div>
  );
};

export default QuickCaptureSection;

