import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Tag,
  AlertCircle,
  FileText,
  Eye,
  EyeOff,
  Send
} from 'lucide-react';
import { formatDate } from '../utils/formatDate.js';
import { validateMarkdown } from '../utils/markdownHelpers.js';
import MarkdownEditor from '../components/MarkdownEditor.jsx';
import MarkdownPreview from '../components/MarkdownPreview.jsx';

/**
 * Simplified Add Advisory Issue Modal for v1.5
 * Streamlined experience with enhanced markdown support
 */
const AddAdvisoryIssueModalV15 = ({
  isOpen,
  onClose,
  onSubmit,
  isDarkTheme = true,
  user,
  isLoading = false
}) => {
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: 'medium',
    due_date: '',
    owner: user?.id || ''
  });

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available options
  const categories = [
    { value: 'technical', label: 'Technical', icon: '⚙️' },
    { value: 'process', label: 'Process', icon: '📋' },
    { value: 'security', label: 'Security', icon: '🔒' },
    { value: 'compliance', label: 'Compliance', icon: '✅' },
    { value: 'resource', label: 'Resource', icon: '👥' },
    { value: 'vendor', label: 'Vendor', icon: '🏢' },
    { value: 'financial', label: 'Financial', icon: '💰' },
    { value: 'operational', label: 'Operational', icon: '🔄' }
  ];

  const severityLevels = [
    { value: 'critical', label: 'Critical', color: 'red', description: 'Immediate action required' },
    { value: 'high', label: 'High', color: 'orange', description: 'Urgent attention needed' },
    { value: 'medium', label: 'Medium', color: 'yellow', description: 'Standard priority' },
    { value: 'low', label: 'Low', color: 'green', description: 'Lower priority' }
  ];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        category: '',
        severity: 'medium',
        due_date: '',
        owner: user?.id || ''
      });
      setErrors({});
      setValidationWarnings([]);
      setShowPreview(false);
      setIsSubmitting(false);
    }
  }, [isOpen, user?.id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Validate description markdown in real-time
    if (field === 'description' && value.trim()) {
      const validation = validateMarkdown(value);
      setValidationWarnings(validation.warnings);
    } else if (field === 'description') {
      setValidationWarnings([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else {
      const validation = validateMarkdown(formData.description);
      if (!validation.valid) {
        newErrors.description = 'Description contains invalid markdown';
      }
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Due date validation (optional but must be future if provided)
    if (formData.due_date) {
      const dueDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.due_date = 'Due date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Format data for submission
      const submissionData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        due_date: formData.due_date || null,
        created_by: user?.id,
        status: 'open'
      };

      await onSubmit(submissionData);
      onClose();
    } catch (error) {
      console.error('Error creating advisory issue:', error);
      setErrors({ submit: 'Failed to create advisory issue. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getSeverityColor = (severity) => {
    const level = severityLevels.find(s => s.value === severity);
    if (!level) return isDarkTheme ? 'text-slate-400' : 'text-gray-500';
    
    const colorMap = {
      red: isDarkTheme ? 'text-[#e69a96]' : 'text-[#e69a96]',
      orange: isDarkTheme ? 'text-[#8a87d6]' : 'text-[#8a87d6]',
      yellow: isDarkTheme ? 'text-yellow-400' : 'text-yellow-600',
      green: isDarkTheme ? 'text-[#e69a96]' : 'text-[#e69a96]'
    };
    
    return colorMap[level.color] || (isDarkTheme ? 'text-slate-400' : 'text-gray-500');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl ${
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
              <AlertCircle className={`w-5 h-5 ${
                isDarkTheme ? 'text-[#8a87d6]' : 'text-[#8a87d6]'
              }`} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${
                isDarkTheme ? 'text-slate-100' : 'text-gray-900'
              }`}>
                New Advisory Issue
              </h2>
              <p className={`text-sm ${
                isDarkTheme ? 'text-slate-400' : 'text-gray-500'
              }`}>
                Create a new issue for tracking and resolution
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
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Issue Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Brief, descriptive title for the advisory issue"
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  errors.title
                    ? 'border-[#e69a96] focus:border-[#e69a96]'
                    : isDarkTheme
                      ? 'border-slate-600 bg-[#8a87d6] text-slate-100 focus:border-[#8a87d6]'
                      : 'border-gray-300 bg-[#f3f4fd] text-gray-900 focus:border-[#8a87d6]'
                } focus:outline-none focus:ring-2 focus:ring-[#8a87d6]/20`}
                maxLength={200}
                autoFocus
              />
              {errors.title && (
                <p className="mt-1 text-sm text-[#e69a96]">{errors.title}</p>
              )}
              <p className={`mt-1 text-xs ${
                isDarkTheme ? 'text-slate-500' : 'text-gray-400'
              }`}>
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Category and Severity Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  <Tag className="w-4 h-4 inline mr-1" />
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    errors.category
                      ? 'border-[#e69a96] focus:border-[#e69a96]'
                      : isDarkTheme
                        ? 'border-slate-600 bg-[#8a87d6] text-slate-100 focus:border-[#8a87d6]'
                        : 'border-gray-300 bg-[#f3f4fd] text-gray-900 focus:border-[#8a87d6]'
                  } focus:outline-none focus:ring-2 focus:ring-[#8a87d6]/20`}
                >
                  <option value="">Select category...</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-[#e69a96]">{errors.category}</p>
                )}
              </div>

              {/* Severity */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Severity
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => handleInputChange('severity', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDarkTheme
                      ? 'border-slate-600 bg-[#8a87d6] text-slate-100 focus:border-[#8a87d6]'
                      : 'border-gray-300 bg-[#f3f4fd] text-gray-900 focus:border-[#8a87d6]'
                  } focus:outline-none focus:ring-2 focus:ring-[#8a87d6]/20`}
                >
                  {severityLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label} - {level.description}
                    </option>
                  ))}
                </select>
                <p className={`mt-1 text-xs ${getSeverityColor(formData.severity)}`}>
                  {severityLevels.find(s => s.value === formData.severity)?.description}
                </p>
              </div>
            </div>

            {/* Due Date and Owner Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Due Date */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                  min={formatDate(new Date()).split('T')[0]}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    errors.due_date
                      ? 'border-[#e69a96] focus:border-[#e69a96]'
                      : isDarkTheme
                        ? 'border-slate-600 bg-[#8a87d6] text-slate-100 focus:border-[#8a87d6]'
                        : 'border-gray-300 bg-[#f3f4fd] text-gray-900 focus:border-[#8a87d6]'
                  } focus:outline-none focus:ring-2 focus:ring-[#8a87d6]/20`}
                />
                {errors.due_date && (
                  <p className="mt-1 text-sm text-[#e69a96]">{errors.due_date}</p>
                )}
              </div>

              {/* Owner (Read-only for current user) */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  <User className="w-4 h-4 inline mr-1" />
                  Owner
                </label>
                <div className={`px-3 py-2 rounded-lg border ${
                  isDarkTheme
                    ? 'border-slate-600 bg-[#8a87d6]/50 text-slate-300'
                    : 'border-gray-300 bg-[#e3e3f5] text-gray-700'
                }`}>
                  {user?.email || 'Current User'}
                </div>
                <p className={`mt-1 text-xs ${
                  isDarkTheme ? 'text-slate-500' : 'text-gray-400'
                }`}>
                  You will be assigned as the owner
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm font-medium ${
                  isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  <FileText className="w-4 h-4 inline mr-1" />
                  Description
                </label>
                
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    showPreview
                      ? isDarkTheme
                        ? 'bg-[#8a87d6] text-white'
                        : 'bg-[#8a87d6] text-white'
                      : isDarkTheme
                        ? 'text-slate-400 hover:text-slate-300'
                        : 'text-gray-500 hover:text-gray-600'
                  }`}
                >
                  {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showPreview ? ' Edit' : ' Preview'}
                </button>
              </div>

              {showPreview ? (
                <div className={`min-h-[120px] p-3 rounded-lg border ${
                  isDarkTheme ? 'border-slate-600 bg-[#8a87d6]/30' : 'border-gray-300 bg-[#e3e3f5]'
                }`}>
                  {formData.description.trim() ? (
                    <MarkdownPreview
                      content={formData.description}
                      isDarkTheme={isDarkTheme}
                      showBorder={false}
                    />
                  ) : (
                    <div className={`text-sm ${
                      isDarkTheme ? 'text-slate-500' : 'text-gray-400'
                    }`}>
                      No description yet. Switch to edit mode to add content.
                    </div>
                  )}
                </div>
              ) : (
                <MarkdownEditor
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                  placeholder="Detailed description of the advisory issue... (supports **bold**, *italic*, # headings, - lists, and colors)"
                  isDarkTheme={isDarkTheme}
                  minHeight={120}
                  maxHeight={300}
                  showToolbar={true}
                  onKeyDown={handleKeyDown}
                />
              )}

              {errors.description && (
                <p className="mt-1 text-sm text-[#e69a96]">{errors.description}</p>
              )}

              {/* Validation warnings */}
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

            {/* Submit error */}
            {errors.submit && (
              <div className={`p-3 rounded-lg text-sm ${
                isDarkTheme ? 'bg-[#e69a96]/20 text-[#e69a96]' : 'bg-[#e69a96] text-[#e69a96]'
              }`}>
                {errors.submit}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          isDarkTheme ? 'border-slate-600' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Ctrl+Enter to submit</span>
            <span>•</span>
            <span>Esc to cancel</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
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
            
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title.trim() || !formData.description.trim() || !formData.category}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isSubmitting || !formData.title.trim() || !formData.description.trim() || !formData.category
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-[#8a87d6]'
              } bg-[#8a87d6] text-white`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent mr-2" />
                  Creating...
                </div>
              ) : (
                <div className="flex items-center">
                  <Send className="w-4 h-4 mr-2" />
                  Create Issue
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAdvisoryIssueModalV15;

