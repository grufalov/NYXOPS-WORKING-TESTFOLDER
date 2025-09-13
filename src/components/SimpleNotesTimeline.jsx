import React, { useState } from 'react';
import { Plus, Send, Edit2, Trash2 } from 'lucide-react';
import { formatDateDisplay } from '../utils/formatDate.js';

const SimpleNotesTimeline = ({ notes = [], onAddNote, onEditNote, onDeleteNote, user, isDarkTheme = true }) => {
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    await onAddNote(newNote.trim());
    setNewNote('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingContent.trim()) return;
    
    await onEditNote(editingNoteId, editingContent.trim());
    setEditingNoteId(null);
    setEditingContent('');
  };

  const startEdit = (note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const handleDelete = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await onDeleteNote(noteId);
    }
  };

  const sortedNotes = [...notes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Previous Notes */}
      <div>
        <h5 className={`font-medium mb-3 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
          Previous Notes ({sortedNotes.length})
        </h5>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {sortedNotes.length === 0 ? (
            <div className={`text-center py-6 text-sm ${
              isDarkTheme ? 'text-slate-500' : 'text-gray-400'
            }`}>
              No notes yet
            </div>
          ) : (
            sortedNotes.map((note) => (
              <div
                key={note.id}
                className={`p-3 rounded-lg ${
                  isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#ffffff]'
                } border-l-4 border-l-blue-500`}
              >
                {editingNoteId === note.id ? (
                  <form onSubmit={handleEditSubmit} className="space-y-2">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className={`w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#8a87d6] ${
                        isDarkTheme 
                          ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400' 
                          : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      rows="3"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={!editingContent.trim()}
                        className="px-3 py-1 text-xs bg-[#f3f4fd] text-white rounded hover:bg-[#f3f4fd] disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className={`px-3 py-1 text-xs rounded ${
                          isDarkTheme 
                            ? 'bg-slate-600 text-slate-300 hover:bg-slate-500' 
                            : 'bg-[#f3f4fd] text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <div className={`text-xs ${
                        isDarkTheme ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        <span className="font-bold">{formatDateDisplay(note.created_at)}</span> - {note.author || note.user_name || 'Unknown User'}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(note)}
                          className={`p-1 rounded hover:bg-[#f3f4fd] ${
                            isDarkTheme ? 'text-gray-400 hover:bg-[#8a87d6]' : 'text-gray-500 hover:bg-[#f3f4fd]'
                          }`}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className={`p-1 rounded hover:bg-[#f3f4fd] ${
                            isDarkTheme ? 'text-gray-400 hover:bg-[#8a87d6]' : 'text-gray-500 hover:bg-[#f3f4fd]'
                          }`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className={`text-sm ${
                      isDarkTheme ? 'text-white' : 'text-gray-900'
                    }`}>
                      {note.content}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column - Add Note Form */}
      <div>
        <h5 className={`font-medium mb-3 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
          Add New Note
        </h5>
        <form onSubmit={handleSubmit} className={`border rounded-lg ${
          isDarkTheme ? 'border-slate-600' : 'border-gray-200'
        }`}>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a timeline note..."
            className={`w-full p-3 rounded-t-lg border-0 resize-none ${
              isDarkTheme
                ? 'bg-[#8a87d6] text-slate-100 placeholder-slate-400'
                : 'bg-[#f3f4fd] text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#8a87d6]`}
            rows={4}
          />
          <div className={`px-3 py-2 border-t flex justify-end gap-2 ${
            isDarkTheme ? 'border-slate-600 bg-[#424250]' : 'border-gray-200 bg-[#e3e3f5]'
          }`}>
            <button
              type="button"
              onClick={() => {
                setNewNote('');
              }}
              className={`px-3 py-1 text-sm rounded ${
                isDarkTheme
                  ? 'text-slate-400 hover:text-slate-300'
                  : 'text-gray-500 hover:text-gray-600'
              }`}
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={!newNote.trim()}
              className="px-3 py-1 text-sm rounded bg-[#8a87d6] text-white hover:bg-[#8a87d6] disabled:opacity-50 flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              Add Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleNotesTimeline;

