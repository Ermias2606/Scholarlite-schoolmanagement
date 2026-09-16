import fs from 'fs';
let content = fs.readFileSync('src/components/PrintReportCardModal.tsx', 'utf8');

content = content.replace(
  "import {",
  "import { ReportCardTemplate } from './ReportCardTemplate';\nimport {"
);

const reportCardRegex = /\{\/\* Printable Report Card Body \*\/\}[\s\S]*?(?=<\/div>\n    <\/div>\n  \);\n\};)/m;

const replacement = `{/* Printable Report Card Body */}
        <div className="p-4 sm:p-8 max-h-[75vh] overflow-y-auto bg-gray-100/60 print:p-0 print:m-0 print:bg-white print:overflow-visible">
          {reportCardStudent && rawStudent ? (
            <ReportCardTemplate
              appData={appData}
              activeClass={activeClass}
              rawStudent={rawStudent}
              reportCardStudent={reportCardStudent}
              selectedYear={selectedYear}
              selectedSemester={selectedSemester}
              termStudentsLength={termStudents.length}
              fullStudentsLength={fullAnalysis?.studentData.length || termStudents.length}
              termMaxScore={termMaxScore}
              subjects={subjects}
            />
          ) : (
            <div className="p-8 text-center text-gray-500">No student results found for this cohort.</div>
          )}
        </div>`;

content = content.replace(reportCardRegex, replacement);
fs.writeFileSync('src/components/PrintReportCardModal.tsx', content);
