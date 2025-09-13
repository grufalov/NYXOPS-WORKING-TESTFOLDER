import React, { useState, useRef, useEffect } from 'react';
import { X, AlertTriangle, Eye } from 'lucide-react';

const AddAdvisoryIssueModal = ({ onClose, onSubmit, isDarkTheme }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'advisory',
    status: 'open',
    business_stakeholder: '',
    recruiter: '',
    practice: '',
    candidate_role: '',
    background: '',
    next_steps: ''
  });
  const [step, setStep] = useState(1); // 1: required fields, 2: optional fields
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

    onSubmit(formData);
  };

  const canProceedToStep2 = formData.title.trim().length > 0;
  const hasOptionalData = formData.business_stakeholder || formData.recruiter || formData.practice || formData.candidate_role || formData.background || formData.next_steps;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            New Advisory Issue
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDarkTheme ? 'hover:bg-[#8a87d6] text-slate-400' : 'hover:bg-[#ffffff] text-gray-500'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center mb-6">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 1 ? 'bg-[#8a87d6] text-white' : isDarkTheme ? 'bg-[#8a87d6] text-slate-400' : 'bg-[#f3f4fd] text-gray-600'
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-[#8a87d6]' : isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#f3f4fd]'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 2 ? 'bg-[#8a87d6] text-white' : isDarkTheme ? 'bg-[#8a87d6] text-slate-400' : 'bg-[#f3f4fd] text-gray-600'
          }`}>
            2
          </div>
          <span className={`ml-3 text-sm ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
            {step === 1 ? 'Required Info' : 'Optional Details'}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-6">
              {/* Title - Required */}
              <div>
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
                  placeholder="Brief description of the issue or situation"
                  required
                />
                <p className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'} mt-1`}>
                  This is the only required field to get started
                </p>
              </div>

              {/* Type Selection */}
              <div>
                <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-3`}>
                  Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setFormData({ ...formData, type: 'advisory' })}
                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                      formData.type === 'advisory'
                        ? 'border-[#8a87d6] bg-[#8a87d6]'
                        : isDarkTheme 
                          ? 'border-slate-600 hover:border-slate-500' 
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Eye className={`w-5 h-5 mr-2 ${formData.type === 'advisory' ? 'text-[#8a87d6]' : isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`} />
                      <span className={`font-medium ${formData.type === 'advisory' ? 'text-[#8a87d6]' : isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        Advisory
                      </span>
                    </div>
                    <p className={`text-sm ${formData.type === 'advisory' ? 'text-[#8a87d6]' : isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
                      Guidance needed or situation to monitor
                    </p>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, type: 'emerging' })}
                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                      formData.type === 'emerging'
                        ? 'border-[#e69a96] bg-[#e69a96]'
                        : isDarkTheme 
                          ? 'border-slate-600 hover:border-slate-500' 
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <AlertTriangle className={`w-5 h-5 mr-2 ${formData.type === 'emerging' ? 'text-[#e69a96]' : isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`} />
                      <span className={`font-medium ${formData.type === 'emerging' ? 'text-[#e69a96]' : isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        Emerging
                      </span>
                    </div>
                    <p className={`text-sm ${formData.type === 'emerging' ? 'text-[#e69a96]' : isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
                      Developing issue that may escalate
                    </p>
                  </div>
                </div>
              </div>

              {/* Initial Status */}
              <div>
                <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                  Initial Status
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
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <p className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mb-4`}>
                Add optional details to help track and categorize this issue. You can always add or edit these later.
              </p>

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
                  placeholder="Who is the business stakeholder?"
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
                  placeholder="Who is the recruiter involved?"
                />
              </div>

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
                  placeholder="Which practice area is this related to?"
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
                  placeholder="Candidate name or role affected"
                />
              </div>

              {/* Background */}
              <div>
                <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                  Background
                </label>
                <textarea
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkTheme 
                      ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                      : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent resize-none`}
                  placeholder="What's the background or context for this issue?"
                />
              </div>

              {/* Next Steps */}
              <div>
                <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                  Next Steps
                </label>
                <textarea
                  value={formData.next_steps}
                  onChange={(e) => setFormData({ ...formData, next_steps: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkTheme 
                      ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                      : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent resize-none`}
                  placeholder="What are the planned next steps?"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-600">
            <div className="flex gap-3">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`px-4 py-2 rounded-lg border ${
                    isDarkTheme 
                      ? 'border-slate-600 text-slate-300 hover:bg-[#8a87d6]' 
                      : 'border-gray-300 text-gray-700 hover:bg-[#e3e3f5]'
                  } transition-colors`}
                >
                  Back
                </button>
              )}
              
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg ${isDarkTheme ? 'text-slate-400 hover:text-slate-300' : 'text-gray-600 hover:text-gray-700'} transition-colors`}
              >
                Cancel
              </button>
            </div>

            <div className="flex gap-3">
              {step === 1 && (
                <>
                  <button
                    type="submit"
                    disabled={!canProceedToStep2}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-[#424250] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create with Title Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!canProceedToStep2}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Add Details
                  </button>
                </>
              )}

              {step === 2 && (
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Create Advisory Issue
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdvisoryIssueModal;

