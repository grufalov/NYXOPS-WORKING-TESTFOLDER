import { useStableQuote } from "../hooks/useStableQuote";

export default function QuoteBar({ isDarkTheme }) {
  const q = useStableQuote();
  
  // Extract key phrases that should be highlighted
  const formatQuote = (quote) => {
    // Common key phrases to highlight
    const keyPhrases = [
      'functional chaos', 'strategic foresight', 'cognitive prioritization', 
      'executive function', 'quarterly aligned', 'mission drift', 'performance metrics',
      'KPIs met', 'deliverables', 'context ready', 'precision', 'vibe window',
      'dopamine access', 'task friction', 'output loud', 'focus mode', 'brain-scattered',
      'buffering', 'overthinking', 'brainstorming', 'ADHD sparkle', 'work-life blend'
    ];
    
    let formattedQuote = quote;
    keyPhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      formattedQuote = formattedQuote.replace(regex, `<span class="text-[#8a87d6] font-medium">${phrase}</span>`);
    });
    
    return formattedQuote;
  };

  return (
    <div 
      className="card bg-gradient-to-r from-[#f3f4fd] to-white border-l-4 border-l-[#8a87d6] relative" 
      style={{ 
        border: '2px solid #c5cae9',
        borderLeft: '4px solid #8a87d6',
        borderRadius: '1rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'linear-gradient(to right, #ffffff, #f8f9ff)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'linear-gradient(to right, #f3f4fd, #ffffff)';
      }}
    >
      <div className="relative">
        <p 
          className="px-4 py-6 text-center italic relative z-10 text-[#30313E]"
          style={{ fontSize: '13pt', lineHeight: '1.5' }}
          dangerouslySetInnerHTML={{ __html: formatQuote(q) }}
        />
      </div>
    </div>
  );
}

