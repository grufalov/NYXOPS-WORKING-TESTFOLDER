import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDateDisplay } from './formatDate.js';

export const exportToCSV = (issues, filename = 'advisory-issues.csv') => {
  const headers = [
    'Status', 'Title', 'Owner', 'Description', 'Background', 'Next Steps', 
    'Age (days)', 'Last Activity', 'Notes Count', 'Latest Note'
  ];
  
  const rows = issues.map(issue => {
    const latestNote = issue.advisory_issue_notes && issue.advisory_issue_notes.length > 0 
      ? issue.advisory_issue_notes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
      : null;
    
    return [
      issue.status || issue.simplified_status || '',
      issue.title || '',
      issue.owner || '',
      (issue.description || '').replace(/"/g, '""'),
      (issue.background || '').replace(/"/g, '""'),
      (issue.next_steps || '').replace(/"/g, '""'),
      issue.age_in_days || issue.age_days || 0,
      formatDateDisplay(issue.last_activity_date || issue.created_at),
      issue.advisory_issue_notes ? issue.advisory_issue_notes.length : 0,
      latestNote ? `${formatDateDisplay(latestNote.created_at)}: ${latestNote.content.replace(/"/g, '""')}` : ''
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportToPDF = (issues, filename = 'advisory-issues.pdf') => {
  const doc = new jsPDF('p', 'mm', 'a4');
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;

  // Helper function for page breaks
  const checkPageBreak = (requiredSpace = 30) => {
    if (yPosition + requiredSpace > 270) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Header with styling
  doc.setFillColor(59, 130, 246); // Blue background
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Advisory Issues Report', margin, 18);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  })}`, margin, 28);
  
  yPosition = 45;
  doc.setTextColor(0, 0, 0); // Reset to black

  // Summary Statistics Box
  const openIssues = issues.filter(i => i.status === 'open' || i.simplified_status === 'Open').length;
  const closedIssues = issues.length - openIssues;

  // Summary table
  autoTable(doc, {
    head: [['Metric', 'Count']],
    body: [
      ['Total Issues', issues.length.toString()],
      ['Open Issues', openIssues.toString()],
      ['Closed Issues', closedIssues.toString()]
    ],
    startY: yPosition,
    theme: 'grid',
    headStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59] },
    margin: { left: margin, right: margin },
    tableWidth: 80
  });
  
  yPosition = doc.lastAutoTable.finalY + 20;

  // Individual Issues
  issues.forEach((issue, index) => {
    checkPageBreak(80);
    
    // Issue header with background
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), 12, 'F');
    
    // Issue number and title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const statusColor = issue.status === 'open' || issue.simplified_status === 'Open' ? [5, 150, 105] : [220, 38, 38];
    doc.setTextColor(...statusColor);
    doc.text(`${index + 1}. ${issue.title}`, margin + 2, yPosition + 3);
    yPosition += 15;
    
    // Metadata table
    doc.setTextColor(0, 0, 0);
    const metaData = [
      ['Status', issue.status || issue.simplified_status || 'Unknown'],
      ['Owner', issue.owner || 'Unassigned'],
      ['Age', `${issue.age_in_days || issue.age_days || 0} days`]
    ];
    
    autoTable(doc, {
      body: metaData,
      startY: yPosition,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 25 } },
      margin: { left: margin + 5, right: margin }
    });
    
    yPosition = doc.lastAutoTable.finalY + 8;
    
    // Content sections
    const sections = [
      { title: 'Description', content: issue.description, color: [59, 130, 246] },
      { title: 'Background', content: issue.background, color: [99, 102, 241] },
      { title: '⭐ Next Steps', content: issue.next_steps, color: [234, 179, 8] }
    ];
    
    sections.forEach(section => {
      if (section.content) {
        checkPageBreak(25);
        
        // Section header
        doc.setFillColor(...section.color, 0.1);
        doc.rect(margin, yPosition - 2, pageWidth - (margin * 2), 8, 'F');
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...section.color);
        doc.text(section.title, margin + 2, yPosition + 3);
        yPosition += 10;
        
        // Content
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(section.content, pageWidth - (margin * 2) - 10);
        doc.text(lines, margin + 5, yPosition);
        yPosition += lines.length * 4 + 5;
      }
    });
    
    // Notes Timeline
    if (issue.advisory_issue_notes && issue.advisory_issue_notes.length > 0) {
      checkPageBreak(30);
      
      // Notes header
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, yPosition - 2, pageWidth - (margin * 2), 8, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(`Notes Timeline (${issue.advisory_issue_notes.length})`, margin + 2, yPosition + 3);
      yPosition += 12;
      
      // Notes table
      const sortedNotes = [...issue.advisory_issue_notes]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5); // Limit to 5 most recent notes
      
      const notesData = sortedNotes.map(note => [
        formatDateDisplay(note.created_at),
        note.author || note.user_name || 'Unknown',
        note.content.length > 80 ? note.content.substring(0, 80) + '...' : note.content
      ]);
      
      if (notesData.length > 0) {
        autoTable(doc, {
          head: [['Date', 'Author', 'Note']],
          body: notesData,
          startY: yPosition,
          theme: 'striped',
          styles: { fontSize: 8, cellPadding: 3 },
          columnStyles: { 
            0: { cellWidth: 25 }, 
            1: { cellWidth: 30 }, 
            2: { cellWidth: 'auto' } 
          },
          headStyles: { fillColor: [71, 85, 105] },
          margin: { left: margin + 5, right: margin }
        });
        
        yPosition = doc.lastAutoTable.finalY + 5;
      }
    }
    
    // Separator line
    if (index < issues.length - 1) {
      checkPageBreak(10);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
    }
  });

  // Footer on each page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, 285);
  }

  doc.save(filename);
};

