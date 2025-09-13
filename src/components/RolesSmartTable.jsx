import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronUp, ChevronDown, MoreHorizontal, Eye, EyeOff, 
  ArrowUpDown, Grip, Check, Square, Minus, Pin, PinOff, X,
  AlignLeft, AlignCenter, AlignRight, ChevronRight, Settings
} from 'lucide-react';
import { 
  getTableLayout, 
  saveTableLayout, 
  updateColumnWidth, 
  autoFitColumn, 
  resetColumnWidth, 
  reorderColumns,
  updateColumnAlignment,
  updateColumnDisplayMode,
  getTableDensity,
  saveTableDensity,
  getDensityHeight,
  getHeaderHeight,
  saveHeaderHeight,
  updateColumnBold
} from '../utils/tableLayout.js';
import { formatDateDisplay } from '../utils/rolesImportExport.js';

const RiskReasonDot = ({ reason, isDarkTheme }) => {
  const colorMap = {
    'No candidates': { bg: '#8a87d6', text: 'Lilac accent' },
    'Approval blocked': { bg: '#f59e0b', text: 'Amber' },
    'Salary range issue': { bg: '#f97316', text: 'Orange' },
    'Aging role': { bg: '#64748b', text: 'Slate' },
    'Other': { bg: '#6b7280', text: 'Gray' }
  };
  
  const colorConfig = colorMap[reason] || colorMap['Other'];
  
  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: colorConfig.bg }}
        title={colorConfig.text}
      />
      <span className="truncate">{reason}</span>
    </div>
  );
};

const TableCell = ({ column, value, isDarkTheme }) => {
  const formatValue = () => {
    switch (column.key) {
      case 'status':
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            value === 'Open' 
              ? (isDarkTheme 
                  ? 'bg-[#16a34a] text-white'
                  : 'bg-[#16a34a] text-white'
                )
              : (isDarkTheme 
                  ? 'bg-gray-700 text-gray-200'
                  : 'bg-gray-100 text-gray-800'
                )
          }`}>
            {value}
          </span>
        );
      
      case 'role_type':
        const displayMode = column.displayMode || 'text';
        
        if (displayMode === 'text') {
          if (value === 'External') {
            return (
              <span className={`font-semibold ${
                isDarkTheme ? 'text-[#f97316]' : 'text-[#f97316]'
              }`}>
                {value}
              </span>
            );
          } else if (value === 'Internal') {
            return (
              <span className={`font-semibold ${
                isDarkTheme ? 'text-[#5B8DEF]' : 'text-[#5B8DEF]'
              }`}>
                {value}
              </span>
            );
          }
          return (
            <span className={`font-semibold ${
              isDarkTheme ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {value}
            </span>
          );
        } else {
          // Chip mode for backward compatibility
          if (value === 'External') {
            return (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isDarkTheme
                  ? 'bg-[#f7e1d6]/10 text-[#e6b897] border border-[#f7e1d6]/20'
                  : 'bg-[#f7e1d6] text-[#8b4513] border border-[#e6b897]'
              }`}>
                {value}
              </span>
            );
          } else if (value === 'Internal') {
            return (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isDarkTheme
                  ? 'bg-[#dcd6f7]/10 text-[#b4a7d6] border border-[#dcd6f7]/20'
                  : 'bg-[#dcd6f7] text-[#6366f1] border border-[#b4a7d6]'
              }`}>
                {value}
              </span>
            );
          }
          return value;
        }
      
      case 'risk_reasons':
        return Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1">
            {value.map((reason, idx) => (
              <RiskReasonDot key={idx} reason={reason} isDarkTheme={isDarkTheme} />
            ))}
          </div>
        ) : (
          <RiskReasonDot reason={value} isDarkTheme={isDarkTheme} />
        );
      
      case 'date_created':
        return formatDateDisplay(value);
      
      default:
        return value || <span className="text-gray-400">—</span>;
    }
  };
  
  // Apply alignment and bold styling
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center', 
    right: 'text-right'
  }[column.alignment || 'left'];
  
  const boldClass = column.bold ? 'font-semibold' : '';
  
  return (
    <div className={`truncate ${alignmentClass} ${boldClass}`} title={Array.isArray(value) ? value.join(', ') : String(value || '')}>
      {formatValue()}
    </div>
  );
};

