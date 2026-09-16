import fs from 'fs';
let content = fs.readFileSync('src/components/ReportsView.tsx', 'utf8');

const tabRegex = /<div className="flex flex-wrap gap-2 pb-2 no-print border-b border-gray-200">[\s\S]*?<\/div>/m;
const newTabs = `<div className="flex flex-wrap gap-2 pb-4 mb-2 no-print border-b border-gray-200">
        {[
          { id: 'summary', icon: '⭐', label: 'Class Summary', activeColor: 'bg-[#003366] text-white shadow-md' },
          { id: 'student_performance_summary', icon: '🚀', label: 'Student Performance Summary', activeColor: 'bg-[#00A896] text-white shadow-md' },
          { id: 'master_sheet', icon: '📑', label: 'Whole Term Master Sheet', activeColor: 'bg-[#00A896] text-white shadow-md' },
          { id: 'rank_list', icon: '📈', label: 'Cumulative Rank List', activeColor: 'bg-[#003366] text-white shadow-md' },
          { id: 'performance', icon: '📊', label: 'Performance Analysis', activeColor: 'bg-[#003366] text-white shadow-md' },
          { id: 'report_card', icon: '🎓', label: 'Student Report Card', activeColor: 'bg-[#FFC300] text-[#003366] shadow-md ring-2 ring-[#FFC300]/50 ring-offset-1' }
        ].map((tab) => (
          <button
            key={tab.id}
            id={tab.id === 'student_performance_summary' ? 'tab-btn-performance-summary' : undefined}
            onClick={() => onSelectReportType(tab.id as any)}
            className={\`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 \${
              reportType === tab.id
                ? tab.activeColor
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 hover:text-gray-900 shadow-sm'
            }\`}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>`;

content = content.replace(tabRegex, newTabs);
fs.writeFileSync('src/components/ReportsView.tsx', content);
