import React from 'react';
import { AlertTriangle, TrendingUp, Archive } from 'lucide-react';

const TaskLimitWarning = ({ count, warning, limitReached, isDarkTheme }) => {
  if (!warning && !limitReached) return null;

  const percentage = (count / 500) * 100;

  return (
    <div className={`p-4 rounded-md border ${
      limitReached 
        ? isDarkTheme
          ? 'bg-[#e69a96]/20 border-[#e69a96] text-[#e69a96]'
          : 'bg-[#e69a96] border-[#e69a96] text-[#e69a96]'
        : isDarkTheme
          ? 'bg-[#8a87d6]/20 border-[#8a87d6] text-[#8a87d6]'
          : 'bg-[#8a87d6] border-[#8a87d6] text-[#8a87d6]'
    }`}>
      <div className="flex items-start space-x-3">
        <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
          limitReached ? 'text-[#e69a96]' : 'text-[#8a87d6]'
        }`} />
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">
              {limitReached ? 'Task Limit Reached' : 'Approaching Task Limit'}
            </h4>
            <span className="text-sm font-mono">
              {count}/500
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className={`w-full h-2 rounded-full mb-3 ${
            isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'
          }`}>
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                limitReached 
                  ? 'bg-[#e69a96]' 
                  : percentage >= 90 
                    ? 'bg-[#8a87d6]' 
                    : 'bg-yellow-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          
          <div className="space-y-2">
            {limitReached ? (
              <div>
                <p className="text-sm mb-2">
                  You've reached the maximum of 500 active tasks. Complete or delete some tasks to add new ones.
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <Archive className="w-4 h-4" />
                    <span>Complete old tasks</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Delete unnecessary tasks</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm mb-2">
                  You have {count} active tasks. Consider cleaning up when you reach 500 tasks.
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Complete tasks regularly</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Archive className="w-4 h-4" />
                    <span>Archive completed tasks</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskLimitWarning;