const ColumnContextMenu = ({ 
  column, 
  isOpen, 
  onClose, 
  onSort, 
  onToggleVisibility, 
  onAutoFit, 
  onResetWidth, 
  onPin,
  onUpdateAlignment,
  onUpdateDisplayMode,
  onUpdateBold,
  onShowColumnsModal,
  position,
  isDarkTheme 
}) => {
  const menuRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div
      ref={menuRef}
      className={`fixed z-50 min-w-48 rounded-lg shadow-lg border ${
        isDarkTheme 
          ? 'bg-slate-700 border-slate-600' 
          : 'bg-white border-gray-200'
      }`}
      style={{
        left: position.x,
        top: position.y,
      }}
      role="menu"
      aria-label={`${column.label} column menu`}
    >
      <div className="py-1">
        <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-200 dark:border-slate-600">
          Sort
        </div>
        <button
          onClick={() => { onSort(column.key, 'asc'); onClose(); }}
          className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left hover:${
            isDarkTheme ? 'bg-[#8a87d6]/10' : 'bg-[#8a87d6]/5'
          }`}
          role="menuitem"
        >
          <ChevronUp className="w-3 h-3" />
          Ascending
        </button>
        <button
          onClick={() => { onSort(column.key, 'desc'); onClose(); }}
          className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left hover:${
            isDarkTheme ? 'bg-[#8a87d6]/10' : 'bg-[#8a87d6]/5'
          }`}
          role="menuitem"
        >
          <ChevronDown className="w-3 h-3" />
          Descending
        </button>
        <button
          onClick={() => { onSort(column.key, null); onClose(); }}
          className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left hover:${
            isDarkTheme ? 'bg-[#8a87d6]/10' : 'bg-[#8a87d6]/5'
          }`}
          role="menuitem"
        >
          <ArrowUpDown className="w-3 h-3" />
          None
        </button>
        
        <div className="border-t border-gray-200 dark:border-slate-600 my-1"></div>
        
        <div className="px-3 py-2 text-xs font-medium text-gray-500">
          Alignment
        </div>
        <button
          onClick={() => { onUpdateAlignment(column.key, 'left'); onClose(); }}
          className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left hover:${
            isDarkTheme ? 'bg-[#8a87d6]/10' : 'bg-[#8a87d6]/5'
          } ${column.alignment === 'left' ? 'bg-[#8a87d6]/10' : ''}`}
          role="menuitem"
        >
          <AlignLeft className="w-3 h-3" />
          Left
        </button>
        <button
          onClick={() => { onUpdateAlignment(column.key, 'center'); onClose(); }}
          className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left hover:${
            isDarkTheme ? 'bg-[#8a87d6]/10' : 'bg-[#8a87d6]/5'
          } ${column.alignment === 'center' ? 'bg-[#8a87d6]/10' : ''}`}
          role="menuitem"
        >
          <AlignCenter className="w-3 h-3" />
          Center
        </button>
        <button
          onClick={() => { onUpdateAlignment(column.key, 'right'); onClose(); }}
          className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left hover:${
            isDarkTheme ? 'bg-[#8a87d6]/10' : 'bg-[#8a87d6]/5'
          } ${column.alignment === 'right' ? 'bg-[#8a87d6]/10' : ''}`}
          role="menuitem"
        >
          <AlignRight className="w-3 h-3" />
          Right
        </button>
        
        {column.key === 'role_type' && (
          <>
            <div className="border-t border-gray-200 dark:border-slate-600 my-1"></div>
            <div className="px-3 py-2 text-xs font-medium text-gray-500">
              Display
            </div>
            <button
              onClick={() => { onUpdateDisplayMode(column.key, 'text'); onClose(); }}
              className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left hover:${
                isDarkTheme ? 'bg-[#8a87d6]/10' : 'bg-[#8a87d6]/5'
              } ${(column.displayMode || 'text') === 'text' ? 'bg-[#8a87d6]/10' : ''}`}
              role="menuitem"
            >
              Bold text
            </button>
            <button
              onClick={() => { onUpdateDisplayMode(column.key, 'chip'); onClose(); }}
              className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left hover:${
                isDarkTheme ? 'bg-[#8a87d6]/10' : 'bg-[#8a87d6]/5'
              } ${column.displayMode === 'chip' ? 'bg-[#8a87d6]/10' : ''}`}
              role="menuitem"
            >
              Chip
            </button>
          </>
        )}
        
        <div className="border-t border-gray-200 dark:border-slate-600 my-1"></div>
        
        <div className="px-3 py-2 text-xs font-medium text-gray-500">
          Style
        </div>
        <button
          onClick={() => { onUpdateBold(column.key, !column.bold); onClose(); }}
          className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left hover:${
            isDarkTheme ? 'bg-[#8a87d6]/10' : 'bg-[#8a87d6]/5'
          } ${column.bold ? 'bg-[#8a87d6]/10' : ''}`}
          role="menuitem"
        >
          <Settings className="w-3 h-3" />
          Bold column text
        </button>
        
        <div className="border-t border-gray-200 dark:border-slate-600 my-1"></div>
        
        <div className="px-3 py-2 text-xs font-medium text-gray-500">
          Column
        </div>
        <button
          onClick={() => { onToggleVisibility(column.key, false); onClose(); }}
          className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left hover:${
            isDarkTheme ? 'bg-[#8a87d6]/10' : 'bg-[#8a87d6]/5'
          }`}
          role="menuitem"
        >
          <EyeOff className="w-3 h-3" />
          Hide
        </button>
        <button
          onClick={() => { onShowColumnsModal(); onClose(); }}
          className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left hover:${
            isDarkTheme ? 'bg-[#8a87d6]/10' : 'bg-[#8a87d6]/5'
          }`}
          role="menuitem"
        >
          <Eye className="w-3 h-3" />
          Show/Hide columns...
        </button>
        <button
          onClick={() => { onAutoFit(); onClose(); }}
          className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left hover:${
            isDarkTheme ? 'bg-[#8a87d6]/10' : 'bg-[#8a87d6]/5'
          }`}
          role="menuitem"
        >
          <ArrowUpDown className="w-3 h-3 rotate-90" />
          Auto-fit width
        </button>
        <button
          onClick={() => { onResetWidth(); onClose(); }}
          className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left hover:${
            isDarkTheme ? 'bg-[#8a87d6]/10' : 'bg-[#8a87d6]/5'
          }`}
          role="menuitem"
        >
          <MoreHorizontal className="w-3 h-3" />
          Reset width
        </button>
      </div>
    </div>
  );
};

const ColumnHeader = ({ 
  column, 
  sortConfig, 
  onSort, 
  onResize, 
  onToggleVisibility,
  onAutoFit,
  onResetWidth,
  onUpdateAlignment,
  onUpdateDisplayMode,
  onUpdateBold,
  onShowColumnsModal,
  isDarkTheme,
  isResizing,
  setIsResizing,
  roles,
  density = 'cozy',
  headerHeight = 48
}) => {
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const [showHoverIcon, setShowHoverIcon] = useState(false);
  const headerRef = useRef(null);
  const resizerRef = useRef(null);
  
  const isSorted = sortConfig?.key === column.key;
  const sortDirection = isSorted ? sortConfig.direction : null;
  
  const handleSort = () => {
    if (isSorted) {
      onSort(column.key, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(column.key, 'asc');
    }
  };
  
  const handleContextMenu = (e) => {
    e.preventDefault();
    const rect = headerRef.current.getBoundingClientRect();
    setContextMenu({
      show: true,
      x: Math.min(e.clientX, window.innerWidth - 200),
      y: Math.min(e.clientY, window.innerHeight - 300)
    });
  };
  
  const handleResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = column.width;
    
    // Disable text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const minWidth = column.minWidth || 80;
      const newWidth = Math.max(minWidth, startWidth + deltaX);
      onResize(column.key, newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleDoubleClick = (e) => {
    if (e.target.closest('.resize-handle')) {
      e.preventDefault();
      e.stopPropagation();
      // Auto-fit column
      const columnData = roles?.map(role => role[column.key]) || [];
      onAutoFit(column.key, columnData);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.target.closest('.resize-handle')) {
      const step = e.shiftKey ? 24 : 8;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const minWidth = column.key === 'job_rec_id' ? 56 : (column.minWidth || 80);
        onResize(column.key, Math.max(minWidth, column.width - step));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onResize(column.key, column.width + step);
      }
    }
  };
  
  const getSortIcon = () => {
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-3 h-3 text-[#8a87d6]" />;
    } else if (sortDirection === 'desc') {
      return <ChevronDown className="w-3 h-3 text-[#8a87d6]" />;
    }
    return null;
  };
  
  const getHoverSortIcon = () => {
    if (isSorted) return null;
    return (
      <ArrowUpDown className={`absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 transition-opacity ${
        showHoverIcon ? 'opacity-50' : 'opacity-0'
      } ${isDarkTheme ? 'text-[#a5a3e8]' : 'text-[#8a87d6]'}`} />
    );
  };
  
  const getSortAriaSort = () => {
    if (sortDirection === 'asc') return 'ascending';
    if (sortDirection === 'desc') return 'descending';
    return 'none';
  };
  
  return (
    <>
      <th 
        ref={headerRef}
        className={`group sticky top-0 z-10 ${
          isDarkTheme 
            ? 'bg-[#8a87d6]/8 border-b border-b-[#8a87d6]/20' 
            : 'bg-[#8a87d6]/6 border-b border-b-[#8a87d6]/15'
        } hover:${
          isDarkTheme ? 'bg-[#8a87d6]/10' : 'bg-[#8a87d6]/8'
        }`}
        style={{ 
          width: column.width,
          minWidth: column.width,
          maxWidth: column.width,
          height: headerHeight,
          borderRight: isDarkTheme ? '1px solid rgba(138, 135, 214, 0.25)' : '1px solid rgba(138, 135, 214, 0.3)'
        }}
        role="columnheader"
        aria-sort={getSortAriaSort()}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex items-center justify-center px-3 h-full" style={{ height: headerHeight }}>
          <button
            onClick={handleSort}
            onMouseEnter={() => setShowHoverIcon(true)}
            onMouseLeave={() => setShowHoverIcon(false)}
            className={`relative flex-1 text-center focus:outline-none focus:ring-2 focus:ring-[#8a87d6] focus:ring-offset-1 rounded px-1 py-1`}
            title={`Sort by ${column.label} ${
              sortDirection === 'asc' ? '(desc)' : '(asc)'
            }`}
            aria-label={`Sort by ${column.label} ${
              sortDirection === 'asc' ? 'descending' : 'ascending'
            }`}
          >
            <span className={`block truncate text-xs font-semibold uppercase tracking-wider text-center pr-4 ${
              isDarkTheme ? 'text-[#a5a3e8]' : 'text-[#6d6ac7]'
            }`} title={column.label}>
              {column.label}
            </span>
            {getSortIcon()}
            {getHoverSortIcon()}
          </button>
        </div>
        
        {/* Resize Handle */}
        <div
          ref={resizerRef}
          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize group/resize"
          onMouseDown={handleResize}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          title="Resize column (double-click to auto-fit)"
          aria-label={`Resize ${column.label} column`}
        >
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-400 group-hover/resize:bg-[#8a87d6] transition-colors" />
          <div className="absolute right-0 top-0 bottom-0 w-2 -mr-1" />
        </div>
      </th>
      
      <ColumnContextMenu
        column={column}
        isOpen={contextMenu.show}
        onClose={() => setContextMenu({ show: false, x: 0, y: 0 })}
        onSort={(key, direction) => onSort(key, direction)}
        onToggleVisibility={onToggleVisibility}
        onAutoFit={() => {
          const columnData = roles?.map(role => role[column.key]) || [];
          onAutoFit(column.key, columnData);
        }}
        onResetWidth={() => onResetWidth(column.key)}
        onUpdateAlignment={onUpdateAlignment}
        onUpdateDisplayMode={onUpdateDisplayMode}
        onUpdateBold={onUpdateBold}
        onShowColumnsModal={onShowColumnsModal}
        position={{ x: contextMenu.x, y: contextMenu.y }}
        isDarkTheme={isDarkTheme}
      />
    </>
  );
};

