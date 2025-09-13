import React, { useState, useEffect } from 'react';
import { ListChecks, RotateCcw, ChevronUp, ChevronDown, Plus, Edit3 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { errorBus } from '../../utils/errorBus';
import ErrorInline from '../../components/ErrorInline';

const DEFAULT_CHECKLIST = [
  'Open calendar',
  'Scan inbox for blockers',
  'Review roles at risk',
  'Pick top 3 tasks',
  'Block focus time'
];

const MorningChecklistCard = ({ isDarkTheme, user }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editableItems, setEditableItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Progress calculation
  const completedCount = items.filter(item => item.is_completed).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const progressText = totalCount > 0 ? `${completedCount}/${totalCount}` : '0/0';

  useEffect(() => {
    if (user?.id) {
      loadChecklist();
    }
  }, [user?.id]);

  const loadChecklist = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('my_desk_checklist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at');

      if (fetchError) throw fetchError;

      if (data.length === 0) {
        await seedChecklist();
        return;
      }

      setItems(data || []);
    } catch (err) {
      setError(err.message);
      errorBus.pushError({ source: 'Morning Checklist', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const seedChecklist = async () => {
    try {
      const checklistItems = DEFAULT_CHECKLIST.map((title) => ({
        user_id: user.id,
        item_text: title,
        is_completed: false
      }));

      const { error: insertError } = await supabase
        .from('my_desk_checklist')
        .insert(checklistItems);

      if (insertError) throw insertError;

      await loadChecklist();
    } catch (err) {
      setError(err.message);
      errorBus.pushError({ source: 'Morning Checklist Seed', message: err.message });
    }
  };

  const toggleItem = async (id, currentState) => {
    try {
      setSaving(true);
      const newState = !currentState;
      
      const { error: updateError } = await supabase
        .from('my_desk_checklist')
        .update({
          is_completed: newState,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setItems(prev => prev.map(item => 
        item.id === id 
          ? { ...item, is_completed: newState }
          : item
      ));
    } catch (err) {
      errorBus.pushError({ source: 'Morning Checklist Toggle', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const resetToday = async () => {
    try {
      setSaving(true);
      
      const { error: updateError } = await supabase
        .from('my_desk_checklist')
        .update({ 
          is_completed: false
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setItems(prev => prev.map(item => ({
        ...item,
        is_completed: false
      })));
    } catch (err) {
      errorBus.pushError({ source: 'Morning Checklist Reset', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const moveItem = async (id, direction) => {
    const currentIndex = items.findIndex(item => item.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === items.length - 1)
    ) return;

    const newItems = [...items];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    [newItems[currentIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[currentIndex]];
    
    setItems(newItems);

    // Note: Without sort_order column, order changes won't persist on reload
    // This could be enhanced later by adding a position/order column to the schema
  };

  const addItem = async () => {
    if (!newItemText.trim()) return;

    try {
      setSaving(true);
      const { data, error: insertError } = await supabase
        .from('my_desk_checklist')
        .insert([{
          user_id: user.id,
          item_text: newItemText.trim(),
          is_completed: false
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      setItems(prev => [...prev, { ...data, is_completed: false }]);
      setNewItemText('');
      setShowAddInput(false);
    } catch (err) {
      errorBus.pushError({ source: 'Morning Checklist Add', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = () => {
    setEditableItems([...items]);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditableItems([]);
    setEditingItemId(null);
    setEditingText('');
  };

  const startEditingItem = (item) => {
    setEditingItemId(item.id);
    setEditingText(item.item_text);
  };

  const cancelEditingItem = () => {
    setEditingItemId(null);
    setEditingText('');
  };

  const saveEditingItem = () => {
    if (!editingText.trim()) return;
    
    setEditableItems(prev => prev.map(item => 
      item.id === editingItemId 
        ? { ...item, item_text: editingText.trim() }
        : item
    ));
    setEditingItemId(null);
    setEditingText('');
  };

  const deleteEditableItem = (id) => {
    setEditableItems(prev => prev.filter(item => item.id !== id));
  };

  const addNewEditableItem = () => {
    const tempId = `temp_${Date.now()}`;
    setEditableItems(prev => [...prev, {
      id: tempId,
      item_text: 'New item',
      is_completed: false,
      user_id: user.id,
      isNew: true
    }]);
    setEditingItemId(tempId);
    setEditingText('New item');
  };

  const saveAllChanges = async () => {
    try {
      setSaving(true);

      // Separate new items from existing items
      const newItems = editableItems.filter(item => item.isNew);
      const existingItems = editableItems.filter(item => !item.isNew);
      const deletedItemIds = items.filter(originalItem => 
        !editableItems.find(editableItem => editableItem.id === originalItem.id)
      ).map(item => item.id);

      // Delete removed items
      if (deletedItemIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('my_desk_checklist')
          .delete()
          .in('id', deletedItemIds);

        if (deleteError) throw deleteError;
      }

      // Update existing items
      for (const item of existingItems) {
        const { error: updateError } = await supabase
          .from('my_desk_checklist')
          .update({ item_text: item.item_text })
          .eq('id', item.id);

        if (updateError) throw updateError;
      }

      // Insert new items
      if (newItems.length > 0) {
        const { data: insertedItems, error: insertError } = await supabase
          .from('my_desk_checklist')
          .insert(newItems.map(item => ({
            user_id: user.id,
            item_text: item.item_text,
            is_completed: false
          })))
          .select();

        if (insertError) throw insertError;

        // Update editableItems with real IDs
        const updatedEditableItems = editableItems.map(item => {
          if (item.isNew) {
            const insertedItem = insertedItems.find(inserted => inserted.item_text === item.item_text);
            return insertedItem || item;
          }
          return item;
        });
        
        setEditableItems(updatedEditableItems);
      }

      // Reload the checklist to get the updated data
      await loadChecklist();
      closeEditModal();
    } catch (err) {
      errorBus.pushError({ source: 'Morning Checklist Save', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-accent" />
            <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              Morning Checklist
            </h3>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="card"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ 
      backgroundColor: '#f3f4fd',
      border: '2px solid #c5cae9',
      borderRadius: '1rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)'
    }}>
      {/* Sticky Header */}
      <div className="sticky top-0 bg-inherit z-10 rounded-t-2xl overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-accent" />
              <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                Morning Checklist
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
                {progressText}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddInput(!showAddInput)}
                  disabled={saving}
                  className="flex items-center gap-1 text-xs text-accent hover:text-accent disabled:opacity-50"
                  title="Add new item"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
                <button
                  onClick={openEditModal}
                  disabled={saving}
                  className="flex items-center gap-1 text-xs text-accent hover:text-accent disabled:opacity-50"
                  title="Edit checklist items"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={resetToday}
                  disabled={saving}
                  className="flex items-center gap-1 text-xs text-accent hover:text-accent disabled:opacity-50"
                  title="Reset today's completion flags"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar as Section Divider */}
        <div 
          className="h-[6px] bg-border rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-label="Morning checklist progress"
        >
          {totalCount > 0 && (
            <div 
              className="h-full bg-[#8a87d6] rounded-full transition-all duration-200 ease-out motion-reduce:transition-none"
              style={{ width: `${progressPercentage}%` }}
            />
          )}
        </div>
      </div>

      {/* Add Item Input */}
      {showAddInput && (
        <div className={`px-4 py-3 border-b border-subtle`}>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Enter new checklist item..."
              className="card"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addItem();
                } else if (e.key === 'Escape') {
                  setShowAddInput(false);
                  setNewItemText('');
                }
              }}
              autoFocus
            />
            <button
              onClick={addItem}
              disabled={!newItemText.trim() || saving}
              className="px-3 py-2 text-sm border rounded text-muted hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddInput(false);
                setNewItemText('');
              }}
              className="card"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {error ? (
          <ErrorInline 
            message={error}
            onRetry={loadChecklist}
            isDarkTheme={isDarkTheme}
          />
        ) : items.length === 0 ? (
          <div className={`text-center py-6 ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
            <p>No checklist items yet.</p>
            <button
              onClick={() => setShowAddInput(true)}
              className="mt-2 text-sm text-accent hover:text-accent"
            >
              Click "Add" above to create your first item
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors"
              >
                <input
                  type="checkbox"
                  checked={item.is_completed}
                  onChange={() => toggleItem(item.id, item.is_completed)}
                  disabled={saving}
                  className="w-4 h-4 rounded focus:ring-[#8a87d6] flex-shrink-0"
                  style={{
                    accentColor: '#8a87d6'
                  }}
                />
                <span className={`flex-1 ml-2 ${
                  item.is_completed 
                    ? `line-through ${isDarkTheme ? 'text-slate-500' : 'text-gray-400'}`
                    : isDarkTheme ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.item_text}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => moveItem(item.id, 'up')}
                    disabled={index === 0 || saving}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                    title="Move up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveItem(item.id, 'down')}
                    disabled={index === items.length - 1 || saving}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                    title="Move down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card">
            {/* Modal Header */}
            <div className={`p-6 border-b border-subtle`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-accent" />
                  <h3 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                    Edit Morning Checklist
                  </h3>
                </div>
                <button
                  onClick={closeEditModal}
                  className="card"
                >
                  ✕
                </button>
              </div>
              <p className={`text-sm mt-2 ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
                Edit, add, or remove items from your permanent morning checklist. These changes will persist after resets.
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                {editableItems.map((item) => (
                  <div key={item.id} className="card">
                    {editingItemId === item.id ? (
                      <>
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="card"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditingItem();
                            if (e.key === 'Escape') cancelEditingItem();
                          }}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={saveEditingItem}
                            className="px-3 py-1 text-sm bg-accent text-white rounded hover:bg-accent-hover"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditingItem}
                            className="card"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className={`flex-1 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                          {item.item_text}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEditingItem(item)}
                            className="card"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteEditableItem(item.id)}
                            className="px-3 py-1 text-sm bg-danger text-white rounded hover:bg-danger-hover"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                
                {/* Add New Item Button */}
                <button
                  onClick={addNewEditableItem}
                  className={`w-full p-3 border-2 border-dashed rounded-lg transition-colors ${isDarkTheme ? 'border-slate-600 hover:border-slate-500 text-slate-400 hover:text-slate-300' : 'border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-600'}`}
                >
                  <Plus className="w-4 h-4 mx-auto mb-1" />
                  Add New Item
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-6 border-t border-subtle flex justify-end gap-3`}>
              <button
                onClick={closeEditModal}
                className="card"
              >
                Cancel
              </button>
              <button
                onClick={saveAllChanges}
                disabled={saving}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MorningChecklistCard;

