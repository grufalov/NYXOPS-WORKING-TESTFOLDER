import React, { useState, useEffect, useRef } from 'react';
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
  X,
  MoreVertical,
  ChevronUp
} from 'lucide-react';
import { formatDateDisplay } from '../utils/formatDate';
import BackgroundDoodles from '../components/decors/BackgroundDoodles.jsx';

// Priority Chip Component (matching Roles at Risk styling)
const PriorityChip = ({ priority, isDarkTheme }) => {
  const getChipStyles = () => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-amber-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return isDarkTheme 
          ? 'bg-slate-600 text-slate-300' 
          : 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getChipStyles()}`}>
      {priority || 'normal'}
    </span>
  );
};

// Progress Donut Component
const ProgressDonut = ({ percentage, size = 'sm', isDarkTheme }) => {
  const dimensions = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';
  const strokeWidth = size === 'sm' ? '2' : '3';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  
  return (
    <div className={`relative ${dimensions}`}>
      <svg className={`${dimensions} transform -rotate-90`} viewBox="0 0 36 36">
        <path
          className={`stroke-current ${isDarkTheme ? 'text-slate-600' : 'text-gray-300'}`}
          strokeWidth={strokeWidth}
          fill="none"
          d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="stroke-current text-[#8a87d6]"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${percentage}, 100`}
          d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${textSize} font-semibold text-[#8a87d6]`}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

// Task Item Component
const TaskItem = ({ task, index, handover, updateHandover, isDarkTheme, user }) => {
  const [showMoreNotes, setShowMoreNotes] = useState(false);
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  
  const isCompleted = typeof task === 'object' && task.completed;
  const taskTitle = typeof task === 'string' ? task : task.title || task.text || 'Untitled task';
  const taskNotes = typeof task === 'object' ? task.notes || '' : '';
  const taskPriority = typeof task === 'object' ? task.priority : 'normal';
  const taskOwner = typeof task === 'object' ? task.ownerId : user?.email;
  const taskDue = typeof task === 'object' ? task.dueDate : null;

  const toggleTaskCompleted = () => {
    const updatedTasks = [...(handover.tasks || [])];
    const currentTask = updatedTasks[index];

    if (typeof currentTask === 'string') {
      updatedTasks[index] = {
        title: currentTask,
        completed: true,
        notes: taskNotes,
        priority: taskPriority,
        ownerId: taskOwner
      };
    } else {
      updatedTasks[index] = {
        ...currentTask,
        completed: !currentTask.completed
      };
    }

    updateHandover(handover.id, { tasks: updatedTasks });
  };

  const updateTaskPriority = (newPriority) => {
    const updatedTasks = [...(handover.tasks || [])];
    const currentTask = updatedTasks[index];
    
    if (typeof currentTask === 'string') {
      updatedTasks[index] = {
        title: currentTask,
        completed: false,
        notes: taskNotes,
        priority: newPriority,
        ownerId: taskOwner
      };
    } else {
      updatedTasks[index] = {
        ...currentTask,
        priority: newPriority
      };
    }
    
    updateHandover(handover.id, { tasks: updatedTasks });
    setIsEditingPriority(false);
  };

  const shouldTruncateNotes = taskNotes && taskNotes.length > 150;

  return (
    <div className={`rounded-xl border p-3 transition-colors ${
      isDarkTheme 
        ? 'border-slate-600 bg-[var(--surface-bg)]' 
        : 'border-black/5 bg-[var(--surface-bg)]'
    } ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Completion Checkbox */}
        <button
          onClick={toggleTaskCompleted}
          className={`mt-0.5 flex-shrink-0 transition-colors ${
            isCompleted 
              ? 'text-green-500' 
              : isDarkTheme ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
        </button>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Task Title */}
          <div className={`text-sm font-medium ${
            isCompleted 
              ? 'line-through opacity-75' 
              : isDarkTheme ? 'text-white' : 'text-gray-900'
          }`}>
            {taskTitle}
          </div>

          {/* Meta Line */}
          <div className={`flex items-center gap-2 mt-1 text-xs ${
            isDarkTheme ? 'text-slate-400' : 'text-gray-600'
          }`}>
            {taskDue && (
              <>
                <span>Due: {new Date(taskDue).toLocaleDateString()}</span>
                <span>•</span>
              </>
            )}
            <span>Owner: {taskOwner || 'Unassigned'}</span>
          </div>

          {/* Task Notes - Always Visible by Default */}
          {taskNotes && (
            <div className={`mt-2 text-sm ${
              isDarkTheme ? 'text-slate-300' : 'text-gray-700'
            }`}>
              <div className={shouldTruncateNotes && !showMoreNotes ? 'line-clamp-3' : ''}>
                {taskNotes}
              </div>
              {shouldTruncateNotes && (
                <button
                  onClick={() => setShowMoreNotes(!showMoreNotes)}
                  className={`mt-1 text-xs font-medium transition-colors ${
                    isDarkTheme 
                      ? 'text-[#8a87d6] hover:text-[#9f9ce8]' 
                      : 'text-[#8a87d6] hover:text-[#7c79d1]'
                  }`}
                >
                  {showMoreNotes ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Priority Chip */}
        <div className="flex-shrink-0">
          {isEditingPriority ? (
            <select
              value={taskPriority}
              onChange={(e) => updateTaskPriority(e.target.value)}
              onBlur={() => setIsEditingPriority(false)}
              autoFocus
              className={`text-xs rounded-full px-2 py-1 border-0 ${
                isDarkTheme 
                  ? 'bg-slate-600 text-white' 
                  : 'bg-white text-gray-900'
              }`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          ) : (
            <button
              onClick={() => setIsEditingPriority(true)}
              className="transition-transform hover:scale-105"
            >
              <PriorityChip priority={taskPriority} isDarkTheme={isDarkTheme} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Expanded Handover Card Component
const ExpandedHandoverCard = ({ 
  handover, 
  updateHandover, 
  deleteHandover, 
  markHandoverCompleted,
  isDarkTheme, 
  user, 
  onEdit,
  onCollapse 
}) => {
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const cardRef = useRef(null);

  const tasks = Array.isArray(handover.tasks) ? handover.tasks : [];
  const openTasks = tasks.filter(task => !(typeof task === 'object' && task.completed));
  const completedTasks = tasks.filter(task => typeof task === 'object' && task.completed);
  const progressPercentage = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  const getStatusChip = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'active':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'incoming': return 'Received';
      case 'outgoing': return 'Sent';
      case 'personal': return 'Personal';
      default: return type;
    }
  };

  // Focus management
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      cardRef.current.focus();
    }
  }, [handover.id]);

  return (
    <div 
      ref={cardRef}
      tabIndex={-1}
      className={`rounded-2xl shadow-sm p-5 transition-all duration-300 ${
        isDarkTheme ? 'bg-[var(--card-bg)]' : 'bg-[var(--card-bg)]'
      }`}
      style={{ backgroundColor: 'var(--card-bg)' }}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className={`text-xl font-semibold ${
              isDarkTheme ? 'text-white' : 'text-gray-900'
            }`}>
              {handover.title}
            </h2>
            
            {/* Status and Type Badges */}
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusChip(handover.status)}`}>
                {handover.status || 'Active'}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                isDarkTheme 
                  ? 'bg-slate-700 text-slate-300 border-slate-600' 
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}>
                {getTypeLabel(handover.type)}
              </span>
            </div>
          </div>

          {/* Meta Line */}
          <div className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
            Created: {handover.created_at ? formatDateDisplay(handover.created_at) : 'N/A'} • 
            Owner: {handover.ownerId || user?.email || 'Unassigned'} • 
            Tasks: {tasks.length}
          </div>
        </div>

        {/* Progress Donut Badge */}
        <ProgressDonut percentage={progressPercentage} size="lg" isDarkTheme={isDarkTheme} />
      </div>

      {/* Linear Progress Bar */}
      <div className={`w-full rounded-full h-2 mb-6 ${
        isDarkTheme ? 'bg-slate-700' : 'bg-gray-200'
      }`}>
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Open Tasks Section */}
      <div className="mb-6">
        <h3 className={`text-lg font-medium mb-3 ${
          isDarkTheme ? 'text-white' : 'text-gray-900'
        }`}>
          Open Tasks ({openTasks.length})
        </h3>
        
        {openTasks.length > 0 ? (
          <div className="space-y-3">
            {openTasks.map((task, index) => {
              const originalIndex = tasks.findIndex(t => t === task);
              return (
                <TaskItem
                  key={originalIndex}
                  task={task}
                  index={originalIndex}
                  handover={handover}
                  updateHandover={updateHandover}
                  isDarkTheme={isDarkTheme}
                  user={user}
                />
              );
            })}
          </div>
        ) : (
          <div className={`text-center py-8 rounded-xl border-2 border-dashed ${
            isDarkTheme 
              ? 'border-slate-600 text-slate-400' 
              : 'border-gray-300 text-gray-500'
          }`}>
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No open tasks yet</p>
            <button className={`mt-2 text-sm font-medium ${
              isDarkTheme 
                ? 'text-[#8a87d6] hover:text-[#9f9ce8]' 
                : 'text-[#8a87d6] hover:text-[#7c79d1]'
            }`}>
              Add your first task
            </button>
          </div>
        )}
      </div>

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowCompletedTasks(!showCompletedTasks)}
            className={`flex items-center gap-2 text-lg font-medium mb-3 transition-colors ${
              isDarkTheme 
                ? 'text-white hover:text-slate-300' 
                : 'text-gray-900 hover:text-gray-700'
            }`}
          >
            Completed Tasks ({completedTasks.length})
            {showCompletedTasks ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {showCompletedTasks && (
            <div className="space-y-3">
              {completedTasks.map((task, index) => {
                const originalIndex = tasks.findIndex(t => t === task);
                return (
                  <TaskItem
                    key={originalIndex}
                    task={task}
                    index={originalIndex}
                    handover={handover}
                    updateHandover={updateHandover}
                    isDarkTheme={isDarkTheme}
                    user={user}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Card Footer Actions */}
      <div className={`flex items-center gap-3 pt-4 border-t ${
        isDarkTheme ? 'border-slate-600' : 'border-gray-200'
      }`}>
        {handover.type === 'incoming' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-[#8a87d6] text-white rounded-lg hover:bg-[#7a77c6] transition-colors font-medium">
            <Users className="w-4 h-4" />
            Take Over
          </button>
        )}
        
        <button 
          onClick={() => markHandoverCompleted(handover.id, handover.status !== 'completed')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <CheckCircle className="w-4 h-4" />
          {handover.status === 'completed' ? 'Mark Active' : 'Mark Completed'}
        </button>
        
        <button 
          onClick={() => deleteHandover(handover.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
            isDarkTheme 
              ? 'text-red-400 hover:bg-red-900/20' 
              : 'text-red-600 hover:bg-red-50'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

// Collapsed Handover Row Component
const CollapsedHandoverRow = ({ 
  handover, 
  isDarkTheme, 
  user, 
  onClick, 
  onExport, 
  onDelete 
}) => {
  const [showKebab, setShowKebab] = useState(false);
  
  const tasks = Array.isArray(handover.tasks) ? handover.tasks : [];
  const completedTasks = tasks.filter(task => typeof task === 'object' && task.completed);
  const progressPercentage = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  const getTypeLabel = (type) => {
    switch (type) {
      case 'incoming': return 'Received';
      case 'outgoing': return 'Sent';
      case 'personal': return 'Personal';
      default: return type;
    }
  };

  return (
    <div 
      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
        isDarkTheme 
          ? 'border-slate-600 bg-[var(--card-bg)] hover:bg-[var(--hover-bg)]' 
          : 'border-gray-200 bg-[var(--card-bg)] hover:bg-[var(--hover-bg)]'
      }`}
      onClick={onClick}
    >
      {/* Title and Meta */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium truncate ${
          isDarkTheme ? 'text-white' : 'text-gray-900'
        }`}>
          {handover.title}
        </h3>
        <div className={`text-sm ${
          isDarkTheme ? 'text-slate-400' : 'text-gray-600'
        }`}>
          {handover.created_at ? formatDateDisplay(handover.created_at) : 'N/A'} • 
          Owner: {handover.ownerId || user?.email || 'Unassigned'}
        </div>
      </div>

      {/* Mini Progress Donut */}
      <ProgressDonut percentage={progressPercentage} size="sm" isDarkTheme={isDarkTheme} />

      {/* Status Chip */}
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
        isDarkTheme 
          ? 'bg-slate-700 text-slate-300 border-slate-600' 
          : 'bg-gray-100 text-gray-700 border-gray-300'
      }`}>
        {getTypeLabel(handover.type)}
      </span>

      {/* Kebab Menu */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setShowKebab(!showKebab)}
          className={`p-2 rounded-lg transition-colors ${
            isDarkTheme 
              ? 'hover:bg-slate-600 text-slate-400' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {showKebab && (
          <div className={`absolute right-0 top-full mt-1 w-32 rounded-lg shadow-lg border z-50 ${
            isDarkTheme 
              ? 'bg-slate-700 border-slate-600' 
              : 'bg-white border-gray-200'
          }`}>
            <button
              onClick={() => {
                onExport(handover);
                setShowKebab(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded-t-lg transition-colors ${
                isDarkTheme 
                  ? 'hover:bg-slate-600 text-slate-300' 
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              Export
            </button>
            <button
              onClick={() => {
                onDelete(handover);
                setShowKebab(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded-b-lg transition-colors ${
                isDarkTheme 
                  ? 'hover:bg-red-900/20 text-red-400' 
                  : 'hover:bg-red-50 text-red-600'
              }`}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main HandoversView Component
const HandoversView = ({ 
  handovers = [], 
  completedHandovers = [],
  addHandover, 
  updateHandover, 
  deleteHandover,
  markHandoverCompleted,
  softDeleteHandover,
  cases = [], 
  user,
  isDarkTheme = true,
  AddHandoverModal,
  EditHandoverModal
}) => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('handovers-active-tab') || 'received';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedHandoverId, setExpandedHandoverId] = useState(() => {
    return localStorage.getItem('handovers-expanded-id') || null;
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHandover, setEditingHandover] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Combine all handovers
  const allHandovers = [...handovers, ...completedHandovers];

  // Filter handovers based on active tab
  const getFilteredHandovers = () => {
    let filtered = allHandovers.filter(handover => {
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
        return handover.createdById === user?.id || handover.type === 'outgoing' || handover.type === 'personal';
      } else if (activeTab === 'received') {
        return handover.createdById !== user?.id || handover.type === 'incoming';
      }
      return true;
    });

    // Sort by createdAt (most recent first)
    return filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  };

  const filteredHandovers = getFilteredHandovers();

  // Get expanded handover
  const expandedHandover = expandedHandoverId 
    ? filteredHandovers.find(h => h.id === expandedHandoverId)
    : null;

  // Get collapsed handovers (all except expanded)
  const collapsedHandovers = filteredHandovers.filter(h => h.id !== expandedHandoverId);

  // Set default expanded handover (most recent)
  useEffect(() => {
    if (!expandedHandover && filteredHandovers.length > 0) {
      const mostRecent = filteredHandovers[0];
      setExpandedHandoverId(mostRecent.id);
      localStorage.setItem('handovers-expanded-id', mostRecent.id);
    } else if (expandedHandover && !filteredHandovers.find(h => h.id === expandedHandoverId)) {
      // Current expanded handover no longer matches filters
      const mostRecent = filteredHandovers[0];
      if (mostRecent) {
        setExpandedHandoverId(mostRecent.id);
        localStorage.setItem('handovers-expanded-id', mostRecent.id);
      } else {
        setExpandedHandoverId(null);
        localStorage.removeItem('handovers-expanded-id');
      }
    }
  }, [filteredHandovers, expandedHandover, expandedHandoverId]);

  // Persist active tab
  useEffect(() => {
    localStorage.setItem('handovers-active-tab', activeTab);
  }, [activeTab]);

  const handleExpandHandover = (handover) => {
    setExpandedHandoverId(handover.id);
    localStorage.setItem('handovers-expanded-id', handover.id);
  };

  const exportHandovers = (format) => {
    console.log(`Exporting ${filteredHandovers.length} handovers as ${format}`);
    setShowExportDropdown(false);
  };

  const exportSingleHandover = (handover, format = 'csv') => {
    console.log(`Exporting handover ${handover.id} as ${format}`);
  };

  return (
    <div
      className="min-h-screen relative"
      style={{ 
        backgroundColor: 'var(--app-bg)', 
        color: 'var(--text)' 
      }}
    >
      <BackgroundDoodles />
      
      <div className="relative z-10 px-6 py-6">
        {/* Top Bar */}
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
                  placeholder="Search handovers…"
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
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Center: Tabs */}
              <div 
                className="inline-flex flex-shrink-0 p-1 rounded-xl"
                role="tablist"
                style={{ backgroundColor: 'var(--surface-bg)' }}
              >
                {[
                  { id: 'sent', label: 'Sent' },
                  { id: 'received', label: 'Received' }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`px-3 py-2 text-sm transition-all rounded-md ${
                      activeTab === id
                        ? 'font-semibold border-b-2 border-[var(--accent)]'
                        : isDarkTheme 
                          ? 'text-slate-400 hover:bg-[#424250]' 
                          : 'text-gray-600 hover:bg-[#f3f4fd]'
                    }`}
                    style={activeTab === id ? { 
                      color: 'var(--text)',
                      borderBottomColor: '#8a87d6'
                    } : {}}
                    role="tab"
                    aria-selected={activeTab === id}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2 ml-auto">
                {/* Export Button */}
                <div className="relative">
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
                          onClick={() => exportHandovers('csv')}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          📊 CSV Spreadsheet
                        </button>
                        <button
                          onClick={() => exportHandovers('pdf')}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          📄 PDF Report
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

        {/* Content */}
        {filteredHandovers.length === 0 ? (
          // Empty State
          <div className={`rounded-xl p-12 text-center ${
            isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd] border border-gray-200'
          }`}>
            <Users className={`w-16 h-16 mx-auto mb-4 ${
              isDarkTheme ? 'text-slate-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-medium mb-2 ${
              isDarkTheme ? 'text-white' : 'text-gray-900'
            }`}>
              No {activeTab} handovers found
            </h3>
            <p className={`mb-6 ${
              isDarkTheme ? 'text-slate-400' : 'text-gray-600'
            }`}>
              {searchTerm 
                ? `No handovers match "${searchTerm}".`
                : 'Get started by creating your first handover.'
              }
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-[#8a87d6] text-white rounded-lg font-medium hover:bg-[#7a77c6] transition-colors"
            >
              Add Handover
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Expanded Handover Card */}
            {expandedHandover && (
              <ExpandedHandoverCard
                handover={expandedHandover}
                updateHandover={updateHandover}
                deleteHandover={deleteHandover}
                markHandoverCompleted={markHandoverCompleted}
                isDarkTheme={isDarkTheme}
                user={user}
                onEdit={setEditingHandover}
                onCollapse={() => setExpandedHandoverId(null)}
              />
            )}

            {/* Previous Handovers List */}
            {collapsedHandovers.length > 0 && (
              <div>
                <h2 className={`text-lg font-medium mb-4 ${
                  isDarkTheme ? 'text-white' : 'text-gray-900'
                }`}>
                  Previous handovers
                </h2>
                <div className="space-y-2">
                  {collapsedHandovers.map(handover => (
                    <CollapsedHandoverRow
                      key={handover.id}
                      handover={handover}
                      isDarkTheme={isDarkTheme}
                      user={user}
                      onClick={() => handleExpandHandover(handover)}
                      onExport={(handover) => exportSingleHandover(handover)}
                      onDelete={(handover) => deleteHandover(handover.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
