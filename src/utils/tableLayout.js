// Utility for managing table layout persistence
// Handles column order, width, visibility, alignment, density, and other table settings

const STORAGE_KEY_LAYOUT = 'rolesTable.layout.v3';
const STORAGE_KEY_DENSITY = 'rolesTable.density.v1';
const STORAGE_KEY_HEADER_HEIGHT = 'rolesTable.headerHeight.v1';

const DEFAULT_COLUMNS = [
  { key: 'job_rec_id', label: 'Job Rec ID', width: 100, visible: true, pinned: false, minWidth: 80, alignment: 'left', bold: false },
  { key: 'roma_id', label: 'ROMA ID', width: 100, visible: true, pinned: false, minWidth: 80, alignment: 'left', bold: false },
  { key: 'role_type', label: 'Role Type', width: 120, visible: true, pinned: false, minWidth: 120, alignment: 'left', displayMode: 'text', bold: false },
  { key: 'title', label: 'Job Title', width: 160, visible: true, pinned: false, minWidth: 160, alignment: 'left', bold: false },
  { key: 'gcm', label: 'GCM', width: 120, visible: true, pinned: false, minWidth: 80, alignment: 'left', bold: false },
  { key: 'hiring_manager', label: 'Hiring Manager', width: 160, visible: true, pinned: false, minWidth: 160, alignment: 'left', bold: false },
  { key: 'recruiter', label: 'Recruiter', width: 120, visible: true, pinned: false, minWidth: 120, alignment: 'left', bold: false },
  { key: 'practice', label: 'Practice', width: 120, visible: true, pinned: false, minWidth: 120, alignment: 'left', bold: false },
  { key: 'client', label: 'Client', width: 120, visible: true, pinned: false, minWidth: 120, alignment: 'left', bold: false },
  { key: 'date_created', label: 'Date Created', width: 120, visible: true, pinned: false, minWidth: 80, alignment: 'left', bold: false },
  { key: 'status', label: 'Status', width: 100, visible: true, pinned: false, minWidth: 80, alignment: 'left', bold: false },
  { key: 'risk_reasons', label: 'Risk Reasons', width: 160, visible: true, pinned: false, minWidth: 160, alignment: 'left', bold: false }
];

const DEFAULT_DENSITY = 'cozy'; // compact: 40px, cozy: 48px, comfortable: 56px

export const getTableLayout = () => {
  try {
    // Try to load v3 layout first
    let saved = localStorage.getItem(STORAGE_KEY_LAYOUT);
    let parsedData = null;
    
    if (saved) {
      parsedData = JSON.parse(saved);
    } else {
      // Migration: Try to load v2 layout and migrate
      const v2Key = 'rolesTable.layout.v2';
      const v2Saved = localStorage.getItem(v2Key);
      if (v2Saved) {
        const v2Data = JSON.parse(v2Saved);
        // Migrate v2 to v3 by adding new properties
        parsedData = v2Data.map(col => ({
          ...col,
          alignment: col.alignment || 'left',
          displayMode: col.displayMode || (col.key === 'role_type' ? 'text' : undefined),
          pinned: false // Remove all pinning
        }));
        // Save migrated data as v3
        localStorage.setItem(STORAGE_KEY_LAYOUT, JSON.stringify(parsedData));
        localStorage.removeItem(v2Key); // Clean up old v2 data
      }
    }
    
    if (parsedData) {
      // Merge with defaults to handle new columns
      const merged = DEFAULT_COLUMNS.map(defaultCol => {
        const savedCol = parsedData.find(col => col.key === defaultCol.key);
        if (savedCol) {
          return { 
            ...defaultCol, 
            ...savedCol, 
            pinned: false, // Ensure no pinning
            minWidth: defaultCol.minWidth || 80,
            alignment: savedCol.alignment || 'left',
            displayMode: savedCol.displayMode || defaultCol.displayMode,
            bold: savedCol.bold || false
          };
        }
        return defaultCol;
      });
      
      // Add any new columns that weren't in the saved layout
      const existingKeys = merged.map(col => col.key);
      const newColumns = parsedData.filter(col => !existingKeys.includes(col.key))
        .map(col => ({ 
          ...col, 
          pinned: false, 
          minWidth: 80, 
          alignment: col.alignment || 'left',
          displayMode: col.displayMode,
          bold: col.bold || false
        }));
      
      return [...merged, ...newColumns];
    }
  } catch (error) {
    console.error('Error loading table layout:', error);
  }
  
  return [...DEFAULT_COLUMNS];
};

