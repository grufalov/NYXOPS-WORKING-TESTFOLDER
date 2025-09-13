import React, { useState, useRef, useEffect } from 'react';
import { CheckSquare, Square, Edit2, Trash2, Tag, MoreVertical, Check, X, Save } from 'lucide-react';
import { getPriorityStyles, formatTagsForDisplay, parseTagString, truncateText } from '../utils/myDeskHelpers.js';

const TaskCard = ({ 
  task, 
  isSelected, 
  onSelect, 
  onToggleComplete, 
  onEdit, 
  onDelete, 
  availableTags, 
  isDarkTheme 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    tags: formatTagsForDisplay(task.tags)
  });
  const [showMenu, setShowMenu] = useState(false);
  
  const menuRef = useRef(null);
  const titleInputRef = useRef(null);

  const priorityStyles = getPriorityStyles(task.priority);

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveEdit = () => {
    if (!editData.title.trim()) return;

    const updates = {
      title: editData.title.trim(),
      description: editData.description.trim() || null,
      priority: editData.priority,
      tags: parseTagString(editData.tags)
    };

    onEdit(updates);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      tags: formatTagsForDisplay(task.tags)
    });
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (isEditing) {
    return (
      <div className={`p-4 border rounded-md ${isDarkTheme ? 'border-gray-600 bg-[#424250]' : 'border-gray-200 bg-[#f3f4fd]'} space-y-3`}>
        <input
          ref={titleInputRef}
          type="text"
          value={editData.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          onKeyDown={handleKeyPress}
          className={`w-full px-3 py-2 border rounded-md ${
            isDarkTheme
              ? 'bg-[#424250] border-gray-600 text-white placeholder-gray-400 focus:border-[#8a87d6]'
              : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8a87d6]'
          } focus:outline-none focus:ring-2 focus:ring-[#8a87d6] focus:ring-opacity-20`}
          placeholder="Task title"
        />
        
        <textarea
          value={editData.description}
          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          onKeyDown={handleKeyPress}
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
            value={editData.priority}
            onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
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
            value={editData.tags}
            onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
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
            onClick={handleCancelEdit}
            className={`p-2 rounded-md transition-colors ${isDarkTheme ? 'text-gray-400 hover:text-gray-200 hover:bg-[#424250]' : 'text-gray-600 hover:text-gray-800 hover:bg-[#f3f4fd]'}`}
            title="Cancel (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleSaveEdit}
            disabled={!editData.title.trim()}
            className={`p-2 rounded-md transition-colors ${
              editData.title.trim()
                ? 'bg-[#8a87d6] hover:bg-[#8a87d6] text-white'
                : isDarkTheme
                  ? 'bg-[#424250] text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title="Save (Ctrl+Enter)"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 border rounded-md group hover:border-[#8a87d6] dark:hover:border-[#8a87d6] transition-all ${
      isSelected 
        ? 'border-[#8a87d6] bg-[#8a87d6] dark:bg-[#8a87d6]/20' 
        : isDarkTheme 
          ? 'border-gray-600 bg-[#424250] hover:bg-gray-750' 
          : 'border-gray-200 bg-[#f3f4fd] hover:bg-[#e3e3f5]'
    } ${task.is_completed ? 'opacity-75' : ''}`}>
      <div className="flex items-start space-x-3">
        {/* Selection Checkbox */}
        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="w-4 h-4 text-[#8a87d6] border-gray-300 rounded focus:ring-[#8a87d6]"
          />
          
          {/* Completion Checkbox */}
          <button
            onClick={onToggleComplete}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.is_completed
                ? 'bg-[#f3f4fd] border-[#f3f4fd] text-white'
                : isDarkTheme
                  ? 'border-gray-600 hover:border-[#f3f4fd]'
                  : 'border-gray-300 hover:border-[#f3f4fd]'
            }`}
          >
            {task.is_completed && <Check className="w-3 h-3" />}
          </button>
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h4 className={`font-medium ${
                task.is_completed 
                  ? 'line-through text-gray-500' 
                  : isDarkTheme ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {task.title}
              </h4>
              
              {/* Description */}
              {task.description && (
                <p className={`text-sm mt-1 ${
                  task.is_completed 
                    ? 'line-through text-gray-400' 
                    : isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {truncateText(task.description, 100)}
                </p>
              )}
              
              {/* Priority and Tags */}
              <div className="flex items-center space-x-2 mt-2">
                {/* Priority Badge */}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityStyles.bgColor} ${priorityStyles.textColor}`}>
                  {priorityStyles.label}
                </span>
                
                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Tag className="w-3 h-3 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {task.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                            isDarkTheme 
                              ? 'bg-[#424250] text-gray-300' 
                              : 'bg-[#ffffff] text-gray-700'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                      {task.tags.length > 3 && (
                        <span className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                          +{task.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all ${isDarkTheme ? 'text-gray-400 hover:text-gray-200 hover:bg-[#424250]' : 'text-gray-600 hover:text-gray-800 hover:bg-[#f3f4fd]'}`}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <div className={`absolute right-0 mt-1 w-32 rounded-md shadow-lg z-10 ${
                  isDarkTheme ? 'bg-[#424250] border border-gray-700' : 'bg-[#f3f4fd] border border-gray-200'
                }`}>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className={`flex items-center space-x-2 w-full px-3 py-2 text-sm text-left transition-colors ${
                        isDarkTheme 
                          ? 'text-gray-300 hover:bg-[#424250]' 
                          : 'text-gray-700 hover:bg-[#ffffff]'
                      }`}
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        onToggleComplete();
                        setShowMenu(false);
                      }}
                      className={`flex items-center space-x-2 w-full px-3 py-2 text-sm text-left transition-colors ${
                        isDarkTheme 
                          ? 'text-gray-300 hover:bg-[#424250]' 
                          : 'text-gray-700 hover:bg-[#ffffff]'
                      }`}
                    >
                      {task.is_completed ? <Square className="w-3 h-3" /> : <CheckSquare className="w-3 h-3" />}
                      <span>{task.is_completed ? 'Mark Incomplete' : 'Mark Complete'}</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-left text-[#e69a96] hover:bg-[#e69a96] dark:hover:bg-[#e69a96]/20 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Created Date */}
          <div className={`text-xs mt-2 ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
            Created {new Date(task.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

