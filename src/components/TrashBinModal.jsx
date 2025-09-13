import React, { useState } from 'react';
import { Trash2, RotateCcw, X, AlertTriangle, Clock, Check } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import { formatTagsForDisplay, getPriorityStyles } from '../utils/myDeskHelpers.js';

const TrashBinModal = ({ 
  isOpen, 
  onClose, 
  deletedTasks, 
  onRestore, 
  onPermanentDelete, 
  isDarkTheme, 
  user 
}) => {
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState(null); // 'restore', 'permanent-delete', 'empty-trash'

  if (!isOpen) return null;

  const handleSelectTask = (taskId, selected) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === deletedTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(deletedTasks.map(task => task.id)));
    }
  };

  const handleBulkRestore = async () => {
    setLoading(true);
    try {
      await Promise.all(
        Array.from(selectedTasks).map(taskId => onRestore(taskId))
      );
      setSelectedTasks(new Set());
    } catch (error) {
      console.error('Error restoring tasks:', error);
    }
    setLoading(false);
  };

  const handleBulkPermanentDelete = async () => {
    setLoading(true);
    try {
      await Promise.all(
        Array.from(selectedTasks).map(taskId => onPermanentDelete(taskId))
      );
      setSelectedTasks(new Set());
    } catch (error) {
      console.error('Error permanently deleting tasks:', error);
    }
    setLoading(false);
    setShowConfirmDialog(false);
  };

  const handleEmptyTrash = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('my_desk_tasks')
        .delete()
        .eq('user_id', user.id)
        .eq('is_deleted', true);

      if (error) throw error;

      // Call parent to update the task list
      deletedTasks.forEach(task => onPermanentDelete(task.id));
    } catch (error) {
      console.error('Error emptying trash:', error);
    }
    setLoading(false);
    setShowConfirmDialog(false);
  };

  const confirmAction = (type) => {
    setActionType(type);
    setShowConfirmDialog(true);
  };

  const executeConfirmedAction = () => {
    switch (actionType) {
      case 'restore':
        handleBulkRestore();
        break;
      case 'permanent-delete':
        handleBulkPermanentDelete();
        break;
      case 'empty-trash':
        handleEmptyTrash();
        break;
      default:
        break;
    }
    setShowConfirmDialog(false);
  };

  const getTimeRemaining = (deletedAt) => {
    const deleteTime = new Date(deletedAt);
    const expiryTime = new Date(deleteTime.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const now = new Date();
    const timeLeft = expiryTime - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-4xl max-h-[80vh] rounded-lg p-6 ${isDarkTheme ? 'bg-[#424250] text-white' : 'bg-[#f3f4fd] text-gray-900'}`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Trash2 className="w-6 h-6 text-[#e69a96]" />
              <div>
                <h2 className="text-xl font-semibold">Trash Bin</h2>
                <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  {deletedTasks.length} deleted task{deletedTasks.length !== 1 ? 's' : ''} • Auto-delete after 7 days
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-md hover:bg-[#f3f4fd] dark:hover:bg-[#424250] transition-colors ${isDarkTheme ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bulk Actions */}
          {deletedTasks.length > 0 && (
            <div className="flex items-center justify-between mb-4 p-3 bg-[#ffffff] dark:bg-[#424250] rounded-md">
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedTasks.size === deletedTasks.length && deletedTasks.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-[#8a87d6] border-gray-300 rounded focus:ring-[#8a87d6]"
                  />
                  <span className="text-sm">
                    {selectedTasks.size > 0 ? `${selectedTasks.size} selected` : 'Select all'}
                  </span>
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                {selectedTasks.size > 0 && (
                  <>
                    <button
                      onClick={() => confirmAction('restore')}
                      disabled={loading}
                      className="flex items-center space-x-2 px-3 py-2 bg-[#f3f4fd] hover:bg-[#f3f4fd] text-white rounded-md text-sm transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Restore ({selectedTasks.size})</span>
                    </button>
                    
                    <button
                      onClick={() => confirmAction('permanent-delete')}
                      disabled={loading}
                      className="flex items-center space-x-2 px-3 py-2 bg-[#e69a96] hover:bg-[#e69a96] text-white rounded-md text-sm transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Forever ({selectedTasks.size})</span>
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => confirmAction('empty-trash')}
                  disabled={loading || deletedTasks.length === 0}
                  className="flex items-center space-x-2 px-3 py-2 bg-[#e69a96] hover:bg-[#e69a96] text-white rounded-md text-sm transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Empty Trash</span>
                </button>
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {deletedTasks.length === 0 ? (
              <div className={`text-center py-12 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Trash is empty</p>
                <p className="text-sm">Deleted tasks will appear here and be automatically removed after 7 days</p>
              </div>
            ) : (
              deletedTasks.map(task => {
                const priorityStyles = getPriorityStyles(task.priority);
                const timeRemaining = getTimeRemaining(task.deleted_at);
                const isSelected = selectedTasks.has(task.id);
                
                return (
                  <div
                    key={task.id}
                    className={`p-4 border rounded-md transition-colors ${
                      isSelected 
                        ? 'border-[#8a87d6] bg-[#8a87d6] dark:bg-[#8a87d6]/20' 
                        : isDarkTheme 
                          ? 'border-gray-600 bg-[#424250] hover:bg-gray-650' 
                          : 'border-gray-200 bg-[#e3e3f5] hover:bg-[#ffffff]'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectTask(task.id, e.target.checked)}
                        className="w-4 h-4 text-[#8a87d6] border-gray-300 rounded focus:ring-[#8a87d6] mt-1"
                      />
                      
                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium line-through ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                              {task.title}
                            </h4>
                            
                            {task.description && (
                              <p className={`text-sm mt-1 line-through ${isDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium opacity-60 ${priorityStyles.bgColor} ${priorityStyles.textColor}`}>
                                {priorityStyles.label}
                              </span>
                              
                              {task.tags && task.tags.length > 0 && (
                                <span className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                                  {formatTagsForDisplay(task.tags)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Individual Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => onRestore(task.id)}
                              className="p-2 rounded-md bg-[#f3f4fd] dark:bg-[#f3f4fd]/30 text-[#e69a96] dark:text-[#e69a96] hover:bg-[#f3f4fd] dark:hover:bg-[#f3f4fd]/50 transition-colors"
                              title="Restore Task"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => {
                                setSelectedTasks(new Set([task.id]));
                                confirmAction('permanent-delete');
                              }}
                              className="p-2 rounded-md bg-[#e69a96] dark:bg-[#e69a96]/30 text-[#e69a96] dark:text-[#e69a96] hover:bg-[#e69a96] dark:hover:bg-[#e69a96]/50 transition-colors"
                              title="Delete Forever"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className={`flex items-center space-x-4 mt-2 text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Deleted {new Date(task.deleted_at).toLocaleDateString()}</span>
                          </div>
                          
                          <div className={`flex items-center space-x-1 ${timeRemaining === 'Expired' ? 'text-[#e69a96]' : ''}`}>
                            <AlertTriangle className="w-3 h-3" />
                            <span>Auto-delete in {timeRemaining}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className={`w-full max-w-md rounded-lg p-6 ${isDarkTheme ? 'bg-[#424250] text-white' : 'bg-[#f3f4fd] text-gray-900'}`}>
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-[#8a87d6]" />
              <h3 className="text-lg font-semibold">Confirm Action</h3>
            </div>
            
            <div className="mb-6">
              {actionType === 'restore' && (
                <p>Restore {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} from trash?</p>
              )}
              {actionType === 'permanent-delete' && (
                <p>Permanently delete {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''}? This action cannot be undone.</p>
              )}
              {actionType === 'empty-trash' && (
                <p>Permanently delete all {deletedTasks.length} tasks in trash? This action cannot be undone.</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className={`flex-1 px-4 py-2 border rounded-md ${isDarkTheme ? 'border-gray-600 text-gray-300 hover:bg-[#424250]' : 'border-gray-300 text-gray-700 hover:bg-[#e3e3f5]'} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmedAction}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                  actionType === 'restore'
                    ? 'bg-[#f3f4fd] hover:bg-[#f3f4fd] text-white'
                    : 'bg-[#e69a96] hover:bg-[#e69a96] text-white'
                } disabled:opacity-50`}
              >
                {loading ? 'Processing...' : actionType === 'restore' ? 'Restore' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TrashBinModal;

