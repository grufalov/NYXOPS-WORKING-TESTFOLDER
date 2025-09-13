import React, { useState } from 'react';

const AddCaseModal = ({ onClose, onAdd, isDarkTheme = true, uniquePractices = [], prefilledData = null, isPromotion = false }) => {
  const [formData, setFormData] = useState({
    attract_id: prefilledData?.attract_id || '',
    subject: prefilledData?.subject || '',
    candidate: prefilledData?.candidate || '',
    practice: prefilledData?.practice || 'Apps',
    recruiter: prefilledData?.recruiter || '',
    priority: prefilledData?.priority || 'Low',
    status: prefilledData?.status || 'open',
    opened_date: prefilledData?.opened_date || new Date().toISOString().split('T')[0],
    // Handle notes - convert JSONB array to text for editing, or use provided text
    notes: Array.isArray(prefilledData?.notes) 
      ? prefilledData.notes.map(note => note.content).join('\n\n')
      : (prefilledData?.notes || '')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.attract_id.trim() || !formData.subject.trim()) return;
    
    // Format the case data with proper notes structure
    const caseData = {
      ...formData,
      // Convert notes to JSONB format if it's a string
      notes: Array.isArray(formData.notes) 
        ? formData.notes 
        : formData.notes.trim() 
          ? [{
              id: Date.now(),
              author: "User",
              content: formData.notes,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]
          : [],
      created_at: new Date().toISOString()
    };
    
    onAdd(caseData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl shadow-xl max-w-lg w-full ${
        isDarkTheme 
          ? 'bg-[#424250] border border-slate-700' 
          : 'bg-[#f3f4fd] border border-gray-200'
      }`}>
        <div className={`p-6 border-b ${
          isDarkTheme ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold ${
            isDarkTheme ? 'text-white' : 'text-gray-900'
          }`}>
            {isPromotion ? 'Promote Role to Case' : 'Add New Case'}
          </h2>
          {isPromotion && (
            <p className={`text-sm mt-1 ${
              isDarkTheme ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Creating a new case from role at risk. Review and adjust the prefilled information as needed.
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Attract ID *
              </label>
              <input
                type="text"
                required
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-[#f3f4fd] border border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                value={formData.attract_id}
                onChange={(e) => setFormData({ ...formData, attract_id: e.target.value })}
                placeholder="e.g., deployes"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Subject *
              </label>
              <input
                type="text"
                required
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-[#f3f4fd] border border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., depl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Candidate
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-[#f3f4fd] border border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                value={formData.candidate}
                onChange={(e) => setFormData({ ...formData, candidate: e.target.value })}
                placeholder="e.g., D.Dep"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Practice
              </label>
              <input
                list="practices"
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-[#f3f4fd] border border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                value={formData.practice}
                onChange={(e) => setFormData({ ...formData, practice: e.target.value })}
                placeholder="Type or select a practice"
              />
              <datalist id="practices">
                <option value="Apps" />
                <option value="Cloud" />
                <option value="DWP" />
                <option value="Mobile" />
                {uniquePractices.map(practice => (
                  <option key={practice} value={practice} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Recruiter
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-[#f3f4fd] border border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                value={formData.recruiter}
                onChange={(e) => setFormData({ ...formData, recruiter: e.target.value })}
                placeholder="e.g., loyed"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Priority
              </label>
              <select
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border border-slate-600 text-white' 
                    : 'bg-[#f3f4fd] border border-gray-300 text-gray-900'
                }`}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Status
              </label>
              <select
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border border-slate-600 text-white' 
                    : 'bg-[#f3f4fd] border border-gray-300 text-gray-900'
                }`}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Opened Date
              </label>
              <input
                type="date"
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border border-slate-600 text-white' 
                    : 'bg-[#f3f4fd] border border-gray-300 text-gray-900'
                }`}
                value={formData.opened_date}
                onChange={(e) => setFormData({ ...formData, opened_date: e.target.value })}
              />
            </div>
          </div>

          {/* Notes field for promotion */}
          {isPromotion && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Transfer Notes from Role
              </label>
              <textarea
                rows={4}
                className={`w-full px-3 py-2 rounded-lg resize-none focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-[#f3f4fd] border border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes and context from the role at risk..."
              />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'text-slate-300 bg-[#8a87d6] hover:bg-[#8a87d6]' 
                  : 'text-gray-600 bg-[#ffffff] hover:bg-[#f3f4fd]'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              {isPromotion ? 'Create Case from Role' : 'Save Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCaseModal;

