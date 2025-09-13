import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

const EditProjectModal = ({ project, onClose, onUpdate, isDarkTheme = true }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'active',
    priority: project?.priority || 'medium',
    period_from: project?.period_from || '',
    period_to: project?.period_to || '',
    stakeholders: project?.stakeholders || '',
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

    // Calculate progress from checklists if they exist
    const progress = project?.checklists ? percentComplete(project) : project?.progress || 0;

    // Make period_from and period_to optional (null if empty)
    const updateData = {
      ...formData,
      period_from: formData.period_from ? formData.period_from : null,
      period_to: formData.period_to ? formData.period_to : null,
      updated_at: new Date().toISOString(),
      progress // This will be computed from checklists
    };

    onUpdate(project.id, updateData);
    onClose();
  };

  // Helper function to calculate progress from checklists
  const percentComplete = (proj) => {
    if (!proj.checklists || proj.checklists.length === 0) return 0;
    const total = proj.checklists.reduce((s, g) => s + g.items.length, 0);
    const done = proj.checklists.reduce((s, g) => s + g.items.filter(i => i.done).length, 0);
    return Math.round(100 * done / Math.max(total, 1));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Edit Project
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDarkTheme ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title and Status Grid */}
          <div className="grid grid-cols-2 gap-4">
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
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent`}
                placeholder="Enter project title"
                required
              />
            </div>

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
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent`}
              >
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Period Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                Period From
              </label>
              <input
                type="date"
                value={formData.period_from}
                onChange={(e) => setFormData({ ...formData, period_from: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkTheme 
                    ? 'bg-[#424250] border-slate-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                Period To
              </label>
              <input
                type="date"
                value={formData.period_to}
                onChange={(e) => setFormData({ ...formData, period_to: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkTheme 
                    ? 'bg-[#424250] border-slate-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent`}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDarkTheme 
                  ? 'bg-[#424250] border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent resize-none`}
              placeholder="Project description (optional)"
            />
          </div>

          {/* Stakeholders */}
          <div>
            <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
              Stakeholders
            </label>
            <input
              type="text"
              value={formData.stakeholders}
              onChange={(e) => setFormData({ ...formData, stakeholders: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDarkTheme 
                  ? 'bg-[#424250] border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent`}
              placeholder="Comma-separated list of stakeholders"
            />
          </div>

          {/* Progress Display (Read-only) */}
          {project?.checklists && (
            <div>
              <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                Progress (Calculated from Checklists)
              </label>
              <div className={`px-4 py-3 rounded-lg border ${
                isDarkTheme 
                  ? 'bg-slate-700 border-slate-600 text-slate-300' 
                  : 'bg-gray-50 border-gray-300 text-gray-700'
              }`}>
                {percentComplete(project)}% Complete
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-600">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg border ${
                isDarkTheme 
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim()}
              className="px-6 py-2 bg-[#8a87d6] text-white rounded-lg hover:bg-[#7b78cc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
