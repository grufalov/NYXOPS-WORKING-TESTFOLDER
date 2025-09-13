import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, AlertTriangle, Eye, ArrowUp, CheckCircle, X, Edit, MoreHorizontal, FileText, Trash2, ExternalLink, Clock, User, Building } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import { formatDateDisplay } from '../utils/formatDate.js';
import { FEATURES } from '../config/features.js';

// Import v1.5 components
import AdvisoryIssueTable from '../components/AdvisoryIssueTable.jsx';
import AddAdvisoryIssueModalV15 from '../modals/AddAdvisoryIssueModalV15.jsx';
import PromoteToCaseModalV15 from '../modals/PromoteToCaseModalV15.jsx';

// Import legacy components
import AdvisoryIssueCard from '../components/AdvisoryIssueCard.jsx';
import AddAdvisoryIssueModal from '../modals/AddAdvisoryIssueModal.jsx';
import EditAdvisoryIssueModal from '../modals/EditAdvisoryIssueModal.jsx';

/**
 * Advisory Issues View with v1.5 Integration
 * Conditionally renders enhanced table layout or legacy card layout based on feature flag
 */
const AdvisoryIssuesView = ({ user, isDarkTheme = true, onPromoteToCase }) => {
  const [advisoryIssues, setAdvisoryIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [promotingItem, setPromotingItem] = useState(null);
  
  // Enhanced filters for v1.5
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'active',
    business_stakeholder: '',
    practice: '',
    search: '',
    // v1.5 specific filters
    category: 'all',
    severity: 'all',
    owner: 'all',
    dateRange: 'all'
  });
  
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Feature flag check
  const isV15Enabled = FEATURES.ADVISORY_V15;

  // Load advisory issues with enhanced data for v1.5
  useEffect(() => {
    if (user) {
      loadAdvisoryIssues();
    }
  }, [user]);

  const loadAdvisoryIssues = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('advisory_issues')
        .select('*, advisory_issue_notes(*)');

      // Add v1.5 fields if enabled
      if (isV15Enabled) {
        query = supabase
          .from('advisory_issues')
          .select(`
            *,
            advisory_issue_notes(*),
            owner:owner(email, user_metadata),
            advisory_issues_with_age(*)
          `);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
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

  // Add new advisory issue (enhanced for v1.5)
  const addAdvisoryIssue = async (itemData) => {
    try {
      const insertData = {
        ...itemData,
        user_id: user.id,
        created_by: user.id
      };

      // Add v1.5 specific fields
      if (isV15Enabled) {
        insertData.owner = itemData.owner || user.id;
        insertData.description = itemData.description || '';
        insertData.category = itemData.category || 'operational';
        insertData.severity = itemData.severity || 'medium';
      }

      const { data, error } = await supabase
        .from('advisory_issues')
        .insert([insertData])
        .select();
      
      if (!error && data) {
        setAdvisoryIssues([data[0], ...advisoryIssues]);
        await logActivity(data[0].id, 'created', { title: itemData.title, type: itemData.type });
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding advisory issue:', error);
    }
  };

  // Update advisory issue (enhanced for v1.5)
  const updateAdvisoryIssue = async (id, updates) => {
    try {
      const oldItem = advisoryIssues.find(item => item.id === id);
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('advisory_issues')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (!error && data) {
        setAdvisoryIssues(advisoryIssues.map(item => item.id === id ? data[0] : item));
        
        // Log activity for status or type changes
        if (updates.status && updates.status !== oldItem?.status) {
          await logActivity(id, 'status_changed', { 
            from: oldItem.status, 
            to: updates.status 
          });
        }
        if (updates.type && updates.type !== oldItem?.type) {
          await logActivity(id, 'type_changed', { 
            from: oldItem.type, 
            to: updates.type 
          });
        }
        
        setShowEditModal(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Error updating advisory issue:', error);
    }
  };

  // Delete advisory issue
  const deleteAdvisoryIssue = async (id) => {
    if (!confirm('Are you sure you want to delete this advisory issue? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('advisory_issues')
        .delete()
        .eq('id', id);
      
      if (!error) {
        setAdvisoryIssues(advisoryIssues.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting advisory issue:', error);
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

  // Edit note (v1.5 feature)
  const editNote = async (noteId, content) => {
    if (!isV15Enabled) return;

    try {
      const { data, error } = await supabase
        .from('advisory_issue_notes')
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .select();
      
      if (!error && data) {
        // Update the note in the advisory issues
        setAdvisoryIssues(advisoryIssues.map(item => ({
          ...item,
          advisory_issue_notes: item.advisory_issue_notes?.map(note =>
            note.id === noteId ? data[0] : note
          ) || []
        })));
      }
    } catch (error) {
      console.error('Error editing note:', error);
    }
  };

  // Delete note (v1.5 feature)
  const deleteNote = async (noteId) => {
    if (!isV15Enabled) return;

    try {
      const { error } = await supabase
        .from('advisory_issue_notes')
        .delete()
        .eq('id', noteId);
      
      if (!error) {
        // Remove the note from advisory issues
        setAdvisoryIssues(advisoryIssues.map(item => ({
          ...item,
          advisory_issue_notes: item.advisory_issue_notes?.filter(note => note.id !== noteId) || []
        })));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Promote to case (enhanced for v1.5)
  const promoteToCase = async (promotionData) => {
    try {
      const { issueId, priority, additionalNotes, retainOriginal, notifyStakeholders } = promotionData;
      const issue = advisoryIssues.find(item => item.id === issueId);
      
      if (!issue) return;

      // Create the case
      const caseData = {
        title: issue.title,
        description: issue.description || issue.notes || '',
        priority: priority,
        status: 'open',
        type: issue.type,
        business_stakeholder: issue.business_stakeholder,
        practice: issue.practice,
        created_by: user.id,
        // Add additional context
        source_issue_id: issueId,
        additional_notes: additionalNotes
      };

      const { data: caseResult, error: caseError } = await supabase
        .from('cases')
        .insert([caseData])
        .select();

      if (caseError) throw caseError;

      // Handle original issue based on retention setting
      if (!retainOriginal) {
        // Mark as promoted and close
        await updateAdvisoryIssue(issueId, {
          status: 'promoted',
          promoted_to_case_id: caseResult[0].id,
          promoted_at: new Date().toISOString(),
          promoted_by: user.id
        });
      } else {
        // Just mark as promoted but keep active
        await updateAdvisoryIssue(issueId, {
          promoted_to_case_id: caseResult[0].id,
          promoted_at: new Date().toISOString(),
          promoted_by: user.id
        });
      }

      // Log activity
      await logActivity(issueId, 'promoted_to_case', {
        case_id: caseResult[0].id,
        priority: priority,
        retained: retainOriginal
      });

      // Notify callback
      if (onPromoteToCase) {
        onPromoteToCase(caseResult[0]);
      }

      setShowPromoteModal(false);
      setPromotingItem(null);

      // Reload to get updated data
      loadAdvisoryIssues();

    } catch (error) {
      console.error('Error promoting to case:', error);
      throw error;
    }
  };

  // Log activity helper
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

  // Filter and sort issues (enhanced for v1.5)
  const getFilteredAndSortedIssues = () => {
    let filtered = advisoryIssues.filter(issue => {
      // Basic filters
      if (filters.type !== 'all' && issue.type !== filters.type) return false;
      
      // Status filter
      if (filters.status === 'active' && ['closed', 'promoted'].includes(issue.status)) return false;
      if (filters.status !== 'active' && filters.status !== 'all' && issue.status !== filters.status) return false;

      if (filters.business_stakeholder && !issue.business_stakeholder?.toLowerCase().includes(filters.business_stakeholder.toLowerCase())) return false;
      if (filters.practice && !issue.practice?.toLowerCase().includes(filters.practice.toLowerCase())) return false;

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchFields = [
          issue.title,
          issue.description,
          issue.notes,
          issue.business_stakeholder,
          issue.practice,
          issue.category
        ].filter(Boolean);
        
        if (!searchFields.some(field => field.toLowerCase().includes(searchTerm))) {
          return false;
        }
      }

      // v1.5 specific filters
      if (isV15Enabled) {
        if (filters.category !== 'all' && issue.category !== filters.category) return false;
        if (filters.severity !== 'all' && issue.severity !== filters.severity) return false;
        if (filters.owner !== 'all' && issue.owner !== filters.owner) return false;
        
        // Date range filter
        if (filters.dateRange !== 'all') {
          const issueDate = new Date(issue.created_at);
          const now = new Date();
          const daysDiff = Math.floor((now - issueDate) / (1000 * 60 * 60 * 24));
          
          switch (filters.dateRange) {
            case 'today':
              if (daysDiff > 0) return false;
              break;
            case 'week':
              if (daysDiff > 7) return false;
              break;
            case 'month':
              if (daysDiff > 30) return false;
              break;
            case 'quarter':
              if (daysDiff > 90) return false;
              break;
          }
        }
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filteredIssues = getFilteredAndSortedIssues();
  const hasFilters = Object.values(filters).some(value => value && value !== 'all' && value !== 'active');

  const clearFilters = () => {
    setFilters({
      type: 'all',
      status: 'active',
      business_stakeholder: '',
      practice: '',
      search: '',
      category: 'all',
      severity: 'all',
      owner: 'all',
      dateRange: 'all'
    });
  };

  // Handle promote action
  const handlePromote = (issue) => {
    setPromotingItem(issue);
    setShowPromoteModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Advisory & Emerging Issues
            {isV15Enabled && (
              <span className={`ml-2 px-2 py-1 text-xs rounded-lg ${
                isDarkTheme ? 'bg-[#8a87d6]/20 text-[#8a87d6]' : 'bg-[#8a87d6] text-[#8a87d6]'
              }`}>
                v1.5
              </span>
            )}
          </h2>
          <p className={`${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mt-1`}>
            {isV15Enabled 
              ? 'Enhanced tracking with markdown support, table layout, and direct exports'
              : 'Lightweight staging area for items that aren\'t full cases yet'
            }
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Issue
        </button>
      </div>

      {/* Render v1.5 table layout or legacy card layout */}
      {isV15Enabled ? (
        <AdvisoryIssueTable
          issues={filteredIssues}
          loading={loading}
          filters={filters}
          onFiltersChange={setFilters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(field, order) => {
            setSortBy(field);
            setSortOrder(order);
          }}
          onStatusToggle={(issueId, newStatus) => updateAdvisoryIssue(issueId, { status: newStatus })}
          onAddNote={addNote}
          onEditNote={editNote}
          onDeleteNote={deleteNote}
          onPromote={handlePromote}
          onEdit={(issue) => {
            setEditingItem(issue);
            setShowEditModal(true);
          }}
          onDelete={deleteAdvisoryIssue}
          isDarkTheme={isDarkTheme}
          user={user}
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          onAddNew={() => setShowAddModal(true)}
        />
      ) : (
        <>
          {/* Legacy Filters and Search */}
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
                  className={`w-full rounded-lg border ${
                    isDarkTheme 
                      ? 'border-slate-600 bg-[#8a87d6] text-slate-100' 
                      : 'border-gray-300 bg-[#f3f4fd] text-gray-900'
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8a87d6]`}
                >
                  <option value="all">All Types</option>
                  <option value="technical">Technical</option>
                  <option value="process">Process</option>
                  <option value="policy">Policy</option>
                  <option value="vendor">Vendor</option>
                  <option value="regulatory">Regulatory</option>
                  <option value="other">Other</option>
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
                  className={`w-full rounded-lg border ${
                    isDarkTheme 
                      ? 'border-slate-600 bg-[#8a87d6] text-slate-100' 
                      : 'border-gray-300 bg-[#f3f4fd] text-gray-900'
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8a87d6]`}
                >
                  <option value="active">Active Only</option>
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Business Stakeholder Filter */}
              <div>
                <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                  Stakeholder
                </label>
                <input
                  type="text"
                  value={filters.business_stakeholder}
                  onChange={(e) => setFilters({ ...filters, business_stakeholder: e.target.value })}
                  placeholder="Filter by stakeholder..."
                  className={`w-full rounded-lg border ${
                    isDarkTheme 
                      ? 'border-slate-600 bg-[#8a87d6] text-slate-100 placeholder-slate-400' 
                      : 'border-gray-300 bg-[#f3f4fd] text-gray-900 placeholder-gray-500'
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8a87d6]`}
                />
              </div>

              {/* Practice Filter */}
              <div>
                <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                  Practice
                </label>
                <input
                  type="text"
                  value={filters.practice}
                  onChange={(e) => setFilters({ ...filters, practice: e.target.value })}
                  placeholder="Filter by practice..."
                  className={`w-full rounded-lg border ${
                    isDarkTheme 
                      ? 'border-slate-600 bg-[#8a87d6] text-slate-100 placeholder-slate-400' 
                      : 'border-gray-300 bg-[#f3f4fd] text-gray-900 placeholder-gray-500'
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8a87d6]`}
                />
              </div>

              {/* Search */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                  Search
                </label>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDarkTheme ? 'text-slate-400' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="Search issues..."
                    className={`w-full rounded-lg border ${
                      isDarkTheme 
                        ? 'border-slate-600 bg-[#8a87d6] text-slate-100 placeholder-slate-400' 
                        : 'border-gray-300 bg-[#f3f4fd] text-gray-900 placeholder-gray-500'
                    } pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8a87d6]`}
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {hasFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 ${
                    isDarkTheme
                      ? 'text-slate-400 hover:text-slate-300 hover:bg-[#8a87d6]'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-[#ffffff]'
                  } transition-colors`}
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Legacy Issues Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8a87d6]"></div>
            </div>
          ) : filteredIssues.length === 0 ? (
            <EmptyState
              isDarkTheme={isDarkTheme}
              hasFilters={hasFilters}
              onAddNew={() => setShowAddModal(true)}
              onClearFilters={clearFilters}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredIssues.map(issue => (
                <AdvisoryIssueCard
                  key={issue.id}
                  issue={issue}
                  onAddNote={addNote}
                  onStatusChange={(newStatus) => updateAdvisoryIssue(issue.id, { status: newStatus })}
                  onDelete={() => deleteAdvisoryIssue(issue.id)}
                  onPromote={() => handlePromote(issue)}
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
        </>
      )}

      {/* Modals */}
      {showAddModal && (
        <>
          {isV15Enabled ? (
            <AddAdvisoryIssueModalV15
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onSubmit={addAdvisoryIssue}
              isDarkTheme={isDarkTheme}
              user={user}
            />
          ) : (
            <AddAdvisoryIssueModal
              onClose={() => setShowAddModal(false)}
              onAdd={addAdvisoryIssue}
              isDarkTheme={isDarkTheme}
            />
          )}
        </>
      )}

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

      {isV15Enabled && showPromoteModal && promotingItem && (
        <PromoteToCaseModalV15
          isOpen={showPromoteModal}
          onClose={() => {
            setShowPromoteModal(false);
            setPromotingItem(null);
          }}
          onPromote={promoteToCase}
          issue={promotingItem}
          isDarkTheme={isDarkTheme}
          user={user}
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

