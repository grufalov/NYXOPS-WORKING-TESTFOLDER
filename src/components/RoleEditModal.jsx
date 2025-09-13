import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Plus, Edit2, Trash2 } from 'lucide-react';
import { getRecentValues, addRecentValue } from '../utils/recentValues.js';
import { formatDateDisplay } from '../utils/rolesImportExport.js';

const ComboBox = ({ 
  label, 
  value, 
  onChange, 
  field, 
  placeholder, 
  isDarkTheme, 
  required = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [recentValues, setRecentValues] = useState([]);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    setRecentValues(getRecentValues(field));
  }, [field]);
  
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);
  
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };
  
  const handleSelectValue = (selectedValue) => {
    setInputValue(selectedValue);
    onChange(selectedValue);
    setIsOpen(false);
    addRecentValue(field, selectedValue);
  };
  
  const filteredValues = recentValues.filter(val => 
    val.toLowerCase().includes(inputValue.toLowerCase())
  );
  
  return (
    <div className={`relative ${className}`}>
      <label className={`block text-sm font-medium mb-1 ${
        isDarkTheme ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg border transition-colors ${
          isDarkTheme 
            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500' 
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
      />
      
      {isOpen && filteredValues.length > 0 && (
        <div 
          ref={dropdownRef}
          className={`absolute z-10 w-full mt-1 py-1 rounded-lg shadow-lg border max-h-40 overflow-y-auto ${
            isDarkTheme 
              ? 'bg-slate-700 border-slate-600' 
              : 'bg-white border-gray-200'
          }`}
        >
          {filteredValues.map((val, index) => (
            <button
              key={index}
              onClick={() => handleSelectValue(val)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-600 ${
                val === inputValue ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const RiskReasonsSelect = ({ value = [], onChange, isDarkTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const validReasons = ['No candidates', 'Approval blocked', 'Salary range issue', 'Other', 'Aging role'];
  
  const handleToggleReason = (reason) => {
    const newValue = value.includes(reason)
      ? value.filter(r => r !== reason)
      : [...value, reason];
    onChange(newValue);
  };
  
  return (
    <div className="relative">
      <label className={`block text-sm font-medium mb-1 ${
        isDarkTheme ? 'text-gray-300' : 'text-gray-700'
      }`}>
        Risk Reasons
      </label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 rounded-lg border text-left transition-colors ${
          isDarkTheme 
            ? 'bg-slate-700 border-slate-600 text-white hover:border-blue-500' 
            : 'bg-white border-gray-300 text-gray-900 hover:border-blue-500'
        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
      >
        {value.length === 0 ? (
          <span className="text-gray-500">Select risk reasons...</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {value.map((reason, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {reason}
              </span>
            ))}
          </div>
        )}
      </button>
      
      {isOpen && (
        <div className={`absolute z-10 w-full mt-1 py-1 rounded-lg shadow-lg border ${
          isDarkTheme 
            ? 'bg-slate-700 border-slate-600' 
            : 'bg-white border-gray-200'
        }`}>
          {validReasons.map((reason) => (
            <button
              key={reason}
              onClick={() => handleToggleReason(reason)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2`}
            >
              <input
                type="checkbox"
                checked={value.includes(reason)}
                onChange={() => {}} // Handled by button click
                className="rounded border-gray-300"
              />
              {reason}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const NotesSection = ({ 
  notes = [], 
  onAddNote, 
  onEditNote, 
  onDeleteNote, 
  user, 
  isDarkTheme 
}) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const textareaRef = useRef(null);
  
  const handleAddNote = () => {
    if (newNoteText.trim()) {
      onAddNote(newNoteText.trim());
      setNewNoteText('');
    }
  };
  
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAddNote();
    }
  };
  
  const startEditing = (note) => {
    setEditingNoteId(note.id);
    setEditingText(note.content);
  };
  
  const saveEdit = () => {
    if (editingText.trim()) {
      onEditNote(editingNoteId, editingText.trim());
    }
    setEditingNoteId(null);
    setEditingText('');
  };
  
  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditingText('');
  };
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [newNoteText]);
  
  const formatNoteDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div className="space-y-4">
      <h4 className={`text-lg font-medium ${
        isDarkTheme ? 'text-white' : 'text-gray-900'
      }`}>
        Notes
      </h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Notes List */}
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className={`text-center py-8 ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="text-2xl mb-2">📝</div>
              <p className="text-sm">No notes yet. Add your first note!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {notes
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((note) => (
                <div 
                  key={note.id}
                  className={`p-3 rounded-lg border ${
                    isDarkTheme 
                      ? 'bg-slate-700 border-slate-600' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`font-medium ${
                        isDarkTheme ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {note.author || user?.user_metadata?.name || 'Unknown'}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500">
                        {formatNoteDate(note.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditing(note)}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Edit note"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className={`w-full px-3 py-2 rounded border resize-none ${
                          isDarkTheme 
                            ? 'bg-slate-600 border-slate-500 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={`text-sm whitespace-pre-wrap ${
                      isDarkTheme ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      {note.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Add Note */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${
            isDarkTheme ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Add Note
          </label>
          
          <textarea
            ref={textareaRef}
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your note here... (Ctrl/Cmd+Enter to save)"
            className={`w-full px-3 py-2 rounded-lg border resize-none transition-colors ${
              isDarkTheme 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            rows={4}
            style={{ minHeight: '100px', maxHeight: '200px' }}
          />
          
          <button
            onClick={handleAddNote}
            disabled={!newNoteText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
};

const RoleEditModal = ({ 
  isOpen, 
  onClose, 
  role, 
  onSave, 
  isDarkTheme = false 
}) => {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (isOpen && role) {
      setFormData({
        title: role.title || '',
        job_rec_id: role.job_rec_id || '',
        roma_id: role.roma_id || '',
        role_type: role.role_type || 'External',
        gcm: role.gcm || '',
        hiring_manager: role.hiring_manager || '',
        recruiter: role.recruiter || '',
        practice: role.practice || '',
        client: role.client || '',
        status: role.status || 'Open',
        risk_reasons: role.risk_reasons || []
      });
      setErrors({});
    }
  }, [isOpen, role]);
  
  // Focus trap and escape key handling
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      modalRef.current?.focus();
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Job Title is required';
    }
    
    if (!formData.job_rec_id?.trim()) {
      newErrors.job_rec_id = 'Job Rec ID is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Add recent values to cache
      if (formData.recruiter?.trim()) {
        addRecentValue('recruiter', formData.recruiter.trim());
      }
      if (formData.practice?.trim()) {
        addRecentValue('practice', formData.practice.trim());
      }
      
      await onSave(role.id, formData);
      onClose();
    } catch (error) {
      console.error('Error saving role:', error);
      // Handle error - could show toast notification
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen || !role) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        ref={modalRef}
        className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl transition-all duration-100 ${
          isDarkTheme ? 'bg-slate-800' : 'bg-white'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        {/* Header */}
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
          isDarkTheme ? 'border-slate-600 bg-slate-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <input
              id="modal-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`text-xl font-semibold bg-transparent border-none outline-none min-w-0 flex-1 ${
                isDarkTheme ? 'text-white' : 'text-gray-900'
              } ${errors.title ? 'text-red-500' : ''}`}
              placeholder="Role Title"
            />
            
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className={`px-3 py-1 rounded-full text-sm font-medium border ${
                formData.status === 'Open'
                  ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
                  : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
              }`}
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkTheme 
                ? 'hover:bg-slate-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Job Rec ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.job_rec_id}
                  onChange={(e) => handleInputChange('job_rec_id', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDarkTheme 
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.job_rec_id ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter Job Rec ID"
                />
                {errors.job_rec_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.job_rec_id}</p>
                )}
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  ROMA ID
                </label>
                <input
                  type="text"
                  value={formData.roma_id}
                  onChange={(e) => handleInputChange('roma_id', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDarkTheme 
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="Enter ROMA ID"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Role Type
                </label>
                <select
                  value={formData.role_type}
                  onChange={(e) => handleInputChange('role_type', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDarkTheme 
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  <option value="Internal">Internal</option>
                  <option value="External">External</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  GCM
                </label>
                <input
                  type="text"
                  value={formData.gcm}
                  onChange={(e) => handleInputChange('gcm', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDarkTheme 
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="Enter GCM"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Hiring Manager
                </label>
                <input
                  type="text"
                  value={formData.hiring_manager}
                  onChange={(e) => handleInputChange('hiring_manager', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDarkTheme 
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="Enter Hiring Manager"
                />
              </div>
              
              <ComboBox
                label="Recruiter"
                value={formData.recruiter}
                onChange={(value) => handleInputChange('recruiter', value)}
                field="recruiter"
                placeholder="Enter or select recruiter"
                isDarkTheme={isDarkTheme}
              />
              
              <ComboBox
                label="Practice"
                value={formData.practice}
                onChange={(value) => handleInputChange('practice', value)}
                field="practice"
                placeholder="Enter or select practice"
                isDarkTheme={isDarkTheme}
              />
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Client
                </label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDarkTheme 
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="Enter Client"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Date Created (Read-only)
                </label>
                <input
                  type="text"
                  value={formatDateDisplay(role.date_created || role.open_date)}
                  readOnly
                  className={`w-full px-3 py-2 rounded-lg border cursor-not-allowed ${
                    isDarkTheme 
                      ? 'bg-slate-600 border-slate-500 text-gray-300' 
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
                />
              </div>
            </div>
            
            {/* Risk Reasons */}
            <RiskReasonsSelect
              value={formData.risk_reasons}
              onChange={(value) => handleInputChange('risk_reasons', value)}
              isDarkTheme={isDarkTheme}
            />
            
            {/* Notes Section */}
            <NotesSection
              notes={role.notes || []}
              onAddNote={(content) => {
                // This would need to be implemented in the parent component
                console.log('Add note:', content);
              }}
              onEditNote={(noteId, content) => {
                // This would need to be implemented in the parent component
                console.log('Edit note:', noteId, content);
              }}
              onDeleteNote={(noteId) => {
                // This would need to be implemented in the parent component
                console.log('Delete note:', noteId);
              }}
              user={{ user_metadata: { name: 'Current User' } }} // This should come from props
              isDarkTheme={isDarkTheme}
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className={`sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t ${
          isDarkTheme ? 'border-slate-600 bg-slate-800' : 'border-gray-200 bg-white'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDarkTheme 
                ? 'text-gray-300 hover:bg-slate-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            disabled={isLoading}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleEditModal;
