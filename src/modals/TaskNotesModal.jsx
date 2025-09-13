import { useState } from 'react';

const TaskNotesModal = ({ task, onClose, onAddNote, isDarkTheme = true }) => {
  const [noteContent, setNoteContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (noteContent.trim()) {
      onAddNote(noteContent.trim());
      setNoteContent('');
    }
  };

  const existingNotes = typeof task === 'object' && task.notes ? task.notes : [];
  const taskTitle = typeof task === 'string' ? task : (task.title || task);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDarkTheme ? 'bg-[#424250] border-slate-700' : 'bg-[#f3f4fd] border-gray-200'} rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto border`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
          Task Notes: {taskTitle}
        </h3>
        
        {/* Existing Notes */}
        {existingNotes.length > 0 && (
          <div className="mb-4">
            <h4 className={`text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
              Existing Notes:
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {existingNotes.map((note, index) => (
                <div key={index} className={`p-2 rounded-lg ${isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#ffffff]'}`}>
                  <p className={`text-sm ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{note.content}</p>
                  <p className={`text-xs mt-1 ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
                    {new Date(note.created_at).toLocaleDateString()} - {note.author}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Add New Note Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
              Add New Note
            </label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:border-[#8a87d6] min-h-[80px] ${
                isDarkTheme 
                  ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter your note about this task..."
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'text-slate-300 bg-[#8a87d6] hover:bg-[#8a87d6]' 
                  : 'text-gray-700 bg-[#f3f4fd] hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Add Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskNotesModal;

