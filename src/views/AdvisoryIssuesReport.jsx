import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';
import { formatDateDisplay } from '../utils/formatDate.js';
import { getAuthorName } from '../utils/authorUtils.js';
import { Star } from 'lucide-react';

const AdvisoryIssuesReport = ({ filters = {}, onClose }) => {
  const [issues, setIssues] = useState([]);
  const [notes, setNotes] = useState({});
  const [userProfiles, setUserProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [filters]);

  useEffect(() => {
    if (!loading && issues.length > 0) {
      // Auto-trigger print after layout paints
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.print();
        }, 200);
      });
    }
  }, [loading, issues]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('advisory_issues')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status !== 'All') {
        query = query.eq('status', filters.status);
      }
      if (filters.practice && filters.practice !== 'All') {
        query = query.eq('practice', filters.practice);
      }
      if (filters.recruiter && filters.recruiter !== 'All') {
        query = query.eq('recruiter', filters.recruiter);
      }
      if (filters.owner && filters.owner !== 'All') {
        query = query.eq('business_stakeholder', filters.owner);
      }

      const { data: issuesData, error: issuesError } = await query;
      if (issuesError) throw issuesError;

      setIssues(issuesData || []);

      // Fetch notes for all issues
      if (issuesData && issuesData.length > 0) {
        const issueIds = issuesData.map(issue => issue.id);
        const { data: notesData, error: notesError } = await supabase
          .from('advisory_issue_notes')
          .select('*')
          .in('advisory_issue_id', issueIds)
          .order('created_at', { ascending: false }); // Latest first

        if (notesError) throw notesError;

        // Group notes by advisory_issue_id
        const notesByIssue = {};
        (notesData || []).forEach(note => {
          if (!notesByIssue[note.advisory_issue_id]) {
            notesByIssue[note.advisory_issue_id] = [];
          }
          notesByIssue[note.advisory_issue_id].push(note);
        });
        setNotes(notesByIssue);
      }

      // Fetch user profiles for author name mapping (handle gracefully if table doesn't exist)
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email');

        if (!profilesError && profilesData) {
          const profilesMap = {};
          profilesData.forEach(profile => {
            profilesMap[profile.id] = profile;
          });
          setUserProfiles(profilesMap);
        }
      } catch (profileError) {
        console.log('Profiles table not found, continuing without user profile mapping');
        // Continue without profiles - the getAuthorName utility will handle fallbacks
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get clean creator name
  const getCreatorName = (issue) => {
    if (userProfiles[issue.user_id]?.full_name) {
      return userProfiles[issue.user_id].full_name;
    }
    return null; // Return null to show "Created on DATE" instead
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#f3f4fd] rounded-lg p-8">
          <div className="text-center">Loading report...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="report-root fixed inset-0 flex items-center justify-center z-50">
      <div className="print-backdrop absolute inset-0 bg-black/50 no-print" />
      <div className="report-panel bg-[#f3f4fd] rounded-lg shadow-xl max-w-6xl max-h-[90vh] overflow-auto">
        <div className="no-print p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Advisory Issues Report</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="print-content p-6 card-inner">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Advisory Issues Report</h1>
            <p className="text-xs uppercase tracking-wide text-gray-500">Generated on {formatDateDisplay(new Date())}</p>
          </div>

          {/* Issues */}
          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue.id} className="rounded-xl border border-gray-200 shadow-sm bg-[#f3f4fd] relative issue-card">
                {/* Left accent */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#c2410c] rounded-l-xl"></div>
                
                <div className="card-inner p-4 pl-6">
                  {/* Title row: Title + Status (no Age) */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 leading-tight">{issue.title}</h3>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      issue.status === 'open' 
                        ? 'bg-[#f3f4fd] text-[#e69a96] border-[#f3f4fd]'
                        : 'bg-[#ffffff] text-gray-700 border-gray-200'
                    }`}>
                      {issue.status === 'open' ? 'Open' : 'Closed'}
                    </span>
                  </div>

                  {/* Meta line under title (labeled, compact) */}
                  <div className="text-xs text-gray-600 mt-1 mb-4">
                    <span className="uppercase tracking-wide text-[10px] text-gray-500 mr-1">Practice:</span>
                    {issue.practice || 'Not specified'} • 
                    <span className="uppercase tracking-wide text-[10px] text-gray-500 mr-1 ml-2">Recruiter:</span>
                    {issue.recruiter || 'Not specified'} • 
                    <span className="uppercase tracking-wide text-[10px] text-gray-500 mr-1 ml-2">Business Stakeholder:</span>
                    {issue.business_stakeholder || 'Not specified'}
                  </div>

                  {/* Description */}
                  {issue.description && (
                    <div className="mb-4">
                      <div className="uppercase tracking-wide text-[10px] text-gray-500 mb-2">Description</div>
                      <div className="text-sm text-gray-800">{issue.description}</div>
                    </div>
                  )}

                  {/* Background block */}
                  {issue.background && (
                    <div className="mb-4">
                      <div className="bg-[#e3e3f5] border border-gray-200 rounded-lg p-3">
                        <div className="uppercase tracking-wide text-[10px] text-gray-500 mb-2">Background</div>
                        <div className="text-sm text-gray-800">{issue.background}</div>
                      </div>
                    </div>
                  )}

                  {/* Next Steps block */}
                  {issue.next_steps && (
                    <div className="mb-4">
                      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Star size={14} className="text-amber-600 print:text-black" aria-hidden />
                          <span className="uppercase tracking-wide text-[10px] text-gray-500">Next Steps</span>
                        </div>
                        <div className="text-sm text-gray-800">{issue.next_steps}</div>
                      </div>
                    </div>
                  )}

                  {/* Notes Timeline */}
                  {notes[issue.id] && notes[issue.id].length > 0 && (
                    <div className="mt-4">
                      <div className="bg-[#e3e3f5] border border-gray-200 rounded-lg p-3">
                        <div className="uppercase tracking-wide text-[10px] text-gray-500 mb-2">
                          Notes Timeline
                        </div>
                        <div className="space-y-2">
                          {notes[issue.id].map((note, index) => (
                            <div 
                              key={note.id} 
                              className={`border border-gray-200 rounded-lg p-2.5 text-sm ${
                                index % 2 === 1 ? 'even:bg-[#e3e3f5]' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <div className="text-sm text-gray-800">{note.content}</div>
                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                  {formatDateDisplay(note.created_at)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {issues.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No advisory issues found matching the current filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisoryIssuesReport;

