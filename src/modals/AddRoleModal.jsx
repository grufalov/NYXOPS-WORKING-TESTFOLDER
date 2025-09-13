import React, { useState } from 'react';
import { X, Building, User, Calendar, AlertTriangle } from 'lucide-react';

const AddRoleModal = ({ onClose, onAdd, isDarkTheme = true }) => {
  const [formData, setFormData] = useState({
    title: '',
    req_id: '',
    practice: '',
    gcm: '',
    hiring_manager: '',
    recruiter: '',
    risk_level: 'medium',
    status: 'monitoring',
    summary: '',
    open_date: new Date().toISOString().split('T')[0],
    my_input: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const practices = [
    'Technology',
    'Healthcare',
    'Financial Services',
    'Manufacturing',
    'Retail',
    'Education',
    'Non-Profit',
    'Government',
    'Energy',
    'Real Estate'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Role title is required';
    }

    if (!formData.practice) {
      newErrors.practice = 'Practice is required';
    }

    if (!formData.open_date) {
      newErrors.open_date = 'Open date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onAdd({
        ...formData,
        team_lead_updates: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      onClose();
    } catch (error) {
      console.error('Error adding role:', error);
      setErrors({ submit: 'Failed to add role. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>

        <div 
          className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full`}
          style={{ backgroundColor: isDarkTheme ? '#424250' : '#f3f4fd' }}
        >
          
          {/* Header */}
          <div className={`px-6 py-4 border-b ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#8a87d6]" />
                <h3 className={`text-lg font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                  Add Role at Risk
                </h3>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg hover:bg-opacity-20 ${
                  isDarkTheme 
                    ? 'text-slate-400 hover:bg-[#424250] hover:text-white' 
                    : 'text-gray-400 hover:bg-[#f3f4fd] hover:text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              
              {/* Role Title */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Role Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Senior React Developer"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-[#8a87d6] ${
                    isDarkTheme 
                      ? 'bg-[#424250] border-slate-600 text-slate-200 placeholder-slate-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${errors.title ? 'border-[#e69a96]' : ''}`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-[#e69a96]">{errors.title}</p>
                )}
              </div>

              {/* Req ID */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Attract ID
                </label>
                <input
                  type="text"
                  value={formData.req_id}
                  onChange={(e) => handleInputChange('req_id', e.target.value)}
                  placeholder="Add Attract ID here"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-[#8a87d6] ${
                    isDarkTheme 
                      ? 'bg-[#424250] border-slate-600 text-slate-200 placeholder-slate-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Practice and GCM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Practice *
                  </label>
                  <input
                    type="text"
                    value={formData.practice}
                    onChange={(e) => handleInputChange('practice', e.target.value)}
                    placeholder="e.g., Technology, Healthcare, Finance"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-[#8a87d6] ${
                      isDarkTheme 
                        ? 'border-slate-600 text-slate-200 placeholder-slate-400' 
                        : 'border-gray-300 text-gray-900 placeholder-gray-500'
                    } ${errors.practice ? 'border-[#e69a96]' : ''}`}
                    style={{ backgroundColor: isDarkTheme ? '#8a87d6' : '#f3f4fd' }}
                  />
                  {errors.practice && (
                    <p className="mt-1 text-sm text-[#e69a96]">{errors.practice}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    GCM Level
                  </label>
                  <input
                    type="text"
                    value={formData.gcm}
                    onChange={(e) => handleInputChange('gcm', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-[#8a87d6] ${
                      isDarkTheme 
                        ? 'border-slate-600 text-slate-200 placeholder-slate-400' 
                        : 'border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    style={{ backgroundColor: isDarkTheme ? '#8a87d6' : '#f3f4fd' }}
                  />
                </div>
              </div>

              {/* Hiring Manager and Recruiter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Hiring Manager
                  </label>
                  <input
                    type="text"
                    value={formData.hiring_manager}
                    onChange={(e) => handleInputChange('hiring_manager', e.target.value)}
                        placeholder="Manager Name"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-[#8a87d6] ${
                          isDarkTheme 
                            ? 'border-slate-600 text-slate-200 placeholder-slate-400' 
                            : 'border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        style={{ backgroundColor: isDarkTheme ? '#8a87d6' : '#f3f4fd' }}
                      />
                    </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Recruiter
                  </label>
                  <input
                    type="text"
                    value={formData.recruiter}
                    onChange={(e) => handleInputChange('recruiter', e.target.value)}
                    placeholder="Recruiter Name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-[#8a87d6] ${
                      isDarkTheme 
                        ? 'border-slate-600 text-slate-200 placeholder-slate-400' 
                        : 'border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    style={{ backgroundColor: isDarkTheme ? '#8a87d6' : '#f3f4fd' }}
                  />
                </div>
              </div>

              {/* Risk Level and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Risk Level
                  </label>
                  <select
                    value={formData.risk_level}
                    onChange={(e) => handleInputChange('risk_level', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-[#8a87d6] ${
                      isDarkTheme 
                        ? 'bg-[#424250] border-slate-600 text-slate-200' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Status
                  </label>
                  <select
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-[#8a87d6] ${
                      isDarkTheme 
                        ? 'border-slate-600 text-slate-200' 
                        : 'border-gray-300 text-gray-900'
                    }`}
                    style={{ backgroundColor: isDarkTheme ? '#8a87d6' : '#f3f4fd' }}
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="monitoring">Monitoring</option>
                    <option value="escalated">Escalated</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Open Date */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Open Date *
                </label>
                <input
                  type="date"
                  value={formData.open_date}
                  onChange={(e) => handleInputChange('open_date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-[#8a87d6] ${
                    isDarkTheme 
                      ? 'bg-[#424250] border-slate-600 text-slate-200' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${errors.open_date ? 'border-[#e69a96]' : ''}`}
                />
                {errors.open_date && (
                  <p className="mt-1 text-sm text-[#e69a96]">{errors.open_date}</p>
                )}
              </div>

              {/* Summary */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Summary
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="Describe why this role is at risk, blockers, challenges..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-[#8a87d6] resize-none ${
                    isDarkTheme 
                      ? 'bg-[#424250] border-slate-600 text-slate-200 placeholder-slate-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* My Input */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Initial Input
                </label>
                <textarea
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-[#8a87d6] resize-none ${
                        isDarkTheme 
                          ? 'border-slate-600 text-slate-200 placeholder-slate-400' 
                          : 'border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      onChange={(e) => handleInputChange('my_input', e.target.value)}
                      placeholder="Add initial information here"
                      value={formData.my_input}
                    />
                  </div>

              {errors.submit && (
                <div className="p-3 bg-[#e69a96] border border-[#e69a96] text-[#e69a96] rounded-lg">
                  {errors.submit}
                </div>
              )}
            </div>
            {/* Footer */}
            <div className={`px-6 py-4 border-t ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'}`}>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 border rounded-lg font-medium hover:bg-opacity-50 ${
                    isDarkTheme 
                      ? 'border-slate-600 text-slate-300 hover:bg-[#424250]' 
                      : 'border-gray-300 text-gray-700 hover:bg-[#f3f4fd]'
                  }`}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#8a87d6] text-white rounded-lg font-medium hover:bg-[#8a87d6] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'Add Role'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRoleModal;

