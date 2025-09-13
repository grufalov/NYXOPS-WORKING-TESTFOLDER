import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, ChevronDown, FileText, Download, AlertTriangle, Edit, Edit2, Trash2, MoreVertical, X, Star } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import { formatDateDisplay } from '../utils/formatDate.js';
import SimpleNotesTimeline from '../components/SimpleNotesTimeline.jsx';
import BackgroundDoodles from '../components/decors/BackgroundDoodles.jsx';
import AddAdvisoryIssueModal from '../modals/AddAdvisoryIssueModal.jsx';
import EditAdvisoryIssueModal from '../modals/EditAdvisoryIssueModal.jsx';
import PromoteModal from '../modals/PromoteModal.jsx';
import AdvisoryIssuesReport from './AdvisoryIssuesReport.jsx';
import { exportToCSV, exportToPDF, exportToHTML } from '../utils/exportUtils.js';
import CardPresenter from '../components/CardPresenter.jsx';

// Advisory Issues Component - Simplified v1.5 Implementation
const AdvisoryIssuesView = ({ user, isDarkTheme = true, onPromoteToCase }) => {
  const [advisoryIssues, setAdvisoryIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [promotingItem, setPromotingItem] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showKebabMenu, setShowKebabMenu] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [viewMode, setViewMode] = useState('cards');
  const [filters, setFilters] = useState({
    status: 'open',
    search: ''
  });
  const [isToolbarStuck, setIsToolbarStuck] = useState(false);
  
  const searchInputRef = useRef(null);
  const toolbarSentinelRef = useRef(null);

  // Load advisory issues
  useEffect(() => {
    if (user) {
      loadAdvisoryIssues();
    }
  }, [user]);

  // Close kebab menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowKebabMenu(null);
      setShowExportMenu(false);
    };
    
    if (showKebabMenu || showExportMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showKebabMenu, showExportMenu]);

  // Persist view mode selection across sessions
  useEffect(() => {
    try {
      const saved = localStorage.getItem('advisory.view');
      if (saved === 'cards' || saved === 'list') {
        setViewMode(saved);
      }
    } catch (e) {
      // ignore localStorage errors (e.g., SSR or privacy settings)
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('advisory.view', viewMode);
    } catch (e) {
      // ignore write errors
    }
  }, [viewMode]);

  // Helper function to get simplified status
  const getSimplifiedStatus = (status) => {
    if (!status) return 'open';
    const lowercaseStatus = status.toLowerCase();
    if (lowercaseStatus.includes('resolved') || lowercaseStatus.includes('closed') || lowercaseStatus.includes('complete')) {
      return 'resolved';
    }
    return 'open';
  };

  // Calculate counts and filtered issues
  const statusCounts = {
    all: advisoryIssues.length,
    open: advisoryIssues.filter(issue => getSimplifiedStatus(issue.status) === 'open').length,
    resolved: advisoryIssues.filter(issue => getSimplifiedStatus(issue.status) === 'resolved').length
  };

  const promotedIssuesCount = advisoryIssues.filter(issue => issue.promoted).length;

  // Filter and sort issues based on current filters
  const getFilteredAndSortedIssues = () => {
    let filtered = advisoryIssues;

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(issue => 
        getSimplifiedStatus(issue.status) === filters.status
      );
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(issue =>
        issue.title?.toLowerCase().includes(searchLower) ||
        issue.background?.toLowerCase().includes(searchLower) ||
        issue.business_stakeholder?.toLowerCase().includes(searchLower) ||
        issue.recruiter?.toLowerCase().includes(searchLower) ||
        issue.practice?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by created_at (newest first)
    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const filteredIssues = getFilteredAndSortedIssues();

  // Selection helper functions
  const toggleIssueSelection = (issueId) => {
    setSelectedIssues(prev => 
      prev.includes(issueId) 
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  const selectAllIssues = () => {
    if (selectedIssues.length === filteredIssues.length && filteredIssues.length > 0) {
      setSelectedIssues([]);
    } else {
      setSelectedIssues(filteredIssues.map(issue => issue.id));
    }
  };

  const selectPageIssues = () => {
    const pageIssueIds = filteredIssues.map(issue => issue.id);
    setSelectedIssues(pageIssueIds);
  };

  const clearSelection = () => {
    setSelectedIssues([]);
  };

  // Data loading function
  const loadAdvisoryIssues = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('advisory_issues')
        .select(`
          *,
          advisory_issue_notes (
            id,
            content,
            author,
            created_at,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading advisory issues:', error);
      } else {
        // Calculate age in days for each issue
        const issuesWithAge = data.map(issue => ({
          ...issue,
          age_in_days: Math.floor((new Date() - new Date(issue.created_at)) / (1000 * 60 * 60 * 24))
        }));
        setAdvisoryIssues(issuesWithAge);
      }
    } catch (error) {
      console.error('Error loading advisory issues:', error);
    } finally {
      setLoading(false);
    }
  };

  // Row click opens edit modal
  const toggleRow = (id) => {
    const issue = advisoryIssues.find(issue => issue.id === id);
    setEditingItem(issue);
    setShowEditModal(true);
  };

  // Action handlers
  const handlePromote = (issue) => {
    setPromotingItem(issue);
    setShowPromoteModal(true);
  };

  const handleEdit = (issue) => {
    setEditingItem(issue);
    setShowEditModal(true);
  };

  const handleDelete = async (issue) => {
    if (window.confirm(`Are you sure you want to delete "${issue.title}"?`)) {
      try {
        const { error } = await supabase
          .from('advisory_issues')
          .delete()
          .eq('id', issue.id);

        if (error) {
          console.error('Error deleting issue:', error);
        } else {
          await loadAdvisoryIssues();
        }
      } catch (error) {
        console.error('Error deleting issue:', error);
      }
    }
  };

  const handleExport = (format) => {
    const issuesToExport = selectedIssues.length > 0 
      ? advisoryIssues.filter(issue => selectedIssues.includes(issue.id))
      : filteredIssues;
    
    if (format === 'csv') {
      exportToCSV(issuesToExport, 'advisory-issues');
    } else if (format === 'print') {
      setShowPrintPreview(true);
    }
    setShowExportMenu(false);
  };

  const handleAddAdvisoryIssue = async (issueData) => {
    try {
      const { data, error } = await supabase
        .from('advisory_issues')
        .insert([{
          ...issueData,
          user_id: user?.id
        }])
        .select();

      if (error) {
        console.error('Error adding issue:', error);
      } else {
        setShowAddModal(false);
        await loadAdvisoryIssues();
      }
    } catch (error) {
      console.error('Error adding issue:', error);
    }
  };

  const handleEditComplete = async (updatedData) => {
    try {
      // Separate the newNote from the main update data
      const { newNote, ...issueData } = updatedData;
      
      // Update the advisory issue
      const { error: updateError } = await supabase
        .from('advisory_issues')
        .update(issueData)
        .eq('id', editingItem.id);

      if (updateError) {
        console.error('Error updating issue:', updateError);
        return;
      }

      // If there's a new note, add it to the notes table
      if (newNote && newNote.trim()) {
        const { error: noteError } = await supabase
          .from('advisory_issue_notes')
          .insert([{
            advisory_issue_id: editingItem.id,
            content: newNote.trim(),
            author: user?.email || 'Unknown',
            user_id: user?.id
          }]);

        if (noteError) {
          console.error('Error adding note:', noteError);
        }
      }

      setShowEditModal(false);
      setEditingItem(null);
      await loadAdvisoryIssues();
    } catch (error) {
      console.error('Error updating issue:', error);
    }
  };

  const handlePromotionComplete = async (promotionData) => {
    try {
      // Update the advisory issue to mark it as promoted
      const { error: updateError } = await supabase
        .from('advisory_issues')
        .update({ promoted: true })
        .eq('id', promotingItem.id);

      if (updateError) {
        console.error('Error updating advisory issue:', updateError);
        return;
      }

      // Call the parent callback to create the case
      if (onPromoteToCase) {
        await onPromoteToCase(promotionData);
      }

      setShowPromoteModal(false);
      setPromotingItem(null);
      await loadAdvisoryIssues();
    } catch (error) {
      console.error('Error promoting issue:', error);
    }
  };

  return (
    <div className="space-y-6 relative" data-advisory-view>
      <BackgroundDoodles />
      
      {/* Toolbar Sentinel for Sticky Detection */}
      <div ref={toolbarSentinelRef} className="h-0 -mb-6" />
      
      {/* Sticky Toolbar - Rounded pill design */}
      <div 
        className="sticky top-0 z-30 mb-6"
        style={{ backgroundColor: 'var(--app-bg)' }}
      >
        <div 
          className="mx-6 p-4 rounded-2xl border overflow-visible transition-shadow duration-200 relative z-10"
          style={{ 
            backgroundColor: 'var(--elevated-bg)', 
            borderColor: 'var(--border)',
            boxShadow: isToolbarStuck ? 'var(--shadow-hover)' : 'var(--shadow)'
          }}
          role="region"
          aria-label="Advisory toolbar"
        >
          {/* Page Title - Screen reader only */}
          <h1 className="sr-only">Advisory & Emerging Issues</h1>
          
          <div className="flex flex-wrap items-center gap-4 min-h-[40px]">
            {/* Left: Mini KPIs */}
            <div className="flex items-center gap-3">
              {/* Promoted to Cases KPI - Only show if > 0 */}
              {promotedIssuesCount > 0 && (
                <div 
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm"
                  style={{ 
                    backgroundColor: 'var(--surface-bg)',
                    borderColor: 'var(--border)',
                    height: '36px'
                  }}
                >
                  <span className="font-bold" style={{ color: 'var(--text)' }}>
                    {promotedIssuesCount}
                  </span>
                  <span style={{ color: 'var(--muted)' }}>Promoted to cases</span>
                </div>
              )}
            </div>

            {/* Center: Search - Now gets more space */}
            <div className="relative flex-1 min-w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search issues…"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full h-10 pl-10 pr-10 text-sm rounded-2xl border transition-all focus:ring-2 focus:ring-[#8a87d6] focus:border-[#8a87d6]"
                style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  borderColor: 'var(--border)',
                  color: 'var(--text)'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setFilters(prev => ({ ...prev, search: '' }));
                    e.target.blur();
                  }
                }}
              />
              {!filters.search && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <kbd 
                    className="px-1.5 py-0.5 text-xs border rounded"
                    style={{ 
                      backgroundColor: 'var(--surface-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--muted)'
                    }}
                  >
                    /
                  </kbd>
                </div>
              )}
              {filters.search && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center transition-all hover:bg-gray-200 dark:hover:bg-gray-600"
                  style={{ color: 'var(--muted)' }}
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Center-Right: Segmented Control */}
            <div 
              className="flex rounded-2xl border p-1"
              style={{ 
                backgroundColor: 'var(--card-bg)', 
                borderColor: 'var(--border)',
                height: '40px'
              }}
              role="tablist"
              aria-label="Filter issues by status"
            >
              {[
                { id: 'all', label: 'All', count: statusCounts.all },
                { id: 'open', label: 'Open', count: statusCounts.open },
                { id: 'resolved', label: 'Resolved', count: statusCounts.resolved }
              ].map(({ id, label, count }) => (
                <button
                  key={id}
                  onClick={() => setFilters(prev => ({ ...prev, status: id }))}
                  className="h-8 px-3 text-sm font-medium rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
                  style={{
                    backgroundColor: filters.status === id ? '#8a87d6' : 'transparent',
                    color: filters.status === id ? 'white' : 'var(--text)'
                  }}
                  role="tab"
                  aria-selected={filters.status === id}
                >
                  <span>{label}</span>
                  <span 
                    className="px-1.5 py-0.5 text-xs rounded-full border"
                    style={{ 
                      backgroundColor: filters.status === id ? 'rgba(255,255,255,0.2)' : 'var(--surface-bg)',
                      borderColor: filters.status === id ? 'rgba(255,255,255,0.3)' : 'var(--border)',
                      color: filters.status === id ? 'white' : 'var(--text)',
                      opacity: 0.85
                    }}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* View Mode Control */}
            <div className="ml-2">
              <div 
                className="flex rounded-2xl border p-1"
                style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  borderColor: 'var(--border)',
                  height: '40px'
                }}
                role="tablist"
                aria-label="View mode"
              >
                {[
                  { id: 'cards', label: 'Cards' },
                  { id: 'list', label: 'List' }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setViewMode(id)}
                    className="h-8 px-3 text-sm font-medium rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
                    style={{
                      backgroundColor: viewMode === id ? '#8a87d6' : 'transparent',
                      color: viewMode === id ? 'white' : 'var(--text)'
                    }}
                    role="tab"
                    aria-selected={viewMode === id}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Selection and Actions */}
            <div className="flex items-center gap-3 ml-auto flex-wrap">
              {/* Select All Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAllIssues}
                  className="h-10 px-4 text-sm font-medium rounded-2xl border transition-all hover:border-[#8a87d6] hover:text-[#8a87d6] flex items-center gap-2 whitespace-nowrap"
                  style={{ 
                    backgroundColor: selectedIssues.length === filteredIssues.length && filteredIssues.length > 0 ? '#8a87d6' : 'var(--card-bg)', 
                    borderColor: selectedIssues.length === filteredIssues.length && filteredIssues.length > 0 ? '#8a87d6' : 'var(--border)',
                    color: selectedIssues.length === filteredIssues.length && filteredIssues.length > 0 ? 'white' : 'var(--text)'
                  }}
                  title={selectedIssues.length === filteredIssues.length && filteredIssues.length > 0 ? 'Clear selection' : `Select all ${filteredIssues.length} issues in current filter`}
                >
                  <span>{selectedIssues.length === filteredIssues.length && filteredIssues.length > 0 ? 'Selected' : 'Select all'}</span>
                  <span 
                    className="px-2 py-0.5 text-xs border rounded-full"
                    style={{ 
                      backgroundColor: selectedIssues.length === filteredIssues.length && filteredIssues.length > 0 ? 'rgba(255,255,255,0.2)' : 'var(--surface-bg)',
                      borderColor: selectedIssues.length === filteredIssues.length && filteredIssues.length > 0 ? 'rgba(255,255,255,0.3)' : 'var(--border)',
                      color: selectedIssues.length === filteredIssues.length && filteredIssues.length > 0 ? 'white' : 'var(--text)',
                      opacity: 0.85
                    }}
                  >
                    {filteredIssues.length}
                  </span>
                </button>

                {/* Selected indicator */}
                {selectedIssues.length > 0 && selectedIssues.length < filteredIssues.length && (
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2 py-0.5 text-xs border rounded-full"
                      style={{ 
                        backgroundColor: 'var(--surface-bg)',
                        borderColor: 'var(--border)',
                        color: 'var(--text)',
                        opacity: 0.85
                      }}
                      aria-live="polite"
                    >
                      Selected: {selectedIssues.length}
                    </span>
                    <button
                      onClick={clearSelection}
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-[#8a87d6] transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Export Button */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="h-10 px-4 text-sm font-medium rounded-2xl border transition-all hover:border-[#8a87d6] hover:text-[#8a87d6] flex items-center gap-2"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                  title={selectedIssues.length > 0 ? `Export ${selectedIssues.length} selected` : `Export all (${filteredIssues.length})`}
                >
                  <Download className="w-4 h-4" />
                  Export
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showExportMenu && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-48 rounded-lg border shadow-lg z-10"
                    style={{ 
                      backgroundColor: 'var(--elevated-bg)',
                      borderColor: 'var(--border)',
                      boxShadow: 'var(--shadow-hover)'
                    }}
                  >
                    <div className="py-1">
                      <button
                        onClick={() => handleExport('csv')}
                        className="w-full px-4 py-2 text-left flex items-center gap-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                        style={{ color: 'var(--text)' }}
                      >
                        <FileText className="w-4 h-4" />
                        Export to CSV
                      </button>
                      <button
                        onClick={() => handleExport('print')}
                        className="w-full px-4 py-2 text-left flex items-center gap-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                        style={{ color: 'var(--text)' }}
                      >
                        <FileText className="w-4 h-4" />
                        PDF Print Preview
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Issue Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="h-10 px-4 text-sm font-medium rounded-2xl bg-[#8a87d6] text-white transition-all hover:bg-[#7a77c6] flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Issue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="px-6 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-lg font-medium" style={{ color: 'var(--text)' }}>
                Loading issues...
              </div>
            </div>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertTriangle className="mx-auto mb-4 w-12 h-12" style={{ color: 'var(--muted)' }} />
              <div className="text-lg font-medium" style={{ color: 'var(--text)' }}>
                No issues found
              </div>
              <div className="mt-2" style={{ color: 'var(--muted)' }}>
                {filters.search || filters.status !== 'all' 
                  ? 'Try adjusting your filters to see more results'
                  : 'Get started by adding your first advisory issue'
                }
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {viewMode === 'cards' ? (
              <CardPresenter
                issues={filteredIssues}
                selectedIssues={selectedIssues}
                toggleIssueSelection={toggleIssueSelection}
                onOpenDetails={(issue) => toggleRow(issue.id)}
                onPromote={handlePromote}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDarkTheme={isDarkTheme}
              />
            ) : (
              filteredIssues.map((issue) => (
                <div key={issue.id}>
                  {/* Main Card */}
                  <div
                    className="rounded-2xl border transition-all cursor-pointer group hover:border-[#8a87d6]"
                    style={{ 
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border)',
                      boxShadow: 'var(--shadow)',
                      transform: 'translateY(0px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow)';
                    }}
                    onClick={() => toggleRow(issue.id)}
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Checkbox for selection */}
                          <input
                            type="checkbox"
                            checked={selectedIssues.includes(issue.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleIssueSelection(issue.id);
                            }}
                            className="w-4 h-4 rounded border-2 text-[#8a87d6] focus:ring-[#8a87d6] focus:ring-2"
                            style={{ borderColor: 'var(--border)' }}
                            aria-label={`Select issue: ${issue.title}`}
                          />

                          {/* Title and Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-base truncate" style={{ color: 'var(--text)' }}>
                                {issue.title}
                              </h3>
                              {issue.promoted && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30">
                                  <AlertTriangle className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Promoted</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--muted)' }}>
                              <span>{issue.business_stakeholder || issue.owner || 'Unassigned'}</span>
                              <span>•</span>
                              <span>{issue.recruiter || '-'}</span>
                              <span>•</span>
                              <span>{issue.practice || '-'}</span>
                              <span>•</span>
                              <span>{issue.age_in_days === 1 ? '1 day' : `${issue.age_in_days || 0} days`}</span>
                            </div>
                          </div>

                          {/* Status and Actions */}
                          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                            {/* Status Chip */}
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                getSimplifiedStatus(issue.status) === 'open'
                                  ? 'border-[#8a87d6] text-[#8a87d6] bg-transparent'
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
                              }`}
                            >
                              {getSimplifiedStatus(issue.status) === 'open' ? 'Open' : 'Resolved'}
                            </span>

                            {/* Primary Action - Promote - Always visible */}
                            <button
                              onClick={() => {
                                if (getSimplifiedStatus(issue.status) === 'open' && !issue.promoted) {
                                  handlePromote(issue);
                                }
                              }}
                              className={`h-8 px-3 text-sm font-medium rounded-xl transition-all ${
                                getSimplifiedStatus(issue.status) === 'open' && !issue.promoted
                                  ? 'bg-[#8a87d6] text-white hover:bg-[#7a77c6]'
                                  : 'border border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500'
                              }`}
                              disabled={getSimplifiedStatus(issue.status) !== 'open' || issue.promoted}
                              aria-disabled={getSimplifiedStatus(issue.status) !== 'open' || issue.promoted}
                              title={
                                issue.promoted 
                                  ? 'Issue already promoted'
                                  : getSimplifiedStatus(issue.status) !== 'open'
                                  ? 'Only open issues can be promoted'
                                  : 'Promote issue to case'
                              }
                            >
                              {issue.promoted ? 'Promoted' : 'Promote'}
                            </button>
                            
                            {/* Kebab Menu */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowKebabMenu(showKebabMenu === issue.id ? null : issue.id);
                                }}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                style={{ color: 'var(--muted)' }}
                                aria-label="More actions"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              
                              {showKebabMenu === issue.id && (
                                <div 
                                  className="absolute right-0 top-full mt-2 w-40 rounded-lg border shadow-lg z-10"
                                  style={{ 
                                    backgroundColor: 'var(--elevated-bg)',
                                    borderColor: 'var(--border)',
                                    boxShadow: 'var(--shadow-hover)'
                                  }}
                                >
                                  <div className="py-1">
                                    <button
                                      onClick={() => handleEdit(issue)}
                                      className="w-full px-4 py-2 text-left flex items-center gap-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                                      style={{ color: 'var(--text)' }}
                                    >
                                      <Edit className="w-4 h-4" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(issue)}
                                      className="w-full px-4 py-2 text-left flex items-center gap-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddAdvisoryIssueModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddAdvisoryIssue}
          isDarkTheme={isDarkTheme}
        />
      )}

      {showEditModal && editingItem && (
        <EditAdvisoryIssueModal
          item={editingItem}
          onClose={() => {
            setShowEditModal(false);
            setEditingItem(null);
          }}
          onUpdate={handleEditComplete}
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
          onSubmit={handlePromotionComplete}
          advisoryIssue={promotingItem}
          isDarkTheme={isDarkTheme}
        />
      )}

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 bg-[#f3f4fd]">
          <AdvisoryIssuesReport 
            filters={filters}
            onClose={() => setShowPrintPreview(false)}
          />
        </div>
      )}
    </div>
  );
};

export default AdvisoryIssuesView;

