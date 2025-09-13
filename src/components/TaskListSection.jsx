import React, { useState, useEffect, useMemo, useRef } from 'react';
import { List, Plus, Search, Filter, CheckSquare, Square, Trash2, Edit2, Tag, AlertTriangle, Archive, MoreVertical, Check, X } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import { 
  getPriorityStyles, 
  sortTasksByPriority, 
  extractTagsFromTasks, 
  parseTagString, 
  formatTagsForDisplay,
  checkTaskLimit,
  sanitizeInput,
  truncateText
} from '../utils/myDeskHelpers.js';
import TaskCard from './TaskCard.jsx';
import TrashBinModal from './TrashBinModal.jsx';
import BulkActionsBar from './BulkActionsBar.jsx';
import TaskLimitWarning from './TaskLimitWarning.jsx';

const TaskListSection = ({ tasks, setTasks, user, isDarkTheme }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    tags: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active'); // active, completed, all
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [showTrashBin, setShowTrashBin] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskLimit, setTaskLimit] = useState({ count: 0, warning: false, limit_reached: false });
  const [loading, setLoading] = useState(false);

  const titleInputRef = useRef(null);

  // Check task limits periodically
  useEffect(() => {
    checkLimits();
  }, [tasks]);

  // Auto-focus title input when form opens
  useEffect(() => {
    if (showAddForm && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [showAddForm]);

  const checkLimits = async () => {
    try {
      const limits = await checkTaskLimit(user.id);
      setTaskLimit(limits);
    } catch (error) {
      console.error('Error checking task limits:', error);
    }
  };

  // Extract available tags from existing tasks
  const availableTags = useMemo(() => {
    return extractTagsFromTasks(tasks);
  }, [tasks]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => !task.is_deleted);

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(task => !task.is_completed);
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter(task => task.is_completed);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(term) ||
        task.description?.toLowerCase().includes(term) ||
        task.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return sortTasksByPriority(filtered);
  }, [tasks, filterStatus, filterPriority, searchTerm]);

  const deletedTasks = useMemo(() => {
    return tasks.filter(task => task.is_deleted);
  }, [tasks]);

  const addTask = async () => {
    if (!newTask.title.trim()) return;

    // Check task limit
    if (taskLimit.limit_reached) {
      alert('Task limit reached (500). Please complete or delete some tasks before adding new ones.');
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        user_id: user.id,
        title: sanitizeInput(newTask.title),
        description: newTask.description ? sanitizeInput(newTask.description) : null,
        priority: newTask.priority,
        tags: parseTagString(newTask.tags)
      };

      const { data, error } = await supabase
        .from('my_desk_tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) throw error;

      setTasks([data, ...tasks]);
      setNewTask({ title: '', description: '', priority: 'medium', tags: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Error adding task. Please try again.');
    }
    setLoading(false);
  };

  const updateTask = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('my_desk_tasks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const toggleTaskCompletion = async (id, isCompleted) => {
    await updateTask(id, { is_completed: !isCompleted });
  };

  const deleteTask = async (id) => {
    try {
      const { error } = await supabase
        .from('my_desk_tasks')
        .update({ 
          is_deleted: true, 
          deleted_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === id ? { ...task, is_deleted: true, deleted_at: new Date().toISOString() } : task
      ));
      
      // Remove from selected tasks if it was selected
      setSelectedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleBulkAction = async (action, taskIds) => {
    try {
      switch (action) {
        case 'complete':
          await Promise.all(taskIds.map(id => updateTask(id, { is_completed: true })));
          break;
        case 'incomplete':
          await Promise.all(taskIds.map(id => updateTask(id, { is_completed: false })));
          break;
        case 'delete':
          await Promise.all(taskIds.map(id => deleteTask(id)));
          break;
        default:
          break;
      }
      setSelectedTasks(new Set());
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      addTask();
    }
  };

  const activeTaskCount = filteredTasks.filter(task => !task.is_completed).length;
  const completedTaskCount = filteredTasks.filter(task => task.is_completed).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <List className="w-5 h-5 text-[#8a87d6]" />
          <h3 className="text-lg font-semibold">Task List</h3>
          {activeTaskCount > 0 && (
            <div className={`text-sm px-2 py-1 rounded-full ${isDarkTheme ? 'bg-[#424250] text-gray-300' : 'bg-[#f3f4fd] text-gray-600'}`}>
              {activeTaskCount} active
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {deletedTasks.length > 0 && (
            <button
              onClick={() => setShowTrashBin(true)}
              className={`p-2 rounded-md transition-colors ${isDarkTheme ? 'text-gray-400 hover:text-gray-200 hover:bg-[#424250]' : 'text-gray-600 hover:text-gray-800 hover:bg-[#f3f4fd]'}`}
              title={`Trash (${deletedTasks.length} items)`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={taskLimit.limit_reached}
            className={`p-2 rounded-md transition-colors ${
              taskLimit.limit_reached
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-[#8a87d6] hover:bg-[#8a87d6] text-white'
            }`}
            title={taskLimit.limit_reached ? 'Task limit reached (500)' : 'Add New Task'}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task Limit Warning */}
      {(taskLimit.warning || taskLimit.limit_reached) && (
        <TaskLimitWarning
          count={taskLimit.count}
          warning={taskLimit.warning}
          limitReached={taskLimit.limit_reached}
          isDarkTheme={isDarkTheme}
        />
      )}

      {/* Add Task Form */}
      {showAddForm && (
        <div className={`border rounded-md p-4 space-y-3 ${isDarkTheme ? 'border-gray-600 bg-[#424250]/50' : 'border-gray-200 bg-[#e3e3f5]'}`}>
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Add New Task</h4>
            <button
              onClick={() => setShowAddForm(false)}
              className={`p-1 rounded-md hover:bg-[#f3f4fd] dark:hover:bg-[#424250] transition-colors ${isDarkTheme ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <input
              ref={titleInputRef}
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              onKeyPress={handleKeyPress}
              placeholder="Task title (required)"
              className={`w-full px-3 py-2 border rounded-md ${
                isDarkTheme
                  ? 'bg-[#424250] border-gray-600 text-white placeholder-gray-400 focus:border-[#8a87d6]'
                  : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8a87d6]'
              } focus:outline-none focus:ring-2 focus:ring-[#8a87d6] focus:ring-opacity-20`}
            />
            
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Description (optional)"
              rows={2}
              className={`w-full px-3 py-2 border rounded-md resize-none ${
                isDarkTheme
                  ? 'bg-[#424250] border-gray-600 text-white placeholder-gray-400 focus:border-[#8a87d6]'
                  : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8a87d6]'
              } focus:outline-none focus:ring-2 focus:ring-[#8a87d6] focus:ring-opacity-20`}
            />
            
            <div className="flex space-x-3">
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className={`px-3 py-2 border rounded-md ${
                  isDarkTheme
                    ? 'bg-[#424250] border-gray-600 text-white'
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                } focus:outline-none focus:border-[#8a87d6]`}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              
              <input
                type="text"
                value={newTask.tags}
                onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                placeholder="Tags (comma separated)"
                className={`flex-1 px-3 py-2 border rounded-md ${
                  isDarkTheme
                    ? 'bg-[#424250] border-gray-600 text-white placeholder-gray-400 focus:border-[#8a87d6]'
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8a87d6]'
                } focus:outline-none focus:ring-2 focus:ring-[#8a87d6] focus:ring-opacity-20`}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 border rounded-md ${isDarkTheme ? 'border-gray-600 text-gray-300 hover:bg-[#424250]' : 'border-gray-300 text-gray-700 hover:bg-[#e3e3f5]'} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                disabled={!newTask.title.trim() || loading}
                className={`px-4 py-2 rounded-md transition-colors ${
                  newTask.title.trim() && !loading
                    ? 'bg-[#8a87d6] hover:bg-[#8a87d6] text-white'
                    : isDarkTheme
                      ? 'bg-[#424250] text-gray-500 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            className={`w-full pl-10 pr-3 py-2 border rounded-md ${
              isDarkTheme
                ? 'bg-[#424250] border-gray-600 text-white placeholder-gray-400 focus:border-[#8a87d6]'
                : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8a87d6]'
            } focus:outline-none focus:ring-2 focus:ring-[#8a87d6] focus:ring-opacity-20`}
          />
        </div>
        
        <div className="flex space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-3 py-2 border rounded-md ${
              isDarkTheme
                ? 'bg-[#424250] border-gray-600 text-white'
                : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
            } focus:outline-none focus:border-[#8a87d6]`}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="all">All</option>
          </select>
          
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className={`px-3 py-2 border rounded-md ${
              isDarkTheme
                ? 'bg-[#424250] border-gray-600 text-white'
                : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
            } focus:outline-none focus:border-[#8a87d6]`}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedTasks.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedTasks.size}
          onAction={handleBulkAction}
          selectedTasks={Array.from(selectedTasks)}
          onClear={() => setSelectedTasks(new Set())}
          isDarkTheme={isDarkTheme}
        />
      )}

      {/* Task List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className={`text-center py-8 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
            <List className="w-8 h-8 mx-auto mb-2 opacity-50" />
            {searchTerm || filterPriority !== 'all' || filterStatus !== 'active' ? (
              <div>
                <p>No tasks match your filters</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterPriority('all');
                    setFilterStatus('active');
                  }}
                  className="text-[#8a87d6] hover:text-[#8a87d6] text-sm mt-1"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div>
                <p>No tasks yet</p>
                <p className="text-sm">Click the + button to add your first task</p>
              </div>
            )}
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              isSelected={selectedTasks.has(task.id)}
              onSelect={(selected) => {
                setSelectedTasks(prev => {
                  const newSet = new Set(prev);
                  if (selected) {
                    newSet.add(task.id);
                  } else {
                    newSet.delete(task.id);
                  }
                  return newSet;
                });
              }}
              onToggleComplete={() => toggleTaskCompletion(task.id, task.is_completed)}
              onEdit={(updates) => updateTask(task.id, updates)}
              onDelete={() => deleteTask(task.id)}
              availableTags={availableTags}
              isDarkTheme={isDarkTheme}
            />
          ))
        )}
      </div>

      {/* Summary */}
      {filteredTasks.length > 0 && (
        <div className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'} flex justify-between`}>
          <span>{activeTaskCount} active, {completedTaskCount} completed</span>
          <span>{filteredTasks.length} total</span>
        </div>
      )}

      {/* Trash Bin Modal */}
      {showTrashBin && (
        <TrashBinModal
          isOpen={showTrashBin}
          onClose={() => setShowTrashBin(false)}
          deletedTasks={deletedTasks}
          onRestore={async (taskId) => {
            await updateTask(taskId, { is_deleted: false, deleted_at: null });
          }}
          onPermanentDelete={async (taskId) => {
            const { error } = await supabase
              .from('my_desk_tasks')
              .delete()
              .eq('id', taskId);
            
            if (!error) {
              setTasks(tasks.filter(task => task.id !== taskId));
            }
          }}
          isDarkTheme={isDarkTheme}
          user={user}
        />
      )}
    </div>
  );
};

export default TaskListSection;

