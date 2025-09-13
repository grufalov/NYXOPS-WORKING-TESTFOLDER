import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Quill toolbar configuration with color/background pickers
const quillToolbarOptions = [
  [{ 'header': [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'align': [] }],
  ['blockquote', 'code-block'],
  ['link'],
  ['clean']
];
import { StickyNote } from 'lucide-react';
import { supabase } from '../../supabaseClient.js';

const QuickNotesCardEnhanced = ({ isDarkTheme, user }) => {
  // Add custom styles for Quill, remove blue outline/focus ring
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .quill-rounded-toolbar-wrapper .ql-toolbar {
        border-radius: 1rem 1rem 0 0 !important;
        margin-bottom: 0;
        border: 1.5px solid #c5cae9 !important;
        background: #f8f9ff;
        box-shadow: 0 2px 8px 0 rgba(140, 140, 200, 0.06);
        padding: 0.5rem 1rem;
      }
      .quill-rounded-toolbar-wrapper .ql-toolbar button, .quill-rounded-toolbar-wrapper .ql-toolbar .ql-picker {
        border-radius: 0.5rem !important;
      }
      .quill-rounded-toolbar-wrapper .ql-container {
        border-radius: 0 0 1rem 1rem !important;
        border: 1.5px solid #c5cae9 !important;
        border-top: none !important;
        background: #fcfcff;
        box-shadow: 0 2px 8px 0 rgba(140, 140, 200, 0.04);
        padding: 1.25rem 1.5rem 1.5rem 1.5rem;
        min-height: 180px;
        font-size: 1rem;
      }
      .quill-rounded-toolbar-wrapper .ql-editor {
        background: transparent;
        border-radius: 0 0 1rem 1rem !important;
        min-height: 120px;
        padding: 0;
        color: #222;
        outline: none !important;
        box-shadow: none !important;
      }
      .quill-rounded-toolbar-wrapper .ql-editor:focus {
        outline: none !important;
        box-shadow: none !important;
      }
      .quill-rounded-toolbar-wrapper .ql-container:focus-within {
        outline: none !important;
        box-shadow: none !important;
      }
      .quill-rounded-toolbar-wrapper .ql-toolbar button:focus {
        outline: none !important;
        box-shadow: none !important;
      }
      .surface-card {
        background: #f6f7fb !important;
        box-shadow: 0 4px 24px 0 rgba(140, 140, 200, 0.10);
      }
    `;
    document.head.appendChild(style);
    // Remove any old toolbar DOM
    const oldToolbar = document.querySelector('.quick-notes-toolbar-old');
    if (oldToolbar) oldToolbar.remove();
    return () => { document.head.removeChild(style); };
  }, []);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [note, setNote] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  // Helper function to format time
  function formatTime(d) {
    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit", 
        minute: "2-digit"
      }).format(d);
    } catch { 
      return ""; 
    }
  }

  // Debounced autosave every 1s (save HTML, not markdown)
  useEffect(() => {
    if (!loaded || !note?.id) return;
    const handle = setTimeout(async () => {
      setIsSaving(true);
      try {
        const now = new Date().toISOString();
        const { error } = await supabase
          .from("my_desk_notes")
          .update({ 
            content, // HTML from Quill
            last_activity: now,
            updated_at: now
          })
          .eq("id", note.id);
        setIsSaving(false);
        if (!error) {
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
          setNote(prev => ({ ...prev, content }));
        }
      } catch (err) {
        setIsSaving(false);
      }
    }, 1000);
    return () => clearTimeout(handle);
  }, [content, loaded, note?.id]);

  useEffect(() => {
    if (user?.id) {
      loadNote();
    }
  }, [user?.id]);

  const loadNote = async () => {
    try {
      setLoading(true);
      setError(null);
      // Try to find existing note (just get the first one for this user)
      const { data: existingNotes, error: fetchError } = await supabase
        .from('my_desk_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (fetchError) throw fetchError;
      if (existingNotes && existingNotes.length > 0) {
        const existingNote = existingNotes[0];
        setNote(existingNote);
        setContent(existingNote.content || ''); // Use HTML directly
        if (existingNote.last_activity) {
          setLastSaved(new Date(existingNote.last_activity));
        }
      } else {
        // Create new note
        const { data: newNote, error: createError } = await supabase
          .from('my_desk_notes')
          .insert([{
            user_id: user.id,
            content: ''
          }])
          .select()
          .single();
        if (createError) throw createError;
        setNote(newNote);
        setContent('');
      }
      setLoaded(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async (newContent) => {
    if (!note?.id) return;
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('my_desk_notes')
        .update({
          content: newContent, // Save HTML
          last_activity: now,
          updated_at: now
        })
        .eq('id', note.id);
      if (updateError) throw updateError;
      setLastSaved(new Date(now));
      setHasUnsavedChanges(false);
      setNote(prev => ({ ...prev, content: newContent }));
    } catch (error) {
      // Optionally handle error
    }
    setIsSaving(false);
  };

  const handleManualSave = () => {
    saveNotes(content);
  };



  if (loading) {
    return (
      <div className="surface-card overflow-hidden min-h-[260px]" style={{ 
        backgroundColor: '#f3f4fd',
        border: '2px solid #c5cae9',
        borderRadius: '1rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)'
      }}>
        <div className="p-4 border-b border-subtle">
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-yellow-500" />
            <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              Quick Notes
            </h3>
          </div>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 rounded w-3/4"></div>
            <div className="h-4 rounded w-1/2"></div>
            <div className="h-4 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="surface-card p-6 min-h-[260px]" style={{ 
        backgroundColor: '#f3f4fd',
        border: '2px solid #c5cae9',
        borderRadius: '1rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)'
      }}>
        <div className="flex items-center gap-2 mb-4">
          <StickyNote className="w-5 h-5 text-yellow-500" />
          <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Quick Notes
          </h3>
        </div>
        <div className={`p-3 rounded border ${isDarkTheme ? 'bg-danger/20 border-danger text-danger' : 'bg-danger border-danger text-danger'}`}>
          <p className="text-sm">{error}</p>
          <button
            onClick={loadNote}
            className={`mt-2 text-sm underline ${isDarkTheme ? 'text-danger hover:text-danger-hover' : 'text-danger hover:text-danger-hover'}`}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="surface-card overflow-hidden min-h-[300px]"
      style={{ 
        backgroundColor: '#f3f4fd',
        border: '2px solid #c5cae9',
        borderRadius: '1rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#ffffff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#f3f4fd';
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-subtle">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-yellow-500" />
          <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Quick Notes</h3>
          {note?.id && hasUnsavedChanges && (
            <button
              onClick={handleManualSave}
              className="text-xs px-2 py-1 bg-[var(--accent)] text-white rounded hover:bg-[var(--accent)]"
            >
              Save
            </button>
          )}
        </div>
      </div>



      {/* Content Area */}
  <div className="p-4 flex flex-col gap-0 h-[300px]">
        {/* Only Quill editor, no preview/markdown mode */}
        <div className="quill-rounded-toolbar-wrapper" style={{marginTop: 0}}>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={{ toolbar: quillToolbarOptions }}
            style={{ minHeight: '200px', flex: 1, background: 'transparent', color: isDarkTheme ? '#fff' : '#111' }}
          />
        </div>
{/* Footer with save status */}
<div className="mt-2 flex justify-end">
          {note?.id && (
            <div className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
              {isSaving ? (
                <span className="text-accent">Saving...</span>
              ) : lastSaved ? (
                <span>Saved {formatTime(lastSaved)}</span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickNotesCardEnhanced;

