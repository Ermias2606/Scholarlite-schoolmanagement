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

  const isPassingStudent = reportCardStudent.termAveragePercentage >= 50;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-6 sm:p-10 max-w-4xl mx-auto printable-report printable-report-card print:m-0 print:p-6 print:border-none print:shadow-none print:w-full print:max-w-none relative overflow-hidden print-page-break">
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0 print:opacity-[0.05]">
        <img
          src={appData.settings.logo || '/icon.svg'}
          alt="Watermark"
          className="w-3/4 max-w-md object-contain grayscale"
        />
      </div>

      <div className="relative z-10">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pb-6 border-b-2 border-gray-800 print-keep-together">
          <img
            src={appData.settings.logo || '/icon.svg'}
            alt="School Logo"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain p-1 border-2 border-[#FFC300] rounded-full shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/icon.svg';
            }}
          />
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl sm:text-3xl font-black text-[#003366] tracking-tight uppercase">
              {appData.settings.name}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-gray-700 tracking-wider mt-1">
              OFFICIAL ACADEMIC REPORT CARD
            </p>
            <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase">
              {selectedSemester} &bull; ACADEMIC YEAR {selectedYear}
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <div className={`px-4 py-2 rounded-xl border-2 font-black text-lg transform rotate-2 ${isPassingStudent ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-rose-500 text-rose-600 bg-rose-50'}`}>
              {isPassingStudent ? 'PROMOTED' : 'RETAINED'}
            </div>
          </div>
        </div>

        {/* Student Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 py-5 border-b border-gray-200 text-sm print-keep-together bg-gray-50/50 -mx-6 px-6 sm:mx-0 sm:px-0 sm:bg-transparent mt-2 rounded-xl print:bg-transparent">
          <div className="col-span-2">
            <span className="text-gray-500 font-bold block text-[10px] tracking-wider uppercase mb-0.5">STUDENT NAME</span>
            <span className="font-extrabold text-[#003366] text-lg leading-tight">{reportCardStudent.name}</span>
          </div>
          <div>
            <span className="text-gray-500 font-bold block text-[10px] tracking-wider uppercase mb-0.5">ROLL NUMBER</span>
            <span className="font-bold text-gray-900 text-base">#{reportCardStudent.rollNo}</span>
          </div>
          <div>
            <span className="text-gray-500 font-bold block text-[10px] tracking-wider uppercase mb-0.5">CLASS COHORT</span>
            <span className="font-bold text-gray-900 text-base">{activeClass.name}</span>
          </div>
          <div>
            <span className="text-gray-500 font-bold block text-[10px] tracking-wider uppercase mb-0.5">ATTENDANCE</span>
            <span className="font-semibold text-gray-800">
              {attendance.presentDays} / {attendance.totalDays} ({attendanceRate}%)
            </span>
          </div>
          <div>
            <span className="text-gray-500 font-bold block text-[10px] tracking-wider uppercase mb-0.5">CONDUCT</span>
            <span className="font-semibold text-gray-800">{remarks.conduct || 'Exemplary'}</span>
          </div>
          <div>
            <span className="text-gray-500 font-bold block text-[10px] tracking-wider uppercase mb-0.5">TERM RANK</span>
            <span className="font-bold text-[#00A896]">
              #{reportCardStudent.termRank} of {termStudentsLength}
            </span>
          </div>
          <div>
            <span className="text-gray-500 font-bold block text-[10px] tracking-wider uppercase mb-0.5">CUMULATIVE RANK</span>
            <span className="font-black text-rose-600">
              #{reportCardStudent.rank} of {fullStudentsLength}
            </span>
          </div>
        </div>

        {/* Subject Breakdown Table */}
        <div className="mt-6 print-keep-together">
          <h4 className="text-xs font-bold text-[#003366] uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#FFC300] inline-block"></span>
            Academic Performance
          </h4>
          <div className="overflow-hidden rounded-xl border border-gray-300 print:rounded-none">
            <table className="w-full text-left text-sm border-collapse bg-white">
              <thead>
                <tr className="bg-[#003366] text-white font-bold print:bg-gray-200 print:text-black">
                  <th className="py-3 px-4 border-r border-[#002244]/50 print:border-gray-400">Subject</th>
                  <th className="py-3 px-4 text-center border-r border-[#002244]/50 print:border-gray-400 w-20">Max Score</th>
                  <th className="py-3 px-4 text-center border-r border-[#002244]/50 print:border-gray-400">Score Breakdown</th>
                  <th className="py-3 px-4 text-center border-r border-[#002244]/50 print:border-gray-400 w-24">Total Obtained</th>
                  <th className="py-3 px-4 text-center border-r border-[#002244]/50 print:border-gray-400 w-20">Grade</th>
                  <th className="py-3 px-4 text-center w-20">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subjects.map((sub, index) => {
                  const markData = reportCardStudent.subjectMarks[sub.name];
                  const obtained = markData ? markData.total : 0;
                  const max = markData?.maxScore || sub.assessments.reduce((sum: number, a: any) => sum + (Number(a.maxScore) || 0), 0);
                  const breakdown = markData?.marks || {};
                  const gradeInfo = getGradeInfo(max > 0 ? (obtained / max) * 100 : 0);
                  const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';

                  return (
                    <tr key={sub.name} className={`${rowBg} hover:bg-blue-50/50 transition-colors print:bg-white`}>
                      <td className="py-2.5 px-4 font-bold text-[#003366] border-r border-gray-200 print:text-black">
                        {sub.name}
                      </td>
                      <td className="py-2.5 px-4 text-center font-semibold text-gray-500 border-r border-gray-200 bg-gray-100/50 print:bg-white">
                        {max}
                      </td>
                      <td className="py-2.5 px-4 border-r border-gray-200 text-xs text-center">
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                          {sub.assessments.map((a: any) => (
                            <span key={a.id || a.name} className="text-gray-500 whitespace-nowrap">
                              <span className="uppercase text-[10px] tracking-wider">{a.name}:</span> <strong className="text-gray-900 ml-0.5">{breakdown[a.name] ?? '-'}</strong>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center font-extrabold text-lg text-[#003366] border-r border-gray-200 print:text-black">
                        {obtained}
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold border-r border-gray-200">
                        <span className={`px-2.5 py-1 rounded-md text-xs border ${gradeInfo.badgeColor} shadow-sm print:border-gray-400 print:text-black print:bg-transparent`}>
                          {gradeInfo.grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                        {gradeInfo.remarks}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 border-t-2 border-gray-300 print:bg-gray-50">
                  <td colSpan={2} className="py-3 px-4 text-right uppercase text-xs font-bold text-gray-600">
                    Term Grand Total:
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-gray-600">{termMaxScore} MAX</td>
                  <td className="py-3 px-4 text-center text-xl font-black text-[#003366] print:text-black">{reportCardStudent.termTotal}</td>
                  <td className="py-3 px-4 text-center text-lg font-black text-[#00A896] print:text-black">
                    {reportCardStudent.grade}
                  </td>
                  <td className="py-3 px-4 text-center text-sm font-black text-[#00A896] print:text-black">
                    {reportCardStudent.termAveragePercentage.toFixed(2)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Cumulative Result Box */}
        <div className="mt-6 p-5 rounded-xl bg-[#003366] text-white shadow-md print-keep-together relative overflow-hidden print:bg-white print:border-2 print:border-gray-800 print:text-black print:shadow-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 print:hidden"></div>
          <p className="text-[10px] font-bold text-[#FFC300] uppercase tracking-widest mb-2 opacity-90 print:text-gray-600">
            CUMULATIVE ACADEMIC STANDING ({selectedYear})
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 relative z-10">
            <div>
              <div className="text-sm font-medium text-blue-100 mb-1 print:text-gray-700">
                Score: <span className="font-bold text-white print:text-black">{reportCardStudent.cumulativeTotal} / {reportCardStudent.cumulativeMaxScore} pts</span>
              </div>
              <div className="text-sm font-medium text-blue-100 print:text-gray-700">
                GPA: <span className="font-bold text-white print:text-black">{reportCardStudent.cumulativeGPA.toFixed(2)}</span> &bull; Grade: <span className="font-bold text-white print:text-black">{reportCardStudent.cumulativeGrade}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-200 uppercase tracking-widest mb-1 font-semibold print:text-gray-600">Overall Average</div>
              <div className="text-3xl font-black text-[#00E5FF] print:text-black">
                {reportCardStudent.overallAveragePercentage.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 print-keep-together">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A896] print:bg-gray-400"></span> Class Teacher&apos;s Remark
            </span>
            <div className="p-4 bg-gray-50 rounded-xl border-l-4 border-[#00A896] text-sm text-gray-800 italic min-h-[4rem] print:border-gray-800">
              &ldquo;{remarks.teacherRemark}&rdquo;
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFC300] print:bg-gray-400"></span> Principal&apos;s Endorsement
            </span>
            <div className="p-4 bg-gray-50 rounded-xl border-l-4 border-[#FFC300] text-sm text-gray-800 italic min-h-[4rem] print:border-gray-800">
              &ldquo;{remarks.principalRemark}&rdquo;
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-12 pt-8 border-t-2 border-gray-200 grid grid-cols-3 gap-6 text-center text-xs text-gray-600 print-keep-together">
          <div>
            <div className="border-b border-gray-400 pb-2 mb-2 w-3/4 mx-auto font-medium text-gray-800 h-8"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Class Teacher</span>
          </div>
          <div>
            <div className="border-b border-gray-400 pb-2 mb-2 w-3/4 mx-auto font-bold text-gray-800 h-8 flex items-end justify-center">
              {new Date().toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Issue Date</span>
          </div>
          <div>
            <div className="border-b border-gray-400 pb-2 mb-2 w-3/4 mx-auto font-medium text-gray-800 h-8"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Principal / Headmaster</span>
          </div>
        </div>
      </div>
    </div>
  );
};
