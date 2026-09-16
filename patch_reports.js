import fs from 'fs';
let content = fs.readFileSync('src/components/ReportsView.tsx', 'utf8');

content = content.replace(
  "import { StudentPerformanceSummaryView } from './StudentPerformanceSummaryView';",
  "import { StudentPerformanceSummaryView } from './StudentPerformanceSummaryView';\nimport { ReportCardTemplate } from './ReportCardTemplate';"
);

// We want to rewrite the 'report_card' block entirely
const reportCardRegex = /\{\/\* 5\. Student Report Card \*\/\}[\s\S]*?(?=<\/div>\n  \);\n\};)/m;

const replacement = `{/* 5. Student Report Card */}
      {reportType === 'report_card' && (
        <div className="space-y-4 animate-in fade-in duration-150 relative">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-xs no-print">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-bold text-gray-700 whitespace-nowrap">
                Select Student:
              </label>
              <select
                value={activeStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00A896]"
              >
                {termStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.rollNo} - {s.name} ({s.termAveragePercentage.toFixed(1)}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
              {rawStudent && onEditRemarksAttendance && (
                <button
                  onClick={() => onEditRemarksAttendance(rawStudent)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#00A896]" />
                  <span>Remarks &amp; Attendance</span>
                </button>
              )}

              <button
                onClick={handleBatchPrint}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition cursor-pointer"
                title="Print all report cards for this class"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Batch Print Class</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#FFC300]" />
                <span>Print Card</span>
              </button>
            </div>
          </div>

          {/* Single Report Card View */}
          <div className={isBatchPrinting ? 'hidden' : 'block'}>
            {reportCardStudent && rawStudent && (
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
            )}
          </div>

          {/* Batch Print Hidden Container */}
          <div className={isBatchPrinting ? 'block print:block' : 'hidden'}>
            {fullAnalysis?.studentData.map((student) => {
              const rStudent = activeClass.students.find(s => s.id === student.id);
              if (!rStudent) return null;
              return (
                <div key={student.id} className="print-page-break">
                  <ReportCardTemplate
                    appData={appData}
                    activeClass={activeClass}
                    rawStudent={rStudent}
                    reportCardStudent={student}
                    selectedYear={selectedYear}
                    selectedSemester={selectedSemester}
                    termStudentsLength={termStudents.length}
                    fullStudentsLength={fullAnalysis.studentData.length}
                    termMaxScore={termMaxScore}
                    subjects={subjects}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}`;

content = content.replace(reportCardRegex, replacement);
fs.writeFileSync('src/components/ReportsView.tsx', content);
