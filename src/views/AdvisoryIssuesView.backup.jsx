import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, ChevronDown, ChevronRight, MoreHorizontal, FileText, Download, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import { formatDateDisplay } from '../utils/formatDate.js';
import SimpleNotesTimeline from '../components/SimpleNotesTimeline.jsx';
import AddAdvisoryIssueModal from '../modals/AddAdvisoryIssueModal.jsx';
import PromoteModal from '../modals/PromoteModal.jsx';
import { exportToCSV, exportToPDF, exportToHTML } from '../utils/exportUtils.js';

// Advisory Issues Component
const AdvisoryIssuesView = ({ user, isDarkTheme = true, onPromoteToCase }) => {
  const [advisoryIssues, setAdvisoryIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promotingItem, setPromotingItem] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [filters, setFilters] = useState({
    status: 'open',
    search: ''
  });

  // Load advisory issues
  useEffect(() => {
    if (user) {
      loadAdvisoryIssues();
    }
  }, [user]);

  const loadAdvisoryIssues = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('advisory_issues_with_age')
        .select('*, advisory_issue_notes(*)')
        .order('last_activity_date', { ascending: false });
      
      if (!error) {
        setAdvisoryIssues(data || []);
      } else {
        console.error('Error loading advisory issues:', error);
      }
    } catch (error) {
      console.error('Error loading advisory issues:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add new advisory issue
  const addAdvisoryIssue = async (itemData) => {
    try {
      const { data, error } = await supabase
        .from('advisory_issues')
        .insert([{ 
          ...itemData, 
          user_id: user.id,
          status: 'open'
        }])
        .select();
      
      if (!error && data) {
        loadAdvisoryIssues(); // Reload to get computed fields
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding advisory issue:', error);
    }
  };

  // Update advisory issue
  const updateAdvisoryIssue = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('advisory_issues')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();
      
      if (!error && data) {
        loadAdvisoryIssues(); // Reload to get computed fields
      }
    } catch (error) {
      console.error('Error updating advisory issue:', error);
    }
  };

  // Promote to case
  const promoteToCase = async (caseData) => {
    try {
      // Create the case
      const { data: caseResult, error: caseError } = await supabase
        .from('cases')
        .insert([{
          title: caseData.title,
          description: caseData.description,
          priority: caseData.priority,
          assigned_to: caseData.assignee,
          notes: caseData.notes,
          status: 'open',
          created_by: user.id
        }])
        .select();

      if (caseError) throw caseError;

      // Update the original issue with promotion metadata
      await updateAdvisoryIssue(caseData.originalIssueId, {
        promoted: true,
        promoted_to_case_id: caseResult[0].id,
        promoted_at: new Date().toISOString(),
        promoted_by: user.id,
        status: 'closed'
      });

      if (onPromoteToCase) {
        onPromoteToCase(caseResult[0]);
      }

    } catch (error) {
      console.error('Error promoting to case:', error);
    }
  };

  // Add note to advisory issue
  const addNote = async (advisoryIssueId, content) => {
    try {
      const { data, error } = await supabase
        .from('advisory_issue_notes')
        .insert([{
          advisory_issue_id: advisoryIssueId,
          content,
          created_by: user.id,
          user_name: user.user_metadata?.full_name || user.email
        }])
        .select();
      
      if (!error && data) {
        // Update the advisory issue with the new note
        setAdvisoryIssues(advisoryIssues.map(item => 
          item.id === advisoryIssueId 
            ? { ...item, advisory_issue_notes: [...(item.advisory_issue_notes || []), data[0]] }
            : item
        ));
        
        await logActivity(advisoryIssueId, 'note_added', { content });
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  // Log activity
  const logActivity = async (advisoryIssueId, action, details = {}) => {
    try {
      await supabase
        .from('advisory_issue_activity')
        .insert([{
          advisory_issue_id: advisoryIssueId,
          action,
          details,
          created_by: user.id,
          user_name: user.user_metadata?.full_name || user.email
        }]);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Filter and sort advisory issues
  const getFilteredAndSortedIssues = () => {
    let filtered = advisoryIssues;

    // Apply status filter (simplified to open/closed)
    if (filters.status === 'open') {
      filtered = filtered.filter(item => item.status === 'open');
    } else if (filters.status === 'closed') {
      filtered = filtered.filter(item => item.status === 'closed');
    }
    
    // Apply search filter (title + description only)
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(search) ||
        (item.description || '').toLowerCase().includes(search)
      );
    }

    return filtered.sort((a, b) => new Date(b.last_activity_date) - new Date(a.last_activity_date));
  }

  const filteredIssues = getFilteredAndSortedIssues();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Advisory & Emerging Issues
          </h2>
          <p className={`${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mt-1`}>
            Lightweight staging area for items that aren't full cases yet
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Item
        </button>
      </div>

      {/* Filters and Search */}
      <div className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-xl p-6 shadow-lg`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Type Filter */}
          <div>
            <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkTheme 
                  ? 'bg-[#8a87d6] border-slate-600 text-white' 
                  : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Types</option>
              <option value="advisory">Advisory</option>
              <option value="emerging">Emerging</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkTheme 
                  ? 'bg-[#8a87d6] border-slate-600 text-white' 
                  : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
              }`}
            >
              <option value="active">Active (Hide Closed)</option>
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="monitoring">Monitoring</option>
              <option value="ready_to_escalate">Ready to Escalate</option>
              <option value="escalated">Escalated</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Business Stakeholder Filter */}
          <div>
            <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
              Business Stakeholder
            </label>
            <input
              type="text"
              placeholder="Filter by stakeholder..."
              value={filters.business_stakeholder}
              onChange={(e) => setFilters({ ...filters, business_stakeholder: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkTheme 
                  ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Practice Filter */}
          <div>
            <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
              Practice
            </label>
            <input
              type="text"
              placeholder="Filter by practice..."
              value={filters.practice}
              onChange={(e) => setFilters({ ...filters, practice: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkTheme 
                  ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Search */}
          <div>
            <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
              Search
            </label>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search title, background, candidate..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
              Sort By
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkTheme 
                  ? 'bg-[#8a87d6] border-slate-600 text-white' 
                  : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
              }`}
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="updated_at-desc">Recently Updated</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <div className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-xl p-8 shadow-lg text-center`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8a87d6] mx-auto"></div>
            <p className={`${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mt-2`}>Loading advisory issues...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <EmptyState 
            isDarkTheme={isDarkTheme} 
            hasFilters={Object.values(filters).some(f => f && f !== 'all' && f !== 'active')}
            onAddNew={() => setShowAddModal(true)}
            onClearFilters={() => setFilters({ type: 'all', status: 'active', business_stakeholder: '', practice: '', search: '' })}
          />
        ) : (
          <div className="grid gap-4">
            {filteredIssues.map(issue => (
              <AdvisoryIssueCard
                key={issue.id}
                issue={issue}
                onUpdate={updateAdvisoryIssue}
                onDelete={deleteAdvisoryIssue}
                onAddNote={addNote}
                onPromote={() => promoteToCase(issue)}
                onEdit={() => {
                  setEditingItem(issue);
                  setShowEditModal(true);
                }}
                isDarkTheme={isDarkTheme}
                user={user}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddAdvisoryIssueModal
          onClose={() => setShowAddModal(false)}
          onAdd={addAdvisoryIssue}
          isDarkTheme={isDarkTheme}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <EditAdvisoryIssueModal
          item={editingItem}
          onClose={() => {
            setShowEditModal(false);
            setEditingItem(null);
          }}
          onUpdate={(updates) => updateAdvisoryIssue(editingItem.id, updates)}
          isDarkTheme={isDarkTheme}
        />
      )}
    </div>
  );
};

// Empty State Component
const EmptyState = ({ isDarkTheme, hasFilters, onAddNew, onClearFilters }) => (
  <div className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-xl p-12 shadow-lg text-center`}>
    <AlertTriangle className={`w-16 h-16 mx-auto mb-4 ${isDarkTheme ? 'text-slate-600' : 'text-gray-400'}`} />
    {hasFilters ? (
      <>
        <h3 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'} mb-2`}>
          No items match your filters
        </h3>
        <p className={`${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mb-6`}>
          Try adjusting your search criteria or clearing filters to see more items.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onClearFilters}
            className={`px-4 py-2 rounded-lg border ${
              isDarkTheme 
                ? 'border-slate-600 text-slate-300 hover:bg-[#8a87d6]' 
                : 'border-gray-300 text-gray-700 hover:bg-[#e3e3f5]'
            } transition-colors`}
          >
            Clear Filters
          </button>
          <button
            onClick={onAddNew}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Add New Item
          </button>
        </div>
      </>
    ) : (
      <>
        <h3 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'} mb-2`}>
          No advisory issues yet
        </h3>
        <p className={`${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mb-6`}>
          Create your first advisory issue to start tracking emerging situations that might need attention.
        </p>
        <button
          onClick={onAddNew}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 mx-auto"
        >
          <Plus className="w-5 h-5" />
          Create First Item
        </button>
      </>
    )}
  </div>
);

export default AdvisoryIssuesView;