export const exportToHTML = (issues, filename = 'advisory-issues.html') => {
  const openIssues = issues.filter(i => i.status === 'open' || i.simplified_status === 'Open').length;
  const closedIssues = issues.length - openIssues;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Advisory Issues Report</title>
  <style>
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      margin: 0; 
      padding: 20px; 
      background-color: #f8fafc;
      color: #424250;
    }
    .container { 
      max-width: 800px; 
      margin: 0 auto; 
      background: white; 
      padding: 30px; 
      border-radius: 8px; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header { 
      text-align: center; 
      border-bottom: 3px solid #8a87d6; 
      padding-bottom: 20px; 
      margin-bottom: 30px; 
    }
    .header h1 { 
      color: #1e40af; 
      margin: 0; 
      font-size: 2.5em; 
    }
    .header p { 
      color: #64748b; 
      margin: 10px 0 0 0; 
    }
    .summary { 
      display: flex; 
      justify-content: space-around; 
      background: #f3f4fd; 
      padding: 20px; 
      border-radius: 8px; 
      margin-bottom: 30px; 
    }
    .summary-item { 
      text-align: center; 
    }
    .summary-number { 
      font-size: 2em; 
      font-weight: bold; 
      display: block; 
    }
    .summary-open { color: #059669; }
    .summary-closed { color: #e69a96; }
    .summary-total { color: #8a87d6; }
    .issue { 
      border: 1px solid #e2e8f0; 
      border-radius: 8px; 
      margin-bottom: 25px; 
      overflow: hidden;
    }
    .issue-header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      padding: 15px 20px; 
      font-weight: bold; 
      font-size: 1.2em; 
    }
    .issue-meta { 
      background: #f8fafc; 
      padding: 10px 20px; 
      border-bottom: 1px solid #e2e8f0; 
      font-size: 0.9em; 
      color: #64748b; 
    }
    .status-open { color: #059669; font-weight: bold; }
    .status-closed { color: #e69a96; font-weight: bold; }
    .issue-content { 
      padding: 20px; 
    }
    .section { 
      margin-bottom: 20px; 
    }
    .section-title { 
      font-weight: bold; 
      color: #374151; 
      margin-bottom: 8px; 
      font-size: 1.1em; 
    }
    .section-content { 
      background: #f9fafb; 
      padding: 12px; 
      border-radius: 6px; 
      border-left: 4px solid #8a87d6; 
      line-height: 1.6; 
    }
    .next-steps { 
      background: #fefce8; 
      border-left-color: #eab308; 
    }
    .next-steps .section-title { 
      color: #a16207; 
    }
    .notes-section { 
      background: #f8fafc; 
      border-radius: 8px; 
      padding: 15px; 
    }
    .note { 
      background: white; 
      border-radius: 6px; 
      padding: 12px; 
      margin-bottom: 10px; 
      border-left: 4px solid #6366f1; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
    }
    .note-header { 
      font-size: 0.85em; 
      color: #6b7280; 
      font-weight: bold; 
      margin-bottom: 5px; 
    }
    .note-content { 
      color: #374151; 
      line-height: 1.5; 
    }
    @media print {
      .container { box-shadow: none; }
      .issue { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Advisory Issues Report</h1>
      <p>Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    
    <div class="summary">
      <div class="summary-item">
        <span class="summary-number summary-total">${issues.length}</span>
        <span>Total Issues</span>
      </div>
      <div class="summary-item">
        <span class="summary-number summary-open">${openIssues}</span>
        <span>Open Issues</span>
      </div>
      <div class="summary-item">
        <span class="summary-number summary-closed">${closedIssues}</span>
        <span>Closed Issues</span>
      </div>
    </div>

    ${issues.map((issue, index) => {
      const isOpen = issue.status === 'open' || issue.simplified_status === 'Open';
      const sortedNotes = issue.advisory_issue_notes ? 
        [...issue.advisory_issue_notes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [];
      
      return `
        <div class="issue">
          <div class="issue-header">
            ${index + 1}. ${issue.title}
          </div>
          <div class="issue-meta">
            Status: <span class="status-${isOpen ? 'open' : 'closed'}">${issue.status || issue.simplified_status || 'Unknown'}</span> | 
            Owner: ${issue.owner || 'Unassigned'} | 
            Age: ${issue.age_in_days || issue.age_days || 0} days
          </div>
          <div class="issue-content">
            ${issue.description ? `
              <div class="section">
                <div class="section-title">Description</div>
                <div class="section-content">${issue.description.replace(/\n/g, '<br>')}</div>
              </div>
            ` : ''}
            
            ${issue.background ? `
              <div class="section">
                <div class="section-title">Background</div>
                <div class="section-content">${issue.background.replace(/\n/g, '<br>')}</div>
              </div>
            ` : ''}
            
            ${issue.next_steps ? `
              <div class="section">
                <div class="section-title">⭐ Next Steps</div>
                <div class="section-content next-steps">${issue.next_steps.replace(/\n/g, '<br>')}</div>
              </div>
            ` : ''}
            
            ${sortedNotes.length > 0 ? `
              <div class="section">
                <div class="section-title">Notes Timeline (${sortedNotes.length})</div>
                <div class="notes-section">
                  ${sortedNotes.map(note => `
                    <div class="note">
                      <div class="note-header">
                        ${formatDateDisplay(note.created_at)} - ${note.author || note.user_name || 'Unknown User'}
                      </div>
                      <div class="note-content">${note.content.replace(/\n/g, '<br>')}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('')}
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
