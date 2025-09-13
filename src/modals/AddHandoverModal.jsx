import React, { useState } from 'react';

const AddHandoverModal = ({ onClose, onAdd, cases = [], isDarkTheme = true }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'incoming',
    tasks: [],
    coveringStart: '',
    coveringEnd: ''
  });
  const [currentTask, setCurrentTask] = useState('');
  const [showCaseSelector, setShowCaseSelector] = useState(false);
  const [selectedCases, setSelectedCases] = useState([]);

  const addTask = () => {
    if (!currentTask.trim()) return;
    
    setFormData({
      ...formData,
      tasks: [...formData.tasks, { 
        title: currentTask.trim(), 
        completed: false,
        type: 'custom',
        priority: 'medium'
      }]
    });
    setCurrentTask('');
  };

  const addCaseAsTask = (case_) => {
    const caseTask = {
      title: `${case_.attract_id} - ${case_.subject}`,
      completed: false,
      type: 'case',
      caseId: case_.id,
      priority: case_.priority?.toLowerCase() || 'medium',
      status: case_.status
    };
    
    setFormData({
      ...formData,
      tasks: [...formData.tasks, caseTask]
    });
  };

  const toggleCaseSelection = (case_) => {
    if (selectedCases.find(c => c.id === case_.id)) {
      setSelectedCases(selectedCases.filter(c => c.id !== case_.id));
    } else {
      setSelectedCases([...selectedCases, case_]);
    }
  };

  const addSelectedCases = () => {
    selectedCases.forEach(case_ => addCaseAsTask(case_));
    setSelectedCases([]);
    setShowCaseSelector(false);
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
    
    onAdd(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkTheme ? 'bg-[#424250] border-slate-700' : 'bg-[#f3f4fd] border-gray-200'} rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border`}>
        <div className={`p-6 border-b ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Add New Handover</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title and Type on one row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Title*</label>
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
                placeholder="Enter handover title"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Type*</label>
              <select
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                }`}
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
              <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>From Date</label>
              <input
                type="date"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                }`}
                value={formData.coveringStart}
                onChange={(e) => setFormData({ ...formData, coveringStart: e.target.value })}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>To Date (leave empty for Present)</label>
              <input
                type="date"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                }`}
                value={formData.coveringEnd}
                onChange={(e) => setFormData({ ...formData, coveringEnd: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Tasks</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
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
              <button
                type="button"
                onClick={() => setShowCaseSelector(true)}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                title="Add cases as tasks"
              >
                Cases
              </button>
            </div>
            
            {/* Case Selector Modal */}
            {showCaseSelector && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                <div className={`${isDarkTheme ? 'bg-[#424250] border-slate-700' : 'bg-[#f3f4fd] border-gray-200'} rounded-xl shadow-xl max-w-lg w-full max-h-[70vh] overflow-y-auto border m-4`}>
                  <div className={`p-4 border-b ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'}`}>
                    <h3 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Select Cases to Add as Tasks</h3>
                  </div>
                  <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                    {cases.length === 0 ? (
                      <p className={`text-sm text-center py-4 ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
                        No cases available
                      </p>
                    ) : (
                      cases.map(case_ => (
                        <div
                          key={case_.id}
                          onClick={() => toggleCaseSelection(case_)}
                          className={`cursor-pointer p-3 rounded-lg border transition-colors ${
                            selectedCases.find(c => c.id === case_.id)
                              ? isDarkTheme
                                ? 'bg-cyan-900 border-cyan-600 text-cyan-200'
                                : 'bg-cyan-50 border-cyan-300 text-cyan-800'
                              : isDarkTheme
                                ? 'bg-[#8a87d6] border-slate-600 text-white hover:bg-[#8a87d6]'
                                : 'bg-[#e3e3f5] border-gray-300 text-gray-900 hover:bg-[#ffffff]'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{case_.attract_id}</div>
                              <div className="text-sm opacity-75 mt-1">{case_.subject}</div>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  case_.priority === 'High' ? 'bg-[#e69a96] text-[#e69a96]' :
                                  case_.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-[#f3f4fd] text-[#e69a96]'
                                }`}>
                                  {case_.priority}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  isDarkTheme ? 'bg-slate-600 text-slate-200' : 'bg-[#f3f4fd] text-gray-700'
                                }`}>
                                  {case_.status}
                                </span>
                              </div>
                            </div>
                            <div className={`ml-3 text-xl ${
                              selectedCases.find(c => c.id === case_.id) ? 'text-cyan-500' : 'text-gray-400'
                            }`}>
                              {selectedCases.find(c => c.id === case_.id) ? '✓' : '+'}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className={`p-4 border-t flex gap-3 ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => setShowCaseSelector(false)}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                        isDarkTheme 
                          ? 'text-slate-300 bg-[#8a87d6] hover:bg-[#8a87d6]' 
                          : 'text-gray-700 bg-[#f3f4fd] hover:bg-gray-300'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addSelectedCases}
                      disabled={selectedCases.length === 0}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                        selectedCases.length > 0
                          ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                          : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      }`}
                    >
                      Add {selectedCases.length} Case{selectedCases.length !== 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {formData.tasks.map((task, index) => (
                <div key={index} className={`flex items-center justify-between p-2 rounded-lg ${isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#ffffff]'}`}>
                  <div className="flex-1">
                    <span className={`text-sm ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{task.title}</span>
                    {task.type === 'case' && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 text-xs bg-cyan-500 text-white rounded-full">Case</span>
                        {task.priority && (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            task.priority === 'high' ? 'bg-[#e69a96] text-white' :
                            task.priority === 'medium' ? 'bg-yellow-500 text-white' :
                            'bg-[#f3f4fd] text-white'
                          }`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTask(index)}
                    className="text-[#e69a96] hover:text-[#e69a96] text-sm font-medium ml-2"
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
                  ? 'text-slate-300 bg-[#8a87d6] hover:bg-[#8a87d6]' 
                  : 'text-gray-700 bg-[#f3f4fd] hover:bg-gray-300'
              }`}
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
              Add Handover
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHandoverModal;

