import { useState } from 'react';

const EditHandoverModal = ({ handover, onClose, onUpdate, isDarkTheme = true }) => {
  const [formData, setFormData] = useState({
    title: handover.title || '',
    type: handover.type || 'incoming',
    tasks: handover.tasks || [],
    coveringStart: handover.coveringStart || '',
    coveringEnd: handover.coveringEnd || ''
  });
  const [currentTask, setCurrentTask] = useState('');

  const addTask = () => {
    if (!currentTask.trim()) return;
    
    setFormData({
      ...formData,
      tasks: [...formData.tasks, { title: currentTask.trim(), completed: false }]
    });
    setCurrentTask('');
  };

  const removeTask = (index) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onUpdate(handover.id, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`${isDarkTheme ? 'border-slate-700' : 'border-gray-200'} rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border`}
        style={{ backgroundColor: isDarkTheme ? '#424250' : '#f3f4fd' }}
      >
        <div className={`p-6 border-b ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Edit Handover</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title and Type on one row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Title*</label>
              <input
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'border-slate-600 text-white placeholder-slate-400' 
                    : 'border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                style={{ backgroundColor: isDarkTheme ? '#8a87d6' : '#f3f4fd' }}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter handover title"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Type</label>
              <select
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'border-slate-600 text-white' 
                    : 'border-gray-300 text-gray-900'
                }`}
                style={{ backgroundColor: isDarkTheme ? '#8a87d6' : '#f3f4fd' }}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="incoming">From Manager</option>
                <option value="outgoing">To Manager</option>
                <option value="personal">Personal Tasks</option>
              </select>
            </div>
          </div>

          {/* Period Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                From Date
              </label>
              <input
                type="date"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'border-slate-600 text-white placeholder-slate-400 bg-slate-800' 
                    : 'border-gray-300 text-gray-900 placeholder-gray-500 bg-white'
                }`}
                value={formData.coveringStart}
                onChange={(e) => setFormData({ ...formData, coveringStart: e.target.value })}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                To Date
              </label>
              <input
                type="date"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'border-slate-600 text-white placeholder-slate-400 bg-slate-800' 
                    : 'border-gray-300 text-gray-900 placeholder-gray-500 bg-white'
                }`}
                value={formData.coveringEnd}
                onChange={(e) => setFormData({ ...formData, coveringEnd: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Tasks</label>
            <div className="flex gap-2">
              <input
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'border-slate-600 text-white placeholder-slate-400' 
                    : 'border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                style={{ backgroundColor: isDarkTheme ? '#8a87d6' : '#f3f4fd' }}
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                placeholder="Add a task"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTask())}
              />
              <button
                type="button"
                onClick={addTask}
                className="px-4 py-2 bg-[#8a87d6] text-white rounded-lg hover:bg-[#8a87d6] transition-colors"
              >
                Add
              </button>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto mt-2">
              {formData.tasks.map((task, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 rounded-lg"
                  style={{ backgroundColor: isDarkTheme ? '#8a87d6' : '#ffffff' }}
                >
                  <span className={`text-sm ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{task.title || task}</span>
                  <button
                    type="button"
                    onClick={() => removeTask(index)}
                    className="text-[#e69a96] hover:text-[#e69a96] text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'text-slate-300 hover:bg-[#8a87d6]' 
                  : 'text-gray-700 bg-[#f3f4fd] hover:bg-gray-300'
              }`}
              style={{ backgroundColor: isDarkTheme ? '#8a87d6' : undefined }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                isDarkTheme
                  ? 'bg-[#8a87d6] text-[#30313E] hover:bg-[#9a97e3]'
                  : 'bg-[#8a87d6] text-white hover:bg-[#7b78cc]'
              }`}
            >
              Update Handover
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHandoverModal;

