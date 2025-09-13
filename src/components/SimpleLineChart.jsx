const SimpleLineChart = () => {
  return (
    <div className="w-full h-full relative">
      <svg width="100%" height="160" className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#475569" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Sample data lines */}
        <polyline
          fill="none"
          stroke="#f3f4fd"
          strokeWidth="2"
          points="20,120 80,100 140,80 200,70 260,60 320,50"
        />
        <polyline
          fill="none"
          stroke="#8a87d6"
          strokeWidth="2"
          points="20,140 80,120 140,110 200,90 260,85 320,75"
        />
        <polyline
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          points="20,130 80,125 140,115 200,95 260,80 320,65"
        />
        
        {/* Week labels */}
        <text x="20" y="150" fill="#94a3b8" fontSize="10" textAnchor="middle">W1</text>
        <text x="80" y="150" fill="#94a3b8" fontSize="10" textAnchor="middle">W2</text>
        <text x="140" y="150" fill="#94a3b8" fontSize="10" textAnchor="middle">W3</text>
        <text x="200" y="150" fill="#94a3b8" fontSize="10" textAnchor="middle">W4</text>
        <text x="260" y="150" fill="#94a3b8" fontSize="10" textAnchor="middle">W5</text>
        <text x="320" y="150" fill="#94a3b8" fontSize="10" textAnchor="middle">W6</text>
      </svg>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-[#f3f4fd]"></div>
          <span className="text-slate-400">Opened</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-[#8a87d6]"></div>
          <span className="text-slate-400">Resolved</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleLineChart;
