import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

const AddProjectModal = ({ onClose, onAdd, isDarkTheme = true }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active',
    progress: 0,
    priority: 'medium'
  });

  const modalRef = useRef(null);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
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

    onAdd({
      ...formData,
      progress: parseInt(formData.progress) || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Add New Project
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDarkTheme ? 'hover:bg-[#424250] text-slate-400' : 'hover:bg-[#f3f4fd] text-gray-500'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
              Project Title <span className="text-[#e69a96]">*</span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDarkTheme 
                  ? 'bg-[#424250] border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent`}
              placeholder="Enter project title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDarkTheme 
                  ? 'bg-[#424250] border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent resize-none`}
              placeholder="Project description (optional)"
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkTheme 
                    ? 'bg-[#424250] border-slate-600 text-white' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent`}
              >
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkTheme 
                    ? 'bg-[#424250] border-slate-600 text-white' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Progress */}
          <div>
            <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
              Progress: {formData.progress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
              className={`w-full h-2 ${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-lg appearance-none cursor-pointer`}
            />
            <div className="flex justify-between text-xs mt-1">
              <span className={isDarkTheme ? 'text-slate-400' : 'text-gray-500'}>0%</span>
              <span className={isDarkTheme ? 'text-slate-400' : 'text-gray-500'}>50%</span>
              <span className={isDarkTheme ? 'text-slate-400' : 'text-gray-500'}>100%</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-600">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg border ${
                isDarkTheme 
                  ? 'border-slate-600 text-slate-300 hover:bg-[#424250]' 
                  : 'border-gray-300 text-gray-700 hover:bg-[#f3f4fd]'
              } transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim()}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Add Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;

