import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

const ErrorInline = ({ 
  message = "Something went wrong", 
  onRetry = null, 
  isDarkTheme = true,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border ${
      isDarkTheme 
        ? 'bg-[#e69a96]/20 border-[#e69a96] text-[#e69a96]' 
        : 'bg-[#e69a96] border-[#e69a96] text-[#e69a96]'
    } ${className}`}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
            isDarkTheme
              ? 'bg-[#e69a96] hover:bg-[#e69a96] text-[#e69a96]'
              : 'bg-[#e69a96] hover:bg-[#e69a96] text-[#e69a96]'
          }`}
        >
          <RotateCcw className="w-3 h-3" />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorInline;
