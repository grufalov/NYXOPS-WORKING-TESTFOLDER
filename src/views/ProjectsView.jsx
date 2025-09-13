// Helper to render Stakeholders: label + names, with truncation and tooltip
function StakeholdersLine({ stakeholders, maxWidth = 340, isCollapsed = false }) {
  if (!stakeholders) return null;
  const names = stakeholders.split(',').map(s => s.trim()).filter(Boolean);
  const namesStr = names.join(', ');
  return (
    <span
      className={`inline-block align-middle truncate ${isCollapsed ? 'max-w-[180px]' : `max-w-[${maxWidth}px]`} text-xs`}
      title={namesStr}
      style={{ verticalAlign: 'middle', maxWidth: isCollapsed ? 180 : maxWidth }}
    >
      <span className="font-semibold text-slate-500 mr-1">Stakeholders:</span>
      <span className="font-normal text-slate-500">{namesStr}</span>
    </span>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Star, 
  Edit, 
  CheckCircle, 
  CheckCircle2,
  Trash2, 
  FileText, 
  Link as LinkIcon,
  Calendar,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  Pencil,
  MessageSquare
} from 'lucide-react';
import BackgroundDoodles from '../components/decors/BackgroundDoodles.jsx';
import NextStepsModal from '../modals/NextStepsModal.jsx';

// Date formatting helper for DD Mon YYYY format
const fmt = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

// Progress calculation helper - uses checklists math, falls back to Next Steps, then 0%
const percentComplete = (project) => {
  // First try checklists
  if (project.checklists && project.checklists.length > 0) {
    const total = project.checklists.reduce((s, g) => s + g.items.length, 0);
    const done = project.checklists.reduce((s, g) => s + g.items.filter(i => i.done).length, 0);
    return Math.round(100 * done / Math.max(total, 1));
  }
  
  // Fall back to Next Steps
  if (project.nextSteps && project.nextSteps.length > 0) {
    const total = project.nextSteps.length;
    const done = project.nextSteps.filter(step => step.done).length;
    return Math.round(100 * done / total);
  }
  
  // Both empty, return 0%
  return 0;
};

// Helper to show progress help text
const getProgressHelpText = (project) => {
  const hasChecklists = project.checklists && project.checklists.length > 0;
  const hasNextSteps = project.nextSteps && project.nextSteps.length > 0;
  
  if (!hasChecklists && !hasNextSteps) {
    return "Add steps to start tracking progress";
  }
  return null;
};

// Period validation helper
const validatePeriod = (periodFrom, periodTo) => {
  if (!periodFrom || !periodTo) return true; // Allow incomplete periods
  return new Date(periodFrom) <= new Date(periodTo);
};

// Status Pill Component - filled colors matching global tokens
const StatusPill = ({ status, isDarkTheme }) => {
  // Use light bg + dark text for all statuses
  const styles = {
    active: {
      bg: 'bg-violet-100',
      text: 'text-slate-700'
    },
    on_hold: {
      bg: 'bg-gray-200',
      text: 'text-slate-700'
    },
    completed: {
      bg: 'bg-emerald-100',
      text: 'text-slate-700'
    }
  };
  const style = styles[status] || styles.active;
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${style.bg} ${style.text} border border-slate-200`}>
      {status.replace('_', ' ')}
    </span>
  );
};

// Note Type Chip Component
const NoteTypeChip = ({ type, isDarkTheme }) => {
  const styles = {
    update: {
      bg: isDarkTheme ? 'bg-blue-400/20' : 'bg-blue-500/12',
      text: isDarkTheme ? 'text-blue-100' : 'text-blue-700'
    },
    decision: {
      bg: isDarkTheme ? 'bg-violet-400/20' : 'bg-violet-500/12',
      text: isDarkTheme ? 'text-violet-100' : 'text-violet-700'
    },
    risk: {
      bg: isDarkTheme ? 'bg-rose-400/20' : 'bg-rose-500/12',
      text: isDarkTheme ? 'text-rose-100' : 'text-rose-700'
    }
  };

  const style = styles[type] || styles.update;
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
      {type}
    </span>
  );
};

// Progress Bar Component - uses same purple as Handovers
const ProgressBar = ({ percentage, isDarkTheme, thin = false }) => {
  const height = thin ? 'h-1' : 'h-1.5';
  
  return (
    <div className={`w-full ${height} ${isDarkTheme ? 'bg-slate-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
      <div 
        className="h-full bg-[#8a87d6] rounded-full transition-all duration-300"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
};

// Collapsed Project Card Component
const CollapsedProjectCard = ({ 
  project, 
  isDarkTheme, 
  onExpand, 
  onPin, 
  onEdit, 
  onDelete 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const progress = percentComplete(project);
  
  const periodText = project.period_from 
    ? project.period_to
      ? `${fmt(project.period_from)} – ${fmt(project.period_to)}`
      : `${fmt(project.period_from)} – Present`
    : 'Period: Not set';

  return (
    <div 
      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
        isDarkTheme 
          ? 'bg-[#424250] border-slate-700 hover:bg-[#8a87d6]/10' 
          : 'bg-[#f3f4fd] hover:bg-white hover:shadow-xl'
      }`}
      onClick={onExpand}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm ${isDarkTheme ? 'text-white' : 'text-gray-900'} truncate`}>
            {project.title}
          </h3>
          <div className="mt-1">
            <ProgressBar percentage={progress} isDarkTheme={isDarkTheme} thin />
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin();
            }}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
            title={project.pinned ? "Unpin" : "Pin to Focus"}
            aria-pressed={project.pinned}
          >
            <Star 
              className="h-4 w-4"
              fill={project.pinned ? "#fbbf24" : "none"}
              stroke={project.pinned ? "#fbbf24" : "#9ca3af"}
            />
          </button>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className={`p-1 rounded hover:bg-black/5 ${isDarkTheme ? 'text-slate-400' : 'text-gray-400'}`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className={`absolute right-0 top-8 z-10 w-32 py-1 rounded-lg border shadow-lg ${
                isDarkTheme ? 'bg-[#424250] border-slate-700' : 'bg-white'
              }`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                    setShowMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-black/5 ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-black/5 ${
                    isDarkTheme ? 'text-red-400' : 'text-red-600'
                  }`}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Status and Progress */}
      <div className="flex items-center gap-2 mb-2">
        <StatusPill status={project.status} isDarkTheme={isDarkTheme} />
        <span className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
          {progress}%
        </span>
      </div>
      
      {/* Row 2: Stakeholders, period, updated */}
      <div className="flex items-center justify-between gap-2 text-xs mt-1">
        <div className="truncate text-slate-600 flex items-center gap-1">
          <StakeholdersLine stakeholders={project.stakeholders} maxWidth={180} isCollapsed={true} />
          {project.stakeholders && ' • '}
          <span>{periodText}</span>
        </div>
        <div className="text-slate-500 min-w-[90px] text-right">Updated {fmt(project.updated_at || project.lastUpdatedAt)}</div>
      </div>
    </div>
  );
};

// Expanded Project Card Component
const ExpandedProjectCard = ({ 
  project, 
  isDarkTheme, 
  onPin, 
  onEdit, 
  onComplete, 
  onDelete,
  onUpdateProject,
  onOpenNextStepsModal,
  user
}) => {
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [expandedNotes, setExpandedNotes] = useState(new Set());
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [newNextSteps, setNewNextSteps] = useState({});
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editingGoalText, setEditingGoalText] = useState('');
  
  const progress = percentComplete(project);
  const periodText = project.period_from 
    ? project.period_to
      ? `${fmt(project.period_from)} – ${fmt(project.period_to)}`
      : `${fmt(project.period_from)} – Present`
    : 'Period: Not set';

  // Initialize notes if they don't exist
  const notes = project.notes || [];
  
  // Show visible items based on expand state
  const visibleNotes = showAllNotes ? notes : notes.slice(0, 2);

  // Helper functions for notes with optimistic updates
  const addNote = () => {
    if (!newNoteText.trim()) return;
    const newNote = {
      id: `temp_${Date.now()}`,
      text: newNoteText.trim(),
      author: getDisplayName(user),
      created_at: new Date().toISOString()
    };
    const updatedNotes = [newNote, ...notes];
    const updatedProject = { 
      ...project, 
      notes: updatedNotes,
      updated_at: new Date().toISOString()
    };
    onUpdateProject(updatedProject);
    setNewNoteText('');
    setShowAddNote(false);
  };

  const deleteNote = (noteId) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    const updatedProject = { 
      ...project, 
      notes: updatedNotes,
      updated_at: new Date().toISOString() // Bump last updated
    };
    onUpdateProject(updatedProject);
  };

  const startEditingNote = (note) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.text || note.content || '');
  };

  const saveNote = (noteId, newText) => {
    if (!newText.trim()) return;
    
    const updatedNotes = notes.map(note => 
      note.id === noteId 
        ? { ...note, text: newText.trim(), content: newText.trim(), updated_at: new Date().toISOString() }
        : note
    );
    
    const updatedProject = { 
      ...project, 
      notes: updatedNotes,
      updated_at: new Date().toISOString()
    };
    
    setEditingNoteId(null);
    setEditingNoteText('');
    onUpdateProject(updatedProject);
  };

  const toggleNoteExpansion = (noteId) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };

  // Helper functions for goals (checklists) with optimistic updates
  const goals = project.checklists?.length > 0 ? project.checklists[0]?.items || [] : [];
  
  const addGoal = (projectId) => {
    // Create optimistic goal with temp ID and start editing immediately
    const tempId = `temp_${Date.now()}`;
    const newGoal = {
      id: tempId,
      title: '',
      done: false,
      created_at: new Date().toISOString()
    };
    
    const updatedGoals = [...goals, newGoal];
    const updatedChecklists = project.checklists?.length > 0 
      ? [{ ...project.checklists[0], items: updatedGoals }, ...(project.checklists.slice(1) || [])]
      : [{ id: `checklist_${Date.now()}`, title: 'Project Goals', items: updatedGoals }];
    
    const updatedProject = { 
      ...project, 
      checklists: updatedChecklists,
      updated_at: new Date().toISOString()
    };
    
    // Start editing the new goal
    setEditingGoalId(tempId);
    setEditingGoalText('');
    
    // Optimistic update - appears immediately
    onUpdateProject(updatedProject);
  };

  const toggleGoal = (goalIndex) => {
    const updatedGoals = [...goals];
    updatedGoals[goalIndex] = {
      ...updatedGoals[goalIndex],
      done: !updatedGoals[goalIndex].done
    };
    
    const updatedChecklists = project.checklists?.length > 0 
      ? [{ ...project.checklists[0], items: updatedGoals }, ...(project.checklists.slice(1) || [])]
      : [{ id: `checklist_${Date.now()}`, title: 'Project Goals', items: updatedGoals }];
    
    const updatedProject = { 
      ...project, 
      checklists: updatedChecklists,
      updated_at: new Date().toISOString()
    };
    
    // Optimistic update - appears immediately
    onUpdateProject(updatedProject);
  };

  const saveGoal = (goalId, newTitle) => {
    if (!newTitle.trim()) {
      // Remove empty goal
      deleteGoal(goalId);
      return;
    }
    
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, title: newTitle.trim() } : goal
    );
    
    const updatedChecklists = project.checklists?.length > 0 
      ? [{ ...project.checklists[0], items: updatedGoals }, ...(project.checklists.slice(1) || [])]
      : [{ id: `checklist_${Date.now()}`, title: 'Project Goals', items: updatedGoals }];
    
    const updatedProject = { 
      ...project, 
      checklists: updatedChecklists,
      updated_at: new Date().toISOString()
    };
    
    setEditingGoalId(null);
    setEditingGoalText('');
    onUpdateProject(updatedProject);
  };

  const deleteGoal = (goalId) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    const updatedChecklists = project.checklists?.length > 0 
      ? [{ ...project.checklists[0], items: updatedGoals }, ...(project.checklists.slice(1) || [])]
      : [];
    
    const updatedProject = { 
      ...project, 
      checklists: updatedChecklists,
      updated_at: new Date().toISOString()
    };
    
    setEditingGoalId(null);
    setEditingGoalText('');
    onUpdateProject(updatedProject);
  };

  const startEditingGoal = (goal) => {
    setEditingGoalId(goal.id);
    setEditingGoalText(goal.title);
  };

  // --- Card elevation tokens (match Cases) ---
  // bg-white, border, ring, shadow, rounded-2xl, hover:shadow-xl
  return (
  <div className={`p-6 rounded-2xl border shadow-lg ring-1 ring-[#e0e0f0] transition-shadow duration-200 ${isDarkTheme ? 'bg-[#23232d]' : 'bg-white'} hover:shadow-xl`}> 
      {/* Header snapshot */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-6">
        {/* Left: Title, Stakeholders, Period */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold truncate max-w-[320px] text-slate-800">{project.title}</h2>
            <button
              onClick={onPin}
              className="ml-1 p-1 rounded-full hover:bg-yellow-100"
              title={project.pinned ? 'Unpin' : 'Pin to Focus'}
              aria-pressed={project.pinned}
            >
              <Star
                className="h-5 w-5"
                fill={project.pinned ? '#fbbf24' : 'none'}
                stroke={project.pinned ? '#fbbf24' : '#eab308'}
              />
            </button>
          </div>
          {/* Stakeholders: label + names, truncation, tooltip */}
          <div className="text-sm font-normal text-slate-500">
            <StakeholdersLine stakeholders={project.stakeholders} maxWidth={340} isCollapsed={false} />
          </div>
          {/* Period on next line */}
          <div className="text-xs font-normal text-slate-400 mt-0.5">
            {periodText}
          </div>
        </div>
        {/* Right: Header metrics simplified */}
        <div className="flex flex-col items-end min-w-[120px] gap-0.5">
          {/* Row 1: Updated date only */}
          <span className="text-xs font-normal text-slate-400 mt-0.5">Updated: {fmt(project.updated_at || project.lastUpdatedAt)}</span>
        </div>
      </div>
      {/* ...existing code... */}
      
      {/* 2x2 Grid Layout for sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Description Section - Top Left */}
        <div className={`sectionCard rounded-2xl border p-6 bg-[var(--card-bg)] ${isDarkTheme ? 'border-slate-700' : ''} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}>
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" />
              <h3 className="text-base font-semibold text-slate-800">Description</h3>
            </span>
            <button
              onClick={onEdit}
              className="text-xs text-[#8a87d6] hover:underline font-bold"
            >
              <b>Edit</b>
            </button>
          </div>
          
          <div className={`rounded-xl p-4 ${isDarkTheme ? 'bg-slate-800/20' : 'bg-gray-50/60'}`}>
            <p className={`text-sm leading-relaxed ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
              {project.description || project.background || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Next Steps Section - Top Right */}
        <div className={`sectionCard rounded-2xl border p-6 ${isDarkTheme ? 'bg-amber-950/40 border-amber-800/50' : 'bg-amber-50/60 border-amber-200/60'} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}>
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h3 className="text-base font-semibold text-slate-800">Next Steps</h3>
            </span>
            <button
              onClick={() => onOpenNextStepsModal(project)}
              className="text-xs text-[#8a87d6] hover:underline font-bold"
            >
              <b>Edit</b>
            </button>
          </div>
          
          <div className={`rounded-xl p-4 ${isDarkTheme ? 'bg-amber-800/30' : 'bg-amber-200/30'}`}>
            {/* Next Steps Content */}
            {(() => {
              // Handle both old array format and new string format
              const nextStepsContent = project.next_steps;
              // If it's an array (old format), convert to string
              if (Array.isArray(nextStepsContent)) {
                const stepsText = nextStepsContent
                  .map(step => `${step.done ? '✓' : '○'} ${step.title}`)
                  .join('\n');
                return stepsText ? (
                  <div className={`text-sm leading-relaxed ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                    {stepsText}
                  </div>
                ) : (
                  <p className={`text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} italic`}>
                    Click "Edit" to add your plan.
                  </p>
                );
              }
              // If it's a string (new format)
              if (typeof nextStepsContent === 'string' && nextStepsContent.trim() !== '') {
                return (
                  <div className={`text-sm leading-relaxed ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                    {nextStepsContent}
                  </div>
                );
              }
              // Empty state
              return (
                <p className={`text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} italic`}>
                  Click "Edit" to add your plan.
                </p>
              );
            })()}
          </div>
        </div>

        {/* Notes Section - Bottom Left */}
        <div className={`sectionCard rounded-2xl border p-6 bg-[var(--card-bg)] ${isDarkTheme ? 'border-slate-700' : ''} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}>
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-slate-500" />
              <h3 className="text-base font-semibold text-slate-800">Notes</h3>
            </span>
            <button
              onClick={() => setShowAddNote(!showAddNote)}
              className="text-xs text-[#8a87d6] hover:underline font-bold"
            >
              <b>Add Note</b>
            </button>
          </div>
          
          {/* Subtle background tint for Notes section */}
          <div className={`rounded-xl p-4 ${isDarkTheme ? 'bg-slate-800/20' : 'bg-white/60'} max-h-80 overflow-y-auto`}>
            {visibleNotes.length === 0 ? (
              <p className={`text-sm italic ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>No notes yet.</p>
            ) : (
              <div className="space-y-3">
                {visibleNotes.map((note, index) => (
                  <div key={note.id}>
                    <div
                      className={`p-3 rounded-xl group transition-all duration-200 ${isDarkTheme ? 'bg-slate-800/40 hover:bg-slate-800/60' : 'bg-slate-50 hover:bg-slate-100'}`}
                      style={{
                        borderLeft: isDarkTheme
                          ? '4px solid rgba(138,135,214,0.35)'
                          : '4px solid rgba(138,135,214,0.28)'
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {editingNoteId === note.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={editingNoteText}
                                onChange={(e) => setEditingNoteText(e.target.value)}
                                onBlur={() => saveNote(note.id, editingNoteText)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && e.ctrlKey) {
                                    saveNote(note.id, editingNoteText);
                                  } else if (e.key === 'Escape') {
                                    setEditingNoteId(null);
                                    setEditingNoteText('');
                                  }
                                }}
                                className={`w-full text-sm p-3 rounded border focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent resize-none ${isDarkTheme ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                                rows="3"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveNote(note.id, editingNoteText)}
                                  className="px-3 py-1 text-xs bg-[#8a87d6] text-white rounded hover:bg-[#7b78cc] transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingNoteId(null);
                                    setEditingNoteText('');
                                  }}
                                  className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className={`text-sm leading-relaxed ${isDarkTheme ? 'text-slate-200' : 'text-slate-800'}`}> 
                                {expandedNotes.has(note.id) || note.text.length <= 80 
                                  ? note.text 
                                  : `${note.text.slice(0, 80)}...`}
                              </p>
                              {note.text.length > 80 && (
                                <button
                                  onClick={() => toggleNoteExpansion(note.id)}
                                  className="text-xs text-[#8a87d6] hover:underline mt-1 font-medium"
                                >
                                  {expandedNotes.has(note.id) ? 'Show less' : 'Show more'}
                                </button>
                              )}
                              <div className="flex items-center gap-2 mt-2 pt-1">
                                {/* Shorter separator line with less opacity */}
                                <div className={`w-1/2 h-px ${isDarkTheme ? 'bg-slate-600/20' : 'bg-slate-200/40'}`}></div>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {note.type && <NoteTypeChip type={note.type} isDarkTheme={isDarkTheme} />}
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{getDisplayName(user)}</span>
                                <span className="text-xs text-slate-500">{new Date(note.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                              </div>
                            </>
                          )}
                        </div>
                        {/* Edit and Delete icons */}
                        {editingNoteId !== note.id && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEditingNote(note)}
                              className={`p-1 rounded ${isDarkTheme ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}
                              title="Edit note"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className={`p-1 rounded ${isDarkTheme ? 'hover:bg-slate-600 text-red-400' : 'hover:bg-slate-200 text-red-500'}`}
                              title="Delete note"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {notes.length > 2 && (
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => setShowAllNotes(!showAllNotes)}
                      className="text-xs text-[#8a87d6] hover:underline font-bold"
                      style={{ color: '#8a87d6' }}
                    >
                      {showAllNotes ? 'Show fewer (2)' : `Show all (${notes.length})`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {showAddNote && (
            <div className={`mt-3 p-3 rounded-lg border ${isDarkTheme ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}>
              <textarea
                placeholder="Add a note..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className={`w-full mb-2 px-3 py-2 rounded border resize-none ${isDarkTheme ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={addNote}
                  className="px-3 py-1 bg-[#8a87d6] hover:bg-[#7b78cc] text-white text-sm rounded transition-colors"
                >
                  Add Note
                </button>
                <button
                  onClick={() => {
                    setShowAddNote(false);
                    setNewNoteText('');
                  }}
                  className={`px-3 py-1 text-sm rounded transition-colors ${isDarkTheme ? 'text-slate-300 hover:bg-slate-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Project Goals Section - Bottom Right */}
        <div className={`sectionCard rounded-2xl border p-6 bg-[var(--card-bg)] ${isDarkTheme ? 'border-slate-700' : ''} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}>
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-slate-500" />
              <h3 className="text-base font-semibold text-slate-800">Project Goals</h3>
            </span>
            <button
              onClick={() => addGoal(project.id)}
              className="text-xs text-[#8a87d6] hover:underline font-bold"
            >
              <b>Add Goal</b>
            </button>
          </div>
          
          {/* Mini progress bar */}
          {goals && goals.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span>Progress</span>
                <span>{Math.round((goals.filter(g => g.done).length / goals.length) * 100)}%</span>
              </div>
              <div className={`w-full h-2 ${isDarkTheme ? 'bg-slate-700' : 'bg-slate-200'} rounded-full overflow-hidden`}>
                <div 
                  className="h-full bg-[#8a87d6] rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((goals.filter(g => g.done).length / goals.length) * 100)}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Subtle background tint for Goals section with max height */}
          <div className={`rounded-xl p-4 ${isDarkTheme ? 'bg-slate-800/20' : 'bg-gray-50/60'} max-h-64 overflow-y-auto`}>
            {(!goals || goals.length === 0) ? (
              <p className={`text-sm italic ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>Add goals to start tracking progress.</p>
            ) : (
              <div className="space-y-2">
                {goals.map((goal, index) => (
                  <div 
                    key={goal.id || index} 
                    className={`flex items-center gap-3 group p-2 rounded-lg transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/50`}
                    style={{ cursor: 'grab' }}
                  >
                    <input
                      type="checkbox"
                      checked={goal.done}
                      onChange={() => toggleGoal(index)}
                      className={`rounded border-2 focus:ring-2 focus:ring-offset-0 ${isDarkTheme ? 'border-slate-600 text-[#8a87d6] focus:ring-[#8a87d6]' : 'border-gray-300 text-[#8a87d6] focus:ring-[#8a87d6]'}`}
                    />
                    {/* Editable Goal Title */}
                    {editingGoalId === goal.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingGoalText}
                          onChange={(e) => setEditingGoalText(e.target.value)}
                          onBlur={() => saveGoal(goal.id, editingGoalText)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveGoal(goal.id, editingGoalText);
                            } else if (e.key === 'Escape') {
                              setEditingGoalId(null);
                              setEditingGoalText('');
                            }
                          }}
                          className={`flex-1 text-sm px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkTheme ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                          autoFocus
                        />
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isDarkTheme ? 'hover:bg-slate-600 text-red-400' : 'hover:bg-gray-200 text-red-500'}`}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-between">
                        <span 
                          className={`text-sm cursor-pointer transition-all ${
                            goal.done 
                              ? `line-through opacity-60 ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}` 
                              : `${isDarkTheme ? 'text-slate-300' : 'text-gray-900'}`
                          }`}
                          onClick={() => startEditingGoal(goal)}
                        >
                          {goal.title}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditingGoal(goal)}
                            className={`p-1 rounded ${
                              isDarkTheme ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-gray-200 text-gray-400'
                            }`}
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className={`p-1 rounded ${
                              isDarkTheme ? 'hover:bg-slate-600 text-red-400' : 'hover:bg-gray-200 text-red-500'
                            }`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
      </div>

      {/* Footer - Right-aligned icon buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
        <button
          onClick={onEdit}
          className={`p-2 rounded-lg border transition-colors ${
            isDarkTheme 
              ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          title="Edit Project"
        >
          <Edit size={16} />
        </button>
        {project.status !== 'completed' && (
          <button
            onClick={onComplete}
            className={`p-2 rounded-lg border transition-colors ${
              isDarkTheme 
                ? 'border-emerald-600 text-emerald-400 hover:bg-emerald-900/20' 
                : 'border-emerald-600 text-emerald-600 hover:bg-emerald-50'
            }`}
            title="Mark Completed"
          >
            <CheckCircle2 size={16} />
          </button>
        )}
        <button
          onClick={onDelete}
          className={`p-2 rounded-lg border transition-colors ${
            isDarkTheme 
              ? 'border-red-600 text-red-400 hover:bg-red-900/20' 
              : 'border-red-600 text-red-600 hover:bg-red-50'
          }`}
          title="Delete Project"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

// Get display name from user or fallback to greeting
const getDisplayName = (user) => {
  // Prefer profile.displayName if available
  if (user?.profile?.displayName) {
    return user.profile.displayName;
  }
  // Fallback: try greeting parse (e.g. "Hi, John!")
  if (user?.greeting) {
    const match = user.greeting.match(/Hi,\s*([^!]+)!/i);
    if (match) return match[1].trim();
  }
  // Fallback: user_metadata.full_name
  if (user?.user_metadata?.full_name) {
    return user.user_metadata.full_name.split(' ')[0];
  }
  // Fallback: email username
  if (user?.email) {
    return user.email.split('@')[0];
  }
  return 'User';
};

// Main Projects View Component
const ProjectsView = ({ 
  projects = [], 
  user,
  isDarkTheme = true,
  onAddProject = () => {},
  onEditProject = () => {},
  onUpdateProject = () => {},
  onDeleteProject = () => {}
}) => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Next Steps modal state
  const [showNextStepsModal, setShowNextStepsModal] = useState(false);
  const [editingNextStepsProject, setEditingNextStepsProject] = useState(null);
  const [nextStepsContent, setNextStepsContent] = useState('');
  
  // Local state for projects to enable optimistic updates
  const [localProjects, setLocalProjects] = useState([]);
  
  // Sync local projects with prop changes
  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);
  
  // Enhanced update handler that updates local state immediately
  const handleUpdateProject = (projectId, updatedProject) => {
    // Update local state immediately (optimistic update)
    setLocalProjects(prev => prev.map(p => 
      p.id === projectId ? updatedProject : p
    ));
    
    // Call parent callback for persistence
    onUpdateProject(projectId, updatedProject);
  };

  // Next Steps helper functions
  const openNextStepsModal = (project) => {
    setEditingNextStepsProject(project);
    
    // Handle both old array format and new string format
    let initialContent = '';
    if (Array.isArray(project?.next_steps)) {
      // Convert old array format to string
      initialContent = project.next_steps
        .map(step => `${step.done ? '✓' : '○'} ${step.title}`)
        .join('\n');
    } else if (typeof project?.next_steps === 'string') {
      // Use existing string format
      initialContent = project.next_steps;
    }
    
    setNextStepsContent(initialContent);
    setShowNextStepsModal(true);
  };

  const saveNextSteps = () => {
    if (!editingNextStepsProject) return;
    
    const updatedProject = {
      ...editingNextStepsProject,
      next_steps: nextStepsContent.trim() || null,
      updated_at: new Date().toISOString()
    };
    
    handleUpdateProject(editingNextStepsProject.id, updatedProject);
    
    setShowNextStepsModal(false);
    setEditingNextStepsProject(null);
    setNextStepsContent('');
  };

  // Load pinned project from localStorage on mount
  useEffect(() => {
    const pinnedId = localStorage.getItem('nx_pinned_project');
    if (pinnedId && localProjects.length > 0) {
      const pinnedProject = localProjects.find(p => p.id === pinnedId);
      if (pinnedProject) {
        // Ensure the pinned project has pinned flag set
        if (!pinnedProject.pinned) {
          handleUpdateProject(pinnedId, { ...pinnedProject, pinned: true });
        }
      } else {
        // Clean up invalid pinned ID
        localStorage.removeItem('nx_pinned_project');
      }
    }
  }, [localProjects.length]);

  // Filter projects based on active tab and search
  const filteredProjects = localProjects.filter(project => {
    const matchesTab = activeTab === 'active' 
      ? project.status !== 'completed' 
      : project.status === 'completed';
    
    const matchesSearch = !searchTerm || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  // Determine focus project (pinned or most recently updated)
  const pinnedId = localStorage.getItem('nx_pinned_project');
  const focusProject = filteredProjects.find(p => p.id === pinnedId) || 
    filteredProjects.sort((a, b) => new Date(b.updated_at || b.lastUpdatedAt || 0) - new Date(a.updated_at || a.lastUpdatedAt || 0))[0];

  // Remaining projects for grid
  const gridProjects = filteredProjects.filter(p => p.id !== focusProject?.id);

  const handlePin = (projectId) => {
    const project = localProjects.find(p => p.id === projectId);
    if (project) {
      const newPinnedState = !project.pinned;
      
      if (newPinnedState) {
        // Pin this project and unpin others
        localStorage.setItem('nx_pinned_project', projectId);
        
        // Unpin all other projects
        localProjects.forEach(p => {
          if (p.id !== projectId && p.pinned) {
            handleUpdateProject(p.id, { ...p, pinned: false });
          }
        });
        
        // Pin the target project
        handleUpdateProject(projectId, { ...project, pinned: true });
      } else {
        // Unpin the project
        localStorage.removeItem('nx_pinned_project');
        handleUpdateProject(projectId, { ...project, pinned: false });
      }
    }
  };

  const handleComplete = (project) => {
    // Mark all next steps as done to achieve 100% progress
    const updatedNextSteps = project.nextSteps?.map(step => ({ ...step, done: true })) || [];
    
    // Mark all checklist items as done if they exist
    const updatedChecklists = project.checklists?.map(checklist => ({
      ...checklist,
      items: checklist.items.map(item => ({ ...item, done: true }))
    })) || [];
    
    handleUpdateProject(project.id, {
      ...project,
      status: 'completed',
      nextSteps: updatedNextSteps,
      checklists: updatedChecklists,
      updated_at: new Date().toISOString()
    });
  };

  const handleEdit = (projectId) => {
    const project = localProjects.find(p => p.id === projectId);
    if (project) {
      onEditProject(project);
    }
  };

  const handleDelete = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      // Clean up pinned state if deleting pinned project
      const pinnedId = localStorage.getItem('nx_pinned_project');
      if (pinnedId === projectId) {
        localStorage.removeItem('nx_pinned_project');
      }
      onDeleteProject(projectId);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-[#30313E]' : 'bg-[#e3e3f5]'} relative`}>
      <BackgroundDoodles isDarkTheme={isDarkTheme} />
      
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header Toolbar */}
        <div className={`flex items-center justify-between mb-8 bg-[#f3f4fd] dark:bg-[#424250] rounded-2xl shadow-sm px-4 py-3 ${
          isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'
        }`}>
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkTheme ? 'text-slate-400' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#424250] border-slate-700 text-white placeholder-slate-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-3 mx-8">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                activeTab === 'active'
                  ? isDarkTheme 
                    ? 'bg-[#8a87d6] text-[#30313E]'
                    : 'bg-[#8a87d6] text-white'
                  : isDarkTheme 
                    ? 'border border-slate-600 text-slate-300 hover:bg-slate-700'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                activeTab === 'completed'
                  ? isDarkTheme 
                    ? 'bg-[#8a87d6] text-[#30313E]'
                    : 'bg-[#8a87d6] text-white'
                  : isDarkTheme 
                    ? 'border border-slate-600 text-slate-300 hover:bg-slate-700'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Completed
            </button>
          </div>

          {/* Add Project */}
          <button
            onClick={onAddProject}
            className="flex items-center gap-2 px-4 py-2 bg-[#8a87d6] text-white rounded-lg hover:bg-[#7b78cc] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Focus Project */}
          {focusProject && (
            <ExpandedProjectCard
              project={focusProject}
              isDarkTheme={isDarkTheme}
              onPin={() => handlePin(focusProject.id)}
              onEdit={() => handleEdit(focusProject.id)}
              onComplete={() => handleComplete(focusProject)}
              onDelete={() => handleDelete(focusProject.id)}
              onUpdateProject={(updatedProject) => handleUpdateProject(updatedProject.id, updatedProject)}
              onOpenNextStepsModal={openNextStepsModal}
              user={user}
            />
          )}

          {/* Grid Projects */}
          {gridProjects.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {gridProjects.map(project => (
                <CollapsedProjectCard
                  key={project.id}
                  project={project}
                  isDarkTheme={isDarkTheme}
                  onExpand={() => handlePin(project.id)}
                  onPin={() => handlePin(project.id)}
                  onEdit={() => handleEdit(project.id)}
                  onDelete={() => handleDelete(project.id)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className={`text-center py-12 ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No projects found</p>
              <p className="text-sm">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : `No ${activeTab} projects yet. Create your first project to get started.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Next Steps Modal */}
      {showNextStepsModal && editingNextStepsProject && (
        <NextStepsModal
          isOpen={showNextStepsModal}
          onClose={() => {
            setShowNextStepsModal(false);
            setEditingNextStepsProject(null);
            setNextStepsContent('');
          }}
          content={nextStepsContent}
          onContentChange={setNextStepsContent}
          onSave={saveNextSteps}
          title={`Next Steps for ${editingNextStepsProject.title}`}
        />
      )}
    </div>
  );
};

export default ProjectsView;
