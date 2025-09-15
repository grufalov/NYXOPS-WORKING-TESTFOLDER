import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient.js';
import { Plus, Search, Filter, Calendar, AlertCircle, CheckCircle, Circle, Clock, User, FileText, Settings, LogOut, Home, Briefcase, Users, Edit, Edit2, Trash2, Sun, Moon, Download, Save, Database, Wifi, WifiOff, ChevronDown, Archive, Paperclip, Eye, AlertTriangle, Clipboard } from 'lucide-react';
import nyxopsLogo from './assets/nyxops-crescent.svg';
import { formatDateDisplay } from './utils/formatDate.js';
import AttachmentsModal from './modals/AttachmentsModal.jsx';
import AdvisoryIssuesView from './views/AdvisoryIssuesView.jsx';
import Dashboard from './views/Dashboard.jsx';
import CasesView from './views/CasesView.jsx';
import CaseCard from './components/CaseCard.jsx';
import SimpleLineChart from './components/SimpleLineChart.jsx';
import ProjectsView from './views/ProjectsView.jsx';
import HandoversView from './views/HandoversView.jsx';
import RolesAtRiskView from './views/RolesAtRiskView.jsx';
import RolesAtRiskV2 from './views/RolesAtRiskV2.jsx';
import MyDeskView from './views/MyDeskView.jsx';
import AddCaseModal from './modals/AddCaseModal.jsx';
import EditCaseModal from './modals/EditCaseModal.jsx';
import NextStepsModal from './modals/NextStepsModal.jsx';
import AddHandoverModal from './modals/AddHandoverModal.jsx';
import EditHandoverModal from './modals/EditHandoverModal.jsx';
import EditTaskModal from './modals/EditTaskModal.jsx';
import TaskNotesModal from './modals/TaskNotesModal.jsx';
import NotesModal from './modals/NotesModal.jsx';
import TodoModal from './modals/TodoModal.jsx';
import AddProjectModal from './modals/AddProjectModal.jsx';
import AddRoleModal from './modals/AddRoleModal.jsx';
import ErrorDrawer from './components/ErrorDrawer.jsx';
import JSZip from 'jszip';
import { listAttachments, getDownloadUrl, formatFileSize } from './utils/attachments.js';
import { handleExportData, handleExportWithAttachments } from './utils/exportHelpers.js';
import { isFeatureEnabled } from './config/features.js';
import { NotificationsProvider } from "./providers/NotificationsProvider.jsx";
import { useToastify } from "./utils/withToast.js";
import { useNotifications } from "./hooks/useNotifications.js";
import RolesAtRiskTableV2 from './lab/RolesAtRiskTableV2.jsx';

// Main App Component

