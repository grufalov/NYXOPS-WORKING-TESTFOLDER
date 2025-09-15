import React, { useState, useEffect, useMemo, useRef } from 'react';
import { withLocalFlags } from '../config/localFlags.js';
import { 
  Search, Download, Upload, MoreVertical, Plus, 
  Filter, X, CheckSquare, Square, Trash2, Settings, Eye, ChevronDown, AlertCircle
} from 'lucide-react';
import BackgroundDoodles from '../components/decors/BackgroundDoodles.jsx';
import RolesTableV2, { INITIAL_COLS } from '../components/RolesTableV2.jsx';
import { supabase } from '../supabaseClient.js';
import { useNotifications } from '../hooks/useNotifications.js';

// Schema-agnostic mapping utilities
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function normalizeToken(str) {
  return str.toLowerCase().replace(/_/g, '');
}

function deriveMapping(rawKeys, expectedKeys) {
  const mapping = {};
  const expectedNormalized = expectedKeys.map(key => ({ 
    original: key, 
    normalized: normalizeToken(key),
    tokens: normalizeToken(key).split(/(?=[A-Z])/).map(t => t.toLowerCase())
  }));
  
  rawKeys.forEach(rawKey => {
    const camelCase = snakeToCamel(rawKey);
    const normalized = normalizeToken(rawKey);
    
    // 1. Direct camelCase match
    const directMatch = expectedKeys.find(k => k === camelCase);
    if (directMatch) {
      mapping[directMatch] = rawKey;
      return;
    }
    
    // 2. Exact normalized match
    const normalizedMatch = expectedNormalized.find(e => e.normalized === normalized);
    if (normalizedMatch) {
      mapping[normalizedMatch.original] = rawKey;
      return;
    }
    
    // 3. Specific field mappings for known schema
    const fieldMappings = {
      'title': 'jobTitle',
      'job_rec_id': 'jobRecId',
      'roma_id': 'romaId',
      'role_type': 'roleType',
      'risk_reasons': 'riskReasons',
      'date_created': 'dateCreated',
      'hiring_manager': 'hiringManager',
      'practice': 'practice',
      'client': 'client',
      'status': 'status',
      'recruiter': 'recruiter'
    };
    
    if (fieldMappings[rawKey] && expectedKeys.includes(fieldMappings[rawKey])) {
      mapping[fieldMappings[rawKey]] = rawKey;
      return;
    }
    
    // 4. Fuzzy matching by tokens for any remaining fields
    const rawTokens = normalized.split(/(?=[A-Z])/).map(t => t.toLowerCase());
    expectedNormalized.forEach(expected => {
      const commonTokens = rawTokens.filter(rt => expected.tokens.some(et => et.includes(rt) || rt.includes(et)));
      if (commonTokens.length > 0 && !mapping[expected.original]) {
        // Simple heuristics for common patterns
        if ((rawKey.includes('title') || rawKey.includes('job')) && expected.original === 'jobTitle') {
          mapping[expected.original] = rawKey;
        } else if ((rawKey.includes('created') || rawKey.includes('date')) && expected.original === 'dateCreated') {
          mapping[expected.original] = rawKey;
        } else if ((rawKey.includes('manager') || rawKey.includes('hiring')) && expected.original === 'hiringManager') {
          mapping[expected.original] = rawKey;
        } else if ((rawKey.includes('reason') || rawKey.includes('risk')) && expected.original === 'riskReasons') {
          mapping[expected.original] = rawKey;
        } else if ((rawKey.includes('rec') || rawKey.includes('job')) && expected.original === 'jobRecId') {
          mapping[expected.original] = rawKey;
        } else if (rawKey.includes('roma') && expected.original === 'romaId') {
          mapping[expected.original] = rawKey;
        } else if ((rawKey.includes('type') || rawKey.includes('role')) && expected.original === 'roleType') {
          mapping[expected.original] = rawKey;
        }
      }
    });
  });
  
  return mapping;
}

