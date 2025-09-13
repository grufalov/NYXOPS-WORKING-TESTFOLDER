import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, ArrowUp, Star } from 'lucide-react';

// CardPresenter with reorganized footer layout and working kebab menu
const CardPresenter = ({
  issues = [],
  selectedIssues = [],
  toggleIssueSelection,
  onOpenDetails,
  onPromote,
  onEdit,
  onDelete,
  isDarkTheme = true
}) => {
  const [showKebabMenu, setShowKebabMenu] = useState(null);

  const getSimplifiedStatus = (status) => {
    if (!status) return 'open';
    const lowercaseStatus = status.toLowerCase();
    if (lowercaseStatus.includes('resolved') || lowercaseStatus.includes('closed') || lowercaseStatus.includes('complete')) {
      return 'resolved';
    }
    return 'open';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {issues.map((issue) => {
        const selected = selectedIssues.includes(issue.id);
        const simplifiedStatus = getSimplifiedStatus(issue.status);
        
        return (
          <article
            key={issue.id}
            tabIndex={0}
            role="button"
            aria-label={`Open details for ${issue.title}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onOpenDetails(issue);
              }
            }}
            onClick={(e) => {
              // Check if the click target is a control element (not the card itself)
              const isControl = e.target.tagName.toLowerCase() === 'input' ||
                               e.target.tagName.toLowerCase() === 'button' ||
                               e.target.closest('input') ||
                               e.target.closest('button');
              
              if (!isControl) {
                onOpenDetails(issue);
              }
            }}
            className={`rounded-xl border transition-all cursor-pointer group p-4 min-h-[280px] ${
              selected ? 'ring-2 ring-[#8a87d6]/40 border-[#8a87d6]/60' : ''
            }`}
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: selected ? '#8a87d6' : 'var(--border)',
              boxShadow: 'var(--shadow)'
            }}
            onMouseEnter={(e) => {
              if (!selected) {
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                e.currentTarget.style.borderColor = '#8a87d6';
              }
            }}
            onMouseLeave={(e) => {
              if (!selected) {
                e.currentTarget.style.boxShadow = 'var(--shadow)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }
            }}
          >
            {/* Title */}
            <div className="mb-4">
              <h3 className="font-semibold text-base truncate" style={{ color: 'var(--text)' }}>
                {issue.title}
              </h3>
              
              {/* Labeled metadata line */}
              <div className="mt-1 text-[13px]" style={{ color: 'var(--muted)' }}>
                <span className="font-medium opacity-85">Business SPOC:</span>{' '}
                <span>{issue.business_stakeholder || issue.owner || 'Unassigned'}</span>
                {' • '}
                <span className="font-medium opacity-85">Recruiter:</span>{' '}
                <span>{issue.recruiter || '–'}</span>
                {' • '}
                <span className="font-medium opacity-85">Practice:</span>{' '}
                <span>{issue.practice || '–'}</span>
                {' • '}
                <span className="font-medium opacity-85">Age:</span>{' '}
                <span>{issue.age_in_days === 1 ? '1 day' : `${issue.age_in_days || 0} days`}</span>
              </div>
            </div>

            {/* Content preview - Next Steps and Background */}
            <div className="flex-1 space-y-3">
              {/* Next Steps - exact same styling as Cases */}
              {issue.next_steps ? (
                <div 
                  className="p-3 rounded-xl border"
                  style={{ 
                    backgroundColor: isDarkTheme ? 'rgba(251, 191, 36, 0.08)' : 'rgba(251, 191, 36, 0.05)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <h4 className="text-yellow-600 dark:text-yellow-500 font-medium flex items-center gap-2 text-sm mb-2">
                    <span className="text-yellow-500">⭐</span>
                    Next Steps
                  </h4>
                  <div className="text-sm line-clamp-2" style={{ color: 'var(--text)' }}>
                    {issue.next_steps}
                  </div>
                </div>
              ) : (
                <div 
                  className="p-3 border-2 border-dashed rounded-xl text-sm"
                  style={{ 
                    borderColor: 'var(--border)',
                    color: 'var(--muted)'
                  }}
                >
                  <span className="text-yellow-500">⭐</span> No next steps defined
                </div>
              )}

              {/* Background preview - muted, 1 line max */}
              <div>
                <span className="text-xs font-medium" style={{ color: 'var(--muted)', opacity: 0.85 }}>
                  Background:
                </span>
                <p className="text-sm mt-1 line-clamp-1" style={{ color: 'var(--muted)' }}>
                  {issue.background || 'No background provided'}
                </p>
              </div>
            </div>

            {/* Footer: Promote | Status | Actions | Checkbox */}
            <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              {/* Left: Promote + Status */}
              <div className="flex items-center gap-3">
                {/* Promote button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (simplifiedStatus === 'open' && !issue.promoted) {
                      onPromote(issue);
                    }
                  }}
                  disabled={simplifiedStatus !== 'open' || issue.promoted}
                  className={`h-8 px-3 text-sm font-medium rounded-xl transition-all ${
                    simplifiedStatus === 'open' && !issue.promoted
                      ? 'bg-[#8a87d6] text-white hover:bg-[#7a77c6]'
                      : 'border border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500'
                  }`}
                  title={
                    issue.promoted 
                      ? 'Issue already promoted'
                      : simplifiedStatus !== 'open'
                      ? 'Only open issues can be promoted'
                      : 'Promote issue to case'
                  }
                  aria-label={`Promote ${issue.title} to case`}
                >
                  {issue.promoted ? 'Promoted' : 'Promote'}
                </button>

                {/* Divider */}
                <div className="w-px h-4" style={{ backgroundColor: 'var(--border)' }}></div>

                {/* Status pill */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    simplifiedStatus === 'open'
                      ? 'border-[#8a87d6] text-[#8a87d6] bg-transparent'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
                  }`}
                >
                  {simplifiedStatus === 'open' ? 'Open' : 'Resolved'}
                </span>
              </div>

              {/* Right: Edit/Delete/Kebab + Checkbox */}
              <div className="flex items-center gap-2">
                {/* Action buttons */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(issue);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  style={{ color: 'var(--muted)' }}
                  aria-label={`Edit issue: ${issue.title}`}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(issue);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
                  aria-label={`Delete issue: ${issue.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                {/* Kebab menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowKebabMenu(showKebabMenu === issue.id ? null : issue.id);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    style={{ color: 'var(--muted)' }}
                    aria-label={`More actions for ${issue.title}`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {showKebabMenu === issue.id && (
                    <div 
                      className="absolute right-0 bottom-full mb-2 w-40 rounded-lg border shadow-lg z-10"
                      style={{ 
                        backgroundColor: 'var(--elevated-bg)',
                        borderColor: 'var(--border)',
                        boxShadow: 'var(--shadow-hover)'
                      }}
                    >
                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(issue);
                            setShowKebabMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left flex items-center gap-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                          style={{ color: 'var(--text)' }}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(issue);
                            setShowKebabMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left flex items-center gap-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selection checkbox */}
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleIssueSelection(issue.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.code === 'Space') {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleIssueSelection(issue.id);
                    }
                  }}
                  aria-label={`Select issue: ${issue.title}`}
                  className="w-4 h-4 rounded border-2 text-[#8a87d6] focus:ring-[#8a87d6] focus:ring-2"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default CardPresenter;
