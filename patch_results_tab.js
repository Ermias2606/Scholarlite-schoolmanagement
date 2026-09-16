import fs from 'fs';

let content = fs.readFileSync('src/components/ResultsTab.tsx', 'utf8');

// 1. Add Import
content = content.replace(
  "import { PrintReportCardModal } from './PrintReportCardModal';",
  "import { PrintReportCardModal } from './PrintReportCardModal';\nimport { ReviewMarksModal } from './ReviewMarksModal';"
);

// 2. Add State inside ResultsTab
content = content.replace(
  "const [isDragging, setIsDragging] = useState(false);",
  "const [isDragging, setIsDragging] = useState(false);\n  const [reviewSubject, setReviewSubject] = useState<Subject | null>(null);"
);

// 3. Update Approvals View Buttons
const newButtons = `
                <div className="flex mt-auto pt-3 border-t border-gray-200">
                  <button 
                    onClick={() => setReviewSubject(subject)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{isApproved || isRejected ? 'View Submission Details' : 'Review & Process Marks'}</span>
                  </button>
                </div>
`;
content = content.replace(
  /<div className="flex gap-2 mt-auto pt-3 border-t border-gray-200">[\s\S]*?<\/div>\s*<\/div>\s*\);\s*}\)\}/,
  newButtons + "              </div>\n            );\n          })}"
);

// 4. Render the modal at the end
content = content.replace(
  "    </div>\n  );\n};",
  `      <ReviewMarksModal
        isOpen={!!reviewSubject}
        onClose={() => setReviewSubject(null)}
        subject={reviewSubject}
        activeClass={activeClass}
        year={selectedYear}
        semester={selectedSemester}
        onApprove={onApproveMarks}
        onReject={onRejectMarks}
      />
    </div>
  );
};`
);

fs.writeFileSync('src/components/ResultsTab.tsx', content);

