import React from 'react';
import { PencilLine, Trash2, StickyNote, CheckCircle2 } from 'lucide-react';

/**
 * CaseCard (NyxOps rebrand)
 * Hierarchy:
 *  - Header: title + status badge + meta
 *  - Next Steps: emphasized sub-surface with coral accent
 *  - Notes: divided list
 *  - Footer: primary/secondary actions
 *
 * Props (keep it flexible to match existing data shape):
 *  - item: {
 *      id, title, status, practice, recruiter, candidate,
 *      next_steps, notes: [{ id, content, created_at, author }]
 *    }
 *  - onEdit(item), onDelete(item), onAddNote(item)
 */
const CaseCard = ({
  item,
  onEdit = () => {},
  onDelete = () => {},
  onAddNote = () => {},
  isDarkTheme = false,
}) => {
  const notes = Array.isArray(item?.notes) ? item.notes : [];

  const statusBadge = (status) => {
    // Rebrand semantics to our palette
    switch ((status || '').toLowerCase()) {
      case 'open':
      case 'active':
        return 'bg-[#8a87d6] text-white';
      case 'resolved':
      case 'closed':
        return 'bg-[#f3f4fd] text-[#e69a96] ring-1 ring-[#e69a96]/30';
      default:
        return 'bg-[#8a87d6] text-white';
    }
  };

  return (
    <article
      className={[
        'group rounded-2xl border transition-all shadow-sm',
        isDarkTheme ? 'bg-[#424250] border-slate-700' : 'bg-[#f3f4fd] border-[#e3e3f5]',
        'hover:shadow-md hover:translate-y-[-1px]',
        isDarkTheme ? 'hover:ring-2 hover:ring-[#8a87d6]' : 'hover:ring-2 hover:ring-[#ffffff]',
      ].join(' ')}
    >
      {/* Header */}
      <header className={['rounded-t-2xl p-4 border-b',
        isDarkTheme ? 'border-slate-700' : 'border-[#e3e3f5]'
      ].join(' ')}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className={['truncate font-semibold',
              isDarkTheme ? 'text-white' : 'text-gray-900',
              'text-lg md:text-xl'
            ].join(' ')}>
              {item?.title || 'Untitled case'}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs md:text-sm">
              <div className={isDarkTheme ? 'text-slate-300' : 'text-gray-600'}>
                <span className="uppercase tracking-wide opacity-70 mr-1">Practice:</span>
                {item?.practice || '—'}
              </div>
              <div className={isDarkTheme ? 'text-slate-300' : 'text-gray-600'}>
                <span className="uppercase tracking-wide opacity-70 mr-1">Recruiter:</span>
                {item?.recruiter || '—'}
              </div>
              <div className={isDarkTheme ? 'text-slate-300' : 'text-gray-600'}>
                <span className="uppercase tracking-wide opacity-70 mr-1">Candidate:</span>
                {item?.candidate || '—'}
              </div>
            </div>
          </div>

          <div className={['px-3 py-1 rounded-full text-xs font-medium shrink-0',
            statusBadge(item?.status)
          ].join(' ')}>
            {item?.status || 'open'}
          </div>
        </div>
      </header>

      {/* Next Steps */}
      {item?.next_steps && (
        <section className="px-4 pt-4">
          <div className={[
            'rounded-xl p-4 flex items-start gap-3',
            'border-l-4',
            isDarkTheme
              ? 'bg-[#8a87d6]/20 border-[#e69a96]'
              : 'bg-[#ffffff] border-[#e69a96]',
          ].join(' ')}>
            <CheckCircle2 className="w-5 h-5 mt-0.5 text-[#e69a96] shrink-0" />
            <p className={isDarkTheme ? 'text-slate-100' : 'text-gray-800'}>{item.next_steps}</p>
          </div>
        </section>
      )}

      {/* Notes */}
      <section className="px-4 mt-4">
        <div className={['rounded-xl overflow-hidden',
          isDarkTheme ? 'bg-[#424250] border border-slate-700' : 'bg-[#f3f4fd] border border-[#e3e3f5]'
        ].join(' ')}>
          {notes.length ? (
            <ul className={['divide-y',
              isDarkTheme ? 'divide-[#30313E]' : 'divide-[#e3e3f5]'
            ].join(' ')}>
              {notes.slice(0, 3).map((n) => (
                <li key={n.id} className="p-3">
                  <p className={isDarkTheme ? 'text-slate-100' : 'text-gray-800'}>{n.content}</p>
                  <p className={['text-xs mt-1',
                    isDarkTheme ? 'text-slate-400' : 'text-gray-500'
                  ].join(' ')}>
                    {n.author ? `${n.author} • ` : ''}{new Date(n.created_at || Date.now()).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-sm flex items-center gap-2">
              <StickyNote className={isDarkTheme ? 'text-slate-400' : 'text-gray-400'} size={16} />
              <span className={isDarkTheme ? 'text-slate-300' : 'text-gray-600'}>No notes yet.</span>
            </div>
          )}
        </div>

        {notes.length > 3 && (
          <button className="mt-2 text-sm text-[#8a87d6] hover:underline">View more notes…</button>
        )}
      </section>

      {/* Footer actions */}
      <footer className={['p-4 mt-4 flex flex-wrap items-center gap-2 justify-between rounded-b-2xl',
        'border-t',
        isDarkTheme ? 'border-slate-700' : 'border-[#e3e3f5]'
      ].join(' ')}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddNote(item)}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-[#8a87d6] text-white hover:opacity-90 transition"
          >
            Add Note
          </button>
          <button
            onClick={() => onEdit(item)}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-[#f3f4fd] text-[#e69a96] border border-[#e69a96]/40 hover:bg-[#f3f4fd]/90 transition"
          >
            Edit Case
          </button>
        </div>
        <button
          onClick={() => onDelete(item)}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-[#e69a96] text-white hover:opacity-90 transition inline-flex items-center gap-2"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </footer>
    </article>
  );
};

export default CaseCard;