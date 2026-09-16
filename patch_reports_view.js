import fs from 'fs';
let content = fs.readFileSync('src/components/ReportsView.tsx', 'utf8');

const bannerHtml = `
  // Check if all marks are approved
  const allSubjects = activeClass.subjects || [];
  const isTermFullyApproved = activeClass.students.length > 0 && activeClass.students.every(student => 
    allSubjects.every(sub => 
      student.results?.[selectedYear]?.[selectedSemester]?.[sub.name]?.approved
    )
  );

  const canGenerateReports = appData.currentUser?.role !== 'subject_teacher' && appData.currentUser?.role !== 'student';

  return (
    <div className="space-y-6">
      {!isTermFullyApproved && (
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
      )}`;

content = content.replace(
  /  return \(\n    <div className="space-y-6">/,
  bannerHtml
);

fs.writeFileSync('src/components/ReportsView.tsx', content);
