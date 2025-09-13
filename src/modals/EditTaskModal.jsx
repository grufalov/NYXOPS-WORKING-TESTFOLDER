import { useState } from 'react';

const EditTaskModal = ({ task, onClose, onUpdate, isDarkTheme = true }) => {
  const [formData, setFormData] = useState({
    title: typeof task === 'string' ? task : (task.title || task),
    priority: typeof task === 'object' && task.priority ? task.priority : 'medium',
    notes: typeof task === 'object' && task.notes ? task.notes : '',
    completed: typeof task === 'object' && task.completed ? task.completed : false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onUpdate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkTheme ? 'bg-[#424250] border-slate-700' : 'bg-[#f3f4fd] border-gray-200'} rounded-xl shadow-xl max-w-md w-full border`}>
        <div className={`p-6 border-b ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Edit Task</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Task Title*</label>
            <input
              type="text"
              required
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                isDarkTheme 
                  ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Priority</label>
            <select
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                isDarkTheme 
                  ? 'bg-[#8a87d6] border-slate-600 text-white' 
                  : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
              }`}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Notes</label>
            <textarea
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                isDarkTheme 
                  ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add task notes..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="completed"
              checked={formData.completed}
              onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
              className="w-4 h-4 text-[#8a87d6] bg-[#ffffff] border-gray-300 rounded focus:ring-[#8a87d6]"
            />
            <label htmlFor="completed" className={`text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
              Mark as completed
            </label>
          </div>

          <div className="flex gap-3 pt-4">
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
              Update Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;

