import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, Download, Plus } from 'lucide-react';
import { 
  searchAndFilterIssues, 
  sortIssues, 
  getIssueSummary,
  getTableColumns
} from '../utils/advisoryHelpers.js';
import { isFeatureEnabled } from '../config/features.js';
import AdvisoryIssueRow from './AdvisoryIssueRow.jsx';

/**
 * AdvisoryIssueTable Component for v1.5
 * Hybrid table layout with expandable rows and comprehensive functionality
 */
const AdvisoryIssueTable = ({
  issues = [],
  user,
  loading = false,
  isDarkTheme = true,
  onAdd,
  onEdit,
  onDelete,
  onPromote,
  onStatusToggle,
  onAddNote,
  onExport
}) => {
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    owner: '',
    promoted: undefined,
    ageRange: undefined
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Responsive detection
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Get table columns based on screen size
  const columns = useMemo(() => getTableColumns(isMobile), [isMobile]);
  
  // Filter and sort issues
  const filteredAndSortedIssues = useMemo(() => {
    const filtered = searchAndFilterIssues(issues, searchQuery, filters);
    return sortIssues(filtered, sortBy, sortOrder);
  }, [issues, searchQuery, filters, sortBy, sortOrder]);
  
  // Summary statistics
  const summary = useMemo(() => getIssueSummary(filteredAndSortedIssues), [filteredAndSortedIssues]);
  
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  
  const toggleRowExpansion = (issueId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(issueId)) {
      newExpanded.delete(issueId);
    } else {
      newExpanded.add(issueId);
    }
    setExpandedRows(newExpanded);
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      status: 'all',
      owner: '',
      promoted: undefined,
      ageRange: undefined
    });
  };
  
  const hasActiveFilters = searchQuery || 
    filters.status !== 'all' || 
    filters.owner || 
    filters.promoted !== undefined || 
    filters.ageRange;
  
  if (!isFeatureEnabled('ADVISORY_V15')) {
    return null;
  }
  
  return (
    <div className={`advisory-issues-table ${
      isDarkTheme ? 'dark' : ''
    }`}>
      {/* Header with search and controls */}
      <div className={`p-4 border-b ${
        isDarkTheme ? 'border-slate-600 bg-[#424250]' : 'border-gray-200 bg-[#f3f4fd]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Title and summary */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className={`text-lg font-semibold ${
                isDarkTheme ? 'text-white' : 'text-gray-900'
              }`}>
                Advisory Issues
              </h2>
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#8a87d6]" />
              )}
            </div>
            <div className={`text-sm mt-1 ${
              isDarkTheme ? 'text-slate-400' : 'text-gray-600'
            }`}>
              {summary.total} total • {summary.open} open • {summary.promoted} promoted
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? isDarkTheme
                    ? 'bg-[#8a87d6] text-white'
                    : 'bg-[#8a87d6] text-white'
                  : isDarkTheme
                    ? 'bg-[#8a87d6] text-slate-300 hover:bg-[#8a87d6]'
                    : 'bg-[#ffffff] text-gray-700 hover:bg-[#f3f4fd]'
              }`}
            >
              <Filter className="w-4 h-4 mr-2 inline" />
              Filter
              {hasActiveFilters && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-[#f3f4fd] bg-opacity-20 rounded">
                  {[
                    searchQuery && 'search',
                    filters.status !== 'all' && 'status',
                    filters.owner && 'owner',
                    filters.promoted !== undefined && 'promoted',
                    filters.ageRange && 'age'
                  ].filter(Boolean).length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => onExport?.('csv')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDarkTheme
                  ? 'bg-[#8a87d6] text-slate-300 hover:bg-[#8a87d6]'
                  : 'bg-[#ffffff] text-gray-700 hover:bg-[#f3f4fd]'
              }`}
              title="Export to CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={onAdd}
              className="px-3 py-2 bg-[#8a87d6] text-white rounded-lg text-sm font-medium hover:bg-[#8a87d6] transition-colors"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Add Issue
            </button>
          </div>
        </div>
        
        {/* Search bar */}
        <div className="mt-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isDarkTheme ? 'text-slate-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issues by title, description, or owner..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDarkTheme
                  ? 'bg-[#8a87d6] border-slate-600 text-white placeholder-slate-400'
                  : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent`}
            />
          </div>
        </div>
        
        {/* Advanced filters */}
        {showFilters && (
          <div className={`mt-4 p-4 rounded-lg border ${
            isDarkTheme ? 'border-slate-600 bg-[#8a87d6]' : 'border-gray-200 bg-[#e3e3f5]'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkTheme
                      ? 'bg-[#424250] border-slate-600 text-white'
                      : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Owner
                </label>
                <input
                  type="text"
                  value={filters.owner}
                  onChange={(e) => handleFilterChange('owner', e.target.value)}
                  placeholder="Filter by owner"
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkTheme
                      ? 'bg-[#424250] border-slate-600 text-white placeholder-slate-400'
                      : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Promotion Status
                </label>
                <select
                  value={filters.promoted === undefined ? 'all' : filters.promoted ? 'promoted' : 'not-promoted'}
                  onChange={(e) => handleFilterChange('promoted', 
                    e.target.value === 'all' ? undefined : e.target.value === 'promoted'
                  )}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkTheme
                      ? 'bg-[#424250] border-slate-600 text-white'
                      : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Issues</option>
                  <option value="promoted">Promoted to Cases</option>
                  <option value="not-promoted">Not Promoted</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Age Range
                </label>
                <select
                  value={filters.ageRange || 'all'}
                  onChange={(e) => handleFilterChange('ageRange', e.target.value === 'all' ? undefined : e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkTheme
                      ? 'bg-[#424250] border-slate-600 text-white'
                      : 'bg-[#f3f4fd] border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Ages</option>
                  <option value="new">New (≤ 7 days)</option>
                  <option value="medium">Medium (8-30 days)</option>
                  <option value="old">Old (&gt; 30 days)</option>
                </select>
              </div>
            </div>
            
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    isDarkTheme
                      ? 'text-slate-300 hover:text-white hover:bg-[#8a87d6]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-[#f3f4fd]'
                  }`}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`${
            isDarkTheme ? 'bg-[#8a87d6]' : 'bg-[#e3e3f5]'
          }`}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-500'
                  } ${column.sortable ? 'cursor-pointer hover:bg-opacity-75' : ''}`}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && sortBy === column.key && (
                      sortOrder === 'asc' 
                        ? <ChevronUp className="w-3 h-3" />
                        : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`${
            isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'
          } divide-y ${isDarkTheme ? 'divide-slate-600' : 'divide-gray-200'}`}>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8a87d6] mr-3" />
                    <span className={isDarkTheme ? 'text-slate-400' : 'text-gray-600'}>
                      Loading issues...
                    </span>
                  </div>
                </td>
              </tr>
            ) : filteredAndSortedIssues.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center">
                  <div className={`text-center ${
                    isDarkTheme ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    {hasActiveFilters ? (
                      <>
                        <div className="mb-2">No issues match your filters</div>
                        <button
                          onClick={clearFilters}
                          className="text-[#8a87d6] hover:text-[#8a87d6] text-sm"
                        >
                          Clear filters to see all issues
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="mb-2">No advisory issues yet</div>
                        <button
                          onClick={onAdd}
                          className="text-[#8a87d6] hover:text-[#8a87d6] text-sm"
                        >
                          Create your first advisory issue
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedIssues.map((issue) => (
                <AdvisoryIssueRow
                  key={issue.id}
                  issue={issue}
                  user={user}
                  isDarkTheme={isDarkTheme}
                  isExpanded={expandedRows.has(issue.id)}
                  onToggleExpand={() => toggleRowExpansion(issue.id)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onPromote={onPromote}
                  onStatusToggle={onStatusToggle}
                  onAddNote={onAddNote}
                  searchQuery={searchQuery}
                  isMobile={isMobile}
                  columns={columns}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer with pagination info */}
      {filteredAndSortedIssues.length > 0 && (
        <div className={`px-4 py-3 border-t ${
          isDarkTheme ? 'border-slate-600 bg-[#424250]' : 'border-gray-200 bg-[#e3e3f5]'
        }`}>
          <div className={`text-sm ${
            isDarkTheme ? 'text-slate-400' : 'text-gray-600'
          }`}>
            Showing {filteredAndSortedIssues.length} of {issues.length} issues
            {hasActiveFilters && (
              <span> (filtered)</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvisoryIssueTable;

