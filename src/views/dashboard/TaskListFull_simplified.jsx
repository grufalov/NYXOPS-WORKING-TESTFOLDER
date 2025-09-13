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
      if (e.key === 'Enter' && e.target.id === 'quick-add-input') {
        createTask();
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
  }, [newTaskTitle, editingTask, editTitle]);

  if (loading && tasks.length === 0) {
    return (
      <div className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-xl shadow-lg overflow-hidden`}>
        <div className={`sticky top-0 z-10 ${isDarkTheme ? 'bg-[#424250]/80 backdrop-blur supports-[backdrop-filter]:bg-[#424250]/60' : 'bg-[#f3f4fd]/80 backdrop-blur supports-[backdrop-filter]:bg-[#f3f4fd]/60'} border-b ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'} p-4`}>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#8a87d6]" />
            <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              Task List
            </h3>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className={`h-12 ${isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#ffffff]'} rounded`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-xl shadow-lg p-6`}>
        <div className="flex items-center gap-2 mb-4">
          <CheckSquare className="w-5 h-5 text-[#8a87d6]" />
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
    <div className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-xl shadow-lg overflow-hidden`}>
      {/* Header - keep tabs only */}
      <div className={`sticky top-0 z-10 ${isDarkTheme ? 'bg-[#424250]/80 backdrop-blur supports-[backdrop-filter]:bg-[#424250]/60' : 'bg-[#f3f4fd]/80 backdrop-blur supports-[backdrop-filter]:bg-[#f3f4fd]/60'} border-b ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="p-4 pb-0">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-5 h-5 text-[#8a87d6]" />
            <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              Task List
            </h3>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-[#8a87d6] text-[#8a87d6] dark:text-[#8a87d6]'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              <span className={`ml-1 text-xs ${
                activeTab === tab.key ? 'text-[#8a87d6]' : 'text-gray-400'
              }`}>
                ({getTaskCount(tab.key)})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable list */}
      <div className="max-h-[70vh] overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="p-8 text-center">
            <CheckSquare className={`w-12 h-12 mx-auto mb-4 ${isDarkTheme ? 'text-slate-400' : 'text-gray-400'}`} />
            <p className={`${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
              No tasks found. Add one below!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 hover:bg-[#e3e3f5] dark:hover:bg-[#8a87d6]/50 transition-colors ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Complete toggle */}
                  <button
                    onClick={() => toggleComplete(task.id, task.completed)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-[#f3f4fd] border-[#f3f4fd] text-white'
                        : 'border-gray-300 dark:border-gray-600 hover:border-[#f3f4fd]'
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
                          className={`flex-1 px-2 py-1 text-sm border rounded ${
                            isDarkTheme
                              ? 'bg-[#8a87d6] border-slate-600 text-white'
                              : 'bg-[#f3f4fd] border-gray-300'
                          }`}
                          autoFocus
                        />
                        <button
                          onClick={saveEdit}
                          className="p-1 text-[#e69a96] hover:text-[#e69a96]"
                          title="Save (Ctrl+S)"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 text-gray-500 hover:text-gray-600"
                          title="Cancel (Esc)"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`text-sm ${task.completed ? 'line-through' : ''} ${
                              isDarkTheme ? 'text-white' : 'text-gray-900'
                            }`}
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
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(task)}
                            className="p-1 text-gray-500 hover:text-[#8a87d6] transition-colors"
                            title="Edit task"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 text-gray-500 hover:text-[#e69a96] transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
              className={`px-4 py-2 text-sm rounded ${
                isDarkTheme
                  ? 'bg-[#8a87d6] text-white hover:bg-[#8a87d6]'
                  : 'bg-[#ffffff] text-gray-700 hover:bg-[#f3f4fd]'
              } disabled:opacity-50`}
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>

      {/* Sticky footer with quick add */}
      <div className={`sticky bottom-0 z-10 ${isDarkTheme ? 'bg-[#424250]/80 backdrop-blur supports-[backdrop-filter]:bg-[#424250]/60' : 'bg-[#f3f4fd]/80 backdrop-blur supports-[backdrop-filter]:bg-[#f3f4fd]/60'} border-t ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'} p-3`}>
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-gray-400" />
          <input
            id="quick-add-input"
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="New task - press Enter (Alt+N to focus)"
            className={`flex-1 px-3 py-2 text-sm border rounded ${
              isDarkTheme
                ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400'
                : 'bg-[#f3f4fd] border-gray-300 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                createTask();
              }
            }}
          />
        </div>
        <p className={`text-xs mt-1 ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
          Press Alt+N to focus • Enter to create • Esc to blur
        </p>
      </div>
    </div>
  );
};

export default TaskListFull;

