import React, { useState, useEffect } from 'react';
import { X, Trash2, Clock } from 'lucide-react';
import { errorBus } from '../utils/errorBus.js';

const ErrorDrawer = ({ isOpen, onClose, isDarkTheme = true }) => {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setErrors(errorBus.getErrors());
    }

    const unsubscribe = errorBus.subscribe((newErrors) => {
      setErrors(newErrors);
    });

    return unsubscribe;
  }, [isOpen]);

  const handleClearAll = () => {
    errorBus.clear();
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleString();
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMin = Math.floor(diffMs / 60000);
    
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
    return `${Math.floor(diffMin / 1440)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed right-0 top-0 bottom-0 w-96 z-50 ${
        isDarkTheme ? 'bg-[#424250] border-slate-700' : 'bg-[#f3f4fd] border-gray-200'
      } border-l shadow-xl`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkTheme ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold ${
            isDarkTheme ? 'text-white' : 'text-gray-900'
          }`}>
            Error Log ({errors.length})
          </h2>
          <div className="flex items-center gap-2">
            {errors.length > 0 && (
              <button
                onClick={handleClearAll}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkTheme 
                    ? 'hover:bg-[#424250] text-slate-400 hover:text-slate-200' 
                    : 'hover:bg-[#f3f4fd] text-gray-500 hover:text-gray-700'
                }`}
                title="Clear all errors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'hover:bg-[#424250] text-slate-400 hover:text-slate-200' 
                  : 'hover:bg-[#f3f4fd] text-gray-500 hover:text-gray-700'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {errors.length === 0 ? (
            <div className={`text-center py-8 ${
              isDarkTheme ? 'text-slate-400' : 'text-gray-500'
            }`}>
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No errors logged</p>
              <p className="text-sm mt-1">Errors will appear here when they occur</p>
            </div>
          ) : (
            <div className="space-y-3">
              {errors.map((error) => (
                <div
                  key={error.id}
                  className={`p-3 rounded-lg border ${
                    isDarkTheme 
                      ? 'bg-[#424250]/50 border-slate-600' 
                      : 'bg-[#f3f4fd] border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      isDarkTheme 
                        ? 'bg-[#e69a96]/50 text-[#e69a96]' 
                        : 'bg-[#e69a96] text-[#e69a96]'
                    }`}>
                      {error.source}
                    </span>
                    <span 
                      className={`text-xs ${
                        isDarkTheme ? 'text-slate-400' : 'text-gray-500'
                      }`}
                      title={formatTimestamp(error.timestamp)}
                    >
                      {getRelativeTime(error.timestamp)}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    isDarkTheme ? 'text-slate-200' : 'text-gray-700'
                  }`}>
                    {error.message}
                  </p>
                  {error.meta && Object.keys(error.meta).length > 0 && (
                    <pre className={`text-xs mt-2 p-2 rounded ${
                      isDarkTheme 
                        ? 'bg-[#424250] text-slate-300' 
                        : 'bg-white text-gray-600'
                    } overflow-x-auto`}>
                      {JSON.stringify(error.meta, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ErrorDrawer;

