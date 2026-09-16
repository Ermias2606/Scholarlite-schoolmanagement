import fs from 'fs';
let content = fs.readFileSync('src/components/ReportsView.tsx', 'utf8');

// We want to add a warning if not all marks are approved for the term.
const headerRegex = /<div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">/m;

const replacement = `
  const termStudents = termAnalysis?.studentData || [];
  
  // Check if all marks are approved
  const allSubjects = activeClass.subjects;
  const isTermFullyApproved = activeClass.students.every(student => 
    allSubjects.every(sub => 
      student.results?.[selectedYear]?.[selectedSemester]?.[sub.name]?.approved
    )
  );
  
  // Check role restrictions
  const canGenerateReports = appData.currentUser?.role !== 'subject_teacher' && appData.currentUser?.role !== 'student';

<div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">`;

content = content.replace(
  /<div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">/m,
  `// Check if all marks are approved
  const allSubjects = activeClass.subjects;
  const isTermFullyApproved = activeClass.students.every(student => 
    allSubjects.every(sub => 
      student.results?.[selectedYear]?.[selectedSemester]?.[sub.name]?.approved
    )
  );
  
  // Check role restrictions
  const canGenerateReports = appData.currentUser?.role !== 'subject_teacher' && appData.currentUser?.role !== 'student';

  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">`
);


// Replace the warning area (if any) or add it just below the header
content = content.replace(
  /{!termAnalysis && \(/,
  `{!isTermFullyApproved && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Marks Pending Approval</h4>
              <p className="text-xs mt-1">Not all subject marks for this term have been approved. Reports may be incomplete or unofficial until an administrator or class teacher approves all subject marks.</p>
            </div>
          </div>
        )}
        
        {!canGenerateReports && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Restricted Access</h4>
              <p className="text-xs mt-1">Your current role does not have permission to view or generate official reports.</p>
            </div>
          </div>
        )}

        {(!termAnalysis || !canGenerateReports) && (`
);

fs.writeFileSync('src/components/ReportsView.tsx', content);
