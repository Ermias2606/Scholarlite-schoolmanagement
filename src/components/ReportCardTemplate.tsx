import React from 'react';
import { AppData, SchoolClass, Student, StudentFullAnalysis } from '../types';
import { getGradeInfo } from '../utils/calculations';

interface ReportCardTemplateProps {
  appData: AppData;
  activeClass: SchoolClass;
  rawStudent: Student;
  reportCardStudent: StudentFullAnalysis;
  selectedYear: string;
  selectedSemester: string;
  termStudentsLength: number;
  fullStudentsLength: number;
  termMaxScore: number;
  subjects: any[];
}

export const ReportCardTemplate: React.FC<ReportCardTemplateProps> = ({
  appData,
  activeClass,
  rawStudent,
  reportCardStudent,
  selectedYear,
  selectedSemester,
  termStudentsLength,
  fullStudentsLength,
  termMaxScore,
  subjects,
}) => {
  const attendance = rawStudent.attendance?.[selectedYear]?.[selectedSemester] || {
    presentDays: 98,
    totalDays: 100,
  };
  const attendanceRate =
    attendance.totalDays > 0
      ? Math.round((attendance.presentDays / attendance.totalDays) * 100)
      : 0;

  const remarks = rawStudent.remarks?.[selectedYear]?.[selectedSemester] || {
    teacherRemark: 'Demonstrates exemplary conduct, diligence, and academic curiosity.',
    principalRemark: 'A commendable academic record with consistent dedication.',
    conduct: 'Exemplary',
  };

  const calculateAge = (dob?: string) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const studentAge = calculateAge(rawStudent.dob);
  const isPassingStudent = reportCardStudent.termAveragePercentage >= 50;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl max-w-4xl mx-auto printable-report printable-report-card print:m-0 print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none relative overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0 print:opacity-[0.04]">
        <img
          src={appData.settings.logo || '/icon.svg'}
          alt="Watermark"
          className="w-3/4 max-w-md object-contain grayscale"
        />
      </div>

      <div className="relative z-10 p-6 sm:p-10 space-y-8">
        
        {/* ================= FRONT PAGE: INSTITUTIONAL & STUDENT BIO ================= */}
        <div className="space-y-6 print-page-break">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b-2 border-[#003366]">
            <img
              src={appData.settings.logo || '/icon.svg'}
              alt="School Logo"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain p-2 border-2 border-[#FFC300] rounded-full shrink-0 bg-gray-50 shadow-sm"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/icon.svg';
              }}
            />
            <div className="text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003366]/10 text-xs font-extrabold text-[#003366] mb-2 uppercase tracking-wide">
                Official Document
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#003366] tracking-tight uppercase">
                {appData.settings.name}
              </h1>
              <p className="text-xs sm:text-sm font-bold text-gray-700 tracking-wider mt-1">
                STUDENT BIO &amp; ACADEMIC PROFILE REPORT
              </p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase">
                {selectedSemester} &bull; ACADEMIC YEAR {selectedYear}
              </p>
            </div>
            <div className="text-center sm:text-right">
              <div className={`px-5 py-2.5 rounded-2xl border-2 font-black text-base shadow-sm ${isPassingStudent ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-rose-500 text-rose-700 bg-rose-50'}`}>
                {isPassingStudent ? 'PROMOTED' : 'RETAINED'}
              </div>
            </div>
          </div>

          {/* Student Detailed Bio Grid (Front Page) */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#003366] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00A896]"></span>
                Biographical Information &amp; Enrollment Details
              </h3>
              <span className="text-xs font-bold bg-[#003366] text-white px-3 py-1 rounded-full">
                Roll #{reportCardStudent.rollNo}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
              <div className="col-span-2">
                <span className="text-gray-500 font-bold block text-[10px] tracking-wider uppercase mb-1">Student Full Name</span>
                <span className="font-black text-[#003366] text-xl">{reportCardStudent.name}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block text-[10px] tracking-wider uppercase mb-1">Admission No.</span>
                <span className="font-bold text-gray-900 text-base">{rawStudent.admissionNumber || `SCH-${reportCardStudent.rollNo}`}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block text-[10px] tracking-wider uppercase mb-1">Class Cohort</span>
                <span className="font-bold text-gray-900 text-base">{activeClass.name}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block text-[10px] tracking-wider uppercase mb-1">Gender</span>
                <span className="font-bold text-gray-900 text-base">{rawStudent.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block text-[10px] tracking-wider uppercase mb-1">Age</span>
                <span className="font-bold text-gray-900 text-base">{studentAge} yrs</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block text-[10px] tracking-wider uppercase mb-1">Academic Year</span>
                <span className="font-bold text-gray-900 text-base">{selectedYear}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block text-[10px] tracking-wider uppercase mb-1">Active Term</span>
                <span className="font-bold text-[#00A896] text-base">{selectedSemester}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block text-[10px] tracking-wider uppercase mb-1">Attendance Record</span>
                <span className="font-bold text-gray-900 text-base">{attendance.presentDays} / {attendance.totalDays} ({attendanceRate}%)</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block text-[10px] tracking-wider uppercase mb-1">Conduct &amp; Behavior</span>
                <span className="font-bold text-gray-900 text-base">{remarks.conduct || 'Exemplary'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block text-[10px] tracking-wider uppercase mb-1">Term Standing</span>
                <span className="font-bold text-[#00A896] text-base">#{reportCardStudent.termRank} of {termStudentsLength}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block text-[10px] tracking-wider uppercase mb-1">Cumulative Standing</span>
                <span className="font-black text-rose-600 text-base">#{reportCardStudent.rank} of {fullStudentsLength}</span>
              </div>
            </div>
          </div>

          <div className="text-center py-4 text-xs text-gray-400 italic print:block">
            &bull; Please turn to the back page for terminal subject scores, grading breakdowns, and teacher remarks &bull;
          </div>
        </div>


        {/* ================= BACK PAGE: SUBJECT MARK RESULTS, AVERAGES, RANKS & REMARKS ================= */}
        <div className="space-y-6 pt-6 border-t-2 border-dashed border-gray-300 print:border-none print:pt-0 print-page-break">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-[#003366] uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[#FFC300] inline-block"></span>
              Back Page: Terminal Subject Results &amp; Faculty Remarks
            </h3>
            <span className="text-xs font-semibold text-gray-500">
              {appData.settings.name} &bull; {selectedSemester}
            </span>
          </div>

          {/* Subject Breakdown Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-300 shadow-xs">
            <table className="w-full text-left text-sm border-collapse bg-white">
              <thead>
                <tr className="bg-[#003366] text-white font-bold">
                  <th className="py-3 px-4 border-r border-[#002244]/50">Subject</th>
                  <th className="py-3 px-4 text-center border-r border-[#002244]/50 w-20">Max Score</th>
                  <th className="py-3 px-4 text-center border-r border-[#002244]/50">Score Breakdown</th>
                  <th className="py-3 px-4 text-center border-r border-[#002244]/50 w-24">Obtained</th>
                  <th className="py-3 px-4 text-center border-r border-[#002244]/50 w-20">Grade</th>
                  <th className="py-3 px-4 text-center w-28">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subjects.map((sub, index) => {
                  const markData = reportCardStudent.subjectMarks[sub.name];
                  const obtained = markData ? markData.total : 0;
                  const max = markData?.maxScore || sub.assessments.reduce((sum: number, a: any) => sum + (Number(a.maxScore) || 0), 0);
                  const breakdown = markData?.marks || {};
                  const gradeInfo = getGradeInfo(max > 0 ? (obtained / max) * 100 : 0);
                  const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60';

                  return (
                    <tr key={sub.name} className={`${rowBg} hover:bg-blue-50/50 transition-colors`}>
                      <td className="py-3 px-4 font-bold text-[#003366] border-r border-gray-200">
                        {sub.name}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-500 border-r border-gray-200 bg-gray-100/50">
                        {max}
                      </td>
                      <td className="py-3 px-4 border-r border-gray-200 text-xs text-center">
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                          {sub.assessments.map((a: any) => (
                            <span key={a.id || a.name} className="text-gray-500 whitespace-nowrap">
                              <span className="uppercase text-[10px] tracking-wider">{a.name}:</span> <strong className="text-gray-900 ml-0.5">{breakdown[a.name] ?? '-'}</strong>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-extrabold text-base text-[#003366] border-r border-gray-200">
                        {obtained}
                      </td>
                      <td className="py-3 px-4 text-center font-bold border-r border-gray-200">
                        <span className={`px-2.5 py-1 rounded-md text-xs border ${gradeInfo.badgeColor} shadow-sm`}>
                          {gradeInfo.grade}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                        {gradeInfo.remarks}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                  <td colSpan={2} className="py-3 px-4 text-right uppercase text-xs text-gray-700">
                    Term Grand Total:
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">{termMaxScore} MAX</td>
                  <td className="py-3 px-4 text-center text-lg font-black text-[#003366]">{reportCardStudent.termTotal}</td>
                  <td className="py-3 px-4 text-center text-base font-black text-[#00A896]">
                    {reportCardStudent.grade}
                  </td>
                  <td className="py-3 px-4 text-center text-sm font-black text-[#00A896]">
                    {reportCardStudent.termAveragePercentage.toFixed(2)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Cumulative Result Summary Box */}
          <div className="p-5 rounded-2xl bg-[#003366] text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <p className="text-[10px] font-bold text-[#FFC300] uppercase tracking-widest mb-2 opacity-90">
              CUMULATIVE ACADEMIC STANDING ({selectedYear})
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 relative z-10">
              <div>
                <div className="text-sm font-medium text-blue-100 mb-1">
                  Cumulative Score: <span className="font-bold text-white">{reportCardStudent.cumulativeTotal} / {reportCardStudent.cumulativeMaxScore} pts</span>
                </div>
                <div className="text-sm font-medium text-blue-100">
                  Cumulative GPA: <span className="font-bold text-white">{reportCardStudent.cumulativeGPA.toFixed(2)}</span> &bull; Cumulative Grade: <span className="font-bold text-white">{reportCardStudent.cumulativeGrade}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-200 uppercase tracking-widest mb-1 font-semibold">Overall Average Percentage</div>
                <div className="text-3xl font-black text-[#00E5FF]">
                  {reportCardStudent.overallAveragePercentage.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Remarks (Back Page) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A896]"></span> Class Teacher&apos;s Remark
              </span>
              <div className="p-4 bg-gray-50 rounded-2xl border-l-4 border-[#00A896] text-sm text-gray-800 italic min-h-[4.5rem]">
                &ldquo;{remarks.teacherRemark}&rdquo;
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC300]"></span> Principal&apos;s Endorsement
              </span>
              <div className="p-4 bg-gray-50 rounded-2xl border-l-4 border-[#FFC300] text-sm text-gray-800 italic min-h-[4.5rem]">
                &ldquo;{remarks.principalRemark}&rdquo;
              </div>
            </div>
          </div>

          {/* Formal Signatures */}
          <div className="mt-10 pt-8 border-t-2 border-gray-200 grid grid-cols-3 gap-6 text-center text-xs text-gray-600">
            <div>
              <div className="border-b border-gray-400 pb-2 mb-2 w-3/4 mx-auto font-medium text-gray-800 h-8"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Class Teacher Signature</span>
            </div>
            <div>
              <div className="border-b border-gray-400 pb-2 mb-2 w-3/4 mx-auto font-bold text-gray-800 h-8 flex items-end justify-center">
                {new Date().toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Official Issue Date</span>
            </div>
            <div>
              <div className="border-b border-gray-400 pb-2 mb-2 w-3/4 mx-auto font-medium text-gray-800 h-8"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Principal / Headmaster</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
