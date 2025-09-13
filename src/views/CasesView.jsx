import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Search, Filter, Calendar, AlertCircle, Circle, Clock, User, FileText, Settings, LogOut, Home, Briefcase, Users, Edit, Edit2, Trash2, Sun, Moon, Download, Save, Database, Wifi, WifiOff, ChevronDown, Archive, Paperclip, Eye, X, SortDesc } from 'lucide-react';
import { formatDateDisplay } from '../utils/formatDate.js';
import { isFeatureEnabled } from '../config/features.js';
import CaseCard from '../components/CaseCard.jsx';
import NextStepsModal from '../modals/NextStepsModal.jsx';
import AddCaseModal from '../modals/AddCaseModal.jsx';
import BackgroundDoodles from '../components/decors/BackgroundDoodles.jsx';

// Cases Component
const CasesView = ({ cases, addCase, updateCase, deleteCase, addCaseNote, updateCaseNote, deleteCaseNote, updateCaseNextSteps, deleteCaseNextSteps, user, isDarkTheme = true, openAttachmentsModal }) => {
  console.log('CasesView rendered with cases:', cases, 'count:', cases?.length);
  
  // Add some test data if no cases exist
  const testCases = cases && cases.length > 0 ? cases : [
    {
      id: 'test-1',
      attract_id: 'TEST-001',
      subject: 'Test Case - Login Issue',
      status: 'open',
      priority: 'high',
      practice: 'IT Support',
      candidate: 'John Doe',
      recruiter: 'Jane Smith',
      created_at: new Date().toISOString(),
      notes: [
        {
          id: 1,
          text: 'Initial report received from user',
          timestamp: new Date().toISOString(),
          author: 'Support Team'
        }
      ]
    },
    {
      id: 'test-2',
      attract_id: 'TEST-002',
      subject: 'Test Case - Password Reset',
      status: 'in-progress',
      priority: 'medium',
      practice: 'IT Support',
      candidate: 'Sarah Wilson',
      recruiter: 'Mike Johnson',
      created_at: new Date().toISOString(),
      notes: []
    }
  ];

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('open');
  const [filterPractice, setFilterPractice] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [selectedCases, setSelectedCases] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showPracticeDropdown, setShowPracticeDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Search input ref for keyboard shortcuts
  const searchInputRef = useRef(null);

  // Next Steps state
  const [showNextStepsModal, setShowNextStepsModal] = useState(false);
  const [editingNextStepsCaseId, setEditingNextStepsCaseId] = useState(null);
  const [nextStepsContent, setNextStepsContent] = useState('');

  // Get unique practices from cases for dynamic filtering
  const uniquePractices = useMemo(() => {
    const practices = new Set();
    cases.forEach(case_ => {
      if (case_.practice && case_.practice.trim()) {
        practices.add(case_.practice.trim());
      }
    });
    return Array.from(practices).sort();
  }, [cases]);

  // Get counts for each status
  const statusCounts = useMemo(() => {
    const counts = { all: testCases.length, open: 0, resolved: 0 };
    testCases.forEach(case_ => {
      if (case_.status === 'open' || case_.status === 'in-progress') {
        counts.open++;
      } else if (case_.status === 'resolved' || case_.status === 'closed') {
        counts.resolved++;
      }
    });
    return counts;
  }, [testCases]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus search on "/"
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Clear search on "Esc" when search is focused
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchTerm('');
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.export-dropdown')) {
        setShowExportDropdown(false);
      }
      if (showPracticeDropdown && !event.target.closest('.practice-dropdown')) {
        setShowPracticeDropdown(false);
      }
      if (showSortDropdown && !event.target.closest('.sort-dropdown')) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportDropdown, showPracticeDropdown, showSortDropdown]);

  const filteredCases = testCases.filter(case_ => {
    const matchesSearch = case_.attract_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.candidate?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'open' && (case_.status === 'open' || case_.status === 'in-progress')) ||
                         (filterStatus === 'resolved' && (case_.status === 'resolved' || case_.status === 'closed'));
    const matchesPractice = filterPractice === 'all' || case_.practice === filterPractice;
    
    return matchesSearch && matchesStatus && matchesPractice;
  }).sort((a, b) => {
    // Apply sorting
    switch (sortBy) {
      case 'created':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1, normal: 1 };
        return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
      case 'updated':
      default:
        return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
    }
  });

  // Case selection functions
  const toggleCaseSelection = (caseId) => {
    setSelectedCases(prev => 
      prev.includes(caseId) 
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    );
  };

  const selectAllCases = () => {
    if (selectedCases.length === filteredCases.length && filteredCases.length > 0) {
      // If all are selected, clear selection (toggle off)
      setSelectedCases([]);
    } else {
      // Otherwise select all (toggle on)
      setSelectedCases(filteredCases.map(case_ => case_.id));
    }
  };

  const clearCaseSelection = () => {
    setSelectedCases([]);
  };

  // Next Steps helper functions
  const openNextStepsModal = (caseId) => {
    const case_ = testCases.find(c => c.id === caseId);
    setEditingNextStepsCaseId(caseId);
    setNextStepsContent(case_?.next_steps || '');
    setShowNextStepsModal(true);
  };

  const saveNextSteps = async () => {
    if (!editingNextStepsCaseId) return;
    
    try {
      await updateCaseNextSteps(editingNextStepsCaseId, nextStepsContent.trim() || null);
      setShowNextStepsModal(false);
      setEditingNextStepsCaseId(null);
      setNextStepsContent('');
    } catch (error) {
      console.error('Failed to save next steps:', error);
      alert('Failed to save next steps. Please try again.');
    }
  };

  const deleteNextSteps = async (caseId) => {
    if (!window.confirm('Are you sure you want to delete the next steps for this case?')) {
      return;
    }
    
    try {
      await deleteCaseNextSteps(caseId);
    } catch (error) {
      console.error('Failed to delete next steps:', error);
      alert('Failed to delete next steps. Please try again.');
    }
  };

  // Simple export function for cases
  const exportCases = async (format = 'json') => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Respect selection or use filtered cases
      let casesToExport;
      if (selectedCases && selectedCases.length > 0) {
        casesToExport = cases.filter(case_ => selectedCases.includes(case_.id));
      } else {
        casesToExport = filteredCases;
      }
      
      if (casesToExport.length === 0) {
        alert('No cases to export.');
        return;
      }

      const filename = `cases_export_${timestamp}`;
      let content, mimeType, fileExtension;
      
      switch (format) {
        case 'html':
          // Get current theme for export
          const currentTheme = isDarkTheme ? 'dark' : 'light';
          
          content = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Cases Export Report</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px; 
            line-height: 1.6;
        }
        
        /* Light theme styles */
        .theme-light {
            background-color: #f8fafc;
            color: #424250;
        }
        .theme-light .container {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .theme-light .case-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
        }
        .theme-light .next-steps {
            background: #fefce8;
            border-left: 3px solid #d4af37;
        }
        
        /* Dark theme styles */
        .theme-dark {
            background-color: #30313e;
            color: #e2e8f0;
        }
        .theme-dark .container {
            background: #424250;
            border: 1px solid #424250;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }
        .theme-dark .case-card {
            background: #424250;
            border: 1px solid #475569;
        }
        .theme-dark .next-steps {
            background: #422006;
            border-left: 3px solid #d4af37;
        }
        
        .container {
            border-radius: 12px;
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #8a87d6 0%, #8a87d6 100%);
            color: white;
            padding: 20px; 
            border-radius: 12px 12px 0 0;
        }
        .case-card {
            border-radius: 8px;
            margin: 20px;
            padding: 16px;
            page-break-inside: avoid;
            page-break-after: auto;
        }
        .meta-row {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin: 12px 0;
            font-size: 14px;
        }
        .meta-row > span {
            flex: 1;
            min-width: 0;
        }
        .next-steps {
            margin: 16px 0;
            padding: 12px;
            border-radius: 6px;
        }
        .next-steps h4 {
            margin: 0 0 8px 0;
            color: #d4af37;
            font-weight: 600;
        }
        .notes-section {
            margin-top: 16px;
        }
        .note {
            background: rgba(59, 130, 246, 0.1);
            border-left: 3px solid #8a87d6;
            padding: 8px 12px;
            margin: 8px 0;
            border-radius: 0 4px 4px 0;
        }
        .note-meta {
            font-size: 12px;
            opacity: 0.7;
            margin-bottom: 4px;
        }
        .note-content {
            white-space: pre-wrap;
        }
        .status-badge, .priority-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            color: white;
        }
        .status-open { background: #059669; }
        .status-closed { background: #e69a96; }
        .status-pending { background: #d97706; }
        .status-resolved { background: #059669; }
        .priority-high { background: #e69a96; }
        .priority-medium { background: #d97706; }
        .priority-low { background: #059669; }
        .priority-normal { background: #6b7280; }
        
        @media print {
            body { background: white !important; color: black !important; }
            .case-card { page-break-inside: avoid; }
        }
    </style>
</head>
<body class="theme-${currentTheme}">
    <div class="container">
        <div class="header">
            <h1>📊 Cases Export Report</h1>
            <p>Generated: ${formatDateDisplay(new Date())} • Total Cases: ${casesToExport.length}</p>
        </div>
        ${casesToExport.map(case_ => `
            <div class="case-card">
                <h3>${(case_.subject || 'No Subject').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h3>
                
                <div class="meta-row">
                    <span><strong>ID:</strong> ${(case_.attract_id || 'N/A').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
                    <span><strong>Status:</strong> <span class="status-badge status-${(case_.status || 'pending').toLowerCase()}">${(case_.status || 'N/A').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span></span>
                    <span><strong>Practice:</strong> ${(case_.practice || 'N/A').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
                    <span><strong>Priority:</strong> <span class="priority-badge priority-${(case_.priority || 'normal').toLowerCase()}">${(case_.priority || 'N/A').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span></span>
                    <span><strong>Recruiter:</strong> ${(case_.recruiter || 'N/A').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
                    <span><strong>Candidate:</strong> ${(case_.candidate || 'N/A').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
                </div>
                
                ${case_.next_steps ? `
                    <div class="next-steps">
                        <h4>⭐ Next Steps</h4>
                        <div style="white-space: pre-wrap;">${(case_.next_steps || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                    </div>
                ` : ''}
                
                ${case_.notes && case_.notes.length > 0 ? `
                    <div class="notes-section">
                        <h4 style="margin-bottom: 8px;">Notes (${case_.notes.length}):</h4>
                        ${case_.notes.map(note => `
                            <div class="note">
                                <div class="note-meta">
                                    ${formatDateDisplay(note.created_at)} - ${(note.author || 'Unknown').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                                </div>
                                <div class="note-content">${(note.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: #6b7280; font-style: italic;">No notes</p>'}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
          mimeType = 'text/html';
          fileExtension = 'html';
          break;
        case 'csv':
          const csvData = [
            ['Case ID', 'Subject', 'Status', 'Priority', 'Practice', 'Candidate', 'Created', 'Notes Count'],
            ...casesToExport.map(case_ => [
              case_.attract_id || '',
              case_.subject || '',
              case_.status || '',
              case_.priority || '',
              case_.practice || '',
              case_.candidate || '',
              case_.created_at ? formatDateDisplay(case_.created_at) : '',
              (case_.notes || []).length
            ])
          ];
          content = csvData.map(row => 
            row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
          ).join('\n');
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
        case 'txt':
          content = `CASES EXPORT REPORT
${'='.repeat(50)}

Export Date: ${formatDateDisplay(new Date())}
Total Cases: ${casesToExport.length}

${'='.repeat(50)}

${casesToExport.map((case_, index) => `
CASE ${index + 1}
${'-'.repeat(30)}
Case ID: ${case_.attract_id || 'N/A'}
Subject: ${case_.subject || 'N/A'}
Status: ${case_.status || 'N/A'}
Priority: ${case_.priority || 'N/A'}
Practice: ${case_.practice || 'N/A'}
Candidate: ${case_.candidate || 'N/A'}
Created: ${case_.created_at ? formatDateDisplay(case_.created_at) : 'N/A'}

Notes (${(case_.notes || []).length}):
${(case_.notes || []).map((note, noteIndex) => 
  `${noteIndex + 1}. ${note.created_at ? formatDateDisplay(note.created_at) : 'No date'} - ${note.author || 'No author'} - ${note.content || 'No content'}`
).join('\n') || 'No notes'}

`).join('\n')}

Generated by Cases & Project Tracker
`;
          mimeType = 'text/plain';
          fileExtension = 'txt';
          break;
        default:
          content = JSON.stringify(casesToExport, null, 2);
          mimeType = 'application/json';
          fileExtension = 'json';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowExportDropdown(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div 
      className={`${isDarkTheme ? 'bg-[#30313e] text-white' : 'bg-[#e3e3f5] text-gray-900'} min-h-screen relative`} 
      data-cases-view
      style={{ backgroundColor: 'var(--app-bg)', color: 'var(--text)' }}
    >
      <BackgroundDoodles />
      
      <div className="relative z-10 px-6 py-6">
        {/* Screen reader only title for accessibility */}
        <h1 className="sr-only">Cases</h1>

        {/* Sticky Toolbar */}
        <div 
          className="sticky top-0 z-10 mb-6"
          style={{ backgroundColor: 'var(--app-bg)' }}
        >
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: 'var(--surface-bg)', 
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div className="flex flex-wrap items-center gap-4">
              {/* Left: Search Input */}
              <div className="relative flex-shrink-0 w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search cases… (Press / to focus)"
                  className="w-full h-10 pl-9 pr-8 rounded-2xl border transition-all focus:ring-2 focus:ring-[#8a87d6] focus:border-transparent"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchTerm('');
                      e.target.blur();
                    }
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Center: Segmented Control */}
              <div 
                className="inline-flex flex-shrink-0 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl overflow-x-auto scrollbar-hide"
                role="tablist"
                aria-label="Filter cases by status"
                style={{ 
                  backgroundColor: 'var(--surface-bg)',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {[
                  { id: 'all', label: 'All', count: statusCounts.all },
                  { id: 'open', label: 'Open', count: statusCounts.open },
                  { id: 'resolved', label: 'Resolved', count: statusCounts.resolved }
                ].map(({ id, label, count }) => (
                  <button
                    key={id}
                    onClick={() => setFilterStatus(id)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-160 whitespace-nowrap ${
                      filterStatus === id
                        ? 'bg-[#8a87d6] text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-[#8a87d6]'
                    }`}
                    role="tab"
                    aria-selected={filterStatus === id}
                    aria-controls={`${id}-panel`}
                    style={{ height: '40px' }}
                  >
                    <span>{label}</span>
                    <span 
                      className="ml-1 px-2 py-0.5 text-xs border rounded-full"
                      style={{ 
                        backgroundColor: filterStatus === id ? 'rgba(255,255,255,0.2)' : 'var(--surface-bg)',
                        borderColor: filterStatus === id ? 'rgba(255,255,255,0.3)' : 'var(--border)',
                        color: filterStatus === id ? 'white' : 'var(--text)',
                        opacity: 0.85
                      }}
                    >
                      {count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Selection Indicator - Only show when selection > 0 */}
              {selectedCases.length > 0 && (
                <div className="flex items-center gap-2">
                  <span 
                    className="px-2 py-0.5 text-xs border rounded-full"
                    style={{ 
                      backgroundColor: 'var(--surface-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                      opacity: 0.85
                    }}
                  >
                    Selected: {selectedCases.length}
                  </span>
                  <button
                    onClick={clearCaseSelection}
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-[#8a87d6] transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Right: Controls */}
              <div className="flex items-center gap-3 ml-auto flex-wrap">
                {/* Select All Button */}
                <button
                  onClick={selectAllCases}
                  className="h-10 px-4 text-sm font-medium rounded-2xl border transition-all hover:border-[#8a87d6] hover:text-[#8a87d6] flex items-center gap-2 whitespace-nowrap"
                  style={{ 
                    backgroundColor: selectedCases.length === filteredCases.length && filteredCases.length > 0 ? '#8a87d6' : 'var(--card-bg)', 
                    borderColor: selectedCases.length === filteredCases.length && filteredCases.length > 0 ? '#8a87d6' : 'var(--border)',
                    color: selectedCases.length === filteredCases.length && filteredCases.length > 0 ? 'white' : 'var(--text)'
                  }}
                  aria-label={selectedCases.length === filteredCases.length && filteredCases.length > 0 ? 'Clear selection' : `Select all ${filteredCases.length} filtered cases`}
                >
                  <span>{selectedCases.length === filteredCases.length && filteredCases.length > 0 ? 'Selected' : 'Select all'}</span>
                  <span 
                    className="px-2 py-0.5 text-xs border rounded-full"
                    style={{ 
                      backgroundColor: selectedCases.length === filteredCases.length && filteredCases.length > 0 ? 'rgba(255,255,255,0.2)' : 'var(--surface-bg)',
                      borderColor: selectedCases.length === filteredCases.length && filteredCases.length > 0 ? 'rgba(255,255,255,0.3)' : 'var(--border)',
                      color: selectedCases.length === filteredCases.length && filteredCases.length > 0 ? 'white' : 'var(--text)',
                      opacity: 0.85
                    }}
                  >
                    {filteredCases.length}
                  </span>
                </button>              {/* Practices Dropdown */}
              <div className="relative practice-dropdown">
                <button
                  onClick={() => setShowPracticeDropdown(!showPracticeDropdown)}
                  className="h-10 px-4 text-sm font-medium rounded-2xl border transition-all hover:border-[#8a87d6] flex items-center gap-2"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                >
                  {filterPractice === 'all' ? 'All Practices' : filterPractice}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showPracticeDropdown && (
                  <div 
                    className="absolute right-0 top-full mt-2 min-w-[200px] rounded-xl border shadow-lg z-50"
                    style={{ 
                      backgroundColor: 'var(--elevated-bg)', 
                      borderColor: 'var(--border)',
                      boxShadow: 'var(--shadow-hover)'
                    }}
                  >
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setFilterPractice('all');
                          setShowPracticeDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                          filterPractice === 'all' ? 'bg-[#8a87d6] text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        All Practices
                      </button>
                      {uniquePractices.map(practice => (
                        <button
                          key={practice}
                          onClick={() => {
                            setFilterPractice(practice);
                            setShowPracticeDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                            filterPractice === practice ? 'bg-[#8a87d6] text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {practice}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative sort-dropdown">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="h-10 px-4 text-sm font-medium rounded-2xl border transition-all hover:border-[#8a87d6] flex items-center gap-2"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                >
                  <SortDesc className="w-4 h-4" />
                  Sort: {sortBy === 'updated' ? 'Updated' : sortBy === 'created' ? 'Created' : 'Priority'}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showSortDropdown && (
                  <div 
                    className="absolute right-0 top-full mt-2 min-w-[160px] rounded-xl border shadow-lg z-50"
                    style={{ 
                      backgroundColor: 'var(--elevated-bg)', 
                      borderColor: 'var(--border)',
                      boxShadow: 'var(--shadow-hover)'
                    }}
                  >
                    <div className="p-1">
                      {[
                        { id: 'updated', label: 'Updated' },
                        { id: 'created', label: 'Created' },
                        { id: 'priority', label: 'Priority' }
                      ].map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={() => {
                            setSortBy(id);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                            sortBy === id ? 'bg-[#8a87d6] text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Add Case Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="h-10 px-4 bg-[#8a87d6] text-white rounded-2xl font-medium transition-all hover:bg-[#7a77c6] flex items-center gap-2"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <Plus className="w-4 h-4" />
                Add Case
              </button>

              {/* Export Button */}
              <div className="relative export-dropdown">
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="h-10 px-4 border-2 border-[#8a87d6] text-[#8a87d6] rounded-2xl font-medium transition-all hover:bg-[#8a87d6] hover:text-white flex items-center gap-2"
                  disabled={filteredCases.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                {showExportDropdown && (
                  <div 
                    className="absolute right-0 top-full mt-2 min-w-[200px] rounded-xl border shadow-lg z-50"
                    style={{ 
                      backgroundColor: 'var(--elevated-bg)', 
                      borderColor: 'var(--border)',
                      boxShadow: 'var(--shadow-hover)'
                    }}
                  >
                    <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
                      <div className="text-xs text-gray-500 mb-1">Export Format</div>
                      <div className="text-xs text-gray-400">
                        {selectedCases.length > 0 
                          ? `${selectedCases.length} selected cases` 
                          : `${filteredCases.length} filtered cases`}
                      </div>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => exportCases('html')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        🌐 HTML Report
                        <span className="text-xs text-gray-500 ml-auto">Beautiful</span>
                      </button>
                      <button
                        onClick={() => exportCases('csv')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        📊 CSV Spreadsheet
                        <span className="text-xs text-gray-500 ml-auto">Data</span>
                      </button>
                      <button
                        onClick={() => exportCases('json')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        🔧 JSON Data
                        <span className="text-xs text-gray-500 ml-auto">Tech</span>
                      </button>
                      <button
                        onClick={() => exportCases('txt')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        📝 Plain Text
                        <span className="text-xs text-gray-500 ml-auto">Simple</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cases List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredCases.length > 0 ? (
          filteredCases.map(case_ => (
            <CaseCard 
              key={case_.id} 
              case_={case_} 
              updateCase={updateCase} 
              deleteCase={deleteCase}
              addCaseNote={addCaseNote} 
              updateCaseNote={updateCaseNote}
              deleteCaseNote={deleteCaseNote}
              user={user} 
              isDarkTheme={isDarkTheme}
              isSelected={selectedCases.includes(case_.id)}
              onToggleSelection={() => toggleCaseSelection(case_.id)}
              openNextStepsModal={openNextStepsModal}
              deleteNextSteps={deleteNextSteps}
              {...(isFeatureEnabled('ATTACHMENTS') && { onOpenAttachments: openAttachmentsModal })}
            />
          ))
        ) : (
          <div 
            className="rounded-xl p-8 text-center xl:col-span-2 border"
            style={{ 
              backgroundColor: 'var(--surface-bg)', 
              borderColor: 'var(--border)'
            }}
          >
            <FileText className={`w-12 h-12 mx-auto mb-3 ${isDarkTheme ? 'text-slate-600' : 'text-gray-400'}`} />
            <p className={`${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>No cases found. Add your first case to get started!</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddCaseModal
          onClose={() => setShowAddModal(false)}
          onAdd={addCase}
          isDarkTheme={isDarkTheme}
          uniquePractices={uniquePractices}
        />
      )}

      {showNextStepsModal && (
        <NextStepsModal
          isOpen={showNextStepsModal}
          onClose={() => {
            setShowNextStepsModal(false);
            setEditingNextStepsCaseId(null);
            setNextStepsContent('');
          }}
          onSave={saveNextSteps}
          content={nextStepsContent}
          onContentChange={setNextStepsContent}
          isDarkTheme={isDarkTheme}
        />
      )}
      </div>
    </div>
  );
};

export default CasesView;

