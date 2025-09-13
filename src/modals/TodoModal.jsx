import { useState } from 'react';

const TodoModal = ({ onClose, onAdd, onUpdate, editingTodo }) => {
  const [content, setContent] = useState(editingTodo?.content || '');
  const [dueDate, setDueDate] = useState(editingTodo?.due_date || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      const todoData = {
        content: content.trim(),
        due_date: dueDate || null
      };

      if (editingTodo) {
        onUpdate(editingTodo.id, todoData);
      } else {
        onAdd(todoData);
      }
      
      setContent('');
      setDueDate('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#424250] rounded-xl p-6 w-full max-w-md">
        <h3 className="text-white text-lg font-semibold mb-4">
          {editingTodo ? 'Edit Todo' : 'Add New Todo'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Todo Description
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 bg-[#8a87d6] border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8a87d6] min-h-[80px]"
              placeholder="What needs to be done?"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-3 bg-[#8a87d6] border border-slate-600 rounded-lg text-white focus:outline-none focus:border-[#8a87d6]"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-300 bg-[#8a87d6] rounded-lg hover:bg-[#8a87d6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#8a87d6] text-white rounded-lg hover:bg-[#8a87d6] transition-colors"
            >
              {editingTodo ? 'Update Todo' : 'Add Todo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoModal;

