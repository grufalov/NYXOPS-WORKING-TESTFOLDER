import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowUp,
  AlertTriangle,
  Clock,
  User,
  FileText,
  CheckCircle,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatDateDisplay } from '../utils/formatDate.js';
import { parseMarkdown, validateMarkdown } from '../utils/markdownHelpers.js';
import MarkdownEditor from '../components/MarkdownEditor.jsx';
import MarkdownPreview from '../components/MarkdownPreview.jsx';

/**
 * Enhanced Promote to Case Dialog for Advisory Issues v1.5
 * Comprehensive dialog for converting advisory issues to cases
 */
const PromoteToCaseModalV15 = ({
  isOpen,
  onClose,
  onPromote,
  issue,
  isDarkTheme = true,
  user,
  isLoading = false
}) => {
  // Form state
  const [formData, setFormData] = useState({
    priority: 'medium',
    additionalNotes: '',
    retainOriginal: true,
    notifyStakeholders: true
  });

  // UI state
  const [showNotesPreview, setShowNotesPreview] = useState(false);
  const [errors, setErrors] = useState({});
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // Multi-step flow

  // Priority options
  const priorityLevels = [
    {
      value: 'critical',
      label: 'Critical',
      color: 'red',
      description: 'Business-critical issue requiring immediate attention',
      examples: ['System outages', 'Security breaches', 'Data loss']
    },
    {
      value: 'high',
      label: 'High',
      color: 'orange',
      description: 'Important issue that should be addressed soon',
      examples: ['Performance issues', 'Process failures', 'Compliance gaps']
    },
    {
      value: 'medium',
      label: 'Medium',
      color: 'yellow',
      description: 'Standard issue that needs attention',
      examples: ['Feature requests', 'Documentation updates', 'Minor bugs']
    },
    {
      value: 'low',
      label: 'Low',
      color: 'green',
      description: 'Lower priority issue that can be addressed later',
      examples: ['Nice-to-have features', 'Cosmetic improvements']
    }
  ];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && issue) {
      // Auto-suggest priority based on issue severity
      const suggestedPriority = getSuggestedPriority(issue.severity);
      
      setFormData({
        priority: suggestedPriority,
        additionalNotes: '',
        retainOriginal: true,
        notifyStakeholders: true
      });
      setErrors({});
      setValidationWarnings([]);
      setShowNotesPreview(false);
      setIsSubmitting(false);
      setStep(1);
    }
  }, [isOpen, issue]);

  const getSuggestedPriority = (severity) => {
    const mapping = {
      'critical': 'critical',
      'high': 'high',
      'medium': 'medium',
      'low': 'low'
    };
    return mapping[severity] || 'medium';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Validate additional notes markdown in real-time
    if (field === 'additionalNotes' && value.trim()) {
      const validation = validateMarkdown(value);
      setValidationWarnings(validation.warnings);
    } else if (field === 'additionalNotes') {
      setValidationWarnings([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Additional notes validation (if provided)
    if (formData.additionalNotes.trim()) {
      const validation = validateMarkdown(formData.additionalNotes);
      if (!validation.valid) {
        newErrors.additionalNotes = 'Additional notes contain invalid markdown';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePromote = async () => {
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const promotionData = {
        issueId: issue.id,
        priority: formData.priority,
        additionalNotes: formData.additionalNotes.trim() || null,
        retainOriginal: formData.retainOriginal,
        notifyStakeholders: formData.notifyStakeholders,
        promotedBy: user?.id
      };

      await onPromote(promotionData);
      onClose();
    } catch (error) {
      console.error('Error promoting to case:', error);
      setErrors({ submit: 'Failed to promote to case. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    const level = priorityLevels.find(p => p.value === priority);
    if (!level) return isDarkTheme ? 'text-slate-400' : 'text-gray-500';
    
    const colorMap = {
      red: isDarkTheme ? 'text-[#e69a96]' : 'text-[#e69a96]',
      orange: isDarkTheme ? 'text-[#8a87d6]' : 'text-[#8a87d6]',
      yellow: isDarkTheme ? 'text-yellow-400' : 'text-yellow-600',
      green: isDarkTheme ? 'text-[#e69a96]' : 'text-[#e69a96]'
    };
    
    return colorMap[level.color] || (isDarkTheme ? 'text-slate-400' : 'text-gray-500');
  };

  const getPriorityBadgeColor = (priority) => {
    const level = priorityLevels.find(p => p.value === priority);
    if (!level) return isDarkTheme ? 'bg-slate-600' : 'bg-[#f3f4fd]';
    
    const colorMap = {
      red: isDarkTheme ? 'bg-[#e69a96]/20 text-[#e69a96]' : 'bg-[#e69a96] text-[#e69a96]',
      orange: isDarkTheme ? 'bg-[#8a87d6]/20 text-[#8a87d6]' : 'bg-[#8a87d6] text-[#8a87d6]',
      yellow: isDarkTheme ? 'bg-yellow-600/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      green: isDarkTheme ? 'bg-[#f3f4fd]/20 text-[#e69a96]' : 'bg-[#f3f4fd] text-[#e69a96]'
    };
    
    return colorMap[level.color] || (isDarkTheme ? 'bg-slate-600' : 'bg-[#f3f4fd]');
  };

  if (!isOpen || !issue) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl ${
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

        {/* Progress Steps */}
        <div className={`px-6 py-3 border-b ${
          isDarkTheme ? 'border-slate-600' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-4">
            {[
              { num: 1, label: 'Review Issue' },
              { num: 2, label: 'Set Priority' },
              { num: 3, label: 'Configure Options' }
            ].map((stepItem, index) => (
              <div key={stepItem.num} className="flex items-center">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                  step >= stepItem.num
                    ? isDarkTheme
                      ? 'bg-[#8a87d6] text-white'
                      : 'bg-[#8a87d6] text-white'
                    : isDarkTheme
                      ? 'bg-slate-600 text-slate-400'
                      : 'bg-[#f3f4fd] text-gray-500'
                }`}>
                  {step > stepItem.num ? <CheckCircle className="w-3 h-3" /> : stepItem.num}
                </div>
                <span className={`ml-2 text-sm ${
                  step >= stepItem.num
                    ? isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                    : isDarkTheme ? 'text-slate-500' : 'text-gray-400'
                }`}>
                  {stepItem.label}
                </span>
                {index < 2 && (
                  <div className={`mx-3 w-6 h-px ${
                    step > stepItem.num
                      ? isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#8a87d6]'
                      : isDarkTheme ? 'bg-slate-600' : 'bg-[#f3f4fd]'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {/* Step 1: Review Issue */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${
                    isDarkTheme ? 'text-slate-200' : 'text-gray-800'
                  }`}>
                    Issue Summary
                  </h3>
                  
                  {/* Issue overview */}
                  <div className={`p-4 rounded-lg border ${
                    isDarkTheme ? 'border-slate-600 bg-[#8a87d6]/30' : 'border-gray-200 bg-[#e3e3f5]'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <h4 className={`font-medium ${
                        isDarkTheme ? 'text-slate-200' : 'text-gray-800'
                      }`}>
                        {issue.title}
                      </h4>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        issue.severity === 'critical' ? 'bg-[#e69a96] text-[#e69a96]' :
                        issue.severity === 'high' ? 'bg-[#8a87d6] text-[#8a87d6]' :
                        issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-[#f3f4fd] text-[#e69a96]'
                      }`}>
                        {issue.severity}
                      </div>
                    </div>
                    
                    <div className={`text-sm mb-3 ${
                      isDarkTheme ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {issue.owner_name || 'Unassigned'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateDisplay(issue.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {issue.category}
                        </span>
                      </div>
                    </div>
                    
                    <div 
                      className={`text-sm prose prose-sm max-w-none ${
                        isDarkTheme ? 'prose-invert' : ''
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: parseMarkdown(issue.description || 'No description')
                      }}
                    />
                  </div>
                </div>

                {/* Promotion impact info */}
                <div className={`p-4 rounded-lg ${
                  isDarkTheme ? 'bg-[#8a87d6]/20 border border-[#8a87d6]/30' : 'bg-[#8a87d6] border border-[#8a87d6]'
                }`}>
                  <div className="flex items-start gap-3">
                    <Info className={`w-5 h-5 mt-0.5 ${
                      isDarkTheme ? 'text-[#8a87d6]' : 'text-[#8a87d6]'
                    }`} />
                    <div>
                      <h4 className={`font-medium mb-2 ${
                        isDarkTheme ? 'text-[#8a87d6]' : 'text-[#8a87d6]'
                      }`}>
                        What happens when you promote this issue?
                      </h4>
                      <ul className={`text-sm space-y-1 ${
                        isDarkTheme ? 'text-[#8a87d6]' : 'text-[#8a87d6]'
                      }`}>
                        <li>• A new case will be created in the Cases system</li>
                        <li>• The case will inherit all issue details and notes</li>
                        <li>• Formal case tracking and workflows will be enabled</li>
                        <li>• You can optionally keep or archive the original issue</li>
                        <li>• Stakeholders can be automatically notified</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Set Priority */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${
                    isDarkTheme ? 'text-slate-200' : 'text-gray-800'
                  }`}>
                    Set Case Priority
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {priorityLevels.map(level => (
                      <label
                        key={level.value}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.priority === level.value
                            ? isDarkTheme
                              ? 'border-[#8a87d6] bg-[#8a87d6]/10'
                              : 'border-[#8a87d6] bg-[#8a87d6]'
                            : isDarkTheme
                              ? 'border-slate-600 hover:border-slate-500'
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={level.value}
                          checked={formData.priority === level.value}
                          onChange={(e) => handleInputChange('priority', e.target.value)}
                          className="sr-only"
                        />
                        
                        <div className="flex items-start justify-between mb-2">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            getPriorityBadgeColor(level.value)
                          }`}>
                            {level.label}
                          </div>
                          
                          {formData.priority === level.value && (
                            <CheckCircle className={`w-4 h-4 ${
                              isDarkTheme ? 'text-[#8a87d6]' : 'text-[#8a87d6]'
                            }`} />
                          )}
                        </div>
                        
                        <p className={`text-sm mb-2 ${
                          isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          {level.description}
                        </p>
                        
                        <div className={`text-xs ${
                          isDarkTheme ? 'text-slate-500' : 'text-gray-500'
                        }`}>
                          Examples: {level.examples.join(', ')}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Priority suggestion */}
                <div className={`p-3 rounded-lg ${
                  isDarkTheme ? 'bg-yellow-900/20 border border-yellow-700/30' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${
                      isDarkTheme ? 'text-yellow-400' : 'text-yellow-600'
                    }`} />
                    <span className={`text-sm ${
                      isDarkTheme ? 'text-yellow-300' : 'text-yellow-700'
                    }`}>
                      Based on the issue severity ({issue.severity}), we suggest{' '}
                      <span className="font-medium">{getSuggestedPriority(issue.severity)}</span> priority.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Configure Options */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${
                    isDarkTheme ? 'text-slate-200' : 'text-gray-800'
                  }`}>
                    Additional Options
                  </h3>
                  
                  {/* Additional Notes */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className={`text-sm font-medium ${
                        isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        Additional Notes (Optional)
                      </label>
                      
                      <button
                        type="button"
                        onClick={() => setShowNotesPreview(!showNotesPreview)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          showNotesPreview
                            ? isDarkTheme
                              ? 'bg-[#8a87d6] text-white'
                              : 'bg-[#8a87d6] text-white'
                            : isDarkTheme
                              ? 'text-slate-400 hover:text-slate-300'
                              : 'text-gray-500 hover:text-gray-600'
                        }`}
                      >
                        {showNotesPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showNotesPreview ? ' Edit' : ' Preview'}
                      </button>
                    </div>

                    {showNotesPreview ? (
                      <div className={`min-h-[100px] p-3 rounded-lg border ${
                        isDarkTheme ? 'border-slate-600 bg-[#8a87d6]/30' : 'border-gray-300 bg-[#e3e3f5]'
                      }`}>
                        {formData.additionalNotes.trim() ? (
                          <MarkdownPreview
                            content={formData.additionalNotes}
                            isDarkTheme={isDarkTheme}
                            showBorder={false}
                          />
                        ) : (
                          <div className={`text-sm ${
                            isDarkTheme ? 'text-slate-500' : 'text-gray-400'
                          }`}>
                            No additional notes. Switch to edit mode to add content.
                          </div>
                        )}
                      </div>
                    ) : (
                      <MarkdownEditor
                        value={formData.additionalNotes}
                        onChange={(value) => handleInputChange('additionalNotes', value)}
                        placeholder="Add any additional context or instructions for the case... (supports markdown)"
                        isDarkTheme={isDarkTheme}
                        minHeight={100}
                        maxHeight={200}
                        showToolbar={true}
                      />
                    )}

                    {errors.additionalNotes && (
                      <p className="mt-1 text-sm text-[#e69a96]">{errors.additionalNotes}</p>
                    )}

                    {validationWarnings.length > 0 && (
                      <div className={`mt-2 p-2 rounded text-sm ${
                        isDarkTheme ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {validationWarnings.map((warning, index) => (
                          <div key={index}>• {warning}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Configuration options */}
                  <div className="space-y-4">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.retainOriginal}
                        onChange={(e) => handleInputChange('retainOriginal', e.target.checked)}
                        className={`mt-1 w-4 h-4 rounded border-2 ${
                          isDarkTheme
                            ? 'border-slate-600 bg-[#8a87d6] text-[#8a87d6] focus:ring-[#8a87d6]/20'
                            : 'border-gray-300 bg-[#f3f4fd] text-[#8a87d6] focus:ring-[#8a87d6]/20'
                        }`}
                      />
                      <div>
                        <div className={`text-sm font-medium ${
                          isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          Keep original advisory issue
                        </div>
                        <div className={`text-xs ${
                          isDarkTheme ? 'text-slate-500' : 'text-gray-500'
                        }`}>
                          If unchecked, the original issue will be marked as promoted and archived
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.notifyStakeholders}
                        onChange={(e) => handleInputChange('notifyStakeholders', e.target.checked)}
                        className={`mt-1 w-4 h-4 rounded border-2 ${
                          isDarkTheme
                            ? 'border-slate-600 bg-[#8a87d6] text-[#8a87d6] focus:ring-[#8a87d6]/20'
                            : 'border-gray-300 bg-[#f3f4fd] text-[#8a87d6] focus:ring-[#8a87d6]/20'
                        }`}
                      />
                      <div>
                        <div className={`text-sm font-medium ${
                          isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          Notify stakeholders
                        </div>
                        <div className={`text-xs ${
                          isDarkTheme ? 'text-slate-500' : 'text-gray-500'
                        }`}>
                          Send notifications to relevant team members about the new case
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit error */}
                {errors.submit && (
                  <div className={`p-3 rounded-lg text-sm ${
                    isDarkTheme ? 'bg-[#e69a96]/20 text-[#e69a96]' : 'bg-[#e69a96] text-[#e69a96]'
                  }`}>
                    {errors.submit}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          isDarkTheme ? 'border-slate-600' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDarkTheme
                    ? 'text-slate-300 hover:text-slate-100 hover:bg-[#8a87d6]'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-[#ffffff]'
                }`}
              >
                Back
              </button>
            )}
            
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDarkTheme
                  ? 'text-slate-300 hover:text-slate-100 hover:bg-[#8a87d6]'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-[#ffffff]'
              }`}
            >
              Cancel
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[#8a87d6] text-white hover:bg-[#8a87d6] transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handlePromote}
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isSubmitting
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-[#8a87d6]'
                } bg-[#8a87d6] text-white`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent mr-2" />
                    Promoting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Promote to Case
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoteToCaseModalV15;

