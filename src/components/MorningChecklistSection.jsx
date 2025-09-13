import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, X, RotateCcw, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient.js';

const MorningChecklistSection = ({ items, setItems, user, isDarkTheme }) => {
  const [newItem, setNewItem] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [carryoverItems, setCarryoverItems] = useState([]);
  const [showCarryoverModal, setShowCarryoverModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check for daily reset on component mount
  useEffect(() => {
    checkForDailyReset();
  }, []);

  const checkForDailyReset = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get user's last reset date
      const { data: settings, error } = await supabase
        .from('my_desk_settings')
        .select('last_checklist_reset')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking reset date:', error);
        return;
      }

      const lastReset = settings?.last_checklist_reset;
      
      // If no reset date or it's a new day, check for reset
      if (!lastReset || lastReset !== today) {
        // Check for uncompleted items from previous day
        const { data: prevItems, error: prevError } = await supabase
          .from('my_desk_checklist')
          .select('*')
          .eq('user_id', user.id)
          .eq('date_created', lastReset || new Date(Date.now() - 86400000).toISOString().split('T')[0])
          .eq('is_completed', false);

        if (prevError) {
          console.error('Error checking previous items:', prevError);
          return;
        }

        if (prevItems && prevItems.length > 0) {
          setCarryoverItems(prevItems);
          setShowCarryoverModal(true);
        } else {
          setShowResetModal(true);
        }
      }
    } catch (error) {
      console.error('Error in daily reset check:', error);
    }
  };

  const handleReset = async (carryOver = false) => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Handle carryover items if requested
      if (carryOver && carryoverItems.length > 0) {
        const carryoverData = carryoverItems.map(item => ({
          user_id: user.id,
          item_text: item.item_text,
          is_completed: false,
          date_created: today
        }));

        await supabase
          .from('my_desk_checklist')
          .insert(carryoverData);
      }

      // Update last reset date
      await supabase
        .from('my_desk_settings')
        .upsert({
          user_id: user.id,
          last_checklist_reset: today
        });

      // Reload items for today
      await loadTodaysItems();
      
    } catch (error) {
      console.error('Error during reset:', error);
    }
    
    setLoading(false);
    setShowResetModal(false);
    setShowCarryoverModal(false);
  };

  const loadTodaysItems = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('my_desk_checklist')
        .select('*')
        .eq('user_id', user.id)
        .eq('date_created', today)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading today\'s items:', error);
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('my_desk_checklist')
        .insert({
          user_id: user.id,
          item_text: newItem.trim(),
          date_created: today
        })
        .select()
        .single();

      if (error) throw error;

      setItems([...items, data]);
      setNewItem('');
    } catch (error) {
      console.error('Error adding checklist item:', error);
    }
  };

  const toggleItem = async (id, isCompleted) => {
    try {
      const { error } = await supabase
        .from('my_desk_checklist')
        .update({ is_completed: !isCompleted })
        .eq('id', id);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === id ? { ...item, is_completed: !isCompleted } : item
      ));
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };

  const deleteItem = async (id) => {
    try {
      const { error } = await supabase
        .from('my_desk_checklist')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting checklist item:', error);
    }
  };

  const completedCount = items.filter(item => item.is_completed).length;
  const totalCount = items.length;

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-[#e69a96]" />
            <h3 className="text-lg font-semibold">Morning Checklist</h3>
          </div>
          <div className="flex items-center space-x-2">
            {totalCount > 0 && (
              <div className={`text-sm px-2 py-1 rounded-full ${isDarkTheme ? 'bg-[#424250] text-gray-300' : 'bg-[#f3f4fd] text-gray-600'}`}>
                {completedCount}/{totalCount}
              </div>
            )}
            <button
              onClick={() => setShowResetModal(true)}
              className={`p-1 rounded-md hover:bg-[#f3f4fd] dark:hover:bg-[#424250] transition-colors ${isDarkTheme ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
              title="Reset Checklist"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className={`w-full h-2 rounded-full ${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'}`}>
            <div
              className="h-full bg-[#f3f4fd] rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        )}

        {/* Add New Item */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add a morning routine item..."
            className={`flex-1 px-3 py-2 border rounded-md ${
              isDarkTheme
                ? 'bg-[#424250] border-gray-600 text-white placeholder-gray-400 focus:border-[#8a87d6]'
                : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8a87d6]'
            } focus:outline-none focus:ring-2 focus:ring-[#8a87d6] focus:ring-opacity-20`}
          />
          <button
            onClick={addItem}
            disabled={!newItem.trim()}
            className={`px-3 py-2 rounded-md transition-colors ${
              newItem.trim()
                ? 'bg-[#8a87d6] hover:bg-[#8a87d6] text-white'
                : isDarkTheme
                  ? 'bg-[#424250] text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Checklist Items */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {items.length === 0 ? (
            <div className={`text-center py-8 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
              <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No checklist items yet</p>
              <p className="text-sm">Add your daily routines above</p>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className={`flex items-center space-x-3 p-2 rounded-md group hover:bg-[#e3e3f5] dark:hover:bg-[#424250] transition-colors ${
                  item.is_completed ? 'opacity-60' : ''
                }`}
              >
                <button
                  onClick={() => toggleItem(item.id, item.is_completed)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    item.is_completed
                      ? 'bg-[#f3f4fd] border-[#f3f4fd] text-white'
                      : isDarkTheme
                        ? 'border-gray-600 hover:border-[#f3f4fd]'
                        : 'border-gray-300 hover:border-[#f3f4fd]'
                  }`}
                >
                  {item.is_completed && <CheckSquare className="w-3 h-3" />}
                </button>
                
                <span
                  className={`flex-1 ${
                    item.is_completed 
                      ? 'line-through text-gray-500' 
                      : isDarkTheme ? 'text-gray-200' : 'text-gray-800'
                  }`}
                >
                  {item.item_text}
                </span>
                
                <button
                  onClick={() => deleteItem(item.id)}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-[#e69a96] dark:hover:bg-[#e69a96]/20 text-[#e69a96] transition-all ${isDarkTheme ? 'hover:text-[#e69a96]' : 'hover:text-[#e69a96]'}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-lg p-6 ${isDarkTheme ? 'bg-[#424250] text-white' : 'bg-[#f3f4fd] text-gray-900'}`}>
            <div className="flex items-center space-x-3 mb-4">
              <RotateCcw className="w-6 h-6 text-[#8a87d6]" />
              <h3 className="text-lg font-semibold">Reset Daily Checklist</h3>
            </div>
            
            <p className={`mb-6 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
              This will start a fresh checklist for today. Your previous day's progress will be saved.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetModal(false)}
                className={`flex-1 px-4 py-2 border rounded-md ${isDarkTheme ? 'border-gray-600 text-gray-300 hover:bg-[#424250]' : 'border-gray-300 text-gray-700 hover:bg-[#e3e3f5]'} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReset(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#8a87d6] hover:bg-[#8a87d6] text-white rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carryover Modal */}
      {showCarryoverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-lg p-6 ${isDarkTheme ? 'bg-[#424250] text-white' : 'bg-[#f3f4fd] text-gray-900'}`}>
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-[#8a87d6]" />
              <h3 className="text-lg font-semibold">Uncompleted Items</h3>
            </div>
            
            <p className={`mb-4 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
              You have {carryoverItems.length} uncompleted items from yesterday. Would you like to carry them over to today?
            </p>
            
            <div className={`mb-6 space-y-2 max-h-32 overflow-y-auto p-2 rounded-md ${isDarkTheme ? 'bg-[#424250]' : 'bg-[#ffffff]'}`}>
              {carryoverItems.map(item => (
                <div key={item.id} className="flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{item.item_text}</span>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleReset(false)}
                disabled={loading}
                className={`flex-1 px-4 py-2 border rounded-md ${isDarkTheme ? 'border-gray-600 text-gray-300 hover:bg-[#424250]' : 'border-gray-300 text-gray-700 hover:bg-[#e3e3f5]'} transition-colors disabled:opacity-50`}
              >
                Start Fresh
              </button>
              <button
                onClick={() => handleReset(true)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#8a87d6] hover:bg-[#8a87d6] text-white rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Carry Over'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MorningChecklistSection;

