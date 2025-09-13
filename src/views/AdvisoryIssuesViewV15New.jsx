import React, { useState, useEffect } from 'react';
import { Plus, Search, ChevronDown, ChevronRight, Download, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import { formatDateDisplay } from '../utils/formatDate.js';
import SimpleNotesTimeline from '../components/SimpleNotesTimeline.jsx';
import AddAdvisoryIssueModal from '../modals/AddAdvisoryIssueModal.jsx';
import PromoteModal from '../modals/PromoteModal.jsx';
import { exportToCSV, exportToPDF, exportToHTML } from '../utils/exportUtils.js';

// Advisory Issues Component - v1.5 Simplified
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
        loadAdvisoryIssues(); // Reload to get updated notes and activity date
      }
    } catch (error) {
      console.error('Error adding note:', error);
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
  };

  const filteredIssues = getFilteredAndSortedIssues();

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getLatestNote = (notes) => {
    if (!notes || notes.length === 0) return 'No notes';
    const latest = notes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    return latest.content.length > 50 ? latest.content.substring(0, 50) + '...' : latest.content;
  };

  const handleExport = (format) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `advisory-issues-${timestamp}`;
    
    switch (format) {
      case 'csv':
        exportToCSV(filteredIssues, `${filename}.csv`);
        break;
      case 'pdf':
        exportToPDF(filteredIssues, `${filename}.pdf`);
        break;
      case 'html':
        exportToHTML(filteredIssues, `${filename}.html`);
        break;
    }
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Advisory & Emerging Issues
          </h2>
          <p className={`${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mt-1`}>
            Lightweight holding list for potential cases
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                isDarkTheme
                  ? 'border-slate-600 text-slate-300 hover:bg-[#8a87d6]'
                  : 'border-gray-300 text-gray-700 hover:bg-[#e3e3f5]'
              }`}
            >
              <Download className="w-4 h-4" />
            </button>
            
            {showExportMenu && (
              <div className={`absolute right-0 mt-2 w-32 rounded-lg shadow-lg border z-10 ${
                isDarkTheme ? 'bg-[#424250] border-slate-600' : 'bg-[#f3f4fd] border-gray-200'
              }`}>
                <button
                  onClick={() => handleExport('csv')}
                  className={`w-full px-3 py-2 text-left text-sm rounded-t-lg transition-colors ${
                    isDarkTheme ? 'hover:bg-[#8a87d6] text-slate-300' : 'hover:bg-[#e3e3f5] text-gray-700'
                  }`}
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                    isDarkTheme ? 'hover:bg-[#8a87d6] text-slate-300' : 'hover:bg-[#e3e3f5] text-gray-700'
                  }`}
                >
                  Export PDF
                </button>
                <button
                  onClick={() => handleExport('html')}
                  className={`w-full px-3 py-2 text-left text-sm rounded-b-lg transition-colors ${
                    isDarkTheme ? 'hover:bg-[#8a87d6] text-slate-300' : 'hover:bg-[#e3e3f5] text-gray-700'
                  }`}
                >
                  Export HTML
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Issue
          </button>
        </div>
      </div>

      {/* Simplified Filters */}
      <div className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-xl p-4 shadow-lg`}>
        <div className="flex items-center gap-4">
          {/* Status Toggle */}
          <div className="flex items-center">
            <label className={`text-sm font-medium mr-3 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
              Status:
            </label>
            <div className="flex rounded-lg overflow-hidden border">
              <button
                onClick={() => setFilters({ ...filters, status: 'open' })}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  filters.status === 'open'
                    ? 'bg-[#f3f4fd] text-white'
                    : isDarkTheme
                      ? 'bg-[#8a87d6] text-slate-300 hover:bg-[#8a87d6]'
                      : 'bg-[#ffffff] text-gray-600 hover:bg-[#f3f4fd]'
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setFilters({ ...filters, status: 'closed' })}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  filters.status === 'closed'
                    ? 'bg-[#e69a96] text-white'
                    : isDarkTheme
                      ? 'bg-[#8a87d6] text-slate-300 hover:bg-[#8a87d6]'
                      : 'bg-[#ffffff] text-gray-600 hover:bg-[#f3f4fd]'
                }`}
              >
                Closed
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkTheme ? 'text-slate-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search title or description..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                  isDarkTheme 
                    ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#8a87d6]`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-xl p-8 shadow-lg text-center`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8a87d6] mx-auto"></div>
          <p className={`${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mt-2`}>Loading advisory issues...</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <EmptyState 
          isDarkTheme={isDarkTheme} 
          hasFilters={filters.search || filters.status !== 'open'}
          onAddNew={() => setShowAddModal(true)}
          onClearFilters={() => setFilters({ status: 'open', search: '' })}
        />
      ) : (
        <div className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-xl shadow-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#e3e3f5]'}`}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-500'
                  }`}>
                    <div className="w-4"></div>
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-500'
                  }`}>
                    Status
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-500'
                  }`}>
                    Title
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-500'
                  }`}>
                    Owner
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-500'
                  }`}>
                    Latest Note
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-500'
                  }`}>
                    Age
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-500'
                  }`}>
                    Last Activity
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} divide-y ${
                isDarkTheme ? 'divide-slate-700' : 'divide-gray-200'
              }`}>
                {filteredIssues.map((issue) => (
                  <React.Fragment key={issue.id}>
                    {/* Main Row */}
                    <tr className={`hover:${isDarkTheme ? 'bg-[#8a87d6]/50' : 'bg-[#e3e3f5]'} transition-colors`}>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleRow(issue.id)}
                          className={`p-1 rounded transition-colors ${
                            isDarkTheme ? 'hover:bg-[#8a87d6]' : 'hover:bg-[#f3f4fd]'
                          }`}
                        >
                          {expandedRows.has(issue.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => updateAdvisoryIssue(issue.id, { 
                            status: issue.status === 'open' ? 'closed' : 'open' 
                          })}
                          className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            issue.status === 'open'
                              ? 'bg-[#f3f4fd] text-[#e69a96] hover:bg-[#f3f4fd]'
                              : 'bg-[#e69a96] text-[#e69a96] hover:bg-[#e69a96]'
                          }`}
                        >
                          {issue.status === 'open' ? 'Open' : 'Closed'}
                        </button>
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium ${
                        isDarkTheme ? 'text-slate-200' : 'text-gray-900'
                      }`}>
                        {issue.title}
                      </td>
                      <td className={`px-4 py-3 text-sm ${
                        isDarkTheme ? 'text-slate-300' : 'text-gray-600'
                      }`}>
                        {issue.owner || 'Unassigned'}
                      </td>
                      <td className={`px-4 py-3 text-sm ${
                        isDarkTheme ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        {getLatestNote(issue.advisory_issue_notes)}
                      </td>
                      <td className={`px-4 py-3 text-sm ${
                        isDarkTheme ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        {issue.age_days || 0} days
                      </td>
                      <td className={`px-4 py-3 text-sm ${
                        isDarkTheme ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        {formatDateDisplay(issue.last_activity_date)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setPromotingItem(issue);
                              setShowPromoteModal(true);
                            }}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              isDarkTheme
                                ? 'bg-[#8a87d6]/20 text-[#8a87d6] hover:bg-[#8a87d6]/30'
                                : 'bg-[#8a87d6] text-[#8a87d6] hover:bg-[#8a87d6]'
                            }`}
                          >
                            Promote
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {expandedRows.has(issue.id) && (
                      <tr>
                        <td colSpan="8" className={`px-4 py-4 ${
                          isDarkTheme ? 'bg-[#8a87d6]/30' : 'bg-[#e3e3f5]'
                        }`}>
                          <div className="space-y-4">
                            {/* Description */}
                            {issue.description && (
                              <div>
                                <h4 className={`text-sm font-medium mb-2 ${
                                  isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                                }`}>
                                  Description
                                </h4>
                                <p className={`text-sm ${
                                  isDarkTheme ? 'text-slate-400' : 'text-gray-600'
                                }`}>
                                  {issue.description}
                                </p>
                              </div>
                            )}

                            {/* Notes Timeline */}
                            <div>
                              <h4 className={`text-sm font-medium mb-2 ${
                                isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                              }`}>
                                Notes Timeline
                              </h4>
                              <SimpleNotesTimeline
                                notes={issue.advisory_issue_notes || []}
                                onAddNote={(content) => addNote(issue.id, content)}
                                user={user}
                                isDarkTheme={isDarkTheme}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddAdvisoryIssueModal
          onClose={() => setShowAddModal(false)}
          onAdd={addAdvisoryIssue}
          isDarkTheme={isDarkTheme}
        />
      )}

      {showPromoteModal && promotingItem && (
        <PromoteModal
          isOpen={showPromoteModal}
          onClose={() => {
            setShowPromoteModal(false);
            setPromotingItem(null);
          }}
          onPromote={promoteToCase}
          issue={promotingItem}
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