const App = () => {
  const { withToast } = useToastify();
  const { notifySuccess, notifyDanger } = useNotifications();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle Supabase OAuth code exchange on mount
  useEffect(() => {
    (async () => {
      if (window.location.href.includes('code=')) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          console.error('Auth exchange error:', error);
        } else {
          console.log('Session established:', data.session);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      // Always check session after exchange attempt
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    })();
  }, []);
  // New state for sidebar features
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true; // Default to dark theme
  });
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('activeTab');
    return savedTab || 'dashboard'; // Default to dashboard
  });
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [projects, setProjects] = useState([]);
  const [handovers, setHandovers] = useState([]);
  const [completedHandovers, setCompletedHandovers] = useState([]);
  
  // Connection status
  const [isConnected, setIsConnected] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [isErrorDrawerOpen, setIsErrorDrawerOpen] = useState(false);
  
  // New state for notes and todos
  const [notes, setNotes] = useState([]);
  const [todos, setTodos] = useState([]);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showAddCaseModal, setShowAddCaseModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [attachmentsCaseId, setAttachmentsCaseId] = useState(null);
  
  // Advisory Issues state
  const [advisoryIssues, setAdvisoryIssues] = useState([]);
  const [promoteToCaseData, setPromoteToCaseData] = useState(null);
  const [promotingAdvisoryId, setPromotingAdvisoryId] = useState(null);

  // Roles at Risk state
  const [rolesAtRisk, setRolesAtRisk] = useState([]);

  // My Desk state
  const [myDeskTaskCount, setMyDeskTaskCount] = useState(0);

  // Navigation counts
  const openCasesCount = cases.filter(c => c.status === 'open').length;
  
  // Advisory issues open count - using same logic as AdvisoryIssuesView
  const getSimplifiedStatus = (status) => {
    const openStatuses = ['under_review', 'investigating', 'monitoring', 'ready_to_escalate'];
    const closedStatuses = ['escalated', 'closed'];
    
    if (openStatuses.includes(status)) return 'open';
    if (closedStatuses.includes(status)) return 'closed';
    return 'open'; // default
  };

  const advisoryIssuesCount = advisoryIssues.filter(issue => getSimplifiedStatus(issue.status) === 'open').length;
  
  const rolesAtRiskCount = rolesAtRisk.length;

  // Keyboard navigation for sidebar
  const navItems = ['dashboard', 'cases', 'advisory', 'roles-at-risk', 'roles-at-risk-v2', 'projects', 'handovers'];
  const [focusedNavIndex, setFocusedNavIndex] = useState(-1);

  // Initialize database tables
  useEffect(() => {
    // Tables should be created manually in Supabase dashboard
    // This automatic creation is disabled due to RPC limitations
    console.log('Database tables should be created manually in Supabase dashboard');
  }, [user]);

  // Load data
  useEffect(() => {
    if (user) {
      console.log('User authenticated, loading data:', user);
      loadCases();
      loadAdvisoryIssues();
      loadProjects();
      loadHandovers();
      loadCompletedHandovers();
      loadNotes();
      loadTodos();
      loadRolesAtRisk();
      checkConnection();
    } else {
      console.log('No user authenticated yet');
    }
  }, [user]);

  // Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  // Persist active tab to localStorage
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // F5 key handler to refresh current page without navigating to Dashboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F5') {
        e.preventDefault();
        window.location.reload();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check connection periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        checkConnection();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const loadCases = async () => {
    console.log('Loading cases...');
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Loading cases:', { data, error, count: data?.length });
    if (!error) {
      setCases(data || []);
      console.log('Cases state updated with:', data?.length, 'cases');
    } else {
      console.error('Error loading cases:', error);
    }
  };

  const loadAdvisoryIssues = async () => {
    console.log('Loading advisory issues...');
    const { data, error } = await supabase
      .from('advisory_issues')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Loading advisory issues:', { data, error, count: data?.length });
    if (!error) {
      setAdvisoryIssues(data || []);
      console.log('Advisory issues state updated with:', data?.length, 'issues');
    } else {
      console.error('Error loading advisory issues:', error);
    }
  };

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setProjects(data || []);
  };

  const loadHandovers = async () => {
    const { data, error } = await supabase
      .from('handovers')
      .select('*')
      .eq('completed', false)  // Only load active handovers
      .eq('deleted', false)    // Only load non-deleted handovers
      .order('created_at', { ascending: false });
    
    if (!error) setHandovers(data || []);
  };

  const loadCompletedHandovers = async () => {
    const { data, error } = await supabase
      .from('handovers')
      .select('*')
      .eq('completed', true)
      .eq('deleted', false)  // Only load non-deleted completed handovers
      .order('created_at', { ascending: false });
    
    if (!error) setCompletedHandovers(data || []);
  };

  const loadNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (!error) setNotes(data || []);
  };

  const loadTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (!error) setTodos(data || []);
  };

  const loadRolesAtRisk = async () => {
    const { data, error } = await supabase
      .from('roles_at_risk')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (!error) setRolesAtRisk(data || []);
  };

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('id')
        .limit(1);
      setIsConnected(!error);
      setConnectionStatus(error ? 'error' : 'connected');
      if (error) {
        notifyDanger('Lost connection to database', {
          id: 'db-disconnect',
          title: 'Database Disconnected',
          description: error.message || 'Cannot reach Supabase',
          sticky: true
        });
      }
    } catch (err) {
      setIsConnected(false);
      setConnectionStatus('error');
      notifyDanger('Lost connection to database', {
        id: 'db-disconnect',
        title: 'Database Disconnected',
        description: err.message || 'Cannot reach Supabase',
        sticky: true
      });
    }
  };

  const addCase = async (caseData) => {
    const data = await withToast("Case", () =>
      supabase.from('cases').insert([{ ...caseData, user_id: user.id }]).select()
    );
    if (data?.[0]) setCases([data[0], ...cases]);
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) console.error('Error signing in:', error);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Attachments modal handler
  const openAttachmentsModal = (caseId) => {
    if (!isFeatureEnabled('ATTACHMENTS')) return; // No-op when feature disabled
    setAttachmentsCaseId(caseId);
  };

  const closeAttachmentsModal = () => {
    if (!isFeatureEnabled('ATTACHMENTS')) return; // No-op when feature disabled
    setAttachmentsCaseId(null);
  };

  // Theme toggle function
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    // Update document class for theme switching
    if (!isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Export function with attachments metadata
  const handleExport = async () => {
    await handleExportData(activeTab, { cases, projects, handovers, notes, todos });
  };

  // Export with attachments as ZIP
  const handleExportWithAttachmentsWrapper = async () => {
    await handleExportWithAttachments(activeTab, { cases });
  };

  // Force save to database
  const forceSaveToDatabase = async () => {
    try {
      setConnectionStatus('saving');
      
      // Refresh all data to ensure sync
      await Promise.all([
        loadCases(),
        loadAdvisoryIssues(),
        loadProjects(),
        loadHandovers(),
        loadCompletedHandovers(),
        loadNotes(),
        loadTodos(),
        loadRolesAtRisk()
      ]);
      
      setConnectionStatus('connected');
      
      // Show success message briefly
      setTimeout(() => {
        setConnectionStatus('connected');
      }, 2000);
      
    } catch (error) {
      console.error('Error syncing with database:', error);
      setConnectionStatus('error');
    }
  };
  
  const updateCase = async (id, updates) => {
    const data = await withToast("Case", () =>
      supabase.from('cases').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select()
    );
    if (data?.[0]) setCases(cases.map(c => c.id === id ? data[0] : c));
  };

  const deleteCase = async (caseId) => {
    try {
      // First, check if this case was promoted from an advisory issue
      const { data: advisoryIssues, error: checkError } = await supabase
        .from('advisory_issues')
        .select('id, promoted_case_id')
        .eq('promoted_case_id', caseId);
      if (checkError) throw new Error(`Error checking advisory issues: ${checkError.message}`);
      if (advisoryIssues && advisoryIssues.length > 0) {
        const { error: updateError } = await supabase
          .from('advisory_issues')
          .update({ promoted_case_id: null, status: 'monitoring', updated_at: new Date().toISOString() })
          .eq('promoted_case_id', caseId);
        if (updateError) throw new Error(`Error updating advisory issues: ${updateError.message}`);
      }
      await withToast("Case", () =>
        supabase.from('cases').delete().eq('id', caseId).select()
      );
      setCases(cases.filter(c => c.id !== caseId));
    } catch (err) {
      alert(`Error deleting case: ${err.message}`);
    }
  };

  // Promote Advisory Issue to Case
  const handlePromoteToCase = (caseData, advisoryIssueId) => {
    setPromoteToCaseData(caseData);
    setPromotingAdvisoryId(advisoryIssueId);
    setShowAddCaseModal(true);
  };

  // Modified addCase to handle promotion from advisory issues
  const addCaseFromPromotion = async (caseData) => {
    console.log('=== PROMOTION FLOW START ===');
    console.log('User:', user?.id);
    console.log('Promoting advisory issue to case with data:', caseData);
    
    // Validate required fields
    if (!caseData.attract_id || !caseData.subject) {
      console.error('Missing required fields:', { attract_id: caseData.attract_id, subject: caseData.subject });
      alert('Error: Missing required fields (attract_id or subject)');
      return;
    }
    
    // Prepare the complete case data
    const completeData = {
      ...caseData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Complete case data to insert:', completeData);
    
    try {
      const { data, error } = await supabase
        .from('cases')
        .insert([completeData])
        .select();
      
      console.log('Case insertion result:', { data, error });
      
      if (error) {
        console.error('Database error:', error);
        alert(`Error creating case: ${error.message}`);
        return;
      }
      
      if (!data || data.length === 0) {
        console.error('No data returned from insert operation');
        alert('Error: No data returned from case creation');
        return;
      }
      
      console.log('Case created successfully:', data[0]);
      
      // Update the cases state immediately
      console.log('Current cases count:', cases.length);
      setCases(prevCases => {
        const newCases = [data[0], ...prevCases];
        console.log('Updated cases count:', newCases.length);
        return newCases;
      });
      
      // Also refresh the cases list to ensure consistency
      console.log('Loading fresh cases from database');
      await loadCases();
      
      // Update the advisory issue to escalated status
      if (promotingAdvisoryId) {
        console.log('Updating advisory issue status to escalated');
        const { error: updateError } = await supabase
          .from('advisory_issues')
          .update({ 
            status: 'escalated',
            promoted_case_id: data[0].id,
            updated_at: new Date().toISOString()
          })
          .eq('id', promotingAdvisoryId);
        
        if (updateError) {
          console.error('Error updating advisory issue:', updateError);
        } else {
          console.log('Advisory issue updated successfully');
        }
      }
      
      notifySuccess("Case created successfully");
      
      // Close modal and clear promotion state
      setShowAddCaseModal(false);
      setPromoteToCaseData(null);
      setPromotingAdvisoryId(null);
      
      // Switch to Cases tab to show the new case
      console.log('Switching to cases tab');
      setActiveTab('cases');
      
      console.log('=== PROMOTION FLOW COMPLETE ===');
      
    } catch (err) {
      console.error('Unexpected error:', err);
      alert(`Unexpected error: ${err.message}`);
    }
  };

  // Project Management
  const addProject = async (projectData) => {
    const { data, error } = await supabase
      .from('projects')
      .insert([{ ...projectData, user_id: user.id }])
      .select();
    
    if (!error && data) {
      setProjects([data[0], ...projects]);
      notifySuccess("Project created successfully");
    }
  };

  const updateProject = async (id, updates) => {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    
    if (!error && data) {
      setProjects(projects.map(p => p.id === id ? data[0] : p));
      notifySuccess("Project updated successfully");
    }
  };

  // Roles at Risk Management
  const addRole = async (roleData) => {
    const data = await withToast("Role", () =>
      supabase.from('roles_at_risk').insert([{ ...roleData, user_id: user.id }]).select()
    );
    if (data?.[0]) setRolesAtRisk([data[0], ...rolesAtRisk]);
  };

  const updateRole = async (id, updates) => {
    const data = await withToast("Role", () =>
      supabase.from('roles_at_risk').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select()
    );
    if (data?.[0]) setRolesAtRisk(rolesAtRisk.map(r => r.id === id ? data[0] : r));
  };

  const deleteRole = async (id) => {
    await withToast("Role", () =>
      supabase.from('roles_at_risk').delete().eq('id', id)
    );
    setRolesAtRisk(rolesAtRisk.filter(r => r.id !== id));
  };

  const addTLUpdate = async (roleId, content) => {
    const role = rolesAtRisk.find(r => r.id === roleId);
    if (!role) return;

    let newUpdate;
    
    // Handle both string content and object with author/date
    if (typeof content === 'string') {
      newUpdate = {
        content,
        author: user?.user_metadata?.name || user?.email || 'Team Lead',
        created_at: new Date().toISOString()
      };
    } else {
      // content is an object with author and created_at
      newUpdate = {
        content: content.content,
        author: content.author,
        created_at: content.created_at ? new Date(content.created_at).toISOString() : new Date().toISOString()
      };
    }

    const updatedTLUpdates = [newUpdate, ...(role.team_lead_updates || [])];

    await updateRole(roleId, { team_lead_updates: updatedTLUpdates });
  };

  const addMyInput = async (roleId, content) => {
    const role = rolesAtRisk.find(r => r.id === roleId);
    if (!role) return;

    const newInput = {
      content,
      author: user?.user_metadata?.name || user?.email || 'You',
      created_at: new Date().toISOString()
    };

    const updatedMyInputs = [newInput, ...(role.my_input_entries || [])];

    await updateRole(roleId, { my_input_entries: updatedMyInputs });
  };

  const promoteRoleToCase = (role) => {
    // Prepare case data from role
    const transferNote = `Promoted from Roles at Risk:\n\n` +
      `Role: ${role.title}\n` +
      `Practice: ${role.practice}\n` +
      `Risk Level: ${role.risk_level}\n` +
      `Days Open: ${Math.floor((new Date() - new Date(role.open_date)) / (1000 * 60 * 60 * 24))} days\n` +
      `Attract ID: ${role.req_id || 'N/A'}\n\n` +
      `SUMMARY:\n${role.summary || 'No summary provided'}\n\n` +
      (role.team_lead_updates?.length > 0 ? 
        `TEAM LEAD UPDATES:\n${role.team_lead_updates.map(u => 
          `${u.created_at.split('T')[0]} - ${u.author}: ${u.content}`
        ).join('\n')}\n\n` : '') +
      (role.my_input ? `MY INPUT:\n${role.my_input}\n\n` : '') +
      `--- Transfer Note from Roles at Risk ---`;

    const caseData = {
      attract_id: role.req_id || '',
      subject: role.title,
      candidate: '',
      practice: role.practice,
      recruiter: role.recruiter || '',
      priority: role.risk_level === 'high' ? 'High' : role.risk_level === 'medium' ? 'Medium' : 'Low',
      status: 'open',
      opened_date: new Date().toISOString().split('T')[0],
      notes: transferNote
    };

    // Set the promotion data and show add case modal
    setPromoteToCaseData(caseData);
    setShowAddCaseModal(true);
    
    // Update role status to escalated
    updateRole(role.id, { status: 'escalated' });
  };

  // Handover Management
  const addHandover = async (handoverData) => {
    const { data, error } = await supabase
      .from('handovers')
      .insert([{ ...handoverData, user_id: user.id }])
      .select();
    
    if (!error && data) {
      setHandovers([data[0], ...handovers]);
      notifySuccess("Handover created successfully");
    }
  };

  const updateHandover = async (handoverId, updateData) => {
    const { data, error } = await supabase
      .from('handovers')
      .update(updateData)
      .eq('id', handoverId)
      .select();
    
    if (!error && data) {
      setHandovers(handovers.map(h => h.id === handoverId ? data[0] : h));
      notifySuccess("Handover updated successfully");
    }
  };

  const markHandoverCompleted = async (handoverId, completed = true) => {
    const { data, error } = await supabase
      .from('handovers')
      .update({ completed })
      .eq('id', handoverId)
      .select();
    
    if (!error && data) {
      const updatedHandover = data[0];
      
      if (completed) {
        // Move from active to completed
        setHandovers(handovers.filter(h => h.id !== handoverId));
        setCompletedHandovers([updatedHandover, ...completedHandovers]);
      } else {
        // Move from completed to active
        setCompletedHandovers(completedHandovers.filter(h => h.id !== handoverId));
        setHandovers([updatedHandover, ...handovers]);
      }
      
      notifySuccess(`Handover marked ${completed ? 'completed' : 'active'} successfully`);
      
      // Show toast notification
      const message = completed 
        ? "Handover marked completed (preserved in DB)" 
        : "Handover unmarked (returned to active)";
      // You can implement a toast notification system here
      console.log(message);
    }
  };

  const softDeleteHandover = async (handoverId) => {
    const { data, error } = await supabase
      .from('handovers')
      .update({ deleted: true })
      .eq('id', handoverId)
      .select();
    
    if (!error && data) {
      // Remove from current view since we only show non-deleted items
      setHandovers(handovers.filter(h => h.id !== handoverId));
      notifySuccess("Handover soft-deleted (preserved in DB)");
      
      // Show toast notification
      console.log("Handover soft-deleted (preserved in DB) — to restore, set deleted=false");
    }
  };

  const deleteHandover = async (handoverId) => {
    const { error } = await supabase
      .from('handovers')
      .delete()
      .eq('id', handoverId);
    
    if (!error) {
      setHandovers(handovers.filter(h => h.id !== handoverId));
    }
  };

  // Notes Management
  const addNote = async (noteContent) => {
    const data = await withToast("Note", () =>
      supabase.from('notes').insert([{ 
        content: noteContent, 
        user_id: user.id,
        created_at: new Date().toISOString()
      }]).select()
    );
    if (data?.[0]) {
      setNotes([data[0], ...notes]);
      setShowNotesModal(false);
    }
  };

  const deleteNote = async (noteId) => {
    await withToast("Note", () =>
      supabase.from('notes').delete().eq('id', noteId)
    );
    setNotes(notes.filter(note => note.id !== noteId));
  };

  // Todos Management
  const addTodo = async (todoData) => {
    const data = await withToast("Todo", () =>
      supabase.from('todos').insert([{ 
        ...todoData,
        user_id: user.id,
        completed: false,
        created_at: new Date().toISOString()
      }]).select()
    );
    if (data?.[0]) {
      setTodos([data[0], ...todos]);
      setShowTodoModal(false);
      setEditingTodo(null);
    }
  };

  const updateTodo = async (todoId, updates) => {
    const data = await withToast("Todo", () =>
      supabase.from('todos').update(updates).eq('id', todoId).select()
    );
    if (data?.[0]) {
      setTodos(todos.map(todo => todo.id === todoId ? data[0] : todo));
      setShowTodoModal(false);
      setEditingTodo(null);
    }
  };

  const toggleTodo = async (todoId) => {
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
      await updateTodo(todoId, { completed: !todo.completed });
    }
  };

  const deleteTodo = async (todoId) => {
    await withToast("Todo", () =>
      supabase.from('todos').delete().eq('id', todoId)
    );
    setTodos(todos.filter(todo => todo.id !== todoId));
  };

  const editTodo = (todo) => {
    setEditingTodo(todo);
    setShowTodoModal(true);
  };

  // Case Notes Management
  const addCaseNote = async (caseId, noteContent) => {
    // For now, let's add it to the case's notes field as JSONB
    const case_ = cases.find(c => c.id === caseId);
    if (!case_) return;

    const newNote = {
      id: Date.now(), // temporary ID
      content: noteContent,
      author: user.user_metadata?.full_name || user.email,
      created_at: new Date().toISOString()
    };

    const existingNotes = case_.notes || [];
    const updatedNotes = [newNote, ...existingNotes];

    const { data, error } = await supabase
      .from('cases')
      .update({ notes: updatedNotes })
      .eq('id', caseId)
      .select();

    if (!error && data) {
      setCases(cases.map(c => c.id === caseId ? data[0] : c));
    }
  };

  const updateCaseNote = async (caseId, noteId, newContent, newDate = null) => {
    const case_ = cases.find(c => c.id === caseId);
    if (!case_) return;

    const existingNotes = case_.notes || [];
    const updatedNotes = existingNotes.map(note => 
      note.id === noteId 
        ? { 
            ...note, 
            content: newContent, 
            created_at: newDate ? `${newDate}T${note.created_at ? note.created_at.split('T')[1] : '12:00:00.000Z'}` : note.created_at,
            updated_at: new Date().toISOString() 
          }
        : note
    );

    const { data, error } = await supabase
      .from('cases')
      .update({ notes: updatedNotes })
      .eq('id', caseId)
      .select();

    if (!error && data) {
      setCases(cases.map(c => c.id === caseId ? data[0] : c));
    }
  };

  const deleteCaseNote = async (caseId, noteId) => {
    const case_ = cases.find(c => c.id === caseId);
    if (!case_) return;

    const existingNotes = case_.notes || [];
    const updatedNotes = existingNotes.filter(note => note.id !== noteId);

    const { data, error } = await supabase
      .from('cases')
      .update({ notes: updatedNotes })
      .eq('id', caseId)
      .select();

    if (!error && data) {
      setCases(cases.map(c => c.id === caseId ? data[0] : c));
    }
  };

  // Next Steps CRUD functions
  const updateCaseNextSteps = async (caseId, nextSteps) => {
    const { data, error } = await supabase
      .from('cases')
      .update({ next_steps: nextSteps })
      .eq('id', caseId)
      .select();

    if (!error && data) {
      setCases(cases.map(c => c.id === caseId ? data[0] : c));
    }
  };

  const deleteCaseNextSteps = async (caseId) => {
    const { data, error } = await supabase
      .from('cases')
      .update({ next_steps: null })
      .eq('id', caseId)
      .select();

    if (!error && data) {
      setCases(cases.map(c => c.id === caseId ? data[0] : c));
    }
  };

  // Export Cases functionality with multiple formats
  const exportCasesData = async (format = 'json') => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const casesToExport = cases.length > 0 ? cases : [];
      
      if (casesToExport.length === 0) {
        alert('No cases to export. Please add some cases first.');
        return;
      }

      const filename = `cases_export_${timestamp}`;
      let content, mimeType, fileExtension;
      
      switch (format) {
        case 'csv':
          // CSV format - great for Excel
          const csvData = [
            ['Case ID', 'Subject', 'Status', 'Priority', 'Practice', 'Candidate', 'Created', 'Next Steps', 'Notes Count'],
            ...casesToExport.map(case_ => [
              case_.attract_id || '',
              case_.subject || '',
              case_.status || '',
              case_.priority || '',
              case_.practice || '',
              case_.candidate || '',
              case_.created_at ? formatDateDisplay(case_.created_at) : '',
              (case_.next_steps || '').replace(/\n/g, ' '),
              (case_.notes || []).length
            ])
          ];
          
          content = csvData.map(row => 
            row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
          ).join('\n');
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
          
        case 'txt':
          // Plain text format
          content = `CASES EXPORT REPORT
${'='.repeat(50)}

Export Date: ${formatDateDisplay(new Date())}
Total Cases: ${casesToExport.length}

${'='.repeat(50)}

${casesToExport.map((case_, index) => `
CASE ${index + 1}
${'-'.repeat(30)}
Case ID: ${case_.attract_id || 'N/A'}
Subject: ${case_.subject || 'N/A'}
Status: ${case_.status || 'N/A'}
Priority: ${case_.priority || 'N/A'}
Practice: ${case_.practice || 'N/A'}
Candidate: ${case_.candidate || 'N/A'}
Created: ${case_.created_at ? formatDateDisplay(case_.created_at) : 'N/A'}

Next Steps:
${case_.next_steps || 'No next steps specified'}

Notes (${(case_.notes || []).length}):
${(case_.notes || []).map((note, noteIndex) => 
  `${noteIndex + 1}. ${note.created_at ? formatDateDisplay(note.created_at) : 'No date'} - ${note.author || 'No author'} - ${note.content || 'No content'}`
).join('\n') || 'No notes'}

`).join('\n')}

Generated by Cases & Project Tracker
`;
          mimeType = 'text/plain';
          fileExtension = 'txt';
          break;
          
        case 'html':
          // Beautiful HTML format that looks like the case view
          content = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Cases Export Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #30313E 0%, #30313E 100%);
            color: #e2e8f0;
            line-height: 1.6;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: #30313E;
            border-radius: 16px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
            overflow: hidden;
            border: 1px solid #424250;
        }
        .header { 
            background: linear-gradient(135deg, #8a87d6 0%, #8a87d6 100%);
            color: white;
            padding: 32px; 
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.1;
        }
        .header-content {
            position: relative;
            z-index: 1;
        }
        .header h1 {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .header-info {
            display: flex;
            gap: 24px;
            flex-wrap: wrap;
            font-size: 16px;
            opacity: 0.95;
            align-items: center;
        }
        .header-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 24px;
            font-weight: 600;
            backdrop-filter: blur(10px);
        }
        .content {
            padding: 32px;
        }
        .cases-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
            gap: 24px;
        }
        .case-card {
            background: #424250;
            border-radius: 12px;
            border: 1px solid #475569;
            overflow: hidden;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            position: relative;
        }
        .case-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(to bottom, #e69a96, #8a87d6, #eab308, #f3f4fd);
        }
        .case-card.priority-high::before { background: #e69a96; }
        .case-card.priority-medium::before { background: #8a87d6; }
        .case-card.priority-low::before { background: #f3f4fd; }
        .case-card.priority-normal::before { background: #64748b; }
        
        .case-header {
            padding: 20px;
            border-bottom: 1px solid #475569;
            background: linear-gradient(135deg, #424250 0%, #424250 100%);
        }
        .case-id {
            font-size: 14px;
            color: #60a5fa;
            font-weight: 600;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .case-title {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #f3f4fd;
            line-height: 1.3;
        }
        .case-badges {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        .badge {
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .status-open { background: #e69a96; color: white; }
        .status-resolved { background: #f3f4fd; color: white; }
        .status-in-progress { background: #8a87d6; color: white; }
        .status-pending { background: #8a87d6; color: white; }
        .priority-high { background: #e69a96; color: white; }
        .priority-medium { background: #8a87d6; color: white; }
        .priority-low { background: #f3f4fd; color: white; }
        .priority-normal { background: #64748b; color: white; }
        
        .case-body {
            padding: 20px;
        }
        .case-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
            background: #2d3748;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #4a5568;
        }
        .info-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .info-label {
            color: #94a3b8;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-value {
            color: #f3f4fd;
            font-weight: 600;
            font-size: 14px;
        }
        
        .case-notes {
            background: #2d3748;
            border-radius: 8px;
            padding: 16px;
            border: 1px solid #4a5568;
        }
        .notes-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #4a5568;
        }
        .notes-title {
            font-size: 16px;
            color: #f3f4fd;
            font-weight: 700;
        }
        .notes-count {
            background: #4f46e5;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .notes-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .note {
            background: #1a202c;
            border: 1px solid #2d3748;
            border-radius: 8px;
            padding: 16px;
            position: relative;
            border-left: 3px solid #4f46e5;
        }
        .note-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .note-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #94a3b8;
            font-size: 12px;
            font-weight: 600;
        }
        .note-date {
            background: #374151;
            padding: 4px 8px;
            border-radius: 6px;
        }
        .note-author {
            background: #065f46;
            color: #d1fae5;
            padding: 4px 8px;
            border-radius: 6px;
        }
        .note-text {
            color: #e2e8f0;
            font-size: 14px;
            line-height: 1.5;
            white-space: pre-wrap;
        }
        .empty-notes {
            color: #64748b;
            font-style: italic;
            text-align: center;
            padding: 24px;
            background: #1a202c;
            border-radius: 8px;
            border: 2px dashed #374151;
        }
        
        .footer {
            margin-top: 32px;
            padding: 24px 32px;
            background: #424250;
            border-top: 1px solid #475569;
            text-align: center;
            color: #94a3b8;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
        }
        .footer-left {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .footer-right {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        /* Print Styles */
        @media print {
            body { 
                background: white !important; 
                color: #1a202c !important; 
                padding: 0 !important;
            }
            .container { 
                background: white !important; 
                border: none !important; 
                box-shadow: none !important;
                border-radius: 0 !important;
            }
            .header { 
                background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%) !important; 
                page-break-after: avoid;
            }
            .case-card { 
                background: white !important; 
                border: 1px solid #e2e8f0 !important; 
                page-break-inside: avoid;
                margin-bottom: 20px !important;
            }
            .case-header {
                background: #f7fafc !important;
            }
            .case-body, .case-info, .case-notes, .note {
                background: white !important;
                border-color: #e2e8f0 !important;
            }
            .case-title, .info-value, .notes-title { color: #2d3748 !important; }
            .note-text { color: #2d3748 !important; }
            .empty-notes { background: #f7fafc !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .cases-grid {
                grid-template-columns: 1fr;
            }
            .case-info {
                grid-template-columns: 1fr;
            }
            .footer {
                flex-direction: column;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <h1>📊 Cases Export Report</h1>
                <div class="header-info">
                    <div class="header-badge">📅 ${formatDateDisplay(new Date())}</div>
                    <div class="header-badge">📋 ${casesToExport.length} Total Cases</div>
                    <div class="header-badge">🎯 ${casesToExport.filter(c => c.status === 'open').length} Open</div>
                    <div class="header-badge">✅ ${casesToExport.filter(c => c.status === 'resolved').length} Resolved</div>
                </div>
            </div>
        </div>
        
        <div class="content">
            <div class="cases-grid">
                ${casesToExport.map(case_ => `
                    <div class="case-card priority-${(case_.priority || 'normal').toLowerCase()}">
                        <div class="case-header">
                            <div class="case-id">🔍 ${case_.attract_id || 'No ID Assigned'}</div>
                            <div class="case-title">${case_.subject || 'Untitled Case'}</div>
                            <div class="case-badges">
                                <span class="badge status-${(case_.status || 'open').replace(/\s+/g, '-')}">
                                    ${case_.status === 'open' ? '🔴' : case_.status === 'resolved' ? '✅' : case_.status === 'pending' ? '🟡' : '🔵'} 
                                    ${case_.status || 'Open'}
                                </span>
                                <span class="badge priority-${(case_.priority || 'normal').toLowerCase()}">
                                    ${case_.priority === 'high' ? '🔥' : case_.priority === 'medium' ? '⚡' : case_.priority === 'low' ? '🌱' : '📊'} 
                                    ${case_.priority || 'Normal'} Priority
                                </span>
                            </div>
                        </div>
                        <div class="case-body">
                            <div class="case-info">
                                <div class="info-item">
                                    <div class="info-label">💼 Practice</div>
                                    <div class="info-value">${case_.practice || 'Not Specified'}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">👤 Candidate</div>
                                    <div class="info-value">${case_.candidate || 'Not Assigned'}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">👨‍💼 Recruiter</div>
                                    <div class="info-value">${case_.recruiter || 'Not Assigned'}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">📅 Created</div>
                                    <div class="info-value">${case_.created_at ? formatDateDisplay(case_.created_at) : 'Unknown'}</div>
                                </div>
                            </div>
                            
                            <div class="case-notes">
                                <div class="notes-header">
                                    <div class="notes-title">📝 Case Notes</div>
                                    <div class="notes-count">${(case_.notes || []).length}</div>
                                </div>
                                ${(case_.notes || []).length > 0 ? `
                                    <div class="notes-list">
                                        ${(case_.notes || []).map((note, index) => `
                                            <div class="note">
                                                <div class="note-header">
                                                    <div class="note-meta">
                                                        <div class="note-date">
                                                            📅 ${note.created_at ? formatDateDisplay(note.created_at) : 'No date'}
                                                        </div>
                                                        ${note.author ? `<div class="note-author">👤 ${note.author}</div>` : ''}
                                                    </div>
                                                </div>
                                                <div class="note-text">${(note.content || 'No content provided').replace(/\n/g, '<br>')}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <div class="empty-notes">
                                        💭 No notes have been added to this case yet
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-left">
                <span>🚀 Generated by Cases & Project Tracker</span>
            </div>
            <div class="footer-right">
                <span>📊 ${casesToExport.length} cases exported</span>
                <span>📅 ${formatDateDisplay(new Date())}</span>
            </div>
        </div>
    </div>
</body>
</html>`;
          mimeType = 'text/html';
          fileExtension = 'html';
          break;
          
        default: // json
          content = JSON.stringify({
            cases: casesToExport,
            exportDate: new Date().toISOString(),
            exportFormat: 'json',
            totalCases: casesToExport.length,
            version: '1.0'
          }, null, 2);
          mimeType = 'application/json';
          fileExtension = 'json';
      }
      
      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`Exported ${casesToExport.length} cases as ${fileExtension.toUpperCase()}: ${filename}.${fileExtension}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
};


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-lg font-semibold">Checking authentication…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-[#424250] border border-slate-700 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Damage Control Center</h1>
            <p className="text-slate-400">Manage your cases, projects, and handovers efficiently</p>
          </div>
          <button
            onClick={handleSignIn}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <User className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

return (
  <NotificationsProvider>
    <div className={`min-h-screen transition-colors duration-200 ${isDarkTheme ? 'dark' : ''}`} style={{ backgroundColor: isDarkTheme ? '#30313E' : '#e3e3f5' }}>
      {/* Fixed Sidebar */}
      <nav 
        className="fixed top-0 left-0 z-20 h-screen w-64 border-r transition-colors duration-200"
        style={{ 
          backgroundColor: isDarkTheme ? '#424250' : '#ffffff',
          borderColor: isDarkTheme ? '#52525b' : '#e5e7eb'
        }}
      >
        <div className="flex flex-col h-full relative">
          {/* Header */}
          <div className="px-6 py-6 border-b" style={{ borderColor: isDarkTheme ? '#52525b' : '#e5e7eb' }}>
            {/* Logo and Title */}
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={nyxopsLogo} 
                alt="NyxOps" 
                className="w-10 h-10 opacity-80"
              />
              <div>
                <h1 className="text-lg font-bold leading-tight" style={{ color: isDarkTheme ? '#f8fafc' : '#1e293b' }}>
                  Damage Control
                </h1>
                <p className="text-sm opacity-70" style={{ color: isDarkTheme ? '#f8fafc' : '#1e293b' }}>
                  Center
                </p>
              </div>
            </div>

            {/* Greeting */}
            {user && (
              <p className="mt-8 text-center text-lg leading-relaxed">
                <span className="font-bold italic">Hey <span className="text-[#8a87d6]">{user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</span>,</span><br />
                <span className="font-normal text-base">let's make chaos behave.</span>
              </p>
            )}
            {!user && (
              <p className="mt-8 text-center text-lg font-normal leading-relaxed">
                Let's make chaos behave.
              </p>
            )}
            
            {/* Divider */}
            <div className="mt-8 h-px bg-border"></div>
          </div>

          {/* Navigation Items */}
          <div className="px-3 pt-4 space-y-1">
            {/* Primary Group */}
            <div className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Home },
                { id: 'cases', label: 'Cases', icon: AlertCircle, count: openCasesCount },
                { id: 'advisory', label: 'Advisory issues', icon: Eye, count: advisoryIssuesCount },
                { id: 'roles-at-risk', label: 'Roles at Risk', icon: AlertTriangle, count: rolesAtRiskCount },
                { id: 'roles-at-risk-v2', label: 'Roles at Risk V2', icon: Briefcase }
              ].map(({ id, label, icon: Icon, count }, index) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  onFocus={() => setFocusedNavIndex(index)}
                  tabIndex={focusedNavIndex === index ? 0 : -1}
                  className={`w-full flex items-center gap-2 px-3 py-3 rounded-xl text-left transition-all relative group focus:outline-none focus:ring-2 focus:ring-[#8a87d6] focus:ring-offset-2 ${
                    activeTab === id
                      ? 'bg-[#8a87d6]/8 text-[#8a87d6]' 
                      : 'opacity-70 hover:opacity-100 hover:bg-surface hover:border hover:border-border'
                  }`}
                  aria-current={activeTab === id ? 'page' : undefined}
                  style={{ height: '46px' }}
                >
                  {/* Active indicator */}
                  {activeTab === id && (
                    <div 
                      className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#8a87d6] rounded-r-full"
                      aria-hidden="true"
                    />
                  )}
                  
                  <Icon 
                    className={`w-5 h-5 ${activeTab === id ? 'opacity-90' : ''}`} 
                    aria-hidden="true" 
                  />
                  <span className={`flex-1 ${activeTab === id ? 'opacity-100' : ''}`}>
                    {label}
                  </span>
                  
                  {/* Count pill */}
                  {count > 0 && (
                    <span 
                      className="px-2 py-0.5 text-xs rounded-full bg-surface border border-border opacity-90"
                      aria-label={`${count} items`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Mini divider */}
            <div className="py-2 px-4">
              <div className="h-px bg-border"></div>
            </div>

            {/* Secondary Group */}
            <div className="space-y-1">
              {[
                { id: 'projects', label: 'Projects', icon: Briefcase },
                { id: 'handovers', label: 'Handover', icon: Users }
              ].map(({ id, label, icon: Icon }, secondaryIndex) => {
                const index = 4 + secondaryIndex; // Continue from primary group
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    onFocus={() => setFocusedNavIndex(index)}
                    tabIndex={focusedNavIndex === index ? 0 : -1}
                    className={`w-full flex items-center gap-2 px-3 py-3 rounded-xl text-left transition-all relative group focus:outline-none focus:ring-2 focus:ring-[#8a87d6] focus:ring-offset-2 ${
                      activeTab === id
                        ? 'bg-[#8a87d6]/8 text-[#8a87d6]' 
                        : 'opacity-70 hover:opacity-100 hover:bg-surface hover:border hover:border-border'
                    }`}
                    aria-current={activeTab === id ? 'page' : undefined}
                    style={{ height: '46px' }}
                  >
                    {/* Active indicator */}
                    {activeTab === id && (
                      <div 
                        className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#8a87d6] rounded-r-full"
                        aria-hidden="true"
                      />
                    )}
                    
                    <Icon 
                      className={`w-5 h-5 ${activeTab === id ? 'opacity-90' : ''}`} 
                      aria-hidden="true" 
                    />
                    <span className={`flex-1 ${activeTab === id ? 'opacity-100' : ''}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Group */}
          <div className="absolute bottom-6 left-4 right-4">
            {/* Footer divider */}
            <div className="mb-4 h-px bg-border"></div>
            
            <div className="space-y-2">
              {/* Row A: Dark mode + Sign out (centered) */}
              <div className="flex items-center justify-center gap-1 text-sm" style={{ height: '42px' }}>
                <button
                  onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all opacity-70 hover:opacity-100 hover:bg-surface focus:outline-none focus:ring-1 focus:ring-[#8a87d6]"
              title={isDarkTheme ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>Dark mode</span>
            </button>
            
            <span className="opacity-40 mx-1">·</span>
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all opacity-70 hover:opacity-100 hover:bg-surface focus:outline-none focus:ring-1 focus:ring-[#8a87d6]"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>

          {/* Row B: Database status (centered) */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="font-medium opacity-80">Database:</span>
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#8a87d6]' : 'bg-red-500'}`}></div>
            <span className="opacity-70">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          </div>
        </div>
      </div>
      </nav>

      {/* Main Content */}
      <div className="ml-64 min-h-screen" style={{ backgroundColor: isDarkTheme ? '#30313E' : '#e3e3f5' }}>
        <div className="pt-8 pr-8 pb-8 pl-8">{/* Restored left padding but changed background to match app background */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              cases={cases} 
              projects={projects} 
              handovers={handovers} 
              rolesAtRisk={rolesAtRisk}
              user={user} 
              notes={notes} 
              todos={todos} 
              setActiveTab={setActiveTab}
              isDarkTheme={isDarkTheme}
              // Todo functions
              setShowTodoModal={setShowTodoModal}
              editTodo={editTodo}
              toggleTodo={toggleTodo}
              deleteTodo={deleteTodo}
              // Notes functions
              setShowNotesModal={setShowNotesModal}
              deleteNote={deleteNote}
              // Modal states
              showAddCaseModal={showAddCaseModal}
              setShowAddCaseModal={setShowAddCaseModal}
              showAddProjectModal={showAddProjectModal}
              setShowAddProjectModal={setShowAddProjectModal}
              // CRUD functions
              addCase={addCase}
              addProject={addProject}
              setSelectedCase={setSelectedCase}
            />
          )}
          {activeTab === 'cases' && <CasesView cases={cases} addCase={addCase} updateCase={updateCase} deleteCase={deleteCase} addCaseNote={addCaseNote} updateCaseNote={updateCaseNote} deleteCaseNote={deleteCaseNote} updateCaseNextSteps={updateCaseNextSteps} deleteCaseNextSteps={deleteCaseNextSteps} user={user} isDarkTheme={isDarkTheme} />}
          {activeTab === 'advisory' && <AdvisoryIssuesView user={user} isDarkTheme={isDarkTheme} onPromoteToCase={handlePromoteToCase} />}
          {activeTab === 'projects' && <ProjectsView projects={projects} addProject={addProject} updateProject={updateProject} isDarkTheme={isDarkTheme} />}
          {activeTab === 'my-desk' && <MyDeskView user={user} isDarkTheme={isDarkTheme} />}
          {activeTab === 'roles-at-risk' && <RolesAtRiskView 
            rolesAtRisk={rolesAtRisk}
            addRole={addRole}
            updateRole={updateRole}
            deleteRole={deleteRole}
            addTLUpdate={addTLUpdate}
            addMyInput={addMyInput}
            user={user}
            isDarkTheme={isDarkTheme}
            onPromoteToCase={promoteRoleToCase}
            AddRoleModal={AddRoleModal}
            NotesModal={NotesModal}
          />}
          {activeTab === 'roles-at-risk-v2' && <RolesAtRiskV2 />}
          {activeTab === 'handovers' && <HandoversView 
            handovers={handovers} 
            completedHandovers={completedHandovers}
            addHandover={addHandover} 
            updateHandover={updateHandover} 
            deleteHandover={deleteHandover}
            markHandoverCompleted={markHandoverCompleted}
            softDeleteHandover={softDeleteHandover}
            cases={cases}
            user={user}
            isDarkTheme={isDarkTheme}
            AddHandoverModal={AddHandoverModal}
            EditHandoverModal={EditHandoverModal}
            EditTaskModal={EditTaskModal}
            TaskNotesModal={TaskNotesModal}
          />}
        </div>
      </div>

      {/* Modals */}
      {showNotesModal && (
        <NotesModal
          onClose={() => setShowNotesModal(false)}
          onAdd={addNote}
        />
      )}
      {showTodoModal && (
        <TodoModal
          onClose={() => {
            setShowTodoModal(false);
            setEditingTodo(null);
          }}
          onAdd={addTodo}
          onUpdate={updateTodo}
          editingTodo={editingTodo}
        />
      )}

      {showAddCaseModal && (
        <AddCaseModal
          onClose={() => {
            setShowAddCaseModal(false);
            setPromoteToCaseData(null);
            setPromotingAdvisoryId(null);
          }}
          onAdd={promoteToCaseData ? addCaseFromPromotion : addCase}
          isDarkTheme={isDarkTheme}
          prefilledData={promoteToCaseData}
          isPromotion={!!promoteToCaseData}
        />
      )}

      {showAddProjectModal && (
        <AddProjectModal
          onClose={() => setShowAddProjectModal(false)}
          onAdd={addProject}
          isDarkTheme={isDarkTheme}
        />
      )}

      {/* Attachments Modal */}
      {isFeatureEnabled('ATTACHMENTS') && attachmentsCaseId && (
        <AttachmentsModal
          caseId={attachmentsCaseId}
          isOpen={true}
          onClose={closeAttachmentsModal}
        />
      )}

      
      

      {/* Error Drawer */}
      <ErrorDrawer 
        isOpen={isErrorDrawerOpen}
        onClose={() => setIsErrorDrawerOpen(false)}
        isDarkTheme={isDarkTheme}
      />
    </div></NotificationsProvider>
  );
};

// Cases Component




// Add Case Modal




// Edit Case Modal


// Projects Component


// Handovers Component



// Task Notes Modal

export default App;

