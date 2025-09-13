import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StickyNote, Save, Bold, Italic, List, ListOrdered } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { errorBus } from '../../utils/errorBus';
import ErrorInline from '../../components/ErrorInline';

// Simple debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const EditorToolbar = ({ targetId, isDarkTheme }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current = document.getElementById(targetId);
  }, [targetId]);

  const wrapSelection = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    let newText;
    if (selectedText) {
      newText = beforeText + prefix + selectedText + suffix + afterText;
    } else {
      newText = beforeText + prefix + suffix + afterText;
    }

    textarea.value = newText;
    textarea.focus();
    
    // Trigger change event
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);

    // Set cursor position
    const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  };

  const addList = (ordered = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    let lines = selectedText ? selectedText.split('\n') : [''];
    
    if (ordered) {
      lines = lines.map((line, index) => `${index + 1}. ${line.trim()}`);
    } else {
      lines = lines.map(line => `- ${line.trim()}`);
    }

    const newText = beforeText + lines.join('\n') + afterText;
    textarea.value = newText;
    textarea.focus();
    
    // Trigger change event
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
  };

  const toolbarButtons = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => wrapSelection('**', '**')
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => wrapSelection('_', '_')
    },
    {
      icon: List,
      label: 'Bulleted list',
      action: () => addList(false)
    },
    {
      icon: ListOrdered,
      label: 'Numbered list',
      action: () => addList(true)
    }
  ];

  return (
    <div className={`flex items-center gap-1 p-2 border-b ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'}`}>
      {toolbarButtons.map((button, index) => (
        <button
          key={index}
          onClick={button.action}
          className={`p-2 rounded hover:bg-[#ffffff] dark:hover:bg-[#8a87d6] transition-colors ${
            isDarkTheme ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
          title={button.label}
          aria-label={button.label}
        >
          <button.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
};

const QuickNotesCard = ({ isDarkTheme, user }) => {
  const [note, setNote] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadNote();
    }
  }, [user?.id]);

  // Debounced autosave
  const debouncedSave = useCallback(
    debounce(async (noteId, newContent) => {
      try {
        setSaving(true);
        const { error: updateError } = await supabase
          .from('my_desk_notes')
          .update({
            content: newContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', noteId);

        if (updateError) throw updateError;

        setLastSaved(new Date());
      } catch (err) {
        errorBus.pushError({ source: 'Quick Notes Autosave', message: err.message });
      } finally {
        setSaving(false);
      }
    }, 600),
    []
  );

  useEffect(() => {
    if (note?.id && content !== note.content) {
      debouncedSave(note.id, content);
    }
  }, [content, note?.id, debouncedSave]);

  const loadNote = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to find existing note
      const { data: existingNote, error: fetchError } = await supabase
        .from('my_desk_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'daily')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingNote) {
        setNote(existingNote);
        setContent(existingNote.content || '');
      } else {
        // Create new note
        const { data: newNote, error: createError } = await supabase
          .from('my_desk_notes')
          .insert([{
            user_id: user.id,
            content: '',
            type: 'daily',
            pinned: false
          }])
          .select()
          .single();

        if (createError) throw createError;

        setNote(newNote);
        setContent('');
      }
    } catch (err) {
      setError(err.message);
      errorBus.pushError({ source: 'Quick Notes Load', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const forceSave = async () => {
    if (!note?.id) return;

    try {
      setSaving(true);
      const { error: updateError } = await supabase
        .from('my_desk_notes')
        .update({
          content: content,
          updated_at: new Date().toISOString()
        })
        .eq('id', note.id);

      if (updateError) throw updateError;

      setLastSaved(new Date());
    } catch (err) {
      errorBus.pushError({ source: 'Quick Notes Force Save', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Force save with Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        forceSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, note?.id]);

  const SaveIndicator = ({ savedAt }) => {
    if (saving) {
      return (
        <div className="flex items-center gap-1 text-xs text-[#8a87d6]">
          <Save className="w-3 h-3 animate-spin" />
          Saving...
        </div>
      );
    }

    if (savedAt) {
      return (
        <div className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
          Saved {savedAt.toLocaleTimeString()}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-xl shadow-lg overflow-hidden min-h-[260px]`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-yellow-500" />
            <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              Quick Notes
            </h3>
          </div>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-2">
            <div className={`h-4 ${isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#ffffff]'} rounded w-3/4`}></div>
            <div className={`h-4 ${isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#ffffff]'} rounded w-1/2`}></div>
            <div className={`h-4 ${isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#ffffff]'} rounded w-2/3`}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-xl shadow-lg p-6 min-h-[260px]`}>
        <div className="flex items-center gap-2 mb-4">
          <StickyNote className="w-5 h-5 text-yellow-500" />
          <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Quick Notes
          </h3>
        </div>
        <ErrorInline 
          message={error}
          onRetry={loadNote}
          isDarkTheme={isDarkTheme}
        />
      </div>
    );
  }

  return (
    <div className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-xl shadow-lg overflow-hidden min-h-[260px]`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-yellow-500" />
          <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Quick Notes
          </h3>
        </div>
        <SaveIndicator savedAt={lastSaved} />
      </div>

      {/* Formatting Toolbar */}
      <EditorToolbar 
        targetId="quick-notes-editor"
        isDarkTheme={isDarkTheme}
      />

      {/* Notes Editor */}
      <div className="p-4">
        <textarea
          id="quick-notes-editor"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your notes... Supports **bold**, _italic_, - bullets, and 1. numbered lists"
          className={`w-full h-40 p-3 border rounded resize-none ${
            isDarkTheme
              ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400'
              : 'bg-[#f3f4fd] border-gray-300 placeholder-gray-500'
          } focus:outline-none focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent`}
          aria-label="Quick Notes editor"
        />
        
        <div className="flex items-center justify-between mt-2">
          <p className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
            {content.length} characters • Auto-saves • Ctrl+S to force save
          </p>
          
          <button
            onClick={forceSave}
            disabled={saving}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              saving
                ? 'bg-[#ffffff] text-gray-400 cursor-not-allowed'
                : isDarkTheme
                ? 'bg-[#8a87d6] text-slate-300 hover:bg-[#8a87d6]'
                : 'bg-[#ffffff] text-gray-600 hover:bg-[#f3f4fd]'
            }`}
          >
            {saving ? 'Saving...' : 'Save Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickNotesCard;

