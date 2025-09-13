import React, { useState } from 'react';

const EditCaseModal = ({ case_, onClose, onUpdate, isDarkTheme = true }) => {
  const [formData, setFormData] = useState({
    attract_id: case_.attract_id || '',
    subject: case_.subject || '',
    candidate: case_.candidate || '',
    practice: case_.practice || '',
    recruiter: case_.recruiter || '',
    priority: case_.priority || 'medium',
    status: case_.status || 'open',
    opened_date: case_.opened_date || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(case_.id, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd] border border-gray-200'} rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Edit Case</h2>
          <button onClick={onClose} className={`transition-colors ${isDarkTheme ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                Attract ID
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                }`}
                value={formData.attract_id}
                onChange={(e) => setFormData({ ...formData, attract_id: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                Subject
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                }`}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                Candidate
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                }`}
                value={formData.candidate}
                onChange={(e) => setFormData({ ...formData, candidate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                Practice
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                }`}
                value={formData.practice}
                onChange={(e) => setFormData({ ...formData, practice: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                Recruiter
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                }`}
                value={formData.recruiter}
                onChange={(e) => setFormData({ ...formData, recruiter: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                Priority
              </label>
              <select
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                }`}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                Status
              </label>
              <select
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
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
              <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                Opened Date
              </label>
              <input
                type="date"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                }`}
                value={formData.opened_date}
                onChange={(e) => setFormData({ ...formData, opened_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'text-slate-300 bg-[#8a87d6] hover:bg-[#8a87d6]' 
                  : 'text-gray-700 bg-[#f3f4fd] hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Update Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCaseModal;

