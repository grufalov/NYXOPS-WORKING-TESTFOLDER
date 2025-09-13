import React, { useState } from 'react';
import { X, ArrowUp } from 'lucide-react';

const PromoteModal = ({ isOpen, onClose, onPromote, issue, isDarkTheme = true }) => {
  const [formData, setFormData] = useState({
    title: issue?.title || '',
    description: issue?.description || '',
    priority: 'medium',
    assignee: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onPromote({
      ...formData,
      originalIssueId: issue.id
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl rounded-xl shadow-2xl ${
        isDarkTheme ? 'bg-[#424250] border border-slate-600' : 'bg-[#f3f4fd] border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDarkTheme ? 'border-slate-600' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isDarkTheme ? 'bg-[#8a87d6]/20' : 'bg-[#8a87d6]'
            }`}>
              <ArrowUp className={`w-5 h-5 ${
                isDarkTheme ? 'text-[#8a87d6]' : 'text-[#8a87d6]'
              }`} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${
                isDarkTheme ? 'text-slate-100' : 'text-gray-900'
              }`}>
                Promote to Case
              </h2>
              <p className={`text-sm ${
                isDarkTheme ? 'text-slate-400' : 'text-gray-500'
              }`}>
                Convert this advisory issue to a formal case
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkTheme
                ? 'text-slate-400 hover:text-slate-300 hover:bg-[#8a87d6]'
                : 'text-gray-400 hover:text-gray-600 hover:bg-[#ffffff]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkTheme ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Case Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkTheme
                  ? 'border-slate-600 bg-[#8a87d6] text-slate-100'
                  : 'border-gray-300 bg-[#f3f4fd] text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#8a87d6]`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkTheme ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkTheme
                  ? 'border-slate-600 bg-[#8a87d6] text-slate-100'
                  : 'border-gray-300 bg-[#f3f4fd] text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#8a87d6]`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkTheme
                    ? 'border-slate-600 bg-[#8a87d6] text-slate-100'
                    : 'border-gray-300 bg-[#f3f4fd] text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#8a87d6]`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Assignee
              </label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                placeholder="Enter assignee..."
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkTheme
                    ? 'border-slate-600 bg-[#8a87d6] text-slate-100 placeholder-slate-400'
                    : 'border-gray-300 bg-[#f3f4fd] text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#8a87d6]`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkTheme ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              placeholder="Any additional context for the case..."
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkTheme
                  ? 'border-slate-600 bg-[#8a87d6] text-slate-100 placeholder-slate-400'
                  : 'border-gray-300 bg-[#f3f4fd] text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#8a87d6]`}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDarkTheme
                  ? 'text-slate-300 hover:text-slate-100 hover:bg-[#8a87d6]'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-[#ffffff]'
              }`}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[#8a87d6] text-white hover:bg-[#8a87d6] transition-colors flex items-center gap-2"
            >
              <ArrowUp className="w-4 h-4" />
              Promote to Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoteModal;

