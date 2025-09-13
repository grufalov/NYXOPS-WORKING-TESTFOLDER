import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  Edit, 
  Download, 
  CheckCircle, 
  Circle, 
  Trash2, 
  FileText, 
  ChevronDown,
  Search,
  X
} from 'lucide-react';
import { formatDateDisplay } from '../utils/formatDate';
import BackgroundDoodles from '../components/decors/BackgroundDoodles.jsx';

// Handover Card Component - Redesigned to match Cases design
const HandoverCard = ({ 
  handover, 
  updateHandover, 
  deleteHandover,
  markHandoverCompleted,
  softDeleteHandover,
  isCompleted = false,
  isDarkTheme = true,
  user,
  onEdit
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Helper functions
  const getTypeIcon = (type) => {
    switch (type) {
      case 'incoming': return '📥';
      case 'outgoing': return '📤';
      case 'personal': return '📋';
      default: return '📄';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'incoming': 
        return isDarkTheme 
          ? 'bg-blue-900/20 text-blue-400 border-blue-700'
          : 'bg-blue-50 text-blue-700 border-blue-200';
      case 'outgoing':
        return isDarkTheme 
          ? 'bg-green-900/20 text-green-400 border-green-700'
          : 'bg-green-50 text-green-700 border-green-200';
      case 'personal':
        return isDarkTheme 
          ? 'bg-purple-900/20 text-purple-400 border-purple-700'
          : 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return isDarkTheme 
          ? 'bg-gray-900/20 text-gray-400 border-gray-700'
          : 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'pending':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const tasks = Array.isArray(handover.tasks) ? handover.tasks : [];
  const completedTasks = tasks.filter(task => {
    if (typeof task === 'string') return false;
    return task.completed;
  }).length;
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const toggleTaskCompleted = (taskIndex) => {
    const updatedTasks = [...tasks];
    const currentTask = updatedTasks[taskIndex];

    if (typeof currentTask === 'string') {
      updatedTasks[taskIndex] = {
        title: currentTask,
        completed: true
      };
    } else {
      updatedTasks[taskIndex] = {
        ...currentTask,
        completed: !currentTask.completed
      };
    }

    updateHandover(handover.id, { tasks: updatedTasks });
  };

  const exportHandoverData = async (format) => {
    console.log(`Exporting handover ${handover.id} as ${format}`);
    setShowExportDropdown(false);
  };

  return (
    <div 
      className={`${isDarkTheme ? 'bg-[#424250] border-slate-700 hover:bg-[#4a4a5a]' : 'bg-[#f3f4fd] border-gray-200 hover:bg-[#ffffff]'} rounded-xl border p-6 transition-all duration-300 shadow-lg group`}
      style={{
        backgroundColor: isDarkTheme ? '#424250' : '#f3f4fd',
        borderColor: isDarkTheme ? '#475569' : '#e5e7eb'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{getTypeIcon(handover.type)}</span>
            <h3 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              {handover.title}
            </h3>
            
            {/* Progress Donut Badge - Top Right */}
            {tasks.length > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="stroke-current text-gray-300 dark:text-slate-600"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="stroke-current text-[#8a87d6]"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${progressPercentage}, 100`}
                      d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-[#8a87d6]">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Status and Type Badges */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(handover.type)}`}>
              {handover.type === 'incoming' ? 'Received' :
               handover.type === 'outgoing' ? 'Sent' : 'Personal'}
            </span>
            {handover.status && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getStatusColor(handover.status)}`}>
                {handover.status}
              </span>
            )}
            {tasks.length > 0 && (
              <span className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
                {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {/* Created Date */}
          <p className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
            Created: {handover.created_at ? formatDateDisplay(handover.created_at) : 'N/A'}
          </p>
        </div>

        {/* Action Icons - Hover Only */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className={`p-2 rounded-lg hover:bg-opacity-20 ${isDarkTheme ? 'text-[#8a87d6] hover:text-[#8a87d6] hover:bg-[#8a87d6]/20' : 'text-[#8a87d6] hover:text-[#8a87d6] hover:bg-[#8a87d6]/20'}`}
              title="Export Handover"
            >
              <Download className="w-4 h-4" />
            </button>
            
            {showExportDropdown && (
              <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50 ${isDarkTheme ? 'bg-[#424250] border border-slate-600' : 'bg-[#f3f4fd] border border-gray-200'}`}>
                <div className="py-1">
                  <button
                    onClick={() => exportHandoverData('csv')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-opacity-10 ${isDarkTheme ? 'text-gray-200 hover:bg-[#8a87d6]' : 'text-gray-700 hover:bg-[#ffffff]'}`}
                  >
                    📊 Export as CSV
                  </button>
                  <button
                    onClick={() => exportHandoverData('html')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-opacity-10 ${isDarkTheme ? 'text-gray-200 hover:bg-[#8a87d6]' : 'text-gray-700 hover:bg-[#ffffff]'}`}
                  >
                    🌐 Export as HTML
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => onEdit && onEdit(handover)}
            className={`p-2 rounded-lg hover:bg-opacity-20 ${isDarkTheme ? 'text-slate-400 hover:text-white hover:bg-[#8a87d6]/20' : 'text-gray-400 hover:text-gray-600 hover:bg-[#8a87d6]/20'}`}
            title="Edit handover"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tasks Section - Collapsible */}
      {tasks.length > 0 && (
        <div className="mb-4">
          {/* Progress Bar */}
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
              Progress: {completedTasks}/{tasks.length} tasks
            </span>
            <span className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className={`w-full ${isDarkTheme ? 'bg-[#30313e]' : 'bg-gray-200'} rounded-full h-2 mb-3`}>
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Task List Preview/Full */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className={`text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                Tasks:
              </h4>
              {tasks.length > 3 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`text-xs ${isDarkTheme ? 'text-[#8a87d6] hover:text-[#9f9ce8]' : 'text-[#8a87d6] hover:text-[#7c79d1]'} font-medium transition-colors`}
                >
                  {isExpanded ? 'Show Less' : `Show All (${tasks.length})`}
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {(isExpanded ? tasks : tasks.slice(0, 3)).map((task, index) => {
                const isCompleted = typeof task === 'object' && task.completed;
                const taskTitle = typeof task === 'string' ? task : task.title || task.text || 'Untitled task';
                const taskPriority = typeof task === 'object' ? task.priority : null;

                return (
                  <div
                    key={index}
                    className={`rounded-lg p-3 transition-colors ${isDarkTheme ? 'bg-[#30313e] hover:bg-[#3a3a4a]' : 'bg-white hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTaskCompleted(index)}
                        className={`flex-shrink-0 transition-colors ${isCompleted ? 'text-green-500' : (isDarkTheme ? 'text-slate-400' : 'text-gray-400')}`}
                      >
                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      </button>
                      <span className={`text-sm flex-1 ${isCompleted ? 'line-through opacity-60' : ''} ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        {taskTitle}
                      </span>
                      {taskPriority && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          taskPriority === 'high' ? 'bg-red-500 text-white' :
                          taskPriority === 'medium' ? 'bg-yellow-500 text-white' :
                          'bg-green-500 text-white'
                        }`}>
                          {taskPriority}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {!isExpanded && tasks.length > 3 && (
                <div className={`text-center py-2 text-sm ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
                  ... and {tasks.length - 3} more tasks
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notes Section - Collapsible like Next Steps in Cases */}
      {handover.notes && (
        <div className={`rounded-lg p-3 mt-4 border-l-4 ${isDarkTheme ? 'bg-[#2d3748] border-[#8a87d6]' : 'bg-yellow-50 border-[#8a87d6]'}`}>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-[#8a87d6]" />
            <h4 className={`text-sm font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Notes</h4>
          </div>
          <p className={`text-sm whitespace-pre-wrap ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
            {handover.notes}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
        <div className="flex items-center gap-2">
          {handover.type === 'incoming' && (
            <button
              onClick={() => {/* Take Over functionality */}}
              className="flex items-center gap-2 px-3 py-2 bg-[#8a87d6] text-white rounded-lg hover:bg-[#7a77c6] transition-colors text-sm font-medium"
              title="Take ownership of this handover"
            >
              <Users className="w-4 h-4" />
              Take Over
            </button>
          )}
          
          {!isCompleted ? (
            <button
              onClick={() => markHandoverCompleted(handover.id, true)}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              title="Mark as completed"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Completed
            </button>
          ) : (
            <button
              onClick={() => markHandoverCompleted(handover.id, false)}
              className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              title="Mark as active"
            >
              <Circle className="w-4 h-4" />
              Mark Active
            </button>
          )}
        </div>
        
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
          title="Delete handover"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full mx-4`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                Delete handover?
              </h3>
              <p className={`text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-600'} mt-2 mb-6`}>
                This will permanently delete this handover and all its tasks. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    softDeleteHandover(handover.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
                    isDarkTheme 
                      ? 'bg-slate-600 text-slate-300 hover:bg-slate-500' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main HandoversView Component
const HandoversView = ({ 
  handovers, 
  completedHandovers,
  addHandover, 
  updateHandover, 
  deleteHandover,
  markHandoverCompleted,
  softDeleteHandover,
  cases = [], 
  user,
  isDarkTheme = true,
  // Import necessary modal components
  AddHandoverModal,
  EditHandoverModal,
  EditTaskModal,
  TaskNotesModal
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHandover, setEditingHandover] = useState(null);
  const [activeTab, setActiveTab] = useState('sent'); // 'sent' or 'received'
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Filter handovers based on active tab
  const getFilteredHandovers = () => {
    const allHandovers = [...handovers, ...completedHandovers];
    const filtered = allHandovers.filter(handover => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          handover.title?.toLowerCase().includes(searchLower) ||
          handover.type?.toLowerCase().includes(searchLower) ||
          handover.status?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Tab filter
      if (activeTab === 'sent') {
        return handover.type === 'outgoing' || handover.type === 'personal';
      } else if (activeTab === 'received') {
        return handover.type === 'incoming';
      }
      return true;
    });

    return filtered;
  };

  const filteredHandovers = getFilteredHandovers();

  // Export functionality
  const exportHandovers = (format) => {
    console.log(`Exporting ${filteredHandovers.length} handovers as ${format}`);
    setShowExportDropdown(false);
  };

  return (
    <div
      className={`${isDarkTheme ? 'bg-[#30313e] text-white' : 'bg-[#e3e3f5] text-gray-900'} min-h-screen relative`}
      data-handovers-view
      style={{ backgroundColor: 'var(--app-bg)', color: 'var(--text)' }}
    >
      <BackgroundDoodles />
      
      <div className="relative z-10 px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Handovers</h1>
            <p className={`${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>Manage task handovers and coverage</p>
          </div>
        </div>

        {/* Purple Action Bar */}
        <div 
          className="sticky top-0 z-10 mb-6"
          style={{ backgroundColor: 'var(--app-bg)' }}
        >
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: 'var(--surface-bg)', 
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div className="flex flex-wrap items-center gap-4">
              {/* Left: Search Input */}
              <div className="relative flex-shrink-0 w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search handovers..."
                  className="w-full h-10 pl-9 pr-8 rounded-2xl border transition-all focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Center: Tab Controls */}
              <div 
                className="inline-flex flex-shrink-0 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl"
                role="tablist"
                aria-label="Filter handovers by direction"
                style={{ backgroundColor: 'var(--surface-bg)' }}
              >
                {[
                  { id: 'sent', label: 'Sent' },
                  { id: 'received', label: 'Received' }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-160 whitespace-nowrap ${
                      activeTab === id
                        ? 'bg-[#8a87d6] text-white shadow-sm font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:text-[#8a87d6] hover:bg-opacity-50'
                    }`}
                    role="tab"
                    aria-selected={activeTab === id}
                    aria-controls={`${id}-panel`}
                    style={{ 
                      height: '40px',
                      minWidth: id === 'sent' ? '80px' : '100px' // Visual balance for different word lengths
                    }}
                  >
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2 ml-auto">
                {/* Export Button */}
                <div className="relative export-dropdown">
                  <button
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                    className="h-10 px-4 border-2 border-[#8a87d6] text-[#8a87d6] rounded-2xl font-medium transition-all hover:bg-[#8a87d6] hover:text-white flex items-center gap-2"
                    disabled={filteredHandovers.length === 0}
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  {showExportDropdown && (
                    <div 
                      className="absolute right-0 top-full mt-2 min-w-[200px] rounded-xl border shadow-lg z-50"
                      style={{ 
                        backgroundColor: 'var(--elevated-bg)', 
                        borderColor: 'var(--border)',
                        boxShadow: 'var(--shadow-hover)'
                      }}
                    >
                      <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
                        <div className="text-xs text-gray-500 mb-1">Export Format</div>
                        <div className="text-xs text-gray-400">
                          {filteredHandovers.length} {activeTab} handovers
                        </div>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => exportHandovers('html')}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          🌐 HTML Report
                        </button>
                        <button
                          onClick={() => exportHandovers('csv')}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          📊 CSV Spreadsheet
                        </button>
                        <button
                          onClick={() => exportHandovers('json')}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          🔧 JSON Data
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Add Handover Button */}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="h-10 px-4 bg-[#8a87d6] text-white rounded-2xl font-medium transition-all hover:bg-[#7a77c6] flex items-center gap-2"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <Plus className="w-4 h-4" />
                  Add Handover
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div 
          id={`${activeTab}-panel`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10"
        >
          {filteredHandovers.length > 0 ? (
            filteredHandovers.map(handover => (
              <HandoverCard 
                key={handover.id} 
                handover={handover} 
                updateHandover={updateHandover} 
                deleteHandover={deleteHandover}
                markHandoverCompleted={markHandoverCompleted}
                softDeleteHandover={softDeleteHandover}
                isCompleted={handover.status === 'completed'}
                isDarkTheme={isDarkTheme}
                user={user}
                onEdit={(handover) => {
                  setEditingHandover(handover);
                  setShowEditModal(true);
                }}
              />
            ))
          ) : (
            <div className={`col-span-full rounded-xl p-8 text-center ${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd] border border-gray-200'}`}>
              <Users className={`w-12 h-12 mx-auto mb-3 ${isDarkTheme ? 'text-slate-600' : 'text-gray-400'}`} />
              <h3 className={`text-lg font-medium mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                No {activeTab} handovers found
              </h3>
              <p className={`${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
                {searchTerm 
                  ? `No handovers match "${searchTerm}". Try adjusting your search.`
                  : filteredHandovers.length === 0 
                    ? 'Add your first handover to get started!'
                    : `No ${activeTab} handovers available.`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && AddHandoverModal && (
        <AddHandoverModal
          onClose={() => setShowAddModal(false)}
          onAdd={addHandover}
          cases={cases}
          isDarkTheme={isDarkTheme}
        />
      )}

      {showEditModal && EditHandoverModal && editingHandover && (
        <EditHandoverModal
          handover={editingHandover}
          onClose={() => {
            setShowEditModal(false);
            setEditingHandover(null);
          }}
          onSave={updateHandover}
          cases={cases}
          isDarkTheme={isDarkTheme}
        />
      )}
    </div>
  );
};

export default HandoversView;
