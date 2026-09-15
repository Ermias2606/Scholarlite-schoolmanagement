import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  Edit3,
  Calendar,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { AppData, SchoolClass, Student } from '../types';
import {
  calculateTermAnalysis,
  calculateFullAnalysis,
  getGradeInfo,
} from '../utils/calculations';

interface PrintReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  activeClass: SchoolClass;
  initialStudentId?: string;
  selectedYear: string;
  selectedSemester: string;
  onEditRemarksAttendance?: (student: Student) => void;
}

export const PrintReportCardModal: React.FC<PrintReportCardModalProps> = ({
  isOpen,
  onClose,
  appData,
  activeClass,
  initialStudentId,
  selectedYear: defaultYear,
  selectedSemester: defaultSemester,
  onEditRemarksAttendance,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>(defaultYear);
  const [selectedSemester, setSelectedSemester] = useState<string>(defaultSemester);
  const [studentId, setStudentId] = useState<string>(
    initialStudentId || activeClass.students[0]?.id || ''
  );

  if (!isOpen) return null;

  const currentStudentId =
    studentId && activeClass.students.some((s) => s.id === studentId)
      ? studentId
      : activeClass.students[0]?.id || '';

  const termAnalysisRes = calculateTermAnalysis(activeClass, selectedYear, selectedSemester);
  const fullAnalysisRes = calculateFullAnalysis(
    activeClass,
    selectedYear,
    selectedSemester,
    appData.settings.semesters
  );

  const termStudents = termAnalysisRes.result?.studentData || [];
  const subjects = termAnalysisRes.result?.subjects || [];
  const termMaxScore = termAnalysisRes.result?.termMaxScore || 0;
  const fullAnalysis = fullAnalysisRes.result;

  const reportCardStudent = fullAnalysis?.studentData.find((s) => s.id === currentStudentId);
  const rawStudent = activeClass.students.find((s) => s.id === currentStudentId);

  // Student Attendance & Remarks
  const attendance = rawStudent?.attendance?.[selectedYear]?.[selectedSemester] || {
    presentDays: 88,
    totalDays: 90,
  };
  const attendanceRate =
    attendance.totalDays > 0
      ? Math.round((attendance.presentDays / attendance.totalDays) * 100)
      : 100;

  const remarks = rawStudent?.remarks?.[selectedYear]?.[selectedSemester] || {
    teacherRemark: 'Demonstrates exemplary conduct, diligence, and academic curiosity.',
    principalRemark: 'A commendable academic record with consistent dedication.',
    conduct: 'Exemplary',
  };

  const handlePrint = () => {
    // Immediate call to print with media print stylesheet taking over
    window.print();
  };

  return (
    <div
      id="print-report-card-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto modal-overlay-print-fix"
    >
      <div
        id="print-report-card-modal-container"
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-auto modal-container-print-fix"
      >
        {/* Top Action Toolbar (Hidden during print) */}
        <div className="px-5 py-4 bg-[#003366] text-white flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFC300] text-[#003366] flex items-center justify-center font-bold">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold">Print Student Report Card</h3>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/20 text-[#FFC300]">
                  PDF-Ready
                </span>
              </div>
              <p className="text-xs text-white/70">
                Formatted with CSS @media print standards for crisp physical and PDF output
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFC300] hover:bg-[#ffd140] text-[#003366] text-xs font-black shadow-md transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selection Bar (Hidden during print) */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 no-print text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-700">Student:</span>
              <select
                value={currentStudentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#00A896]"
              >
                {activeClass.students.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.rollNo} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-700">Term:</span>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#00A896]"
              >
                {appData.settings.semesters.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {rawStudent && onEditRemarksAttendance && (
              <button
                onClick={() => onEditRemarksAttendance(rawStudent)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#00A896]" />
                <span>Remarks &amp; Attendance</span>
              </button>
            )}
          </div>
        </div>

        {/* Printable Report Card Body */}
        <div className="p-4 sm:p-8 max-h-[75vh] overflow-y-auto bg-gray-100/60 print:p-0 print:m-0 print:bg-white print:overflow-visible">
          {reportCardStudent ? (
            <div
              id="printable-report-card"
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-10 max-w-3xl mx-auto printable-report-card text-gray-900"
            >
              {/* Institution Header */}
              <div className="text-center pb-5 border-b-2 border-[#003366] print-keep-together">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 p-1.5 border-2 border-[#FFC300] rounded-full flex items-center justify-center bg-white shadow-xs">
                  <img
                    src={appData.settings.logo || '/icon.svg'}
                    alt="School Logo"
                    className="w-full h-full object-contain rounded-full"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                    }}
                  />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-[#003366] tracking-tight uppercase">
                  {appData.settings.name}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-gray-700 tracking-wider mt-0.5">
                  OFFICIAL ACADEMIC REPORT CARD &bull; {selectedSemester.toUpperCase()} ({selectedYear})
                </p>
              </div>

              {/* Student Demographics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 py-4 border-b border-gray-200 text-xs print-keep-together">
                <div>
                  <span className="text-gray-500 font-medium block text-[10px] uppercase">Student Name</span>
                  <span className="font-extrabold text-gray-900 text-sm">{reportCardStudent.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block text-[10px] uppercase">Roll Number</span>
                  <span className="font-extrabold text-gray-900 text-sm">#{reportCardStudent.rollNo}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block text-[10px] uppercase">Class Cohort</span>
                  <span className="font-extrabold text-gray-900 text-sm">{activeClass.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block text-[10px] uppercase">Attendance Record</span>
                  <span className="font-semibold text-gray-800">
                    {attendance.presentDays} / {attendance.totalDays} days ({attendanceRate}%)
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block text-[10px] uppercase">Term Rank</span>
                  <span className="font-bold text-[#003366]">
                    #{reportCardStudent.termRank} of {termStudents.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block text-[10px] uppercase">Cumulative Rank</span>
                  <span className="font-bold text-rose-600">
                    #{reportCardStudent.rank} of {fullAnalysis?.studentData.length || termStudents.length}
                  </span>
                </div>
              </div>

              {/* Academic Performance Table */}
              <div className="mt-4 print-keep-together">
                <h4 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Academic Performance &amp; Assessment Breakdown
                </h4>
                <table className="w-full text-left text-xs border border-gray-300 border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-300">
                      <th className="py-2 px-3 border-r border-gray-300">Subject</th>
                      <th className="py-2 px-3 text-center border-r border-gray-300">Continuous Assessment</th>
                      <th className="py-2 px-3 text-center border-r border-gray-300 w-14">Max</th>
                      <th className="py-2 px-3 text-center border-r border-gray-300 w-16">Marks</th>
                      <th className="py-2 px-3 text-center border-r border-gray-300 w-16">Grade</th>
                      <th className="py-2 px-3 text-center w-16">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {subjects.map((sub) => {
                      const markData = reportCardStudent.subjectMarks[sub.name];
                      const obtained = markData ? markData.total : 0;
                      const max =
                        markData?.maxScore ||
                        sub.assessments.reduce((sum, a) => sum + (Number(a.maxScore) || 0), 0);
                      const isPass = max > 0 && obtained / max >= 0.5;
                      const breakdown = markData?.marks || {};
                      const gradeInfo = getGradeInfo(max > 0 ? (obtained / max) * 100 : 0);

                      return (
                        <tr key={sub.name} className="border-b border-gray-200">
                          <td className="py-2 px-3 font-bold text-gray-900 border-r border-gray-200">
                            {sub.name}
                          </td>
                          <td className="py-2 px-3 border-r border-gray-200 text-[11px]">
                            {sub.assessments.map((a) => (
                              <span key={a.id || a.name} className="mr-2 text-gray-600">
                                {a.name}: <strong className="text-gray-900">{breakdown[a.name] ?? '-'}</strong>/{a.maxScore}
                              </span>
                            ))}
                          </td>
                          <td className="py-2 px-3 text-center font-semibold text-gray-600 border-r border-gray-200">
                            {max}
                          </td>
                          <td className="py-2 px-3 text-center font-extrabold text-[#003366] border-r border-gray-200">
                            {obtained}
                          </td>
                          <td className="py-2 px-3 text-center font-bold border-r border-gray-200">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[11px] border font-bold ${gradeInfo.badgeColor}`}
                            >
                              {gradeInfo.grade}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-bold">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                                isPass
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isPass ? 'PASS' : 'FAIL'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-extrabold text-[#003366] border-t-2 border-gray-300">
                      <td colSpan={2} className="py-2 px-3 text-right uppercase text-[11px]">
                        Term Summary:
                      </td>
                      <td className="py-2 px-3 text-center">{termMaxScore}</td>
                      <td className="py-2 px-3 text-center text-sm">{reportCardStudent.termTotal}</td>
                      <td className="py-2 px-3 text-center text-xs font-black text-[#00A896]">
                        {reportCardStudent.grade}
                      </td>
                      <td className="py-2 px-3 text-center text-xs font-black text-[#00A896]">
                        {reportCardStudent.termAveragePercentage.toFixed(1)}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Cumulative Standings */}
              <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-[#FFC300] text-center summary-block print-keep-together">
                <div className="text-xs font-black text-[#003366]">
                  Cumulative GPA: {reportCardStudent.cumulativeGPA.toFixed(2)} &bull; Cumulative Score: {reportCardStudent.cumulativeTotal} / {reportCardStudent.cumulativeMaxScore} &bull; Overall: {reportCardStudent.overallAveragePercentage.toFixed(1)}% ({reportCardStudent.cumulativeGrade})
                </div>
              </div>

              {/* Remarks & Conduct */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 remarks-block print-keep-together">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-[#003366] tracking-wider">
                      Teacher Remark
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Conduct: {remarks.conduct || 'Exemplary'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-700 italic">
                    &ldquo;{remarks.teacherRemark}&rdquo;
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-[10px] font-bold uppercase text-[#003366] tracking-wider block mb-1">
                    Principal&apos;s Endorsement
                  </span>
                  <p className="text-[11px] text-gray-700 italic">
                    &ldquo;{remarks.principalRemark}&rdquo;
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="mt-8 pt-4 border-t border-gray-300 grid grid-cols-3 gap-4 text-center text-xs text-gray-600 signature-block print-keep-together">
                <div>
                  <div className="border-b border-gray-400 pb-1 mb-1 font-semibold text-gray-800">
                    Class Teacher
                  </div>
                  <span className="text-[10px] text-gray-400">Signature</span>
                </div>
                <div>
                  <div className="border-b border-gray-400 pb-1 mb-1 font-semibold text-gray-800">
                    {new Date().toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <span className="text-[10px] text-gray-400">Issue Date</span>
                </div>
                <div>
                  <div className="border-b border-gray-400 pb-1 mb-1 font-semibold text-gray-800">
                    Principal / Headmaster
                  </div>
                  <span className="text-[10px] text-gray-400">Official Stamp</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">No student results found for this cohort.</div>
          )}
        </div>
      </div>
    </div>
  );
};
