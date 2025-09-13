import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { errorBus } from '../utils/errorBus.js';

const SidebarErrorPill = ({ isDarkTheme = true, onOpenDrawer }) => {
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setErrorCount(errorBus.getErrorCount());
    };

    // Initial count
    updateCount();

    // Subscribe to changes
    const unsubscribe = errorBus.subscribe(updateCount);

    return unsubscribe;
  }, []);

  if (errorCount === 0) {
    return null;
  }

  return (
    <button
      onClick={onOpenDrawer}
      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        isDarkTheme 
          ? 'bg-[#e69a96]/30 text-[#e69a96] hover:bg-[#e69a96]/40 border border-[#e69a96]/50' 
          : 'bg-[#e69a96] text-[#e69a96] hover:bg-[#e69a96] border border-[#e69a96]'
      }`}
      title={`${errorCount} error${errorCount === 1 ? '' : 's'}`}
    >
      <AlertCircle className="w-4 h-4" />
      <span className="text-sm flex-1 text-left">
        {errorCount} error{errorCount === 1 ? '' : 's'}
      </span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        isDarkTheme ? 'bg-[#e69a96] text-[#e69a96]' : 'bg-[#e69a96] text-[#e69a96]'
      }`}>
        {errorCount}
      </span>
    </button>
  );
};

export default SidebarErrorPill;
