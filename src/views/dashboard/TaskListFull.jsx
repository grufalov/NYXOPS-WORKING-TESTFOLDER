import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { errorBus } from '../../utils/errorBus';
import ErrorInline from '../../components/ErrorInline';

const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'completed', label: 'Completed' }
];

const TaskListFull = ({ isDarkTheme, user }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user?.id) {
      loadTasks(true);
    }
  }, [user?.id, activeTab]);

  const loadTasks = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = reset ? 1 : page;
      const offset = (currentPage - 1) * 10;

      let query = supabase
        .from('my_desk_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + 9);

      // Apply tab filters
      switch (activeTab) {
        case 'active':
          query = query.eq('completed', false);
          break;
        case 'today':
          query = query.eq('due_date', today);
          break;
        case 'overdue':
          query = query.lt('due_date', today).eq('completed', false);
          break;
        case 'completed':
          query = query.eq('completed', true);
          break;
        // 'all' shows everything
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      if (reset) {
        setTasks(data || []);
        setPage(2);
      } else {
        setTasks(prev => [...prev, ...(data || [])]);
        setPage(prev => prev + 1);
      }

      setHasMore(data && data.length === 10);
    } catch (err) {
      setError(err.message);
      errorBus.pushError({ source: 'Task List', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from('my_desk_tasks')
        .insert([{
          user_id: user.id,
          title: newTaskTitle.trim(),
          completed: false
        }])
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [data, ...prev]);
      setNewTaskTitle('');
    } catch (err) {
      errorBus.pushError({ source: 'Create Task', message: err.message });
    }
  };

  const toggleComplete = async (taskId, currentStatus) => {
    try {
      // Add completion animation
      const checkbox = document.querySelector(`[data-task-id="${taskId}"]`);
      if (checkbox && !currentStatus) {
        checkbox.classList.add('task-complete-animation');
        setTimeout(() => {
          checkbox.classList.remove('task-complete-animation');
        }, 160);
      }
      
      const { error } = await supabase
        .from('my_desk_tasks')
        .update({ completed: !currentStatus })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, completed: !currentStatus } : task
      ));
    } catch (err) {
      errorBus.pushError({ source: 'Toggle Task', message: err.message });
    }
  };

  const startEdit = (task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = async () => {
    if (!editTitle.trim() || !editingTask) return;

    try {
      const { error } = await supabase
        .from('my_desk_tasks')
        .update({ title: editTitle.trim() })
        .eq('id', editingTask);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === editingTask ? { ...task, title: editTitle.trim() } : task
      ));
      
      setEditingTask(null);
      setEditTitle('');
    } catch (err) {
      errorBus.pushError({ source: 'Edit Task', message: err.message });
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditTitle('');
  };

  const deleteTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from('my_desk_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      errorBus.pushError({ source: 'Delete Task', message: err.message });
    }
  };

  const getTaskCount = (tabKey) => {
    switch (tabKey) {
      case 'active':
        return tasks.filter(t => !t.completed).length;
      case 'completed':
        return tasks.filter(t => t.completed).length;
      case 'today':
        return tasks.filter(t => t.due_date === today).length;
      case 'overdue':
        return tasks.filter(t => t.due_date && t.due_date < today && !t.completed).length;
      default:
        return tasks.length;
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        document.getElementById('quick-add-input')?.focus();
      }
      if (e.key === 'Escape' && editingTask) {
        cancelEdit();
      }
      if (e.ctrlKey && e.key === 's' && editingTask) {
        e.preventDefault();
        saveEdit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingTask, editTitle]);

  if (loading && tasks.length === 0) {
    return (
      <div className="card">
        <div className="card">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-accent" />
            <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              Task List
            </h3>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-surface rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <CheckSquare className="w-5 h-5 text-accent" />
          <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Task List
          </h3>
        </div>
        <ErrorInline 
          message={error}
          onRetry={() => loadTasks(true)}
          isDarkTheme={isDarkTheme}
        />
      </div>
    );
  }

  return (
    <div className="card" style={{ 
      backgroundColor: '#f3f4fd',
      border: '2px solid #c5cae9',
      borderRadius: '1rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)'
    }}>
      {/* Header - keep tabs only */}
      <div className="p-4 pb-0">
        <div className="flex items-center gap-2 mb-4">
          <CheckSquare className="w-5 h-5 text-accent" />
          <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Task List
          </h3>
        </div>
      </div>
        
      {/* Tabs - Real tablist with accessibility */}
      <div 
        role="tablist" 
        aria-label="Task categories"
        className={`flex border-b ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'}`}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`tabpanel-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all relative ${
              activeTab === tab.key
                ? 'border-[#8a87d6] text-[#8a87d6] font-semibold'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-[#8a87d6] hover:border-gray-300 dark:hover:text-gray-300'
            }`}
          >
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8a87d6] rounded-full" />
            )}
            {tab.label}
            <span 
              className={`ml-1.5 px-2 py-0.5 text-xs rounded-full border ${
                activeTab === tab.key 
                  ? 'text-[#8a87d6] border-[#8a87d6] bg-[#8a87d6]/10' 
                  : 'text-gray-400 border-gray-300 dark:bg-gray-800 dark:border-gray-600'
              }`}
              style={{
                backgroundColor: activeTab === tab.key 
                  ? undefined 
                  : isDarkTheme ? undefined : '#f3f4fd'
              }}
            >
              {getTaskCount(tab.key)}
            </span>
          </button>
        ))}
      </div>

      {/* Scrollable list */}
      <div 
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="max-h-[70vh] overflow-y-auto"
      >
        {tasks.length === 0 ? (
          <div className="p-8 text-center">
            <CheckSquare className={`w-12 h-12 mx-auto mb-4 ${isDarkTheme ? 'text-slate-400' : 'text-gray-400'}`} />
            <p className={`${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
              No tasks found. Add one below!
            </p>
          </div>
        ) : (
          <div className={`divide-y ${isDarkTheme ? 'divide-slate-600/50' : 'divide-gray-100'}`}>
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 transition-all duration-150 group ${
                  task.completed ? 'opacity-60' : ''
                } dark:hover:bg-gray-800/50`}
                style={{
                  '--task-animation-duration': '120ms'
                }}
                onMouseEnter={(e) => {
                  if (!isDarkTheme) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDarkTheme) {
                    e.currentTarget.style.backgroundColor = '';
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Complete toggle with custom checkbox styling */}
                  <button
                    data-task-id={task.id}
                    onClick={() => toggleComplete(task.id, task.completed)}
                    aria-label={task.completed ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
                    className={`task-checkbox ${
                      task.completed
                        ? 'bg-[#8a87d6] border-[#8a87d6] text-white scale-110'
                        : 'border-gray-300 dark:border-gray-600 hover:border-[#8a87d6] hover:scale-105 focus-ring'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3" />}
                  </button>

                  {/* Task content */}
                  <div className="flex-1 min-w-0">
                    {editingTask === task.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="card focus-ring"
                          autoFocus
                          aria-label="Edit task title"
                        />
                        <button
                          onClick={saveEdit}
                          className="p-1 text-[#e69a96] hover:text-[#e69a96] focus-ring"
                          title="Save (Ctrl+S)"
                          aria-label="Save changes"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 text-gray-500 hover:text-gray-600 focus-ring"
                          title="Cancel (Esc)"
                          aria-label="Cancel editing"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`text-sm transition-all duration-[var(--task-animation-duration)] ${
                              task.completed ? 'line-through text-gray-500' : ''
                            } ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}
                          >
                            {task.title}
                          </p>
                          {task.due_date && (
                            <p className={`text-xs mt-1 ${
                              task.due_date < today && !task.completed
                                ? 'text-[#e69a96]'
                                : isDarkTheme ? 'text-slate-400' : 'text-gray-500'
                            }`}>
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <button
                            onClick={() => startEdit(task)}
                            className="p-1 text-gray-500 hover:text-accent transition-colors focus-ring"
                            title="Edit task"
                            aria-label={`Edit "${task.title}"`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 text-gray-500 hover:text-[#e69a96] transition-colors focus-ring"
                            title="Delete task"
                            aria-label={`Delete "${task.title}"`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="w-1 h-4 text-gray-400 cursor-grab hover:text-gray-600" title="Drag to reorder">
                            ⋮⋮
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="p-4 text-center">
            <button
              onClick={() => loadTasks(false)}
              disabled={loading}
              className="card"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className={`border-t ${isDarkTheme ? 'border-slate-600/50' : 'border-gray-200'}`}></div>

      {/* Sticky footer with quick add */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-gray-400" />
          <input
            id="quick-add-input"
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="New task - press Enter"
            className={`flex-1 px-3 py-2 border rounded-lg focus-ring ${
              isDarkTheme 
                ? 'bg-[#424250] border-slate-600 text-white placeholder-slate-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                createTask();
              }
            }}
            aria-label="Add new task - press Enter to create"
          />
        </div>
      </div>
    </div>
  );
};

export default TaskListFull;