const TableRow = ({ 
  role, 
  columns, 
  isSelected, 
  onSelect, 
  onClick, 
  onKeyDown,
  isDarkTheme,
  rowIndex 
}) => {
  const visibleColumns = columns.filter(col => col.visible);
  
  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onSelect(!isSelected);
  };
  
  const handleCheckboxKeyDown = (e) => {
    if (e.key === ' ') {
      e.stopPropagation();
      e.preventDefault();
      onSelect(!isSelected);
    }
  };
  
  return (
    <tr 
      className={`cursor-pointer transition-colors border-b min-w-0 ${
        isDarkTheme ? 'border-slate-700' : 'border-gray-100'
      } ${
        isSelected 
          ? (isDarkTheme 
              ? 'bg-[#8a87d6]/8 border-[#8a87d6]/20' 
              : 'bg-[#8a87d6]/5 border-[#8a87d6]/15'
            )
          : (isDarkTheme
              ? 'hover:bg-neutral-900 transition-colors'
              : 'hover:bg-white transition-colors'
            )
      }`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="row"
      aria-selected={isSelected}
      data-index={rowIndex}
    >
      <td className={`w-8 border-r ${
        isDarkTheme 
          ? 'border-[#8a87d6]/15' 
          : 'border-[#8a87d6]/10'
      }`}>
        <div className="flex items-center justify-center h-full px-3 py-3">
          <button
            onClick={handleCheckboxClick}
            onKeyDown={handleCheckboxKeyDown}
            className="flex items-center justify-center w-4 h-4 focus:outline-none focus:ring-2 focus:ring-[#8a87d6] focus:ring-offset-1 rounded"
            tabIndex={-1}
            aria-label={isSelected ? 'Deselect row' : 'Select row'}
          >
            {isSelected ? (
              <Check className="w-4 h-4 text-[#8a87d6]" />
            ) : (
              <Square className={`w-4 h-4 ${
                isDarkTheme ? 'text-gray-400 hover:text-[#a5a3e8]' : 'text-gray-400 hover:text-[#8a87d6]'
              }`} />
            )}
          </button>
        </div>
      </td>
      
      {visibleColumns.map((column, index) => {
        return (
          <td 
            key={column.key}
            className={`px-3 py-3 text-sm border-r min-w-0 ${
              isDarkTheme ? 'border-slate-700' : 'border-gray-100'
            }`}
            style={{ 
              width: column.width,
              minWidth: Math.max(column.width || 80, column.key === 'id' || column.key === 'gcm_link' || column.key === 'status' || column.key === 'date_created' ? 80 : column.key === 'recruiter' || column.key === 'practice' ? 120 : 80),
              maxWidth: column.width
            }}
            title={Array.isArray(role[column.key]) ? role[column.key]?.join(', ') : String(role[column.key] || '')}
          >
            <TableCell 
              column={column} 
              value={role[column.key]} 
              isDarkTheme={isDarkTheme} 
            />
          </td>
        );
      })}
    </tr>
  );
};

