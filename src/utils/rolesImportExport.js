// Utilities for importing roles from Excel/CSV and exporting data
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Import utilities
export const parseExcelData = (text) => {
  try {
    // Parse as TSV (Excel paste format) or CSV
    const lines = text.trim().split('\n');
    if (lines.length === 0) {
      throw new Error('No data found');
    }
    
    // Detect delimiter (tab or comma)
    const firstLine = lines[0];
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const delimiter = tabCount > commaCount ? '\t' : ',';
    
    // Parse rows
    const rows = lines.map(line => {
      // Simple CSV/TSV parser - could be enhanced for quoted fields
      return line.split(delimiter).map(cell => cell.trim().replace(/^"|"$/g, ''));
    });
    
    return {
      rows,
      delimiter,
      hasHeaders: isLikelyHeader(rows[0])
    };
    
  } catch (error) {
    console.error('Error parsing Excel data:', error);
    throw new Error(`Failed to parse data: ${error.message}`);
  }
};

const isLikelyHeader = (row) => {
  if (!row || row.length === 0) return false;
  
  const headerKeywords = [
    'job rec id', 'roma id', 'role type', 'job title', 'gcm',
    'hiring manager', 'recruiter', 'practice', 'client',
    'date created', 'status', 'risk reasons'
  ];
  
  const rowText = row.join(' ').toLowerCase();
  const matchCount = headerKeywords.filter(keyword => 
    rowText.includes(keyword)
  ).length;
  
  return matchCount >= 3; // If 3+ header keywords match, likely a header
};

export const mapImportData = (rows, hasHeaders = false) => {
  const dataRows = hasHeaders ? rows.slice(1) : rows;
  const expectedColumns = [
    'job_rec_id', 'roma_id', 'role_type', 'title', 'gcm', 'hiring_manager',
    'recruiter', 'practice', 'client', 'date_created', 'status', 'risk_reasons'
  ];
  
  return dataRows.map((row, index) => {
    const mapped = {};
    
    expectedColumns.forEach((col, colIndex) => {
      mapped[col] = row[colIndex] || '';
    });
    
    // Validation and normalization
    const errors = [];
    const warnings = [];
    
    // Required fields
    if (!mapped.job_rec_id.trim()) {
      errors.push('Job Rec ID is required');
    }
    if (!mapped.title.trim()) {
      errors.push('Job Title is required');
    }
    
    // Normalize role type
    if (mapped.role_type) {
      const normalized = normalizeRoleType(mapped.role_type);
      if (normalized) {
        mapped.role_type = normalized;
      } else {
        errors.push(`Invalid Role Type: "${mapped.role_type}". Must be Internal or External`);
      }
    } else {
      mapped.role_type = 'External'; // Default
      warnings.push('Role Type defaulted to External');
    }
    
    // Normalize status
    if (mapped.status) {
      const normalized = normalizeStatus(mapped.status);
      if (normalized) {
        mapped.status = normalized;
      } else {
        errors.push(`Invalid Status: "${mapped.status}". Must be Open or Closed`);
      }
    } else {
      mapped.status = 'Open'; // Default
      warnings.push('Status defaulted to Open');
    }
    
    // Parse and normalize risk reasons
    if (mapped.risk_reasons) {
      const parsed = parseRiskReasons(mapped.risk_reasons);
      if (parsed.valid.length > 0) {
        mapped.risk_reasons = parsed.valid;
        if (parsed.invalid.length > 0) {
          warnings.push(`Invalid risk reasons ignored: ${parsed.invalid.join(', ')}`);
        }
      } else {
        errors.push(`No valid risk reasons found in: "${mapped.risk_reasons}"`);
        mapped.risk_reasons = ['Other']; // Default
      }
    } else {
      mapped.risk_reasons = ['Other']; // Default
      warnings.push('Risk Reasons defaulted to Other');
    }
    
    // Parse date created
    if (mapped.date_created) {
      const parsed = parseDateCreated(mapped.date_created);
      if (parsed) {
        mapped.date_created = parsed;
      } else {
        errors.push(`Invalid Date Created: "${mapped.date_created}". Expected M/D/YYYY format`);
      }
    } else {
      mapped.date_created = new Date().toISOString().split('T')[0]; // Today
      warnings.push('Date Created defaulted to today');
    }
    
    return {
      rowIndex: index + (hasHeaders ? 2 : 1), // 1-based, account for header
      data: mapped,
      errors,
      warnings,
      isValid: errors.length === 0
    };
  });
};

const normalizeRoleType = (value) => {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes('internal') || normalized === 'int') return 'Internal';
  if (normalized.includes('external') || normalized === 'ext') return 'External';
  return null;
};

const normalizeStatus = (value) => {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes('open') || normalized === 'active') return 'Open';
  if (normalized.includes('closed') || normalized === 'inactive') return 'Closed';
  return null;
};