function shapeRowsForTable(rawRows, mapping) {
  return rawRows.map(rawRow => {
    const shaped = { id: rawRow.id }; // Always preserve ID
    
    Object.entries(mapping).forEach(([expectedKey, rawKey]) => {
      let value = rawRow[rawKey];
      
      // Handle arrays by joining with ", "
      if (Array.isArray(value)) {
        value = value.join(', ');
      }
      
      shaped[expectedKey] = value;
    });
    
    return shaped;
  });
}

// Toolbar component definitions from RolesAtRiskView
const TableKebabMenu = ({ 
  isOpen, 
  onClose, 
  onDensityChange, 
  onShowColumns, 
  density, 
  isDarkTheme 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className={`absolute right-0 z-20 mt-1 py-1 rounded-lg shadow-lg border min-w-48 ${
      isDarkTheme 
        ? 'bg-slate-700 border-slate-600' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-200 dark:border-slate-600">
        Table Options
      </div>
      
      <button
        onClick={() => {
          onShowColumns();
          onClose();
        }}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:${
          isDarkTheme ? 'bg-[#8a87d6]/10' : 'bg-[#8a87d6]/5'
        } transition-colors`}
      >
        <Eye className="w-4 h-4" />
        Columns...
      </button>
    </div>
  );
};

