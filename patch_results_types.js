import fs from 'fs';
let types = fs.readFileSync('src/types.ts', 'utf8');

// The StudentMarks interface already has approved?: boolean and approvedBy?: string

let content = fs.readFileSync('src/components/ResultsTab.tsx', 'utf8');

// I need to add approval UI in ResultsTab
// Let's modify the arguments of onSaveStudentMarks to include an approved flag
content = content.replace(
  "onSaveStudentMarks: (",
  "onApproveMarks?: (classId: string, year: string, semester: string, subjectName: string) => void;\n  onSaveStudentMarks: ("
);

// We need to add approval status in the UI
const saveButtonRegex = /<button[\s\S]*?onClick={handleSaveMarks}[\s\S]*?<\/button>/m;
const saveButtonHtml = `<button
              onClick={handleSaveMarks}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00A896] hover:bg-[#008f80] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Marks</span>
            </button>
            
            {(currentUser?.role === 'school_admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'admin' || currentUser?.role === 'class_teacher') && onApproveMarks && (
              <button
                onClick={() => onApproveMarks(activeClass.id, selectedYear, selectedSemester, activeSubject.name)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer"
                title="Approve marks to lock them and allow report generation"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Marks</span>
              </button>
            )}`;

content = content.replace(saveButtonRegex, saveButtonHtml);

// Make sure we show if marks are approved
// Also let's disable inputs if marks are approved
content = content.replace(
  "const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);",
  "const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);\n  const isSubjectApproved = activeClass?.students.some(s => s.results?.[selectedYear]?.[selectedSemester]?.[activeSubject?.name || '']?.approved) || false;"
);

content = content.replace(
  "onChange={(e) =>",
  "disabled={isSubjectApproved}\n                                  onChange={(e) =>"
);

content = content.replace(
  "<span className=\"text-xs font-bold px-3 py-1 bg-gray-100 text-gray-700 rounded-full\">\n              Max Total: {activeSubjectTotalMax} Marks\n            </span>",
  `<span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
              Max Total: {activeSubjectTotalMax} Marks
            </span>
            {isSubjectApproved && (
              <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approved & Locked
              </span>
            )}`
);

fs.writeFileSync('src/components/ResultsTab.tsx', content);

