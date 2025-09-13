import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Download, Upload, MoreVertical, Plus, 
  Filter, X, CheckSquare, Square, Trash2, Settings
} from 'lucide-react';
import BackgroundDoodles from '../components/decors/BackgroundDoodles.jsx';
import RolesSmartTable from '../components/RolesSmartTable.jsx';
import RoleEditModal from '../components/RoleEditModal.jsx';
import PasteImportModal from '../components/PasteImportModal.jsx';
import { exportToCSV, exportToXLSX, exportToHTML, exportToPDF } from '../utils/rolesImportExport.js';
import { getTableLayout } from '../utils/tableLayout.js';
import { getRecentValues } from '../utils/recentValues.js';

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
            ? 'bg-slate-700 border-slate-600 text-white hover:border-blue-500' 
            : 'bg-white border-gray-300 text-gray-900 hover:border-blue-500'
        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
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
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
          isDarkTheme 
            ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Download className="w-4 h-4" />
        Export
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

const SelectionControls = ({ 
  selectedCount, 
  totalCount, 
  filteredCount,
  onSelectAll, 
  onSelectPage, 
  onClearSelection,
  onBulkDelete,
  isDarkTheme 
}) => {
  if (selectedCount === 0) return null;
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${
      isDarkTheme 
        ? 'bg-blue-900/20 border-blue-700' 
        : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          isDarkTheme 
            ? 'bg-blue-800 text-blue-200' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          <CheckSquare className="w-4 h-4" />
          Selected: {selectedCount}
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => onSelectPage()}
            className={`px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 ${
              isDarkTheme ? 'text-blue-300' : 'text-blue-700'
            }`}
          >
            Select page ({Math.min(filteredCount, 50)})
          </button>
          
          <span className="text-gray-400">•</span>
          
          <button
            onClick={() => onSelectAll()}
            className={`px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 ${
              isDarkTheme ? 'text-blue-300' : 'text-blue-700'
            }`}
          >
            Select all ({filteredCount})
          </button>
          
          <span className="text-gray-400">•</span>
          
          <button
            onClick={onClearSelection}
            className={`px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 ${
              isDarkTheme ? 'text-blue-300' : 'text-blue-700'
            }`}
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onBulkDelete}
          className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Selected
        </button>
      </div>
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
  
  // Table layout
  const [tableColumns] = useState(() => getTableLayout());
  
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
  
  const clearFilters = () => {
    setSearchTerm('');
    setPracticeFilter([]);
    setRecruiterFilter([]);
  };
  
  return (
    <div 
      className={`min-h-screen relative ${
        isDarkTheme ? 'bg-[#30313e] text-white' : 'bg-[#e3e3f5] text-gray-900'
      }`} 
      data-roles-view
    >
      <BackgroundDoodles />
      
      {/* Sticky Toolbar */}
      <div className={`sticky top-0 z-10 px-6 py-4 border-b ${
        isDarkTheme ? 'bg-[#30313e] border-slate-700' : 'bg-[#f3f4fd] border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Roles at Risk</h1>
            <p className="text-sm text-gray-500 mt-1">
              {filteredAndSortedRoles.length} of {rolesAtRisk.length} roles
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#8a87d6] hover:bg-[#7c79d1] text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Role at Risk
          </button>
        </div>
        
        {/* Filters and Actions */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search */}
            <div className="md:col-span-4">
              <div className="relative">
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
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
            </div>
            
            {/* Practice Filter */}
            <div className="md:col-span-3">
              <MultiSelectDropdown
                label="Practice"
                options={uniquePractices}
                value={practiceFilter}
                onChange={setPracticeFilter}
                placeholder="All Practices"
                isDarkTheme={isDarkTheme}
              />
            </div>
            
            {/* Recruiter Filter */}
            <div className="md:col-span-3">
              <MultiSelectDropdown
                label="Recruiter"
                options={uniqueRecruiters}
                value={recruiterFilter}
                onChange={setRecruiterFilter}
                placeholder="All Recruiters"
                isDarkTheme={isDarkTheme}
              />
            </div>
            
            {/* Actions */}
            <div className="md:col-span-2 flex gap-2">
              <button
                onClick={clearFilters}
                className={`px-3 py-2 rounded-lg border transition-colors ${
                  isDarkTheme 
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                title="Clear all filters"
              >
                <X className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowImportModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  isDarkTheme 
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Upload className="w-4 h-4" />
                Paste from Excel
              </button>
              
              <ExportDropdown
                onExport={handleExport}
                hasSelection={selectedRoles.length > 0}
                selectedCount={selectedRoles.length}
                totalCount={filteredAndSortedRoles.length}
                isDarkTheme={isDarkTheme}
              />
            </div>
          </div>
          
          {/* Selection Controls */}
          <SelectionControls
            selectedCount={selectedRoles.length}
            totalCount={rolesAtRisk.length}
            filteredCount={filteredAndSortedRoles.length}
            onSelectAll={handleSelectAll}
            onSelectPage={handleSelectPage}
            onClearSelection={() => setSelectedRoles([])}
            onBulkDelete={handleBulkDelete}
            isDarkTheme={isDarkTheme}
          />
        </div>
      </div>
      
      {/* Table Content */}
      <div className="p-6">
        <RolesSmartTable
          roles={filteredAndSortedRoles}
          selectedRoles={selectedRoles}
          onSelectionChange={setSelectedRoles}
          onRowClick={handleRowClick}
          sortConfig={sortConfig}
          onSort={handleSort}
          isDarkTheme={isDarkTheme}
        />
      </div>
      
      {/* Modals */}
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
    </div>
  );
};

export default RolesAtRiskView;
