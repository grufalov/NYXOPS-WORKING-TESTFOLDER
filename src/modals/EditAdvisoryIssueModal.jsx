import React, { useState, useRef, useEffect } from 'react';
import { X, Star } from 'lucide-react';

const EditAdvisoryIssueModal = ({ item, onClose, onUpdate, isDarkTheme }) => {
  const [formData, setFormData] = useState({
    title: item.title || '',
    type: item.type || 'advisory',
    status: item.status || 'open',
    business_stakeholder: item.business_stakeholder || item.owner || '',
    recruiter: item.recruiter || '',
    practice: item.practice || '',
    candidate_role: item.candidate_role || '',
    background: item.background || item.trigger_event || '',
    next_steps: item.next_steps || ''
  });
  const [newNote, setNewNote] = useState('');
  const modalRef = useRef(null);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    // Prepare the update data
    const updateData = {
      ...formData,
      newNote: newNote.trim() || null // Include the new note if provided
    };

    onUpdate(updateData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Edit Advisory Issue
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDarkTheme ? 'hover:bg-[#8a87d6] text-slate-400' : 'hover:bg-[#ffffff] text-gray-500'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Title (50% width), Type, Status */}
          <div className="grid grid-cols-4 gap-4">
            {/* Title - takes 2 columns (50% width) */}
            <div className="col-span-2">
              <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                Title <span className="text-[#e69a96]">*</span>
              </label>
              <input
                ref={titleInputRef}
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent`}
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent`}
              >
                <option value="advisory">Advisory</option>
                <option value="emerging">Emerging</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent`}
              >
                <option value="open">Open</option>
                <option value="monitoring">Monitoring</option>
                <option value="ready_to_escalate">Ready to Escalate</option>
                <option value="escalated">Escalated</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Row 2: Practice, Business Stakeholder, Candidate, Recruiter */}
          <div className="grid grid-cols-4 gap-4">
            {/* Practice */}
            <div>
              <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                Practice
              </label>
              <input
                type="text"
                value={formData.practice}
                onChange={(e) => setFormData({ ...formData, practice: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent`}
                placeholder="Practice area"
              />
            </div>

            {/* Business Stakeholder */}
            <div>
              <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                Business Stakeholder
              </label>
              <input
                type="text"
                value={formData.business_stakeholder}
                onChange={(e) => setFormData({ ...formData, business_stakeholder: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent`}
                placeholder="Business stakeholder"
              />
            </div>

            {/* Candidate/Role */}
            <div>
              <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                Candidate/Role
              </label>
              <input
                type="text"
                value={formData.candidate_role}
                onChange={(e) => setFormData({ ...formData, candidate_role: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent`}
                placeholder="Candidate/role"
              />
            </div>

            {/* Recruiter */}
            <div>
              <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                Recruiter
              </label>
              <input
                type="text"
                value={formData.recruiter}
                onChange={(e) => setFormData({ ...formData, recruiter: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent`}
                placeholder="Recruiter involved"
              />
            </div>
          </div>

          {/* Row 3: Background and Next Steps side by side */}
          <div className="grid grid-cols-2 gap-6">
            {/* Background */}
            <div>
              <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                Background
              </label>
              <textarea
                value={formData.background}
                onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent resize-none`}
                placeholder="What's the background or context for this issue?"
              />
            </div>

            {/* Next Steps - with yellow styling and star */}
            <div>
              <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2 flex items-center gap-2`}>
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                Next Steps
              </label>
              <textarea
                value={formData.next_steps}
                onChange={(e) => setFormData({ ...formData, next_steps: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border !bg-yellow-50 !border-yellow-200 !text-yellow-700 placeholder-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                placeholder="What are the planned next steps?"
              />
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <h3 className={`text-lg font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'} mb-4`}>
              Previous Notes
            </h3>
            
            {item.advisory_issue_notes && item.advisory_issue_notes.length > 0 ? (
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {item.advisory_issue_notes.map((note, index) => (
                  <div 
                    key={note.id || index}
                    className={`p-3 rounded-lg border ${
                      isDarkTheme 
                        ? 'bg-slate-700 border-slate-600' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'} mb-1`}>
                      {new Date(note.created_at).toLocaleDateString()} • {note.author}
                    </div>
                    <p className={`text-sm ${isDarkTheme ? 'text-slate-200' : 'text-gray-700'}`}>
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 rounded-lg border-2 border-dashed ${
                isDarkTheme 
                  ? 'border-slate-600 text-slate-400' 
                  : 'border-gray-300 text-gray-500'
              } text-center mb-4`}>
                <p className="text-sm italic">No notes yet</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                  Add a Note
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkTheme 
                      ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                      : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent resize-none`}
                  placeholder="Add your note here..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-600">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg border ${
                isDarkTheme 
                  ? 'border-slate-600 text-slate-300 hover:bg-[#8a87d6]' 
                  : 'border-gray-300 text-gray-700 hover:bg-[#e3e3f5]'
              } transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim()}
              className="px-6 py-2 !bg-[#8a87d6] !text-white rounded-lg hover:!bg-[#7a77c6] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Update Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdvisoryIssueModal;