const MultiSelectDropdown = ({ 
  label, 
  options = [], 
  value = [], 
  onChange, 
  placeholder,
  isDarkTheme 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleToggle = (option) => {
    const newValue = value.includes(option)
      ? value.filter(v => v !== option)
      : [...value, option];
    onChange(newValue);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 rounded-lg border text-left transition-colors ${
          isDarkTheme 
            ? 'bg-slate-700 border-slate-600 text-white hover:border-[#8a87d6]' 
            : 'bg-white border-gray-300 text-gray-900 hover:border-[#8a87d6]'
        } focus:outline-none focus:ring-2 focus:ring-[#8a87d6]/20 focus:border-[#8a87d6]`}
      >
        {value.length === 0 ? (
          <span className="text-gray-500">{placeholder}</span>
        ) : (
          <span>{`${label} (${value.length})`}</span>
        )}
      </button>
      
      {isOpen && (
        <div className={`absolute z-20 w-full mt-1 py-1 rounded-lg shadow-lg border max-h-60 overflow-y-auto ${
          isDarkTheme 
            ? 'bg-slate-700 border-slate-600' 
            : 'bg-white border-gray-200'
        }`}>
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleToggle(option)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2`}
            >
              <input
                type="checkbox"
                checked={value.includes(option)}
                onChange={() => {}} // Handled by button click
                className="rounded border-gray-300"
              />
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ExportDropdown = ({ 
  onExport, 
  hasSelection, 
  selectedCount, 
  totalCount,
  isDarkTheme 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const exportOptions = [
    { key: 'csv', label: 'Export as CSV', icon: '📄' },
    { key: 'xlsx', label: 'Export as Excel', icon: '📊' },
    { key: 'html', label: 'Export as HTML', icon: '🌐' },
    { key: 'pdf', label: 'Export as PDF', icon: '📑' }
  ];
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-4 text-sm font-medium rounded-lg border transition-all hover:border-[#8a87d6] hover:text-[#8a87d6] flex items-center gap-2"
        style={{ 
          backgroundColor: isDarkTheme ? '#374151' : '#ffffff', 
          borderColor: isDarkTheme ? '#4b5563' : '#d1d5db',
          color: isDarkTheme ? '#e5e7eb' : '#374151'
        }}
        title={hasSelection ? `Export ${selectedCount} selected` : `Export all (${totalCount})`}
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className={`absolute right-0 z-20 mt-1 py-1 rounded-lg shadow-lg border min-w-48 ${
          isDarkTheme 
            ? 'bg-slate-700 border-slate-600' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-200 dark:border-slate-600">
            {hasSelection 
              ? `Exporting ${selectedCount} selected roles` 
              : `Exporting ${totalCount} filtered roles`
            }
          </div>
          
          {exportOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => {
                onExport(option.key);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2`}
            >
              <span>{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const InlineSelectionControls = ({ 
  selectedCount, 
  totalCount, 
  filteredCount,
  onSelectAll, 
  onSelectPage, 
  onClearSelection,
  isDarkTheme 
}) => {
  if (selectedCount === 0) return null;
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
        isDarkTheme
          ? 'bg-[#8a87d6]/10 text-[#a5a3e8] border-[#8a87d6]/20'
          : 'bg-[#8a87d6]/8 text-[#6d6ac7] border-[#8a87d6]/20'
      }`}>
        Selected: {selectedCount}
      </span>
      <span className="text-gray-400">·</span>
      <button
        onClick={onSelectPage}
        className={`transition-colors ${
          isDarkTheme
            ? 'text-[#a5a3e8] hover:text-[#b8b6eb]'
            : 'text-[#8a87d6] hover:text-[#7c79d1]'
        }`}
      >
        Select page ({Math.min(50, filteredCount)})
      </button>
      <span className="text-gray-400">·</span>
      <button
        onClick={onSelectAll}
        className={`transition-colors ${
          isDarkTheme
            ? 'text-[#a5a3e8] hover:text-[#b8b6eb]'
            : 'text-[#8a87d6] hover:text-[#7c79d1]'
        }`}
      >
        Select all ({totalCount})
      </button>
      <span className="text-gray-400">·</span>
      <button
        onClick={onClearSelection}
        className={`transition-colors ${
          isDarkTheme
            ? 'text-[#a5a3e8] hover:text-[#b8b6eb]'
            : 'text-[#8a87d6] hover:text-[#7c79d1]'
        }`}
      >
        Clear
      </button>
    </div>
  );
};

// Modal components for actions
function ViewModal({ isOpen, onClose, role }) {
  if (!isOpen || !role) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Role Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          {Object.entries(role).map(([key, value]) => (
            key !== 'id' && (
              <div key={key} className="flex">
                <span className="font-medium w-32 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <span className="text-gray-600">{value || '—'}</span>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RolesAtRiskV2() {
  const { notifySuccess, notifyDanger } = useNotifications();
  
  // Data state
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [mapping, setMapping] = useState({});
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [practiceFilter, setPracticeFilter] = useState([]);
  const [recruiterFilter, setRecruiterFilter] = useState([]);
  const [searchDebounced, setSearchDebounced] = useState('');
  const [viewModalRole, setViewModalRole] = useState(null);
  
  // Selection state for new toolbar
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showKebabMenu, setShowKebabMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Theme (defaulting to light theme like RolesAtRiskView)
  const isDarkTheme = false;
  
  // Pagination config
  const pageSize = 25;
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(searchTerm), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Get expected keys from table component
  const expectedKeys = useMemo(() => {
    return INITIAL_COLS.filter(col => col.key !== 'actions').map(col => col.key);
  }, []);
  
  // Load initial data
  useEffect(() => {
    loadRoles(true);
  }, []);
  
  async function loadRoles(isInitial = false) {
    try {
      if (isInitial) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }
      
      const from = isInitial ? 0 : offset;
      const to = from + pageSize - 1;
      
      const { data, error } = await supabase
        .from('roles_at_risk')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);
        
      if (error) throw error;
      
      // Discover schema and create mapping on first load
      let currentMapping = mapping;
      if (isInitial && data && data.length > 0) {
        const rawKeys = Object.keys(data[0]);
        currentMapping = deriveMapping(rawKeys, expectedKeys);
        setMapping(currentMapping);
        
        // Log mapping in development
        if (import.meta.env.DEV) {
          console.log('🔍 Schema Discovery:', {
            rawKeys,
            expectedKeys,
            mapping: currentMapping
          });
        }
      }
      
      const shapedRows = shapeRowsForTable(data || [], currentMapping);
      
      if (isInitial) {
        setRoles(shapedRows);
        setOffset(data?.length || 0);
      } else {
        setRoles(prev => [...prev, ...shapedRows]);
        setOffset(prev => prev + (data?.length || 0));
      }
      
      // Check if we have more data
      setHasMore((data?.length || 0) === pageSize);
      
    } catch (err) {
      console.error('Error loading roles:', err);
      setError(err.message);
      if (isInitial) {
        notifyDanger('Failed to load roles data');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }
  
  // Filtered data for client-side search and filters
  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      // Search across text-like fields
      const searchFields = ['jobTitle', 'jobRecId', 'romaId', 'hiringManager', 'client', 'recruiter'];
      const matchesSearch = !searchDebounced || searchFields.some(field => 
        String(role[field] || '').toLowerCase().includes(searchDebounced.toLowerCase())
      );
      
      const matchesPractice = practiceFilter.length === 0 || practiceFilter.includes(role.practice);
      const matchesRecruiter = recruiterFilter.length === 0 || recruiterFilter.includes(role.recruiter);
      
      return matchesSearch && matchesPractice && matchesRecruiter;
    });
  }, [roles, searchDebounced, practiceFilter, recruiterFilter]);
  
  // Get unique values for filters
  const uniquePractices = useMemo(() => {
    return [...new Set(roles.map(role => role.practice).filter(Boolean))].sort();
  }, [roles]);
  
  const uniqueRecruiters = useMemo(() => {
    return [...new Set(roles.map(role => role.recruiter).filter(Boolean))].sort();
  }, [roles]);

  // Selection and filter helper functions
  const clearFilters = () => {
    setSearchTerm('');
    setPracticeFilter([]);
    setRecruiterFilter([]);
  };

  const hasActiveFilters = searchTerm || practiceFilter.length > 0 || recruiterFilter.length > 0;

  const handleSelectAll = () => {
    setSelectedRoles(filteredRoles.map(role => role.id));
  };

  const handleSelectPage = () => {
    const pageRoles = filteredRoles.slice(0, Math.min(50, filteredRoles.length)).map(role => role.id);
    setSelectedRoles(prev => [...new Set([...prev, ...pageRoles])]);
  };
  
  // Action handlers
  const handleViewRow = (role) => {
    setViewModalRole(role);
  };
  
  const handleEditRow = async (updatedRole) => {
    try {
      // Convert back to snake_case for database
      const dbUpdates = {};
      Object.entries(mapping).forEach(([expectedKey, rawKey]) => {
        if (updatedRole[expectedKey] !== undefined) {
          dbUpdates[rawKey] = updatedRole[expectedKey];
        }
      });
      
      const { error } = await supabase
        .from('roles_at_risk')
        .update({ ...dbUpdates, updated_at: new Date().toISOString() })
        .eq('id', updatedRole.id);
        
      if (error) throw error;
      
      // Update local state
      setRoles(prev => prev.map(role => 
        role.id === updatedRole.id ? updatedRole : role
      ));
      
      notifySuccess('Role updated successfully');
    } catch (err) {
      console.error('Error updating role:', err);
      notifyDanger('Failed to update role');
    }
  };
  
  const handleDeleteRow = async (role) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      const { error } = await supabase
        .from('roles_at_risk')
        .delete()
        .eq('id', role.id);
        
      if (error) throw error;
      
      // Update local state
      setRoles(prev => prev.filter(r => r.id !== role.id));
      
      notifySuccess('Role deleted successfully');
    } catch (err) {
      console.error('Error deleting role:', err);
      notifyDanger('Failed to delete role');
    }
  };
  
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadRoles(false);
    }
  };
  
  const handleExport = (format) => {
    // TODO: Implement actual export functionality based on format
    const dataToExport = selectedRoles.length > 0 
      ? filteredRoles.filter(role => selectedRoles.includes(role.id))
      : filteredRoles;
    
    notifySuccess(`Export as ${format.toUpperCase()} functionality coming soon (${dataToExport.length} roles)`);
  };

  return (
    <div className="min-h-screen bg-app relative" style={{ backgroundColor: '#e3e3f5' }}>
      <BackgroundDoodles />
      
      {/* Toolbar - Separate container */}
      <div className="relative z-20 px-6 pt-6 pb-3">
        <div 
          className="p-4 border rounded-xl shadow-lg overflow-visible relative z-10"
          style={{ 
            backgroundColor: 'var(--surface-bg)', 
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {/* Header - Selection controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <InlineSelectionControls
                selectedCount={selectedRoles.length}
                totalCount={roles.length}
                filteredCount={filteredRoles.length}
                onSelectAll={handleSelectAll}
                onSelectPage={handleSelectPage}
                onClearSelection={() => setSelectedRoles([])}
                isDarkTheme={isDarkTheme}
              />
            </div>
          </div>
        
          {/* Filters and Actions */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 xl:gap-y-0 xl:flex-nowrap">
              {/* Search */}
              <div className="flex-none w-full sm:w-auto">
                <div className="relative max-w-[420px] sm:w-80 xl:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDarkTheme 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#8a87d6]/20 focus:border-[#8a87d6]`}
                  />
                </div>
              </div>
            
              {/* Practice Filter */}
              <div className="flex-none w-full sm:w-auto">
                <div className="w-full sm:w-56 xl:w-60">
                  <MultiSelectDropdown
                    label="Practice"
                    options={uniquePractices}
                    value={practiceFilter}
                    onChange={setPracticeFilter}
                    placeholder="All Practices"
                    isDarkTheme={isDarkTheme}
                  />
                </div>
              </div>
            
              {/* Recruiter Filter */}
              <div className="flex-none w-full sm:w-auto">
                <div className="w-full sm:w-56 xl:w-60">
                  <MultiSelectDropdown
                    label="Recruiter"
                    options={uniqueRecruiters}
                    value={recruiterFilter}
                    onChange={setRecruiterFilter}
                    placeholder="All Recruiters"
                    isDarkTheme={isDarkTheme}
                  />
                </div>
              </div>
            
              {/* Actions */}
              <div className="flex items-center gap-2 flex-none">
                {/* Clear filters X - only show when filters are active */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className={`px-3 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                      isDarkTheme 
                        ? 'border-slate-600 text-slate-300 hover:bg-slate-700 focus:ring-[#8a87d6] focus:border-[#8a87d6]' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-[#8a87d6] focus:border-[#8a87d6]'
                    } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
                    title="Clear all filters"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              
                <button
                  onClick={() => setShowImportModal(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                    isDarkTheme 
                      ? 'border-slate-600 text-slate-300 hover:bg-slate-700 focus:ring-[#8a87d6] focus:border-[#8a87d6]' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-[#8a87d6] focus:border-[#8a87d6]'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
                >
                  <Upload className="w-4 h-4" />
                  Paste from Excel
                </button>
              
                {/* Export Button */}
                <div className="relative">
                  <ExportDropdown
                    onExport={handleExport}
                    hasSelection={selectedRoles.length > 0}
                    selectedCount={selectedRoles.length}
                    totalCount={filteredRoles.length}
                    isDarkTheme={isDarkTheme}
                  />
                </div>
              
                {/* Add Role at Risk */}
                <button
                  onClick={() => notifySuccess('Add role functionality coming soon')}
                  className="h-10 flex items-center gap-2 px-4 text-sm font-medium rounded-lg bg-[#8a87d6] text-white transition-all hover:bg-[#7a77c6]"
                >
                  <Plus className="w-4 h-4" />
                  Add Role at Risk
                </button>
              
                {/* Kebab Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowKebabMenu(!showKebabMenu)}
                    className={`h-10 px-3 rounded-lg border transition-colors ${
                      isDarkTheme 
                        ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                
                  <TableKebabMenu
                    isOpen={showKebabMenu}
                    onClose={() => setShowKebabMenu(false)}
                    onDensityChange={() => notifySuccess('Density control coming soon')}
                    onShowColumns={() => notifySuccess('Column control coming soon')}
                    density="cozy"
                    isDarkTheme={isDarkTheme}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mx-6 mb-4 rounded-xl bg-red-50 border border-red-200 p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Error loading data</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={() => loadRoles(true)}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!error && (
        <div className="px-6 pb-6">
          <RolesTableV2
            rows={filteredRoles}
            loading={loading}
            storageKey="rolesAtRiskV2"
            onViewRow={handleViewRow}
            onEditRow={handleEditRow}
            onDeleteRow={handleDeleteRow}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            loadingMore={loadingMore}
          />
        </div>
      )}

      {/* View Modal */}
      <ViewModal
        isOpen={!!viewModalRole}
        onClose={() => setViewModalRole(null)}
        role={viewModalRole}
      />
    </div>
  );
}