const RolesSmartTable = ({ 
  roles = [], 
  selectedRoles = [], 
  onSelectionChange,
  onRowClick,
  sortConfig,
  onSort,
  isDarkTheme = false,
  className = "",
  density = null,
  onColumnsChange = null,
  onShowColumnsModal = null
}) => {
  const [columns, setColumns] = useState(() => getTableLayout());
  const [isResizing, setIsResizing] = useState(false);
  const [tableDensity, setTableDensity] = useState(() => density || getTableDensity());
  const [headerHeight, setHeaderHeight] = useState(() => getHeaderHeight());
  const tableRef = useRef(null);
  const tableContainerRef = useRef(null);
  const tableInnerRef = useRef(null);
  const tableBodyRef = useRef(null);
  
  const visibleColumns = columns.filter(col => col.visible);
  
  // Update density when prop changes
  useEffect(() => {
    if (density && density !== tableDensity) {
      setTableDensity(density);
    }
  }, [density]);
  
  // Debounced save function
  const debouncedSave = useCallback(
    debounce((cols) => saveTableLayout(cols), 500),
    []
  );
  
  const handleColumnResize = (columnKey, newWidth) => {
    const updated = updateColumnWidth(columns, columnKey, newWidth);
    setColumns(updated);
    debouncedSave(updated);
  };
  
  const handleAutoFit = (columnKey, columnData) => {
    const updated = autoFitColumn(columns, columnKey, columnData);
    setColumns(updated);
  };
  
  const handleResetWidth = (columnKey) => {
    const updated = resetColumnWidth(columns, columnKey);
    setColumns(updated);
  };
  
  const handleColumnVisibilityToggle = (columnKey, visible) => {
    const updated = columns.map(col => 
      col.key === columnKey ? { ...col, visible } : col
    );
    setColumns(updated);
    saveTableLayout(updated);
    if (onColumnsChange) onColumnsChange(updated);
  };
  
  const handleUpdateAlignment = (columnKey, alignment) => {
    const updated = updateColumnAlignment(columns, columnKey, alignment);
    setColumns(updated);
    if (onColumnsChange) onColumnsChange(updated);
  };
  
  const handleUpdateDisplayMode = (columnKey, displayMode) => {
    const updated = updateColumnDisplayMode(columns, columnKey, displayMode);
    setColumns(updated);
    if (onColumnsChange) onColumnsChange(updated);
  };
  
  const handleUpdateBold = (columnKey, bold) => {
    const updated = updateColumnBold(columnKey, bold);
    setColumns(updated);
    if (onColumnsChange) onColumnsChange(updated);
  };
  
  const handleHeaderHeightChange = (newHeight) => {
    setHeaderHeight(newHeight);
    saveHeaderHeight(newHeight);
  };
  
  // Dynamic width calculation to prevent unnecessary horizontal scrolling
  const updateTableWidth = useCallback(() => {
    if (!tableContainerRef.current || !tableInnerRef.current) return;
    
    const visibleColumns = columns.filter(col => col.visible);
    const gridGapPx = 0; // No gap between columns as they have borders
    
    const totalWidth = visibleColumns.reduce((acc, col) => acc + (col.width || col.minWidth || 80), 0) + 32; // +32 for checkbox column
    const containerWidth = tableContainerRef.current.clientWidth || 0;
    
    // Only set explicit width if content exceeds container, otherwise let it be 100%
    if (totalWidth > containerWidth) {
      tableInnerRef.current.style.width = `${totalWidth}px`;
      tableContainerRef.current.style.overflowX = 'auto';
    } else {
      tableInnerRef.current.style.width = '100%';
      tableContainerRef.current.style.overflowX = 'hidden';
    }
  }, [columns]);
  
  // Update table dimensions on column changes or resize
  useEffect(() => {
    updateTableWidth();
  }, [updateTableWidth, columns]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = debounce(updateTableWidth, 200);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateTableWidth]);
  
  // Handle dynamic table body height - be less aggressive about scrollbars
  const updateTableBodyHeight = useCallback(() => {
    if (!tableBodyRef.current) return;
    
    const rowHeight = getDensityHeight(tableDensity) + 1; // +1 for border
    const bodyHeight = roles.length * rowHeight;
    const containerHeight = window.innerHeight;
    const headerHeight = 180; // approximate toolbar + header height (increased buffer)
    const padding = 150; // increased buffer space to avoid premature scrollbars
    const available = containerHeight - headerHeight - padding;
    
    // Only add scrollbar if content significantly exceeds available space
    if (bodyHeight > available && roles.length > 10) { // Only for more than 10 rows
      tableBodyRef.current.style.maxHeight = `${available}px`;
      tableBodyRef.current.style.overflowY = 'auto';
    } else {
      tableBodyRef.current.style.maxHeight = 'none';
      tableBodyRef.current.style.overflowY = 'visible';
    }
  }, [roles.length, tableDensity]);
  
  // Update table body height when roles change (after function declaration)
  useEffect(() => {
    updateTableBodyHeight();
  }, [updateTableBodyHeight]);
  
  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(roles.map(role => role.id));
    } else {
      onSelectionChange([]);
    }
  };
  
  const handleMasterCheckboxKeyDown = (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      handleSelectAll(!isAllSelected);
    }
  };
  
  const isAllSelected = roles.length > 0 && selectedRoles.length === roles.length;
  const isSomeSelected = selectedRoles.length > 0 && selectedRoles.length < roles.length;
  
  // Keyboard navigation
  const handleKeyDown = (e, role, index) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        onRowClick(role);
        break;
      case ' ':
        e.preventDefault();
        const isSelected = selectedRoles.includes(role.id);
        if (isSelected) {
          onSelectionChange(selectedRoles.filter(id => id !== role.id));
        } else {
          onSelectionChange([...selectedRoles, role.id]);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        const nextRow = tableRef.current?.querySelector(`tr[data-index="${index + 1}"]`);
        nextRow?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevRow = tableRef.current?.querySelector(`tr[data-index="${index - 1}"]`);
        prevRow?.focus();
        break;
    }
  };
  
  if (roles.length === 0) {
    return (
      <div className={`text-center py-12 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-medium mb-2">No roles found</h3>
        <p className="text-sm">No roles match your current filters.</p>
      </div>
    );
  }
  
  return (
    <div 
      ref={tableContainerRef}
      className={`h-auto rounded-lg border ${
        isDarkTheme ? 'border-[#8a87d6]/20' : 'border-[#8a87d6]/15'
      } ${className}`} 
      style={{ 
        overflowX: 'hidden', // Will be dynamically set to 'auto' when needed
        overflowY: 'visible',
        scrollbarGutter: 'stable both-edges'
      }}
    >
      <div ref={tableInnerRef} style={{ width: '100%' }}>
        <table 
          ref={tableRef}
          className={`w-full ${
            isDarkTheme ? 'bg-slate-800' : 'bg-white'
          }`}
          role="table"
          aria-label="Roles at Risk"
        >
          <thead>
            <tr>
              <th className={`w-8 sticky top-0 z-20 ${
                isDarkTheme 
                  ? 'bg-[#8a87d6]/8 border-b border-b-[#8a87d6]/20' 
                  : 'bg-[#8a87d6]/6 border-b border-b-[#8a87d6]/15'
              }`}
              style={{ 
                height: headerHeight,
                borderRight: isDarkTheme ? '1px solid rgba(138, 135, 214, 0.25)' : '1px solid rgba(138, 135, 214, 0.3)'
              }}
              >
                <div className="flex items-center justify-center h-full px-3">
                  <button
                    onClick={() => handleSelectAll(!isAllSelected)}
                    onKeyDown={handleMasterCheckboxKeyDown}
                    className="flex items-center justify-center w-4 h-4 focus:outline-none focus:ring-2 focus:ring-[#8a87d6] focus:ring-offset-1 rounded"
                    title={isAllSelected ? 'Deselect all' : 'Select all'}
                    aria-label={isAllSelected ? 'Deselect all rows' : 'Select all rows'}
                  >
                    {isAllSelected ? (
                      <Check className="w-4 h-4 text-[#8a87d6]" />
                    ) : isSomeSelected ? (
                      <Minus className="w-4 h-4 text-[#8a87d6]" />
                    ) : (
                      <Square className={`w-4 h-4 ${
                        isDarkTheme ? 'text-gray-400 hover:text-[#a5a3e8]' : 'text-gray-400 hover:text-[#8a87d6]'
                      }`} />
                    )}
                  </button>
                </div>
              </th>
              
              {visibleColumns.map((column) => (
                <ColumnHeader
                  key={column.key}
                  column={column}
                  sortConfig={sortConfig}
                  onSort={onSort}
                  onResize={handleColumnResize}
                  onAutoFit={handleAutoFit}
                  onResetWidth={handleResetWidth}
                  onToggleVisibility={handleColumnVisibilityToggle}
                  onUpdateAlignment={handleUpdateAlignment}
                  onUpdateDisplayMode={handleUpdateDisplayMode}
                  onUpdateBold={handleUpdateBold}
                  onShowColumnsModal={onShowColumnsModal}
                  isDarkTheme={isDarkTheme}
                  isResizing={isResizing}
                  setIsResizing={setIsResizing}
                  roles={roles}
                  density={tableDensity}
                  headerHeight={headerHeight}
                />
              ))}
            </tr>
            
            {/* Header Height Resize Handle */}
            <tr>
              <td 
                colSpan={visibleColumns.length + 1} 
                className="h-0 p-0 relative"
                style={{ height: 0 }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize group/header-resize"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startY = e.clientY;
                    const startHeight = headerHeight;
                    
                    const handleMouseMove = (e) => {
                      const newHeight = Math.max(36, Math.min(64, startHeight + (e.clientY - startY)));
                      handleHeaderHeightChange(newHeight);
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                  title="Resize header height"
                >
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-400 group-hover/header-resize:bg-[#8a87d6] transition-colors" />
                </div>
              </td>
            </tr>
          </thead>
          
          <tbody ref={tableBodyRef} style={{ height: 'auto', maxHeight: 'none', overflowY: 'visible' }}>
            {roles.map((role, index) => (
              <TableRow
                key={role.id}
                role={role}
                columns={columns}
                isSelected={selectedRoles.includes(role.id)}
                onSelect={(selected) => {
                  if (selected) {
                    onSelectionChange([...selectedRoles, role.id]);
                  } else {
                    onSelectionChange(selectedRoles.filter(id => id !== role.id));
                  }
                }}
                onClick={() => onRowClick(role)}
                onKeyDown={(e) => handleKeyDown(e, role, index)}
                isDarkTheme={isDarkTheme}
                rowIndex={index}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Simple debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default RolesSmartTable;
