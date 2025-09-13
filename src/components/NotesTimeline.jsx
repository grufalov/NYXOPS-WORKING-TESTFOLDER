import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Send, 
  Eye, 
  EyeOff,
  Edit3,
  Trash2,
  Clock,
  User,
  MessageSquare
} from 'lucide-react';
import { formatDateDisplay } from '../utils/formatDate.js';
import { parseMarkdown, validateMarkdown } from '../utils/markdownHelpers.js';
import MarkdownEditor from './MarkdownEditor.jsx';
import MarkdownPreview from './MarkdownPreview.jsx';

/**
 * NotesTimeline Component for Advisory Issues v1.5
 * Display and manage timeline notes with enhanced markdown support
 */
const NotesTimeline = ({
  issueId,
  notes = [],
  user,
  isDarkTheme = true,
  onAddNote,
  onEditNote,
  onDeleteNote,
  maxNotes = 50
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  
  const addNoteRef = useRef(null);
  
  // Sort notes by creation date (newest first)
  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );
  
  const canEditNote = (note) => {
    if (!user || !note.created_by) return false;
    
    // User can edit their own notes within 15 minutes
    const noteAge = Date.now() - new Date(note.created_at).getTime();
    const fifteenMinutes = 15 * 60 * 1000;
    
    return note.created_by === user.id && noteAge < fifteenMinutes;
  };
  
  const canDeleteNote = (note) => {
    if (!user || !note.created_by) return false;
    
    // User can delete their own notes within 30 minutes
    const noteAge = Date.now() - new Date(note.created_at).getTime();
    const thirtyMinutes = 30 * 60 * 1000;
    
    return note.created_by === user.id && noteAge < thirtyMinutes;
  };
  
  const handleAddNote = async () => {
    if (!newNoteContent.trim() || isSubmitting) return;
    
    // Validate content
    const validation = validateMarkdown(newNoteContent);
    if (!validation.valid) {
      setValidationErrors(validation.warnings);
      return;
    }
    
    setIsSubmitting(true);
    setValidationErrors([]);
    
    try {
      await onAddNote?.(issueId, newNoteContent.trim());
      setNewNoteContent('');
      setIsAdding(false);
      setShowPreview(false);
    } catch (error) {
      console.error('Error adding note:', error);
      setValidationErrors(['Failed to add note. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditNote = async (noteId) => {
    if (!editContent.trim() || isSubmitting) return;
    
    // Validate content
    const validation = validateMarkdown(editContent);
    if (!validation.valid) {
      setValidationErrors(validation.warnings);
      return;
    }
    
    setIsSubmitting(true);
    setValidationErrors([]);
    
    try {
      await onEditNote?.(noteId, editContent.trim());
      setEditingNoteId(null);
      setEditContent('');
    } catch (error) {
      console.error('Error editing note:', error);
      setValidationErrors(['Failed to edit note. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }
    
    try {
      await onDeleteNote?.(noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };
  
  const startEditing = (note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setValidationErrors([]);
  };
  
  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditContent('');
    setValidationErrors([]);
  };
  
  const handleKeyDown = (e, isNewNote = true) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (isNewNote) {
        handleAddNote();
      } else if (editingNoteId) {
        handleEditNote(editingNoteId);
      }
    }
    
    if (e.key === 'Escape') {
      if (isNewNote) {
        setIsAdding(false);
        setNewNoteContent('');
        setShowPreview(false);
      } else {
        cancelEditing();
      }
    }
  };
  
  // Auto-focus when starting to add a note
  useEffect(() => {
    if (isAdding && addNoteRef.current) {
      const textarea = addNoteRef.current.querySelector('textarea');
      if (textarea) {
        textarea.focus();
      }
    }
  }, [isAdding]);
  
  return (
    <div className="notes-timeline">
      {/* Add note section */}
      <div className={`mb-4 ${
        isAdding ? 'border rounded-lg ' + (isDarkTheme ? 'border-slate-600' : 'border-gray-200') : ''
      }`}>
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className={`w-full px-3 py-2 text-left text-sm rounded-lg border-2 border-dashed transition-colors ${
              isDarkTheme
                ? 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300 hover:bg-[#424250]/50'
                : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600 hover:bg-[#e3e3f5]'
            }`}
          >
            <Plus className="w-4 h-4 mr-2 inline" />
            Add a note...
          </button>
        ) : (
          <div ref={addNoteRef}>
            {showPreview ? (
              <div className="p-3">
                <div className={`mb-3 text-sm font-medium ${
                  isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Preview:
                </div>
                <MarkdownPreview
                  content={newNoteContent}
                  isDarkTheme={isDarkTheme}
                  showBorder={false}
                  maxHeight={200}
                />
              </div>
            ) : (
              <MarkdownEditor
                value={newNoteContent}
                onChange={setNewNoteContent}
                placeholder="Add a timeline note... (supports **bold**, *italic*, # headings, - lists, and colors)"
                isDarkTheme={isDarkTheme}
                autoFocus={true}
                minHeight={80}
                maxHeight={200}
                showToolbar={true}
                showPreview={showPreview}
                onTogglePreview={setShowPreview}
                onKeyDown={(e) => handleKeyDown(e, true)}
              />
            )}
            
            {/* Validation errors */}
            {validationErrors.length > 0 && (
              <div className={`mx-3 mb-3 p-2 rounded text-sm ${
                isDarkTheme ? 'bg-[#e69a96]/20 text-[#e69a96]' : 'bg-[#e69a96] text-[#e69a96]'
              }`}>
                {validationErrors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            )}
            
            {/* Action buttons */}
            <div className={`px-3 pb-3 flex items-center justify-between ${
              isDarkTheme ? 'bg-[#424250]' : 'bg-[#e3e3f5]'
            }`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    showPreview
                      ? isDarkTheme
                        ? 'bg-[#8a87d6] text-white'
                        : 'bg-[#8a87d6] text-white'
                      : isDarkTheme
                        ? 'text-slate-400 hover:text-slate-300'
                        : 'text-gray-500 hover:text-gray-600'
                  }`}
                >
                  {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
                
                <span className={`text-xs ${
                  isDarkTheme ? 'text-slate-500' : 'text-gray-400'
                }`}>
                  Ctrl+Enter to send
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewNoteContent('');
                    setShowPreview(false);
                    setValidationErrors([]);
                  }}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    isDarkTheme
                      ? 'text-slate-400 hover:text-slate-300'
                      : 'text-gray-500 hover:text-gray-600'
                  }`}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleAddNote}
                  disabled={!newNoteContent.trim() || isSubmitting}
                  className={`px-3 py-1 text-sm rounded font-medium transition-colors ${
                    !newNoteContent.trim() || isSubmitting
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  } bg-[#8a87d6] text-white hover:bg-[#8a87d6]`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-1" />
                      Adding...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="w-3 h-3 mr-1" />
                      Add Note
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Notes list */}
      <div className="space-y-3">
        {sortedNotes.length === 0 ? (
          <div className={`text-center py-6 ${
            isDarkTheme ? 'text-slate-500' : 'text-gray-400'
          }`}>
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No notes yet</div>
            <div className="text-xs">Add the first note to start the timeline</div>
          </div>
        ) : (
          sortedNotes.map((note, index) => (
            <div
              key={note.id}
              className={`relative pl-6 ${
                index < sortedNotes.length - 1 ? 'pb-4' : ''
              }`}
            >
              {/* Timeline line */}
              {index < sortedNotes.length - 1 && (
                <div className={`absolute left-2 top-6 bottom-0 w-px ${
                  isDarkTheme ? 'bg-slate-600' : 'bg-[#f3f4fd]'
                }`} />
              )}
              
              {/* Timeline dot */}
              <div className={`absolute left-0 top-2 w-4 h-4 rounded-full border-2 ${
                isDarkTheme 
                  ? 'bg-[#424250] border-slate-600' 
                  : 'bg-[#f3f4fd] border-gray-300'
              }`} />
              
              {/* Note content */}
              <div className={`rounded-lg border ${
                isDarkTheme ? 'border-slate-600 bg-[#8a87d6]/30' : 'border-gray-200 bg-[#e3e3f5]'
              }`}>
                {/* Note header */}
                <div className={`px-3 py-2 border-b ${
                  isDarkTheme ? 'border-slate-600' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className={`w-3 h-3 ${
                        isDarkTheme ? 'text-slate-400' : 'text-gray-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        {note.user_name || 'Unknown User'}
                      </span>
                      <Clock className={`w-3 h-3 ${
                        isDarkTheme ? 'text-slate-500' : 'text-gray-400'
                      }`} />
                      <span className={`text-xs ${
                        isDarkTheme ? 'text-slate-500' : 'text-gray-500'
                      }`}>
                        {formatDateDisplay(note.created_at)}
                      </span>
                    </div>
                    
                    {/* Note actions */}
                    {(canEditNote(note) || canDeleteNote(note)) && (
                      <div className="flex items-center gap-1">
                        {canEditNote(note) && editingNoteId !== note.id && (
                          <button
                            onClick={() => startEditing(note)}
                            className={`p-1 rounded transition-colors ${
                              isDarkTheme
                                ? 'text-slate-400 hover:text-slate-300 hover:bg-[#8a87d6]'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-[#f3f4fd]'
                            }`}
                            title="Edit note"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        )}
                        
                        {canDeleteNote(note) && (
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className={`p-1 rounded transition-colors ${
                              isDarkTheme
                                ? 'text-[#e69a96] hover:text-[#e69a96] hover:bg-[#e69a96]/20'
                                : 'text-[#e69a96] hover:text-[#e69a96] hover:bg-[#e69a96]'
                            }`}
                            title="Delete note"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Note body */}
                <div className="p-3">
                  {editingNoteId === note.id ? (
                    <div>
                      <MarkdownEditor
                        value={editContent}
                        onChange={setEditContent}
                        isDarkTheme={isDarkTheme}
                        minHeight={60}
                        maxHeight={150}
                        showToolbar={true}
                        onKeyDown={(e) => handleKeyDown(e, false)}
                      />
                      
                      {/* Edit actions */}
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button
                          onClick={cancelEditing}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            isDarkTheme
                              ? 'text-slate-400 hover:text-slate-300'
                              : 'text-gray-500 hover:text-gray-600'
                          }`}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        
                        <button
                          onClick={() => handleEditNote(note.id)}
                          disabled={!editContent.trim() || isSubmitting}
                          className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                            !editContent.trim() || isSubmitting
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          } bg-[#8a87d6] text-white hover:bg-[#8a87d6]`}
                        >
                          {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={`text-sm leading-relaxed prose prose-sm max-w-none ${
                        isDarkTheme ? 'prose-invert' : ''
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: parseMarkdown(note.content)
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Show limit warning */}
      {sortedNotes.length >= maxNotes * 0.8 && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          isDarkTheme ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-700'
        }`}>
          <div className="font-medium mb-1">Note limit approaching</div>
          <div>
            {sortedNotes.length} of {maxNotes} notes used. Consider promoting to a case for extended discussion.
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesTimeline;

