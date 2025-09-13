import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Edit, Trash2, ExternalLink, Plus, MessageSquare, Eye, AlertTriangle, Clock, CheckCircle, ArrowUp, X } from 'lucide-react';
import { formatDateDisplay } from '../utils/formatDate.js';

// Advisory Issue Card Component
const AdvisoryIssueCard = ({ 
  issue, 
  onUpdate, 
  onDelete, 
  onAddNote, 
  onPromote, 
  onEdit, 
  isDarkTheme, 
  user 
}) => {
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [showNotesLog, setShowNotesLog] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const moreMenuRef = useRef(null);
  const noteInputRef = useRef(null);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus note input when shown
  useEffect(() => {
    if (showQuickNote && noteInputRef.current) {
      noteInputRef.current.focus();
    }
  }, [showQuickNote]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'emerging':
        return <AlertTriangle className="w-4 h-4" />;
      case 'advisory':
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4" />;
      case 'monitoring':
        return <Eye className="w-4 h-4" />;
      case 'ready_to_escalate':
        return <ArrowUp className="w-4 h-4" />;
      case 'escalated':
        return <ExternalLink className="w-4 h-4" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'emerging':
        return 'bg-[#e69a96] text-[#e69a96] border-[#e69a96]';
      case 'advisory':
      default:
        return 'bg-[#8a87d6] text-[#8a87d6] border-[#8a87d6]';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-[#f3f4fd] text-[#e69a96] border-[#f3f4fd]';
      case 'monitoring':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ready_to_escalate':
        return 'bg-[#8a87d6] text-[#8a87d6] border-[#8a87d6]';
      case 'escalated':
        return 'bg-[#8a87d6] text-[#8a87d6] border-[#8a87d6]';
      case 'closed':
        return 'bg-white text-gray-800 border-gray-200';
      default:
        return 'bg-white text-gray-800 border-gray-200';
    }
  };

  const handleQuickStatusChange = (newStatus) => {
    onUpdate(issue.id, { status: newStatus });
    setShowMoreMenu(false);
  };

  const handleTypeToggle = () => {
    const newType = issue.type === 'advisory' ? 'emerging' : 'advisory';
    onUpdate(issue.id, { type: newType });
    setShowMoreMenu(false);
  };

  const handleQuickNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    
    await onAddNote(issue.id, noteContent.trim());
    setNoteContent('');
    setShowQuickNote(false);
  };

  const lastNote = issue.advisory_issue_notes && issue.advisory_issue_notes.length > 0 
    ? issue.advisory_issue_notes[issue.advisory_issue_notes.length - 1] 
    : null;

  return (
    <div className={`${isDarkTheme ? 'bg-[#424250] border-slate-700' : 'bg-[#8a87d6] border-gray-200'} border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'} mb-2`}>
            {issue.title}
          </h3>
          
          {/* Type and Status Badges */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
              isDarkTheme ? 'bg-[#424250] border-slate-600' : getTypeBadgeColor(issue.type)
            }`}>
              {getTypeIcon(issue.type)}
              {issue.type.charAt(0).toUpperCase() + issue.type.slice(1)}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
              isDarkTheme ? 'bg-[#424250] border-slate-600' : getStatusBadgeColor(issue.status)
            }`}>
              {getStatusIcon(issue.status)}
              {issue.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </div>

        {/* More Menu */}
        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`p-2 rounded-lg ${isDarkTheme ? 'hover:bg-[#8a87d6] text-slate-400' : 'hover:bg-white text-gray-500'} transition-colors`}
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMoreMenu && (
            <div className={`absolute right-0 top-full mt-2 w-48 ${isDarkTheme ? 'bg-[#424250] border-slate-600' : 'bg-[#8a87d6] border-gray-200'} border rounded-lg shadow-lg z-10`}>
              <div className="py-1">
                <button
                  onClick={onEdit}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${isDarkTheme ? 'text-slate-300 hover:bg-[#8a87d6]' : 'text-gray-700 hover:bg-white'} transition-colors`}
                >
                  <Edit className="w-4 h-4" />
                  Edit Details
                </button>
                
                <button
                  onClick={handleTypeToggle}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${isDarkTheme ? 'text-slate-300 hover:bg-[#8a87d6]' : 'text-gray-700 hover:bg-[#ffffff]'} transition-colors`}
                >
                  {getTypeIcon(issue.type === 'advisory' ? 'emerging' : 'advisory')}
                  Switch to {issue.type === 'advisory' ? 'Emerging' : 'Advisory'}
                </button>

                <div className={`border-t ${isDarkTheme ? 'border-slate-600' : 'border-gray-200'} my-1`}></div>
                
                <div className="px-4 py-2">
                  <p className={`text-xs font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'} mb-2`}>
                    Quick Status Change
                  </p>
                  <div className="space-y-1">
                    {['open', 'monitoring', 'ready_to_escalate', 'closed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleQuickStatusChange(status)}
                        disabled={issue.status === status}
                        className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                          issue.status === status
                            ? isDarkTheme ? 'bg-slate-600 text-slate-400' : 'bg-[#ffffff] text-gray-500'
                            : isDarkTheme ? 'hover:bg-[#8a87d6] text-slate-300' : 'hover:bg-[#ffffff] text-gray-700'
                        }`}
                      >
                        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`border-t ${isDarkTheme ? 'border-slate-600' : 'border-gray-200'} my-1`}></div>
                
                <button
                  onClick={onPromote}
                  disabled={issue.status === 'escalated'}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                    issue.status === 'escalated'
                      ? isDarkTheme ? 'text-slate-500' : 'text-gray-400'
                      : 'text-[#8a87d6] hover:bg-[#8a87d6]'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                  {issue.status === 'escalated' ? 'Already Promoted' : 'Promote to Case'}
                </button>
                
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onDelete(issue.id);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${isDarkTheme ? 'text-[#e69a96] hover:bg-[#e69a96]/20' : 'text-[#e69a96] hover:bg-[#e69a96]'} transition-colors`}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Updated Metadata Grid - Business Stakeholder and Recruiter */}
      {(issue.business_stakeholder || issue.owner || issue.recruiter || issue.practice || issue.candidate_role) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {(issue.business_stakeholder || issue.owner) && (
            <div>
              <span className={`text-xs font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>Business Stakeholder</span>
              <p className={`text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} break-words`}>
                {issue.business_stakeholder || issue.owner}
              </p>
            </div>
          )}
          {issue.recruiter && (
            <div>
              <span className={`text-xs font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>Recruiter</span>
              <p className={`text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} break-words`}>{issue.recruiter}</p>
            </div>
          )}
          {issue.practice && (
            <div>
              <span className={`text-xs font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>Practice</span>
              <p className={`text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} break-words`}>{issue.practice}</p>
            </div>
          )}
          {issue.candidate_role && (
            <div>
              <span className={`text-xs font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>Candidate/Role</span>
              <p className={`text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} break-words`}>{issue.candidate_role}</p>
            </div>
          )}
        </div>
      )}

      {/* Three-Column Layout: Background, Notes, Next Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Background Column */}
        <div className={`${isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#e3e3f5]'} rounded-lg p-3`}>
          <span className={`text-xs font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'} block mb-2`}>
            Background
          </span>
          {(issue.background || issue.trigger_event) ? (
            <p className={`text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
              {issue.background || issue.trigger_event}
            </p>
          ) : (
            <p className={`text-sm ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'} italic`}>
              No background provided
            </p>
          )}
        </div>

        {/* Notes Column */}
        <div className={`${isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#e3e3f5]'} rounded-lg p-3`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
              Latest Note
            </span>
            {issue.advisory_issue_notes && issue.advisory_issue_notes.length > 0 && (
              <button
                onClick={() => setShowNotesLog(true)}
                className={`text-xs ${isDarkTheme ? 'text-cyan-400 hover:text-cyan-300' : 'text-[#8a87d6] hover:text-[#8a87d6]'} transition-colors`}
              >
                View All ({issue.advisory_issue_notes.length})
              </button>
            )}
          </div>
          {lastNote ? (
            <>
              <p className={`text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} line-clamp-2 mb-2`}>
                {lastNote.content}
              </p>
              <p className={`text-xs ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>
                {lastNote.user_name} • {formatDateDisplay(lastNote.created_at)}
              </p>
            </>
          ) : (
            <p className={`text-sm ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'} italic`}>
              No notes yet
            </p>
          )}
        </div>

        {/* Next Steps Column */}
        <div className={`${isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#e3e3f5]'} rounded-lg p-3`}>
          <span className={`text-xs font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'} block mb-2`}>
            Next Steps
          </span>
          {issue.next_steps ? (
            <p className={`text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
              {issue.next_steps}
            </p>
          ) : (
            <p className={`text-sm ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'} italic`}>
              No next steps defined
            </p>
          )}
        </div>
      </div>

      {/* Quick Note Form */}
      {showQuickNote && (
        <form onSubmit={handleQuickNoteSubmit} className="mb-4">
          <textarea
            ref={noteInputRef}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Add a quick note..."
            rows={3}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDarkTheme 
                ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
            } resize-none`}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowQuickNote(false);
                setNoteContent('');
              }
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleQuickNoteSubmit(e);
              }
            }}
          />
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
              Ctrl+Enter to save, Esc to cancel
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowQuickNote(false);
                  setNoteContent('');
                }}
                className={`px-3 py-1 rounded text-sm ${isDarkTheme ? 'text-slate-400 hover:text-slate-300' : 'text-gray-600 hover:text-gray-700'} transition-colors`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!noteContent.trim()}
                className="px-3 py-1 bg-[#8a87d6] text-white rounded text-sm hover:bg-[#8a87d6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Note
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-600">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowQuickNote(true)}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${isDarkTheme ? 'text-slate-400 hover:text-slate-300 hover:bg-[#8a87d6]' : 'text-gray-600 hover:text-gray-700 hover:bg-[#ffffff]'} transition-colors`}
          >
            <Plus className="w-4 h-4" />
            Add Note
          </button>
          
          {issue.advisory_issue_notes && issue.advisory_issue_notes.length > 0 && (
            <button
              onClick={() => setShowNotesLog(true)}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${isDarkTheme ? 'text-slate-400 hover:text-slate-300 hover:bg-[#8a87d6]' : 'text-gray-600 hover:text-gray-700 hover:bg-[#ffffff]'} transition-colors`}
            >
              <MessageSquare className="w-4 h-4" />
              Notes ({issue.advisory_issue_notes.length})
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-xs ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>
            {formatDateDisplay(issue.created_at)}
          </span>
        </div>
      </div>

      {/* Notes Log Modal */}
      {showNotesLog && (
        <NotesLogModal
          issue={issue}
          onClose={() => setShowNotesLog(false)}
          isDarkTheme={isDarkTheme}
        />
      )}
    </div>
  );
};

// Notes Log Modal
const NotesLogModal = ({ issue, onClose, isDarkTheme }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Notes - {issue.title}
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDarkTheme ? 'hover:bg-[#8a87d6] text-slate-400' : 'hover:bg-[#ffffff] text-gray-500'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {issue.advisory_issue_notes && issue.advisory_issue_notes.length > 0 ? (
            issue.advisory_issue_notes.map((note) => (
              <div
                key={note.id}
                className={`${isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#e3e3f5]'} rounded-lg p-4`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                    {note.user_name}
                  </span>
                  <span className={`text-xs ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>
                    {formatDateDisplay(note.created_at)}
                  </span>
                </div>
                <p className={`text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} whitespace-pre-wrap`}>
                  {note.content}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className={`w-12 h-12 mx-auto mb-3 ${isDarkTheme ? 'text-slate-600' : 'text-gray-400'}`} />
              <p className={`${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>No notes yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisoryIssueCard;

