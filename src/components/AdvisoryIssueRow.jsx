import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUp,
  MessageSquare,
  Clock,
  User,
  Calendar
} from 'lucide-react';
import { 
  getSimplifiedStatus, 
  getStatusDisplay, 
  calculateAge, 
  formatAge,
  getAgeColorClass,
  highlightSearchTerms,
  formatPromotionInfo,
  getNoteCount
} from '../utils/advisoryHelpers.js';
import { formatDateDisplay } from '../utils/formatDate.js';
import NotesTimeline from './NotesTimeline.jsx';

/**
 * AdvisoryIssueRow Component for v1.5
 * Expandable table row with inline editing and notes timeline
 */
const AdvisoryIssueRow = ({
  issue,
  user,
  isDarkTheme = true,
  isExpanded = false,
  onToggleExpand,
  onEdit,
  onDelete,
  onPromote,
  onStatusToggle,
  onAddNote,
  searchQuery = '',
  isMobile = false,
  columns = []
}) => {
  const [showActions, setShowActions] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  
  const simplifiedStatus = getSimplifiedStatus(issue.status);
  const statusDisplay = getStatusDisplay(issue.status);
  const age = calculateAge(issue.created_at);
  const ageDisplay = formatAge(age);
  const ageColorClass = getAgeColorClass(age);
  const noteCount = getNoteCount(issue);
  
  const handleStatusToggle = async () => {
    if (statusChanging) return;
    
    setStatusChanging(true);
    try {
      const newStatus = simplifiedStatus === 'open' ? 'closed' : 'open';
      await onStatusToggle?.(issue.id, newStatus);
    } finally {
      setStatusChanging(false);
    }
  };
  
  const handlePromote = () => {
    setShowActions(false);
    onPromote?.(issue);
  };
  
  const handleEdit = () => {
    setShowActions(false);
    onEdit?.(issue);
  };
  
  const handleDelete = () => {
    setShowActions(false);
    if (window.confirm('Are you sure you want to delete this advisory issue? This action cannot be undone.')) {
      onDelete?.(issue.id);
    }
  };
  
  const renderCellContent = (column) => {
    switch (column.key) {
      case 'title':
        return (
          <div className="flex items-center">
            <button
              onClick={onToggleExpand}
              className={`mr-2 p-1 rounded hover:bg-opacity-20 ${
                isDarkTheme ? 'hover:bg-[#f3f4fd]' : 'hover:bg-black'
              }`}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <div 
                className={`font-medium ${
                  isDarkTheme ? 'text-white' : 'text-gray-900'
                }`}
                dangerouslySetInnerHTML={{
                  __html: highlightSearchTerms(issue.title || '', searchQuery)
                }}
              />
              {issue.promoted && (
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-[#f3f4fd] text-[#e69a96] dark:bg-[#f3f4fd] dark:text-[#e69a96]">
                    Promoted to Case
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'status':
        return (
          <button
            onClick={handleStatusToggle}
            disabled={statusChanging}
            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full transition-colors ${
              statusChanging ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
            } ${statusDisplay.color} ${statusDisplay.bgColor} ${statusDisplay.darkColor} ${statusDisplay.darkBgColor}`}
          >
            {statusChanging ? (
              <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent mr-1" />
            ) : null}
            {statusDisplay.label}
          </button>
        );
      
      case 'owner':
        return (
          <div className={`text-sm ${
            isDarkTheme ? 'text-slate-300' : 'text-gray-700'
          }`}>
            {highlightSearchTerms(
              issue.owner || issue.business_stakeholder || '-',
              searchQuery
            )}
          </div>
        );
      
      case 'age':
        return (
          <div className={`text-sm font-medium ${ageColorClass}`}>
            {ageDisplay}
          </div>
        );
      
      case 'last_activity':
        return (
          <div className={`text-sm ${
            isDarkTheme ? 'text-slate-400' : 'text-gray-600'
          }`}>
            {formatDateDisplay(issue.last_activity_date || issue.updated_at)}
          </div>
        );
      
      case 'notes':
        return (
          <div className={`text-sm ${
            isDarkTheme ? 'text-slate-400' : 'text-gray-600'
          }`}>
            {noteCount > 0 ? (
              <span className="flex items-center">
                <MessageSquare className="w-3 h-3 mr-1" />
                {noteCount}
              </span>
            ) : (
              '-'
            )}
          </div>
        );
      
      case 'actions':
        return (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className={`p-2 rounded-md transition-colors ${
                isDarkTheme
                  ? 'hover:bg-[#8a87d6] text-slate-400 hover:text-white'
                  : 'hover:bg-[#ffffff] text-gray-500 hover:text-gray-700'
              }`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <div className={`absolute right-0 top-full mt-1 w-48 py-1 rounded-md shadow-lg border z-20 ${
                  isDarkTheme
                    ? 'bg-[#424250] border-slate-600'
                    : 'bg-[#f3f4fd] border-gray-200'
                }`}>
                  <button
                    onClick={handleEdit}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center transition-colors ${
                      isDarkTheme
                        ? 'text-slate-300 hover:bg-[#8a87d6] hover:text-white'
                        : 'text-gray-700 hover:bg-[#ffffff] hover:text-gray-900'
                    }`}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Issue
                  </button>
                  
                  {!issue.promoted && (
                    <button
                      onClick={handlePromote}
                      className={`w-full px-4 py-2 text-left text-sm flex items-center transition-colors ${
                        isDarkTheme
                          ? 'text-slate-300 hover:bg-[#8a87d6] hover:text-white'
                          : 'text-gray-700 hover:bg-[#ffffff] hover:text-gray-900'
                      }`}
                    >
                      <ArrowUp className="w-4 h-4 mr-2" />
                      Promote to Case
                    </button>
                  )}
                  
                  <button
                    onClick={handleDelete}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center transition-colors ${
                      isDarkTheme
                        ? 'text-[#e69a96] hover:bg-[#e69a96]/20 hover:text-[#e69a96]'
                        : 'text-[#e69a96] hover:bg-[#e69a96] hover:text-[#e69a96]'
                    }`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Issue
                  </button>
                </div>
              </>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <>
      {/* Main row */}
      <tr className={`${
        isDarkTheme ? 'hover:bg-[#8a87d6]/50' : 'hover:bg-[#e3e3f5]'
      } transition-colors ${isExpanded ? (isDarkTheme ? 'bg-[#8a87d6]/30' : 'bg-[#8a87d6]/30') : ''}`}>
        {columns.map((column) => (
          <td
            key={column.key}
            className={`px-4 py-3 ${
              column.key === 'title' ? 'max-w-xs' : ''
            }`}
          >
            {renderCellContent(column)}
          </td>
        ))}
      </tr>
      
      {/* Expanded content */}
      {isExpanded && (
        <tr className={`${
          isDarkTheme ? 'bg-[#8a87d6]/20' : 'bg-[#8a87d6]/50'
        }`}>
          <td colSpan={columns.length} className="px-4 py-6">
            <div className="max-w-4xl">
              {/* Description */}
              {(issue.description || issue.background) && (
                <div className="mb-6">
                  <h4 className={`text-sm font-medium mb-2 flex items-center ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    <User className="w-4 h-4 mr-1" />
                    Description
                  </h4>
                  <div 
                    className={`text-sm leading-relaxed ${
                      isDarkTheme ? 'text-slate-400' : 'text-gray-600'
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: highlightSearchTerms(
                        issue.description || issue.background || '',
                        searchQuery
                      )
                    }}
                  />
                </div>
              )}
              
              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <div className={`text-xs font-medium mb-1 ${
                    isDarkTheme ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    Created
                  </div>
                  <div className={`text-sm flex items-center ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDateDisplay(issue.created_at)}
                  </div>
                </div>
                
                <div>
                  <div className={`text-xs font-medium mb-1 ${
                    isDarkTheme ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    Last Activity
                  </div>
                  <div className={`text-sm flex items-center ${
                    isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDateDisplay(issue.last_activity_date || issue.updated_at)}
                  </div>
                </div>
                
                {issue.promoted && (
                  <div>
                    <div className={`text-xs font-medium mb-1 ${
                      isDarkTheme ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                      Promotion Info
                    </div>
                    <div className={`text-sm ${
                      isDarkTheme ? 'text-[#e69a96]' : 'text-[#e69a96]'
                    }`}>
                      {formatPromotionInfo(issue)}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Notes Timeline */}
              <div>
                <h4 className={`text-sm font-medium mb-3 flex items-center ${
                  isDarkTheme ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Timeline Notes ({noteCount})
                </h4>
                
                <NotesTimeline
                  issueId={issue.id}
                  notes={issue.advisory_issue_notes || []}
                  user={user}
                  isDarkTheme={isDarkTheme}
                  onAddNote={onAddNote}
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default AdvisoryIssueRow;

