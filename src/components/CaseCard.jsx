import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, Plus, FileText, CheckCircle, Paperclip, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDateDisplay } from '../utils/formatDate.js';
import EditCaseModal from '../modals/EditCaseModal.jsx';

const CaseCard = ({ case_, updateCase, deleteCase, addCaseNote, updateCaseNote, deleteCaseNote, user, isDarkTheme = true, isSelected, onToggleSelection, openNextStepsModal, deleteNextSteps, onOpenAttachments }) => {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [editingNoteDate, setEditingNoteDate] = useState('');
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  const [showKebabMenu, setShowKebabMenu] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
  
  const kebabMenuRef = useRef(null);
  
  // Close kebab menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (kebabMenuRef.current && !kebabMenuRef.current.contains(event.target)) {
        setShowKebabMenu(false);
      }
    };

    if (showKebabMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showKebabMenu]);
  
  const getStatusChipStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'in-progress':
        return {
          className: 'border border-[#8a87d6] text-[#8a87d6] bg-transparent',
          label: status === 'in-progress' ? 'Open' : 'Open'
        };
      case 'resolved':
      case 'closed':
        return {
          className: isDarkTheme 
            ? 'bg-green-900/30 text-green-300 border border-green-700/50' 
            : 'bg-green-50 text-green-700 border border-green-200',
          label: 'Resolved'
        };
      default:
        return {
          className: 'border border-gray-400 text-gray-500 bg-transparent',
          label: status || 'Unknown'
        };
    }
  };

  const getPriorityBorderColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-blue-500';
    }
  };

  const statusChip = getStatusChipStyle(case_.status);
  
  // Truncate long text for metadata
  const truncateText = (text, maxLength = 20) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div 
      className={`rounded-2xl border transition-all duration-150 p-6 cursor-pointer relative ${
        isSelected ? 'ring-2 ring-[#8a87d6] ring-offset-2' : ''
      } ${
        isDarkTheme 
          ? 'bg-[var(--surface-bg)] hover:bg-[var(--elevated-bg)] border-[var(--border)] hover:border-[var(--border-strong)]' 
          : 'bg-[var(--surface-bg)] hover:bg-[var(--elevated-bg)] border-[var(--border)] hover:border-[var(--border-strong)]'
      }`}
      style={{ 
        backgroundColor: 'var(--surface-bg)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--border-strong)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      role="region"
      aria-label={`Case: ${case_.subject || 'No Subject'}`}
    >
      {/* Header row - single line with title, status, and metadata */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 
            className="font-medium text-lg leading-tight flex-1 truncate" 
            style={{ color: 'var(--text)' }}
            title={case_.subject || 'No Subject'}
          >
            {case_.subject || 'No Subject'}
          </h3>
          <span 
            className={`px-2 py-1 text-xs font-medium rounded-lg flex-shrink-0 ${statusChip.className}`}
          >
            {statusChip.label}
          </span>
        </div>
        
        {/* Tiny metadata inline */}
        <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--muted)' }}>
          <span>{case_.practice || 'N/A'}</span>
          <span>•</span>
          <span>{truncateText(case_.recruiter, 15) || 'N/A'}</span>
          <span>•</span>
          <span>{truncateText(case_.candidate, 15) || 'N/A'}</span>
        </div>
      </div>

      {/* Next Steps section - softer styling */}
      {case_.next_steps ? (
        <div 
          className="mb-4 p-3 rounded-xl border"
          style={{ 
            backgroundColor: isDarkTheme ? 'rgba(251, 191, 36, 0.08)' : 'rgba(251, 191, 36, 0.05)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-yellow-600 dark:text-yellow-500 font-medium flex items-center gap-2 text-sm">
              <span className="text-yellow-500">⭐</span>
              Next Steps
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openNextStepsModal(case_.id);
              }}
              className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors duration-150 text-sm"
              title="Edit Next Steps"
            >
              Edit
            </button>
          </div>
          <div className="text-sm" style={{ color: 'var(--text)' }}>
            {case_.next_steps}
          </div>
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openNextStepsModal(case_.id);
          }}
          className="w-full mb-4 p-3 border-2 border-dashed rounded-xl transition-all duration-150 text-sm"
          style={{ 
            borderColor: 'var(--border)',
            color: 'var(--muted)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-strong)';
            e.currentTarget.style.backgroundColor = 'var(--elevated-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Add Next Steps
        </button>
      )}

      {/* Notes section - collapsed by default */}
      {case_.notes && case_.notes.length > 0 && (
        <div className="mb-4">
          <div className="space-y-2">
            {(showAllNotes ? case_.notes : case_.notes.slice(0, 2)).map((note, index) => (
              <div 
                key={note.id || index} 
                className="p-3 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--elevated-bg)',
                  borderColor: 'var(--border)'
                }}
              >
                {editingNoteId === note.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingNoteContent}
                      onChange={(e) => setEditingNoteContent(e.target.value)}
                      className="w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a87d6] transition-all duration-150"
                      style={{ 
                        backgroundColor: 'var(--surface-bg)',
                        borderColor: 'var(--border)',
                        color: 'var(--text)'
                      }}
                      rows="3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCaseNote(case_.id, note.id, editingNoteContent);
                          setEditingNoteId(null);
                          setEditingNoteContent('');
                        }}
                        className="px-3 py-1 text-xs bg-[#8a87d6] text-white rounded-lg hover:bg-[#7a77c6] transition-all duration-150"
                      >
                        Save
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingNoteId(null);
                          setEditingNoteContent('');
                        }}
                        className="px-3 py-1 text-xs border rounded-lg transition-all duration-150"
                        style={{ 
                          borderColor: 'var(--border)',
                          color: 'var(--muted)'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Timestamp and author on one line */}
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        {formatDateDisplay(note.created_at)} • {note.author}
                        {note.updated_at && <span> (edited)</span>}
                      </p>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNoteId(note.id);
                            setEditingNoteContent(note.content || '');
                            setEditingNoteDate(note.created_at ? note.created_at.split('T')[0] : new Date().toISOString().split('T')[0]);
                            setShowEditNoteModal(true);
                          }}
                          className="p-1 rounded-lg transition-all duration-150 hover:bg-[#8a87d6]/10"
                          style={{ color: 'var(--muted)' }}
                          title="Edit Note"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this note?')) {
                              await deleteCaseNote(case_.id, note.id);
                            }
                          }}
                          className="p-1 rounded-lg transition-all duration-150 hover:bg-red-500/10 text-red-500"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {/* Note content - max 3 lines */}
                    <div className={`text-sm ${!showAllNotes && index >= 1 ? 'line-clamp-3' : ''}`} style={{ color: 'var(--text)' }}>
                      {note.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* View more button */}
            {case_.notes.length > 2 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllNotes(!showAllNotes);
                }}
                className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-all duration-150 hover:bg-[#8a87d6]/10"
                style={{ color: 'var(--muted)' }}
                aria-expanded={showAllNotes}
              >
                {showAllNotes ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    View {case_.notes.length - 2} more notes
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Case Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div 
            className="rounded-xl p-6 w-full max-w-md border"
            style={{ 
              backgroundColor: 'var(--elevated-bg)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-hover)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Add Case Note</h3>
            <form 
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (noteContent.trim() && addCaseNote) {
                  addCaseNote(case_.id, noteContent.trim());
                  setNoteContent('');
                  setShowNoteModal(false);
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  Note Content
                </label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a87d6] min-h-[100px] transition-all duration-150"
                  style={{ 
                    backgroundColor: 'var(--surface-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                  placeholder="Enter your note about this case..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNoteModal(false);
                    setNoteContent('');
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg transition-all duration-150"
                  style={{ 
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#8a87d6] text-white rounded-lg hover:bg-[#7a77c6] transition-all duration-150"
                >
                  Add Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Case Modal */}
      {showEditModal && (
        <EditCaseModal
          case_={case_}
          onClose={() => setShowEditModal(false)}
          onUpdate={updateCase}
          isDarkTheme={isDarkTheme}
        />
      )}

      {/* Edit Case Note Modal */}
      {showEditNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div 
            className="rounded-xl p-6 w-full max-w-md border"
            style={{ 
              backgroundColor: 'var(--elevated-bg)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-hover)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Edit Case Note</h3>
            <form 
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (editingNoteContent.trim() && updateCaseNote) {
                  try {
                    await updateCaseNote(case_.id, editingNoteId, editingNoteContent.trim(), editingNoteDate);
                    setShowEditNoteModal(false);
                    setEditingNoteId(null);
                    setEditingNoteContent('');
                    setEditingNoteDate('');
                  } catch (error) {
                    alert('Update failed. Please try again.');
                  }
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  Note Date
                </label>
                <input
                  type="date"
                  value={editingNoteDate}
                  onChange={(e) => setEditingNoteDate(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a87d6] transition-all duration-150"
                  style={{ 
                    backgroundColor: 'var(--surface-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  Note Content
                </label>
                <textarea
                  value={editingNoteContent}
                  onChange={(e) => setEditingNoteContent(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a87d6] min-h-[100px] transition-all duration-150"
                  style={{ 
                    backgroundColor: 'var(--surface-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                  placeholder="Edit your note about this case..."
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditNoteModal(false);
                    setEditingNoteId(null);
                    setEditingNoteContent('');
                    setEditingNoteDate('');
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg transition-all duration-150"
                  style={{ 
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#8a87d6] text-white rounded-lg hover:bg-[#7a77c6] transition-all duration-150"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer actions - cleaner layout */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          {/* Primary action */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowNoteModal(true);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-[#8a87d6] text-white rounded-lg font-medium transition-all duration-150 hover:bg-[#7a77c6] text-sm"
            title="Add Note"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </button>
          
          {/* Secondary actions */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowEditModal(true);
            }}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg font-medium transition-all duration-150 text-sm"
            style={{ 
              borderColor: 'var(--border)',
              color: 'var(--text)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#8a87d6';
              e.currentTarget.style.color = '#8a87d6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            title="Edit Case"
          >
            <Edit2 className="w-4 h-4" />
            Edit Case
          </button>
          
          {case_.status !== 'resolved' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateCase(case_.id, { status: 'resolved' });
              }}
              className="flex items-center gap-2 px-3 py-2 border border-green-600 text-green-600 rounded-lg font-medium transition-all duration-150 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm"
              title="Mark as resolved"
            >
              <CheckCircle className="w-4 h-4" />
              Resolve
            </button>
          )}
        </div>
        
        {/* Selection checkbox and Kebab menu */}
        <div className="flex items-center gap-2">
          {/* Selection checkbox */}
          <div 
            className="flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelection}
              className="w-3.5 h-3.5 text-[#8a87d6] bg-transparent border border-gray-400 rounded opacity-50 hover:opacity-70 focus:ring-[#8a87d6] focus:ring-1 transition-all duration-150"
              title="Select case"
            />
          </div>
          
          {/* Kebab menu for delete */}
          <div className="relative" ref={kebabMenuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowKebabMenu(!showKebabMenu);
            }}
            className="p-2 rounded-lg transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-700"
            style={{ color: 'var(--muted)' }}
            title="More actions"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {showKebabMenu && (
            <div 
              className="absolute right-0 top-full mt-2 w-32 rounded-lg border shadow-lg z-10"
              style={{ 
                backgroundColor: 'var(--elevated-bg)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-hover)'
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowKebabMenu(false);
                  if (window.confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
                    deleteCase(case_.id);
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-150"
                title="Delete Case"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseCard;

