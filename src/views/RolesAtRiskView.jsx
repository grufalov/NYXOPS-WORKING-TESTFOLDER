import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Download, Upload, MoreVertical, Plus, 
  Filter, X, CheckSquare, Square, Trash2, Settings, Eye, ChevronDown
} from 'lucide-react';
import BackgroundDoodles from '../components/decors/BackgroundDoodles.jsx';
import RolesSmartTable from '../components/RolesSmartTable.jsx';
import RoleEditModal from '../components/RoleEditModal.jsx';
import PasteImportModal from '../components/PasteImportModal.jsx';
import { exportToCSV, exportToXLSX, exportToHTML, exportToPDF } from '../utils/rolesImportExport.js';
import { 
  getTableLayout, 
  getTableDensity, 
  saveTableDensity, 
  getDensityHeight 
} from '../utils/tableLayout.js';
import { getRecentValues } from '../utils/recentValues.js';

const DensityControl = ({ density, onDensityChange, isDarkTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const densityOptions = [
    { key: 'compact', label: 'Compact', height: '40px' },
    { key: 'cozy', label: 'Cozy', height: '48px' },
    { key: 'comfortable', label: 'Comfortable', height: '56px' }
  ];
  
  const currentOption = densityOptions.find(opt => opt.key === density) || densityOptions[1];
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm hover:${
          isDarkTheme ? 'bg-[#8a87d6]/10' : 'bg-[#8a87d6]/5'
        } transition-colors`}
      >
        <Settings className="w-4 h-4" />
        Density: {currentOption.label}
      </button>
      
      {isOpen && (
        <div className={`absolute right-0 z-20 mt-1 py-1 rounded-lg shadow-lg border min-w-48 ${
          isDarkTheme 
            ? 'bg-slate-700 border-slate-600' 
            : 'bg-white border-gray-200'
        }`}>
          {densityOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => {
                onDensityChange(option.key);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:${
                isDarkTheme ? 'bg-[#8a87d6]/10' : 'bg-[#8a87d6]/5'
              } flex items-center justify-between ${
                density === option.key ? (isDarkTheme ? 'bg-[#8a87d6]/10' : 'bg-[#8a87d6]/5') : ''
              }`}
            >
              <span>{option.label}</span>
              <span className="text-xs text-gray-500">{option.height}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ColumnVisibilityModal = ({ 
  isOpen, 
  onClose, 
  columns, 
  onColumnToggle, 
  isDarkTheme 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
          isDarkTheme ? 'bg-slate-800' : 'bg-white'
        }`}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Show/Hide Columns</h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg hover:${
                  isDarkTheme ? 'bg-slate-700' : 'bg-gray-100'
                } transition-colors`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {columns.map((column) => (
                <label key={column.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={column.visible}
                    onChange={(e) => onColumnToggle(column.key, e.target.checked)}
                    className="rounded border-gray-300 text-[#8a87d6] focus:ring-[#8a87d6]"
                  />
                  <span className="flex-1">{column.label}</span>
                  {!column.visible && (
                    <span className="text-xs text-gray-500">Hidden</span>
                  )}
                </label>
              ))}
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-600 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#8a87d6] text-white rounded-lg hover:bg-[#7c79d1] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      
      <DensityControl 
        density={density} 
        onDensityChange={onDensityChange} 
        isDarkTheme={isDarkTheme} 
      />
      
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

const RolesAtRiskView = ({
  rolesAtRisk = [],
  addRole,
  updateRole,
  deleteRole,
  user,
  isDarkTheme = true,
  onPromoteToCase,
  AddRoleModal,
  NotesModal
}) => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [practiceFilter, setPracticeFilter] = useState([]);
  const [recruiterFilter, setRecruiterFilter] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'date_created', direction: 'desc' });
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [showKebabMenu, setShowKebabMenu] = useState(false);
  
  // Table layout and density
  const [tableColumns, setTableColumns] = useState(() => getTableLayout());
  const [density, setDensity] = useState(() => getTableDensity());
  
  // Table resizing state
  const [tableSize, setTableSize] = useState({ width: '100%', height: 'auto' });
  const [isResizing, setIsResizing] = useState(false);
  const tableContainerRef = useRef(null);
  
  // Get unique filter values
  const uniquePractices = useMemo(() => {
    return [...new Set(rolesAtRisk.map(role => role.practice).filter(Boolean))].sort();
  }, [rolesAtRisk]);
  
  const uniqueRecruiters = useMemo(() => {
    return [...new Set(rolesAtRisk.map(role => role.recruiter).filter(Boolean))].sort();
  }, [rolesAtRisk]);
  
  // Filter and sort roles
  const filteredAndSortedRoles = useMemo(() => {
    let filtered = rolesAtRisk.filter(role => {
      const matchesSearch = !searchTerm || (
        role.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.job_rec_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.roma_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.hiring_manager?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.client?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesPractice = practiceFilter.length === 0 || 
        practiceFilter.includes(role.practice);
      
      const matchesRecruiter = recruiterFilter.length === 0 || 
        recruiterFilter.includes(role.recruiter);
      
      return matchesSearch && matchesPractice && matchesRecruiter;
    });
    
    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Handle different data types
        if (Array.isArray(aVal)) aVal = aVal.join(', ');
        if (Array.isArray(bVal)) bVal = bVal.join(', ');
        
        if (aVal == null) aVal = '';
        if (bVal == null) bVal = '';
        
        // Handle dates
        if (sortConfig.key === 'date_created') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [rolesAtRisk, searchTerm, practiceFilter, recruiterFilter, sortConfig]);

  // Table resizing handlers
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isResizing || !tableContainerRef.current) return;
    
    const rect = tableContainerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    const newHeight = e.clientY - rect.top;
    
    // Minimum dimensions
    const minWidth = 400;
    const minHeight = 200;
    
    setTableSize({
      width: Math.max(newWidth, minWidth) + 'px',
      height: Math.max(newHeight, minHeight) + 'px'
    });
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Reset table size to default
  const resetTableSize = () => {
    setTableSize({ width: '100%', height: 'auto' });
  };

  // Add global mouse events for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'nw-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing]);
  
  // Handlers
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const handleRowClick = (role) => {
    setEditingRole(role);
  };
  
  const handleRoleSave = async (roleId, updates) => {
    try {
      await updateRole(roleId, updates);
      setEditingRole(null);
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  };
  
  const handleExport = async (format) => {
    try {
      const exportData = selectedRoles.length > 0
        ? rolesAtRisk.filter(role => selectedRoles.includes(role.id))
        : filteredAndSortedRoles;
      
      const timestamp = new Date().toISOString().split('T')[0];
      const baseFilename = `roles-at-risk-${timestamp}`;
      
      switch (format) {
        case 'csv':
          exportToCSV(exportData, tableColumns, `${baseFilename}.csv`);
          break;
        case 'xlsx':
          exportToXLSX(exportData, tableColumns, `${baseFilename}.xlsx`);
          break;
        case 'html':
          exportToHTML(exportData, tableColumns, `${baseFilename}.html`);
          break;
        case 'pdf':
          exportToPDF(exportData, tableColumns, `${baseFilename}.pdf`);
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}`);
    }
  };
  
  const handleImport = async (importData) => {
    try {
      const results = { created: 0, updated: 0, errors: [] };
      
      for (const item of importData) {
        try {
          const existingRole = rolesAtRisk.find(role => 
            role.job_rec_id === item.data.job_rec_id
          );
          
          if (existingRole) {
            await updateRole(existingRole.id, item.data);
            results.updated++;
          } else {
            await addRole(item.data);
            results.created++;
          }
        } catch (error) {
          results.errors.push(`Row ${item.rowIndex}: ${error.message}`);
        }
      }
      
      return results;
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  };
  
  const handleBulkDelete = async () => {
    if (selectedRoles.length === 0) return;
    
    const confirmed = confirm(
      `Are you sure you want to delete ${selectedRoles.length} role(s)? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      for (const roleId of selectedRoles) {
        await deleteRole(roleId);
      }
      setSelectedRoles([]);
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert(`Delete failed: ${error.message}`);
    }
  };
  
  const handleSelectAll = () => {
    setSelectedRoles(filteredAndSortedRoles.map(role => role.id));
  };
  
  const handleSelectPage = () => {
    const pageRoles = filteredAndSortedRoles.slice(0, 50).map(role => role.id);
    setSelectedRoles(prev => [...new Set([...prev, ...pageRoles])]);
  };
  
  const handleDensityChange = (newDensity) => {
    setDensity(newDensity);
    saveTableDensity(newDensity);
  };
  
  const handleColumnToggle = (columnKey, visible) => {
    const updated = tableColumns.map(col => 
      col.key === columnKey ? { ...col, visible } : col
    );
    setTableColumns(updated);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setPracticeFilter([]);
    setRecruiterFilter([]);
  };
  
  // Check if filters are active
  const hasActiveFilters = searchTerm || practiceFilter.length > 0 || recruiterFilter.length > 0;
  
  return (
    <div 
      className={`${isDarkTheme ? 'bg-[#30313e] text-white' : 'bg-[#e3e3f5] text-gray-900'} h-screen overflow-hidden relative`} 
      data-roles-view
      style={{ backgroundColor: 'var(--app-bg)', color: 'var(--text)' }}
    >
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
          {/* Header - Removed page title, moved selection controls up */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <InlineSelectionControls
              selectedCount={selectedRoles.length}
              totalCount={rolesAtRisk.length}
              filteredCount={filteredAndSortedRoles.length}
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
              
              {/* Export Button - styled to match Advisory Issues */}
              <div className="relative">
                <ExportDropdown
                  onExport={handleExport}
                  hasSelection={selectedRoles.length > 0}
                  selectedCount={selectedRoles.length}
                  totalCount={filteredAndSortedRoles.length}
                  isDarkTheme={isDarkTheme}
                />
              </div>
              
              {/* Add Role at Risk - moved here, height 40px */}
              <button
                onClick={() => setShowAddModal(true)}
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
                  onDensityChange={handleDensityChange}
                  onShowColumns={() => setShowColumnsModal(true)}
                  density={density}
                  isDarkTheme={isDarkTheme}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
        
      {/* Table Container - Resizable with spacing */}
      <div className="flex-1 px-6 pt-4 pb-6 overflow-y-auto">
        <div 
          ref={tableContainerRef}
          className="relative border rounded-lg shadow-sm"
          style={{ 
            width: tableSize.width,
            height: tableSize.height,
            minWidth: '400px',
            minHeight: '200px',
            backgroundColor: 'var(--surface-bg)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="h-full overflow-auto">
            <RolesSmartTable
          roles={filteredAndSortedRoles}
          selectedRoles={selectedRoles}
          onSelectionChange={setSelectedRoles}
          onRowClick={handleRowClick}
          sortConfig={sortConfig}
          onSort={handleSort}
          isDarkTheme={isDarkTheme}
          density={density}
            onColumnsChange={setTableColumns}
            onShowColumnsModal={() => setShowColumnsModal(true)}
          />
          </div>
          
          {/* Resize Handle - Bottom Right Corner */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize opacity-50 hover:opacity-100 transition-opacity z-10"
            style={{
              background: 'linear-gradient(-45deg, transparent 30%, var(--border) 30%, var(--border) 35%, transparent 35%, transparent 65%, var(--border) 65%, var(--border) 70%, transparent 70%)',
              backgroundSize: '4px 4px'
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={resetTableSize}
            title="Drag to resize table • Double-click to reset"
          />
        </div>
        </div>      {/* Modals */}
      {showAddModal && AddRoleModal && (
        <AddRoleModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={addRole}
          isDarkTheme={isDarkTheme}
        />
      )}
      
      {editingRole && (
        <RoleEditModal
          isOpen={!!editingRole}
          onClose={() => setEditingRole(null)}
          role={editingRole}
          onSave={handleRoleSave}
          isDarkTheme={isDarkTheme}
        />
      )}
      
      {showImportModal && (
        <PasteImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
          existingRoles={rolesAtRisk}
          isDarkTheme={isDarkTheme}
        />
      )}
      
      {showColumnsModal && (
        <ColumnVisibilityModal
          isOpen={showColumnsModal}
          onClose={() => setShowColumnsModal(false)}
          columns={tableColumns}
          onColumnToggle={handleColumnToggle}
          isDarkTheme={isDarkTheme}
        />
      )}
      </div>
    </div>
  );
};

export default RolesAtRiskView;

