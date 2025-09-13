import React, { useState, useEffect } from 'react';
import { Clipboard, CheckSquare, PenTool, StickyNote, List, Shield, X, Eye, EyeOff, Smartphone, Monitor } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import MorningChecklistSection from '../components/MorningChecklistSection.jsx';
import QuickCaptureSection from '../components/QuickCaptureSection.jsx';
import ScratchpadSection from '../components/ScratchpadSection.jsx';
import TaskListSection from '../components/TaskListSection.jsx';
import PinAuthModal from '../components/PinAuthModal.jsx';

const MyDeskView = ({ user, isDarkTheme }) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [hasPin, setHasPin] = useState(false);

  // Mobile view state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [activeTab, setActiveTab] = useState('checklist');

  // Data state
  const [checklistItems, setChecklistItems] = useState([]);
  const [quickCaptureItems, setQuickCaptureItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  // Task count for sidebar badge
  const [activeTaskCount, setActiveTaskCount] = useState(0);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    if (user) {
      checkAuthenticationStatus();
    }
  }, [user]);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAllData();
    }
  }, [isAuthenticated, user]);

  // Update active task count
  useEffect(() => {
    const count = tasks.filter(task => !task.is_completed && !task.is_deleted).length;
    setActiveTaskCount(count);
    
    // Update parent component with task count for sidebar badge
    if (window.updateMyDeskTaskCount) {
      window.updateMyDeskTaskCount(count);
    }
  }, [tasks]);

  const checkAuthenticationStatus = async () => {
    try {
      // Check if user has a PIN set up
      const { data: settings, error } = await supabase
        .from('my_desk_settings')
        .select('pin_hash')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking PIN status:', error);
        return;
      }

      const pinExists = settings?.pin_hash;
      setHasPin(pinExists);

      if (!pinExists) {
        // No PIN set up, show PIN creation modal
        setShowPinModal(true);
      } else {
        // PIN exists, check session authentication
        const sessionAuth = sessionStorage.getItem(`mydesk_auth_${user.id}`);
        if (sessionAuth === 'authenticated') {
          setIsAuthenticated(true);
        } else {
          setShowPinModal(true);
        }
      }
    } catch (error) {
      console.error('Error in authentication check:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePinSuccess = () => {
    setIsAuthenticated(true);
    setShowPinModal(false);
    sessionStorage.setItem(`mydesk_auth_${user.id}`, 'authenticated');
  };

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadChecklistItems(),
        loadQuickCaptureItems(),
        loadTasks(),
        loadNotes()
      ]);
    } catch (error) {
      console.error('Error loading My Desk data:', error);
    }
  };

  const handleConvertToTask = async (content) => {
    try {
      const taskData = {
        user_id: user.id,
        title: content.trim(),
        description: null,
        priority: 'medium',
        tags: []
      };

      const { data, error } = await supabase
        .from('my_desk_tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) throw error;

      setTasks([data, ...tasks]);
      return data;
    } catch (error) {
      console.error('Error converting to task:', error);
      throw error;
    }
  };

  const loadChecklistItems = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('my_desk_checklist')
        .select('*')
        .eq('user_id', user.id)
        .eq('date_created', today)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChecklistItems(data || []);
    } catch (error) {
      console.error('Error loading checklist items:', error);
    }
  };

  const loadQuickCaptureItems = async () => {
    try {
      const { data, error } = await supabase
        .from('my_desk_quick_capture')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_processed', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setQuickCaptureItems(data || []);
    } catch (error) {
      console.error('Error loading quick capture items:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('my_desk_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('my_desk_notes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setNotes(data?.content || '');
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(`mydesk_auth_${user.id}`);
    setShowPinModal(true);
  };

  const mobileTabConfig = [
    { id: 'checklist', label: 'Checklist', icon: CheckSquare },
    { id: 'tasks', label: 'Tasks', icon: List },
    { id: 'notes', label: 'Notes', icon: StickyNote }
  ];

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className="text-center">
          <Clipboard className="w-8 h-8 mx-auto mb-2 animate-pulse" />
          <p>Loading My Desk...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className={`flex items-center justify-center h-64 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-[#8a87d6]" />
            <h2 className="text-xl font-semibold mb-2">My Desk</h2>
            <p className="mb-4">Your personal productivity workspace</p>
            <p className="text-sm text-gray-500">PIN authentication required for privacy</p>
          </div>
        </div>
        
        {showPinModal && (
          <PinAuthModal
            isOpen={showPinModal}
            onClose={() => setShowPinModal(false)}
            onSuccess={handlePinSuccess}
            hasExistingPin={hasPin}
            user={user}
            isDarkTheme={isDarkTheme}
          />
        )}
      </>
    );
  }

  return (
    <div className={`p-4 space-y-6 ${isDarkTheme ? 'bg-[#424250] text-white' : 'bg-[#e3e3f5] text-gray-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Clipboard className="w-8 h-8 text-[#8a87d6]" />
          <div>
            <h1 className="text-2xl font-bold">My Desk</h1>
            <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
              Your personal productivity workspace
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* View mode indicator */}
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs ${isDarkTheme ? 'bg-[#424250] text-gray-300' : 'bg-[#f3f4fd] text-gray-600'}`}>
            {isMobile ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
            <span>{isMobile ? 'Mobile' : 'Desktop'}</span>
          </div>
          
          {/* Task count badge */}
          {activeTaskCount > 0 && (
            <div className="bg-[#8a87d6] text-white px-2 py-1 rounded-full text-xs font-semibold">
              {activeTaskCount} active
            </div>
          )}
          
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className={`p-2 rounded-md hover:bg-[#f3f4fd] dark:hover:bg-[#424250] transition-colors ${isDarkTheme ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
            title="Lock My Desk"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      {isMobile && (
        <div className={`flex space-x-1 p-1 rounded-lg ${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'}`}>
          {mobileTabConfig.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? isDarkTheme
                    ? 'bg-[#8a87d6] text-white'
                    : 'bg-[#8a87d6] text-white'
                  : isDarkTheme
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-[#424250]'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      {isMobile ? (
        // Mobile: Tabbed interface
        <div className="space-y-6">
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <MorningChecklistSection
                items={checklistItems}
                setItems={setChecklistItems}
                user={user}
                isDarkTheme={isDarkTheme}
              />
              <QuickCaptureSection
                items={quickCaptureItems}
                setItems={setQuickCaptureItems}
                onConvertToTask={handleConvertToTask}
                user={user}
                isDarkTheme={isDarkTheme}
              />
            </div>
          )}
          
          {activeTab === 'tasks' && (
            <TaskListSection
              tasks={tasks}
              setTasks={setTasks}
              user={user}
              isDarkTheme={isDarkTheme}
            />
          )}
          
          {activeTab === 'notes' && (
            <ScratchpadSection
              content={notes}
              setContent={setNotes}
              user={user}
              isDarkTheme={isDarkTheme}
            />
          )}
        </div>
      ) : (
        // Desktop: Grid layout
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Left: Morning Checklist */}
          <div className={`rounded-lg border p-6 ${isDarkTheme ? 'bg-[#424250] border-gray-700' : 'bg-[#f3f4fd] border-gray-200'}`}>
            <MorningChecklistSection
              items={checklistItems}
              setItems={setChecklistItems}
              user={user}
              isDarkTheme={isDarkTheme}
            />
          </div>

          {/* Top Right: Quick Capture */}
          <div className={`rounded-lg border p-6 ${isDarkTheme ? 'bg-[#424250] border-gray-700' : 'bg-[#f3f4fd] border-gray-200'}`}>
            <QuickCaptureSection
              items={quickCaptureItems}
              setItems={setQuickCaptureItems}
              onConvertToTask={handleConvertToTask}
              user={user}
              isDarkTheme={isDarkTheme}
            />
          </div>

          {/* Bottom Left: Personal Notes */}
          <div className={`rounded-lg border p-6 ${isDarkTheme ? 'bg-[#424250] border-gray-700' : 'bg-[#f3f4fd] border-gray-200'}`}>
            <ScratchpadSection
              content={notes}
              setContent={setNotes}
              user={user}
              isDarkTheme={isDarkTheme}
            />
          </div>

          {/* Bottom Right: Task List */}
          <div className={`rounded-lg border p-6 ${isDarkTheme ? 'bg-[#424250] border-gray-700' : 'bg-[#f3f4fd] border-gray-200'}`}>
            <TaskListSection
              tasks={tasks}
              setTasks={setTasks}
              user={user}
              isDarkTheme={isDarkTheme}
            />
          </div>
        </div>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <PinAuthModal
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onSuccess={handlePinSuccess}
          hasExistingPin={hasPin}
          user={user}
          isDarkTheme={isDarkTheme}
        />
      )}
    </div>
  );
};

export default MyDeskView;

