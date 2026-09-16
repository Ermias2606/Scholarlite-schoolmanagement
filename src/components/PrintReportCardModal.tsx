import React, { useState } from 'react';
import { ReportCardTemplate } from './ReportCardTemplate';
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
        </div></div>
    </div>
  );
};
