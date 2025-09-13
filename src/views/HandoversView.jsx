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
  ChevronUp,
  Pencil,
  Calendar
} from 'lucide-react';
import BackgroundDoodles from '../components/decors/BackgroundDoodles.jsx';
import EditTaskModal from '../modals/EditTaskModal.jsx';

// Date formatting helper for DD Mon YYYY format
const fmt = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

// Get display name from user or fallback to greeting
const getDisplayName = (user) => {
  if (user?.user_metadata?.full_name) {
    return user.user_metadata.full_name.split(' ')[0];
  }
  if (user?.email) {
    return user.email.split('@')[0];
  }
  return 'User';
};

// Priority Chip Component with visible background colors
const PriorityChip = ({ priority, isDarkTheme }) => {
  const getChipStyles = () => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return isDarkTheme 
          ? 'bg-red-400/30 text-red-200' 
          : 'bg-red-500/20 text-red-700';
      case 'medium':
        return isDarkTheme 
          ? 'bg-amber-300/30 text-amber-100' 
          : 'bg-amber-500/20 text-amber-700';
      case 'low':
        return isDarkTheme 
          ? 'bg-emerald-300/30 text-emerald-100' 
          : 'bg-emerald-500/20 text-emerald-700';
      default:
        return isDarkTheme 
          ? 'bg-slate-600/30 text-slate-300' 
          : 'bg-gray-200/70 text-gray-700';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getChipStyles()}`}>
      {priority || 'normal'}
    </span>
  );
};

// Task Notes Component with edit/delete functionality and show last 2 by default
const TaskNotes = ({ notes, onUpdateNotes, isDarkTheme, currentUser, task, index, handover, updateHandover }) => {
  const [expandedNotes, setExpandedNotes] = useState(new Set());
  const [editingNote, setEditingNote] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editDate, setEditDate] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteDate, setNewNoteDate] = useState('');
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);

  if (!notes || notes.length === 0) {
    return (
      <div className="mt-3">
        <div className="flex justify-end items-center gap-2">
          <button
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              isDarkTheme 
                ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
            title="Edit task"
          >
            Edit task
          </button>
          <button
            onClick={() => {
              setShowAddNote(true);
              setNewNoteDate(new Date().toISOString().split('T')[0]);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#8a87d6] text-white hover:bg-[#7b78cc] transition-colors"
          >
            Add note
          </button>
        </div>
        {showAddNote && (
          <div className="mt-2 p-3 border rounded-lg" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Add a note..."
              className={`w-full h-20 p-2 text-sm rounded border resize-none ${
                isDarkTheme ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-gray-300'
              }`}
            />
            <div className="flex items-center gap-2 mt-2">
              <input
                type="date"
                value={newNoteDate}
                onChange={(e) => setNewNoteDate(e.target.value)}
                className={`text-xs px-2 py-1 rounded border ${
                  isDarkTheme ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-gray-300'
                }`}
              />
              <button
                onClick={() => {
                  if (newNoteContent.trim()) {
                    const newNote = {
                      author: getDisplayName(currentUser),
                      content: newNoteContent.trim(),
                      created_at: new Date(newNoteDate + 'T00:00:00').toISOString()
                    };
                    onUpdateNotes([newNote]);
                    setNewNoteContent('');
                    setNewNoteDate('');
                    setShowAddNote(false);
                  }
                }}
                className="px-3 py-1 text-xs bg-[#8a87d6] text-white rounded hover:bg-[#7a77c6]"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setNewNoteContent('');
                  setNewNoteDate('');
                  setShowAddNote(false);
                }}
                className={`px-3 py-1 text-xs rounded ${
                  isDarkTheme ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Sort notes by created_at descending (newest first)
  const notesSorted = [...notes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const visibleNotes = showAllNotes ? notesSorted : notesSorted.slice(0, 2);
  const hasMoreNotes = notesSorted.length > 2;

  const toggleNoteExpansion = (noteIndex) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteIndex)) {
      newExpanded.delete(noteIndex);
    } else {
      newExpanded.add(noteIndex);
    }
    setExpandedNotes(newExpanded);
  };

  const startEditing = (noteIndex) => {
    const note = visibleNotes[noteIndex];
    setEditingNote(noteIndex);
    setEditContent(note.content || note.text || '');
    setEditDate(new Date(note.created_at).toISOString().split('T')[0]);
  };

  const saveEdit = () => {
    if (editContent.trim()) {
      const editedNote = visibleNotes[editingNote];
      const updatedNotes = notes.map(note => 
        note.created_at === editedNote.created_at && note.author === editedNote.author
          ? { ...note, content: editContent.trim(), created_at: new Date(editDate + 'T00:00:00').toISOString() }
          : note
      );
      onUpdateNotes(updatedNotes);
      setEditingNote(null);
      setEditContent('');
      setEditDate('');
    }
  };

  const deleteNote = (noteIndex) => {
    if (confirm('Delete this note?')) {
      const noteToDelete = visibleNotes[noteIndex];
      const updatedNotes = notes.filter(note => 
        !(note.created_at === noteToDelete.created_at && note.author === noteToDelete.author)
      );
      onUpdateNotes(updatedNotes);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      {visibleNotes.map((note, index) => {
        const isExpanded = expandedNotes.has(index);
        const content = note.content || note.text || '';
        const author = note.author === 'Current User' ? getDisplayName(currentUser) : (note.author || 'Unknown');
        const createdAt = note.created_at || note.timestamp || new Date().toISOString();
        const shouldTruncate = content.length > 150;

        if (editingNote === index) {
          return (
            <div key={index} className="border-l-2 border-[#8a87d6] pl-3 py-1.5">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={`w-full h-20 p-2 text-sm rounded border resize-none ${
                  isDarkTheme ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-gray-300'
                }`}
              />
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className={`text-xs px-2 py-1 rounded border ${
                    isDarkTheme ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-gray-300'
                  }`}
                />
                <button
                  onClick={saveEdit}
                  className="px-3 py-1 text-xs bg-[#8a87d6] text-white rounded hover:bg-[#7a77c6]"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingNote(null)}
                  className={`px-3 py-1 text-xs rounded ${
                    isDarkTheme ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          );
        }

        return (
          <div 
            key={index}
            className="border-l-2 border-[#8a87d6] pl-3 py-1.5 group"
          >
            {/* Note Header */}
            <div className={`flex items-center justify-between text-sm ${
              isDarkTheme ? 'text-slate-400' : 'text-gray-600'
            }`}>
              <div>
                <span className={`font-medium ${
                  isDarkTheme ? 'text-slate-200' : 'text-gray-800'
                }`}>
                  {author}
                </span>
                <span className="mx-2">•</span>
                <span>{fmt(createdAt)}</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                <button
                  onClick={() => startEditing(index)}
                  className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                    isDarkTheme ? 'text-slate-400' : 'text-gray-500'
                  }`}
                  tabIndex={0}
                  aria-label="Edit note"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteNote(index)}
                  className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                    isDarkTheme ? 'text-slate-400' : 'text-gray-500'
                  }`}
                  tabIndex={0}
                  aria-label="Delete note"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Note Content */}
            <div className={`text-sm mt-1 ${
              isDarkTheme ? 'text-slate-300' : 'text-gray-700'
            }`}>
              <div className={shouldTruncate && !isExpanded ? 'line-clamp-3' : ''}>
                {content}
              </div>
              {shouldTruncate && (
                <button
                  onClick={() => toggleNoteExpansion(index)}
                  className={`mt-1 text-xs font-medium transition-colors ${
                    isDarkTheme 
                      ? 'text-[#8a87d6] hover:text-[#9f9ce8]' 
                      : 'text-[#8a87d6] hover:text-[#7c79d1]'
                  }`}
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Show all/fewer toggle */}
      {hasMoreNotes && (
        <div className="mt-2">
          <button
            onClick={() => setShowAllNotes(!showAllNotes)}
            className={`text-xs font-medium transition-colors ${
              isDarkTheme 
                ? 'text-[#8a87d6] hover:text-[#9f9ce8]' 
                : 'text-[#8a87d6] hover:text-[#7c79d1]'
            }`}
          >
            {showAllNotes 
              ? 'Show fewer (2)' 
              : `Show all notes (${notesSorted.length})`
            }
          </button>
        </div>
      )}
      
      {/* Task Footer Buttons */}
      <div className="flex justify-end items-center gap-2">
        {/* Edit Task Button */}
        <button
          onClick={() => setShowEditTaskModal(true)}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            isDarkTheme 
              ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
          title="Edit task"
        >
          Edit task
        </button>
        
        <button
          onClick={() => {
            setShowAddNote(true);
            setNewNoteDate(new Date().toISOString().split('T')[0]);
          }}
          className="text-xs px-3 py-1.5 rounded-lg bg-[#8a87d6] text-white hover:bg-[#7b78cc] transition-colors"
          tabIndex={0}
        >
          Add note
        </button>
      </div>

      {showAddNote && (
        <div className="mt-2 p-3 border rounded-lg" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Add a note..."
            className={`w-full h-20 p-2 text-sm rounded border resize-none ${
              isDarkTheme ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-gray-300'
            }`}
          />
          <div className="flex items-center gap-2 mt-2">
            <input
              type="date"
              value={newNoteDate}
              onChange={(e) => setNewNoteDate(e.target.value)}
              className={`text-xs px-2 py-1 rounded border ${
                isDarkTheme ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-gray-300'
              }`}
            />
            <button
              onClick={() => {
                if (newNoteContent.trim()) {
                  const newNote = {
                    author: getDisplayName(currentUser),
                    content: newNoteContent.trim(),
                    created_at: new Date(newNoteDate + 'T00:00:00').toISOString()
                  };
                  onUpdateNotes([...notes, newNote]);
                  setNewNoteContent('');
                  setNewNoteDate('');
                  setShowAddNote(false);
                }
              }}
              className="px-3 py-1 text-xs bg-[#8a87d6] text-white rounded hover:bg-[#7a77c6]"
              tabIndex={0}
            >
              Save
            </button>
            <button
              onClick={() => {
                setNewNoteContent('');
                setNewNoteDate('');
                setShowAddNote(false);
              }}
              className={`px-3 py-1 text-xs rounded ${
                isDarkTheme ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
              tabIndex={0}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditTaskModal && (
        <EditTaskModal
          task={task}
          onClose={() => setShowEditTaskModal(false)}
          onUpdate={(updatedTask) => {
            const updatedTasks = [...(handover.tasks || [])];
            updatedTasks[index] = updatedTask;
            updateHandover(handover.id, { tasks: updatedTasks });
            setShowEditTaskModal(false);
          }}
          isDarkTheme={isDarkTheme}
        />
      )}
    </div>
  );
};

// Task Item Component
const TaskItem = ({ task, index, handover, updateHandover, isDarkTheme, user }) => {
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  
  const isCompleted = typeof task === 'object' && task.completed;
  const taskTitle = typeof task === 'string' ? task : task.title || task.text || 'Untitled task';
  
  // Handle notes - extract array of note objects
  let taskNotes = [];
  if (typeof task === 'object' && task.notes) {
    if (typeof task.notes === 'string') {
      // Single string note - convert to note object
      taskNotes = [{
        author: getDisplayName(user),
        content: task.notes,
        created_at: new Date().toISOString()
      }];
    } else if (Array.isArray(task.notes)) {
      // Array of notes
      taskNotes = task.notes.map(note => ({
        ...note,
        author: note.author === 'Current User' ? getDisplayName(user) : note.author
      }));
    } else if (typeof task.notes === 'object') {
      // Single note object
      taskNotes = [{
        ...task.notes,
        author: task.notes.author === 'Current User' ? getDisplayName(user) : task.notes.author
      }];
    }
  }
  
  const taskPriority = typeof task === 'object' ? task.priority : 'normal';
  const taskDue = typeof task === 'object' ? task.dueDate : null;

  const updateTaskNotes = (newNotes) => {
    const updatedTasks = [...(handover.tasks || [])];
    const currentTask = updatedTasks[index];

    if (typeof currentTask === 'string') {
      updatedTasks[index] = {
        title: currentTask,
        completed: false,
        notes: newNotes,
        priority: taskPriority
      };
    } else {
      updatedTasks[index] = {
        ...currentTask,
        notes: newNotes
      };
    }

    updateHandover(handover.id, { tasks: updatedTasks });
  };

  const toggleTaskCompleted = () => {
    const updatedTasks = [...(handover.tasks || [])];
    const currentTask = updatedTasks[index];

    if (typeof currentTask === 'string') {
      updatedTasks[index] = {
        title: currentTask,
        completed: true,
        notes: taskNotes,
        priority: taskPriority
      };
    } else {
      updatedTasks[index] = {
        ...currentTask,
        completed: !currentTask.completed
      };
    }

    updateHandover(handover.id, { tasks: updatedTasks });
  };

  return (
    <div className={`p-4 rounded-xl border transition-colors ${
      isDarkTheme 
        ? 'border-slate-600 bg-[var(--card-bg)]' 
        : 'border-gray-200 bg-[var(--card-bg)]'
    } ${isCompleted ? 'opacity-60' : ''}`}>
      {/* Task Header */}
      <div className="flex items-start gap-3 mb-3">
        <button
          onClick={toggleTaskCompleted}
          className={`flex-shrink-0 mt-0.5 transition-colors ${
            isCompleted 
              ? 'text-[#8a87d6]' 
              : isDarkTheme ? 'text-slate-400 hover:text-[#8a87d6]' : 'text-gray-400 hover:text-[#8a87d6]'
          }`}
        >
          {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </button>
        
        <div className="flex-1 min-w-0">
          {/* Task Title and Priority - Grid Layout */}
          <div className="grid grid-cols-[1fr_auto] items-start gap-2 mb-1">
            <h4 className={`font-semibold whitespace-normal break-words ${
              isCompleted 
                ? 'line-through text-gray-500' 
                : isDarkTheme ? 'text-white' : 'text-gray-900'
            }`}>
              {taskTitle}
            </h4>
            <div className="col-start-2 self-start">
              <PriorityChip priority={taskPriority} isDarkTheme={isDarkTheme} />
            </div>
          </div>
          
          {/* Meta Row */}
          {taskDue && (
            <div className={`text-xs ${
              isDarkTheme ? 'text-slate-400' : 'text-gray-600'
            }`}>
              <span>Due {fmt(taskDue)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Task Notes */}
      <TaskNotes 
        notes={taskNotes} 
        onUpdateNotes={updateTaskNotes}
        isDarkTheme={isDarkTheme} 
        currentUser={user}
        task={task}
        index={index}
        handover={handover}
        updateHandover={updateHandover}
      />
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
        return 'bg-[#8a87d6] text-white';
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

          {/* Meta Line - Cleaned */}
          <div className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
            Created: {handover.created_at ? fmt(handover.created_at) : 'N/A'} • 
            Tasks: {tasks.length}
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit && onEdit(handover)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkTheme 
                ? 'text-slate-400 hover:text-[#8a87d6] hover:bg-slate-700' 
                : 'text-gray-500 hover:text-[#8a87d6] hover:bg-gray-100'
            }`}
            title="Edit handover"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onCollapse && onCollapse()}
            className={`p-2 rounded-lg transition-colors ${
              isDarkTheme 
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title="Collapse"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Linear Progress Bar - Purple styling */}
      <div className={`w-full rounded-full h-1.5 mb-6 ${
        isDarkTheme ? 'bg-slate-700/30' : 'bg-gray-200/30'
      }`}>
        <div
          className="bg-[#8a87d6] h-1.5 rounded-full transition-all duration-300"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
      <div className={`flex items-center justify-end gap-3 pt-4 border-t ${
        isDarkTheme ? 'border-slate-600' : 'border-gray-200'
      }`}>
        <button 
          onClick={() => markHandoverCompleted(handover.id, handover.status !== 'completed')}
          className={`p-2 rounded-lg transition-colors ${
            isDarkTheme 
              ? 'text-green-400 hover:bg-green-900/20' 
              : 'text-green-600 hover:bg-green-50'
          }`}
          title={handover.status === 'completed' ? 'Mark Active' : 'Mark Completed'}
        >
          <CheckCircle className="w-4 h-4" />
        </button>
        
        <button 
          onClick={() => deleteHandover(handover.id)}
          className={`p-2 rounded-lg transition-colors ${
            isDarkTheme 
              ? 'text-red-400 hover:bg-red-900/20' 
              : 'text-red-600 hover:bg-red-50'
          }`}
          title="Delete handover"
        >
          <Trash2 className="w-4 h-4" />
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
          {handover.created_at ? fmt(handover.created_at) : 'N/A'}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex-shrink-0 w-20">
        <div className={`w-full rounded-full h-1.5 ${
          isDarkTheme ? 'bg-slate-700/30' : 'bg-gray-200/30'
        }`}>
          <div
            className="bg-[#8a87d6] h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className={`text-xs mt-1 text-center ${
          isDarkTheme ? 'text-slate-400' : 'text-gray-500'
        }`}>
          {Math.round(progressPercentage)}%
        </div>
      </div>

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
          className="mb-6"
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

              {/* Tabs - Left aligned after search */}
              <div className="flex items-center gap-3">
                {[
                  { id: 'sent', label: 'Sent' },
                  { id: 'received', label: 'Received' }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`px-4 py-2 text-sm font-medium transition-all rounded-full ${
                      activeTab === id
                        ? 'bg-[#8a87d6] text-white'
                        : isDarkTheme 
                          ? 'text-slate-400 hover:bg-slate-700 border border-slate-600' 
                          : 'text-gray-600 hover:bg-gray-100 border border-gray-300'
                    }`}
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
                onEdit={(handover) => {
                  setEditingHandover(handover);
                  setShowEditModal(true);
                }}
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
          onUpdate={updateHandover}
          cases={cases}
          isDarkTheme={isDarkTheme}
        />
      )}
    </div>
  );
};

export default HandoversView;
