import React from 'react';
import { Check, X, Trash2, Edit, Tag } from 'lucide-react';

const BulkActionsBar = ({ selectedCount, onAction, selectedTasks, onClear, isDarkTheme }) => {
  return (
    <div className={`flex items-center justify-between p-3 rounded-md border ${
      isDarkTheme 
        ? 'bg-[#8a87d6]/20 border-[#8a87d6] text-[#8a87d6]' 
        : 'bg-[#8a87d6] border-[#8a87d6] text-[#8a87d6]'
    }`}>
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium">
          {selectedCount} task{selectedCount !== 1 ? 's' : ''} selected
        </span>
        
        <button
          onClick={onClear}
          className={`p-1 rounded-md transition-colors ${
            isDarkTheme 
              ? 'text-[#8a87d6] hover:text-[#8a87d6] hover:bg-[#8a87d6]/30' 
              : 'text-[#8a87d6] hover:text-[#8a87d6] hover:bg-[#8a87d6]'
          }`}
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onAction('complete', selectedTasks)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isDarkTheme
              ? 'bg-[#f3f4fd]/30 text-[#e69a96] hover:bg-[#f3f4fd]/50'
              : 'bg-[#f3f4fd] text-[#e69a96] hover:bg-[#f3f4fd]'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>Complete</span>
        </button>
        
        <button
          onClick={() => onAction('incomplete', selectedTasks)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isDarkTheme
              ? 'bg-[#424250] text-gray-300 hover:bg-gray-600'
              : 'bg-[#ffffff] text-gray-700 hover:bg-[#f3f4fd]'
          }`}
        >
          <X className="w-4 h-4" />
          <span>Mark Incomplete</span>
        </button>
        
        <button
          onClick={() => onAction('delete', selectedTasks)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isDarkTheme
              ? 'bg-[#e69a96]/30 text-[#e69a96] hover:bg-[#e69a96]/50'
              : 'bg-[#e69a96] text-[#e69a96] hover:bg-[#e69a96]'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default BulkActionsBar;

