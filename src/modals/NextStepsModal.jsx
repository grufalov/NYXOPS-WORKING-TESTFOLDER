import React from 'react';

const NextStepsModal = ({ isOpen, onClose, onSave, content, onContentChange, isDarkTheme = true }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkTheme ? 'bg-[#424250] border-slate-600' : 'bg-[#f3f4fd] border-gray-200'} rounded-xl border p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <h2 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              Edit Next Steps
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className={`transition-colors ${isDarkTheme ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-yellow-400' : 'text-yellow-600'}`}>
              Next Steps
            </label>
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                isDarkTheme 
                  ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              rows="6"
              placeholder="Describe the next steps for this case..."
              autoFocus
            />
            <p className={`text-xs mt-1 ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
              Plain text only. Use line breaks to organize your content.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'border-slate-600 text-slate-300 hover:bg-[#8a87d6]' 
                  : 'border-gray-300 text-gray-700 hover:bg-[#e3e3f5]'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg hover:from-yellow-600 hover:to-amber-600 transition-all font-medium"
            >
              Save Next Steps
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NextStepsModal;