export const saveTableLayout = (columns) => {
  try {
    localStorage.setItem(STORAGE_KEY_LAYOUT, JSON.stringify(columns));
  } catch (error) {
    console.error('Error saving table layout:', error);
  }
};

export const getTableDensity = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DENSITY);
    if (saved && ['compact', 'cozy', 'comfortable'].includes(saved)) {
      return saved;
    }
  } catch (error) {
    console.error('Error loading table density:', error);
  }
  return DEFAULT_DENSITY;
};

export const saveTableDensity = (density) => {
  try {
    localStorage.setItem(STORAGE_KEY_DENSITY, density);
  } catch (error) {
    console.error('Error saving table density:', error);
  }
};

export const getDensityHeight = (density) => {
  switch (density) {
    case 'compact': return 40;
    case 'cozy': return 48;
    case 'comfortable': return 56;
    default: return 48;
  }
};

export const resetTableLayout = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_LAYOUT);
    return [...DEFAULT_COLUMNS];
  } catch (error) {
    console.error('Error resetting table layout:', error);
    return [...DEFAULT_COLUMNS];
  }
};

export const updateColumnWidth = (columns, columnKey, newWidth) => {
  const updated = columns.map(col => {
    if (col.key === columnKey) {
      const minWidth = col.minWidth || 80;
      return { ...col, width: Math.max(minWidth, newWidth) };
    }
    return col;
  });
  saveTableLayout(updated);
  return updated;
};

export const updateColumnAlignment = (columns, columnKey, alignment) => {
  const updated = columns.map(col => 
    col.key === columnKey ? { ...col, alignment } : col
  );
  saveTableLayout(updated);
  return updated;
};

export const updateColumnDisplayMode = (columns, columnKey, displayMode) => {
  const updated = columns.map(col => 
    col.key === columnKey ? { ...col, displayMode } : col
  );
  saveTableLayout(updated);
  return updated;
};

export const autoFitColumn = (columns, columnKey, content) => {
  const column = columns.find(col => col.key === columnKey);
  if (!column) return columns;
  
  // Calculate auto-fit width based on content
  const baseWidth = column.minWidth || 80;
  const maxSampleLength = Math.max(
    column.label.length,
    ...(content || []).slice(0, 10).map(item => String(item || '').length)
  );
  
  // Estimate width: ~8px per character + padding
  const estimatedWidth = Math.max(baseWidth, Math.min(300, maxSampleLength * 8 + 24));
  
  return updateColumnWidth(columns, columnKey, estimatedWidth);
};

export const resetColumnWidth = (columns, columnKey) => {
  const defaultColumn = DEFAULT_COLUMNS.find(col => col.key === columnKey);
  if (!defaultColumn) return columns;
  
  return updateColumnWidth(columns, columnKey, defaultColumn.width);
};

export const updateColumnVisibility = (columns, columnKey, visible) => {
  const updated = columns.map(col => 
    col.key === columnKey ? { ...col, visible } : col
  );
  saveTableLayout(updated);
  return updated;
};

export const reorderColumns = (columns, fromIndex, toIndex) => {
  const updated = [...columns];
  const [movedColumn] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, movedColumn);
  saveTableLayout(updated);
  return updated;
};

export const getVisibleColumns = (columns) => {
  return columns.filter(col => col.visible);
};

export const getPinnedColumns = (columns) => {
  return columns.filter(col => col.pinned && col.visible);
};

export const getUnpinnedColumns = (columns) => {
  return columns.filter(col => !col.pinned && col.visible);
};

// Header height management
const DEFAULT_HEADER_HEIGHT = 48; // Default to cozy density equivalent

export const getHeaderHeight = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_HEADER_HEIGHT);
    if (saved) {
      const height = parseInt(saved, 10);
      if (height >= 36 && height <= 64) {
        return height;
      }
    }
  } catch (error) {
    console.error('Error loading header height:', error);
  }
  return DEFAULT_HEADER_HEIGHT;
};

export const saveHeaderHeight = (height) => {
  try {
    // Constrain to valid range
    const constrainedHeight = Math.max(36, Math.min(64, parseInt(height, 10)));
    localStorage.setItem(STORAGE_KEY_HEADER_HEIGHT, constrainedHeight.toString());
  } catch (error) {
    console.error('Error saving header height:', error);
  }
};

// Column bold toggle
export const updateColumnBold = (columnKey, bold) => {
  const columns = getTableLayout();
  const updated = columns.map(col => 
    col.key === columnKey ? { ...col, bold } : col
  );
  saveTableLayout(updated);
  return updated;
};
