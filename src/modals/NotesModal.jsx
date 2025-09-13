import { useState } from 'react';

const NotesModal = ({ onClose, onAdd, onSave, isDarkTheme = true, initialContent = '' }) => {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      // Use onSave if provided (for existing notes), otherwise onAdd (for new notes)
      if (onSave) {
        onSave(content.trim());
      } else if (onAdd) {
        onAdd(content.trim());
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-xl p-6 w-full max-w-md ${
        isDarkTheme 
          ? 'bg-[#424250]' 
          : 'bg-[#f3f4fd] border border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isDarkTheme ? 'text-white' : 'text-gray-900'
        }`}>
          Add New Note
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkTheme ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Note Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`w-full p-3 rounded-lg min-h-[100px] focus:outline-none focus:border-pink-500 ${
                isDarkTheme 
                  ? 'bg-[#8a87d6] border border-slate-600 text-white placeholder-gray-400' 
                  : 'bg-[#f3f4fd] border border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter your note..."
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'text-gray-300 bg-[#8a87d6] hover:bg-[#8a87d6]' 
                  : 'text-gray-600 bg-[#ffffff] hover:bg-[#f3f4fd]'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Add Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotesModal;

