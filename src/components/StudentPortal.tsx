import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Award,
  BookOpen,
  Printer,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { AppData, SchoolClass, Student } from '../types';
import { calculateTermAnalysis, calculateFullAnalysis, getGradeInfo } from '../utils/calculations';

interface StudentPortalProps {
  appData: AppData;
  studentId: string;
  classId?: string;
  onOpenReportCardPrint?: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  appData,
  studentId,
  classId,
}) => {
  const { classes, settings } = appData;

  // Locate student and class
  let currentClass: SchoolClass | undefined;
  let currentStudent: Student | undefined;

  if (classId) {
    currentClass = classes.find((c) => c.id === classId);
    currentStudent = currentClass?.students.find((s) => s.id === studentId);
  } else {
    for (const c of classes) {
      const found = c.students.find((s) => s.id === studentId);
      if (found) {
        currentClass = c;
        currentStudent = found;
        break;
      }
    }
  }

  // Fallback to first student if not found
  if (!currentClass || !currentStudent) {
    currentClass = classes[0];
    currentStudent = currentClass?.students[0];
  }

  const [selectedTerm, setSelectedTerm] = useState<string>(
    settings.semesters[0] || 'Term 1'
  );
  const currentYear = settings.academicYear;

  if (!currentClass || !currentStudent) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-200">
        <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 font-semibold">No student records available.</p>
      </div>
    );
  }

  // Perform calculations for this class & term
  const termRes = calculateTermAnalysis(currentClass, currentYear, selectedTerm);
  const fullRes = calculateFullAnalysis(
    currentClass,
    currentYear,
    selectedTerm,
    settings.semesters
  );

  const termStudent = termRes.result?.studentData.find((s) => s.id === currentStudent.id);
  const fullStudent = fullRes.result?.studentData.find((s) => s.id === currentStudent.id);
  const subjects = currentClass.subjects;

  const selectedTermIdx = settings.semesters.indexOf(selectedTerm);
  const prevTermName = selectedTermIdx > 0 ? settings.semesters[selectedTermIdx - 1] : null;
  const prevTermRes = prevTermName ? calculateTermAnalysis(currentClass, currentYear, prevTermName) : null;
  const prevTermStudent = prevTermRes?.result?.studentData.find((s) => s.id === currentStudent.id);
  const hasPrevMarks = Boolean(prevTermStudent && prevTermStudent.termTotal > 0);
  const termDeltaPct = hasPrevMarks && termStudent && prevTermStudent
    ? termStudent.termAveragePercentage - prevTermStudent.termAveragePercentage
    : 0;
  const rankDelta = hasPrevMarks && prevTermStudent && termStudent
    ? prevTermStudent.termRank - termStudent.termRank
    : 0;

  const attendance = currentStudent.attendance?.[currentYear]?.[selectedTerm] || {
    presentDays: 98,
    totalDays: 100,
  };
  const attendanceRate =
    attendance.totalDays > 0
      ? ((attendance.presentDays / attendance.totalDays) * 100).toFixed(1)
      : '0';

  const remarks = currentStudent.remarks?.[currentYear]?.[selectedTerm] || {
    teacherRemark: 'Demonstrates consistent scholarly diligence and active engagement.',
    principalRemark: 'Commendable academic standing.',
    conduct: 'Exemplary',
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Student Welcome Header */}
      <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#00A896] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden no-print">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 shadow-lg border-2 border-[#FFC300] flex-shrink-0 flex items-center justify-center">
              <img
                src={settings.logo || '/icon.svg'}
                alt="School"
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                }}
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold text-[#FFC300] mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Official Student &amp; Guardian Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {currentStudent.name}
              </h1>
              <p className="text-white/80 text-xs sm:text-sm mt-1 flex items-center gap-3 flex-wrap">
                <span>Roll #{currentStudent.rollNo}</span>
                <span>&bull;</span>
                <span>{currentClass.name}</span>
                <span>&bull;</span>
                <span>Academic Year {currentYear}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Term Selector */}
            <div className="bg-white/15 backdrop-blur-xs p-1.5 rounded-2xl border border-white/20 flex items-center gap-1">
              <span className="text-xs font-semibold px-2 text-white/80 hidden sm:inline">Term:</span>
              {settings.semesters.map((term) => (
                <button
                  key={term}
                  onClick={() => setSelectedTerm(term)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedTerm === term
                      ? 'bg-[#FFC300] text-[#003366] shadow-sm'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#003366] hover:bg-gray-100 font-bold text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs border-l-4 border-l-[#003366]">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {selectedTerm} Average
          </span>
          <div className="text-3xl font-black text-[#003366] mt-2">
            {termStudent ? `${termStudent.termAveragePercentage.toFixed(1)}%` : 'N/A'}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Grade {termStudent?.grade || 'A'}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              GPA {termStudent?.gpa.toFixed(1) || '4.0'}
            </span>
          </div>
          {hasPrevMarks && prevTermName && (
            <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center">
              {termDeltaPct > 0.05 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>▲ +{termDeltaPct.toFixed(1)}% vs {prevTermName}</span>
                </span>
              ) : termDeltaPct < -0.05 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
                  <span>▼ {termDeltaPct.toFixed(1)}% vs {prevTermName}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                  <Minus className="w-3.5 h-3.5 text-gray-400" />
                  <span>— 0.0% vs {prevTermName}</span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs border-l-4 border-l-[#00A896]">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Term Rank
          </span>
          <div className="text-3xl font-black text-[#00A896] mt-2">
            #{termStudent?.termRank || 1}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Out of {currentClass.students.length} enrolled scholars
          </p>
          {hasPrevMarks && prevTermName && rankDelta !== 0 && (
            <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center">
              {rankDelta > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>▲ +{rankDelta} {rankDelta === 1 ? 'place' : 'places'} vs {prevTermName}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
                  <span>▼ {rankDelta} {rankDelta === -1 ? 'place' : 'places'} vs {prevTermName}</span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs border-l-4 border-l-[#FFC300]">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Cumulative Rank
          </span>
          <div className="text-3xl font-black text-[#b38600] mt-2">
            #{fullStudent?.rank || 1}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Cumulative GPA: {fullStudent?.cumulativeGPA.toFixed(1) || '4.0'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs border-l-4 border-l-indigo-500">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Attendance Rate
          </span>
          <div className="text-3xl font-black text-indigo-600 mt-2">
            {attendanceRate}%
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {attendance.presentDays} / {attendance.totalDays} school days attended
          </p>
        </div>
      </div>

      {/* Subject Performance & Assessment Breakdown */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#003366]">
              {selectedTerm} Assessment &amp; Subject Results
            </h3>
            <p className="text-xs text-gray-500">Detailed continuous evaluations and examinations</p>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
            {subjects.length} Enrolled Courses
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100/70 text-gray-700 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Assessment Breakdown</th>
                <th className="py-3 px-4 text-center w-20">Max</th>
                <th className="py-3 px-4 text-center w-24">Obtained</th>
                <th className="py-3 px-4 text-center w-20">Grade</th>
                <th className="py-3 px-4 text-center w-24">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subjects.map((sub) => {
                const markInfo = termStudent?.subjectMarks[sub.name];
                const obtained = markInfo ? markInfo.total : 0;
                const maxScore = markInfo ? markInfo.maxScore : 100;
                const pct = maxScore > 0 ? (obtained / maxScore) * 100 : 0;
                const gradeInfo = getGradeInfo(pct);
                const breakdown = markInfo?.marks || {};

                return (
                  <tr key={sub.name} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{sub.name}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-2 text-xs">
                        {sub.assessments.map((a) => (
                          <span
                            key={a.id || a.name}
                            className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-700"
                          >
                            <span className="text-gray-500">{a.name}:</span>{' '}
                            <strong className="text-gray-900">{breakdown[a.name] ?? '-'}</strong>/
                            {a.maxScore}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-gray-600">
                      {maxScore}
                    </td>
                    <td className="py-3.5 px-4 text-center font-extrabold text-[#003366] text-base">
                      {obtained}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${gradeInfo.badgeColor}`}
                      >
                        {gradeInfo.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-xs font-bold ${
                          pct >= 50 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {pct >= 50 ? 'Pass' : 'Needs Support'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-extrabold text-[#003366] border-t-2 border-gray-200">
                <td colSpan={2} className="py-3 px-4 text-right uppercase text-xs">
                  Term Grand Total:
                </td>
                <td className="py-3 px-4 text-center">{termStudent?.termMaxScore || 0}</td>
                <td className="py-3 px-4 text-center text-lg">{termStudent?.termTotal || 0}</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#00A896]/15 text-[#00A896]">
                    {termStudent?.grade}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-xs font-black text-[#00A896]">
                  {termStudent?.termAveragePercentage.toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Conduct & Teacher Feedback Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h4 className="text-sm font-bold text-[#003366] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FFC300]" />
              Class Teacher&apos;s Assessment
            </h4>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Conduct: {remarks.conduct || 'Exemplary'}
            </span>
          </div>
          <p className="text-sm text-gray-700 italic leading-relaxed">
            &ldquo;{remarks.teacherRemark}&rdquo;
          </p>
          <div className="pt-2 text-xs text-gray-400 font-medium">
            Assigned Class Teacher &bull; {currentClass.name}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h4 className="text-sm font-bold text-[#003366] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#00A896]" />
              Principal / Headmaster&apos;s Remarks
            </h4>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              Official Endorsement
            </span>
          </div>
          <p className="text-sm text-gray-700 italic leading-relaxed">
            &ldquo;{remarks.principalRemark}&rdquo;
          </p>
          <div className="pt-2 text-xs text-gray-400 font-medium">
            Office of Academic Affairs &bull; {settings.name}
          </div>
        </div>
      </div>

      {/* Printable Report Card view (Visible on print) */}
      <div className="hidden print:block bg-white p-8 border-2 border-gray-900 rounded-none text-black">
        <div className="text-center pb-4 border-b-2 border-gray-800">
          <h1 className="text-2xl font-black uppercase">{settings.name}</h1>
          <p className="text-sm font-bold mt-1">
            OFFICIAL ACADEMIC TRANSCRIPT &bull; {selectedTerm.toUpperCase()} ({currentYear})
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 py-4 border-b border-gray-400 text-xs">
          <div>Student Name: <strong>{currentStudent.name}</strong></div>
          <div>Roll Number: <strong>#{currentStudent.rollNo}</strong></div>
          <div>Class: <strong>{currentClass.name}</strong></div>
          <div>Term Rank: <strong>#{termStudent?.termRank} of {currentClass.students.length}</strong></div>
          <div>Attendance: <strong>{attendance.presentDays}/{attendance.totalDays} ({attendanceRate}%)</strong></div>
          <div>Conduct: <strong>{remarks.conduct}</strong></div>
        </div>

        <table className="w-full text-left text-xs border border-gray-400 my-4 border-collapse">
          <thead>
            <tr className="bg-gray-200 border-b border-gray-400">
              <th className="p-2 border-r border-gray-400">Subject</th>
              <th className="p-2 text-center border-r border-gray-400">Max</th>
              <th className="p-2 text-center border-r border-gray-400">Obtained</th>
              <th className="p-2 text-center border-r border-gray-400">Grade</th>
              <th className="p-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub) => {
              const m = termStudent?.subjectMarks[sub.name];
              const score = m ? m.total : 0;
              const max = m ? m.maxScore : 100;
              const pct = max > 0 ? (score / max) * 100 : 0;
              const gi = getGradeInfo(pct);
              return (
                <tr key={sub.name} className="border-b border-gray-300">
                  <td className="p-2 border-r border-gray-300 font-bold">{sub.name}</td>
                  <td className="p-2 text-center border-r border-gray-300">{max}</td>
                  <td className="p-2 text-center border-r border-gray-300 font-bold">{score}</td>
                  <td className="p-2 text-center border-r border-gray-300 font-bold">{gi.grade}</td>
                  <td className="p-2 text-center">{pct >= 50 ? 'PASS' : 'FAIL'}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td className="p-2 text-right">TOTAL:</td>
              <td className="p-2 text-center">{termStudent?.termMaxScore}</td>
              <td className="p-2 text-center">{termStudent?.termTotal}</td>
              <td className="p-2 text-center">{termStudent?.grade}</td>
              <td className="p-2 text-center">{termStudent?.termAveragePercentage.toFixed(1)}%</td>
            </tr>
          </tfoot>
        </table>

        <div className="py-2 text-xs space-y-1">
          <div><strong>Teacher Remarks:</strong> {remarks.teacherRemark}</div>
          <div><strong>Principal Remarks:</strong> {remarks.principalRemark}</div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-400 grid grid-cols-2 text-center text-xs">
          <div>Class Teacher Signature</div>
          <div>Principal Signature &amp; Seal</div>
        </div>
      </div>
    </div>
  );
};