const parseRiskReasons = (value) => {
  const validReasons = ['No candidates', 'Approval blocked', 'Salary range issue', 'Other', 'Aging role'];
  const parts = value.split(/[;,]/).map(part => part.trim()).filter(Boolean);
  
  const valid = [];
  const invalid = [];
  
  parts.forEach(part => {
    const found = validReasons.find(reason => 
      reason.toLowerCase() === part.toLowerCase()
    );
    if (found) {
      if (!valid.includes(found)) {
        valid.push(found);
      }
    } else {
      invalid.push(part);
    }
  });
  
  return { valid, invalid };
};

const parseDateCreated = (value) => {
  try {
    // Expected format: M/D/YYYY (e.g., "9/2/2025")
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = value.trim().match(dateRegex);
    
    if (!match) return null;
    
    const [, month, day, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    // Validate the date
    if (date.getFullYear() !== parseInt(year) ||
        date.getMonth() !== parseInt(month) - 1 ||
        date.getDate() !== parseInt(day)) {
      return null;
    }
    
    // Return as UTC ISO string for storage
    return date.toISOString().split('T')[0];
    
  } catch (error) {
    return null;
  }
};

// Export utilities
export const exportToCSV = (data, columns, filename = 'roles-at-risk.csv') => {
  try {
    const visibleColumns = columns.filter(col => col.visible);
    
    // Create header row
    const headers = visibleColumns.map(col => col.label);
    
    // Create data rows
    const rows = data.map(item => 
      visibleColumns.map(col => {
        const value = item[col.key];
        if (Array.isArray(value)) {
          return value.join('; ');
        }
        return value || '';
      })
    );
    
    // Combine headers and data
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    downloadFile(csvContent, filename, 'text/csv');
    
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new Error('Failed to export CSV');
  }
};

export const exportToXLSX = (data, columns, filename = 'roles-at-risk.xlsx') => {
  try {
    const visibleColumns = columns.filter(col => col.visible);
    
    // Create worksheet data
    const wsData = [
      visibleColumns.map(col => col.label), // Headers
      ...data.map(item => 
        visibleColumns.map(col => {
          const value = item[col.key];
          if (Array.isArray(value)) {
            return value.join('; ');
          }
          return value || '';
        })
      )
    ];
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Roles at Risk');
    
    // Download
    XLSX.writeFile(wb, filename);
    
  } catch (error) {
    console.error('Error exporting XLSX:', error);
    throw new Error('Failed to export XLSX');
  }
};

export const exportToHTML = (data, columns, filename = 'roles-at-risk.html') => {
  try {
    const visibleColumns = columns.filter(col => col.visible);
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Roles at Risk Report</title>
    <style>
        @media print {
            @page { size: A4 landscape; margin: 0.5in; }
            body { font-size: 10pt; }
            table { page-break-inside: avoid; }
            thead { display: table-header-group; }
        }
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .export-info { font-size: 12px; color: #666; margin-bottom: 20px; }
        .text-ellipsis { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    </style>
</head>
<body>
    <h1>Roles at Risk Report</h1>
    <div class="export-info">
        Generated on ${new Date().toLocaleString()} | Total roles: ${data.length}
    </div>
    <table>
        <thead>
            <tr>
                ${visibleColumns.map(col => `<th>${col.label}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${data.map(item => `
                <tr>
                    ${visibleColumns.map(col => {
                        let value = item[col.key] || '';
                        if (Array.isArray(value)) {
                            value = value.join(', ');
                        }
                        const cellClass = value.length > 30 ? 'text-ellipsis' : '';
                        return `<td class="${cellClass}" title="${String(value).replace(/"/g, '&quot;')}">${value}</td>`;
                    }).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;
    
    downloadFile(html, filename, 'text/html');
    
  } catch (error) {
    console.error('Error exporting HTML:', error);
    throw new Error('Failed to export HTML');
  }
};

export const exportToPDF = (data, columns, filename = 'roles-at-risk.pdf') => {
  try {
    const visibleColumns = columns.filter(col => col.visible);
    
    // Create PDF
    const doc = new jsPDF('l', 'pt', 'a4'); // Landscape A4
    
    // Title
    doc.setFontSize(16);
    doc.text('Roles at Risk Report', 40, 40);
    
    // Metadata
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleString()} | Total roles: ${data.length}`, 40, 60);
    
    // Table data
    const tableData = data.map(item => 
      visibleColumns.map(col => {
        const value = item[col.key];
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return String(value || '');
      })
    );
    
    // Auto table
    doc.autoTable({
      head: [visibleColumns.map(col => col.label)],
      body: tableData,
      startY: 80,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [249, 249, 249] },
      columnStyles: {
        // Adjust column widths based on content
        0: { cellWidth: 60 }, // Job Rec ID
        1: { cellWidth: 60 }, // ROMA ID
        // Add more specific widths as needed
      },
      didDrawCell: (data) => {
        // Handle text overflow
        if (data.cell.text && data.cell.text.length > 1) {
          const text = data.cell.text.join(' ');
          if (text.length > 25) {
            data.cell.text = [text.substring(0, 22) + '...'];
          }
        }
      }
    });
    
    // Save PDF
    doc.save(filename);
    
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw new Error('Failed to export PDF');
  }
};

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const formatDateDisplay = (isoDate) => {
  if (!isoDate) return '';
  
  try {
    const date = new Date(isoDate);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
    
  } catch (error) {
    return isoDate;
  }
};
