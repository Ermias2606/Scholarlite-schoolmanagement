import React, { useState } from 'react';
import {
  Printer,
  Download,
  Award,
  BarChart3,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Edit3,
  Calendar,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { AppData, SchoolClass, Student } from '../types';
import {
  calculateTermAnalysis,
  calculateFullAnalysis,
  downloadCSV,
  getGradeInfo,
} from '../utils/calculations';
import { StudentPerformanceSummaryView } from './StudentPerformanceSummaryView';

interface ReportsViewProps {
  appData: AppData;
  activeClass: SchoolClass;
  selectedYear: string;
  selectedSemester: string;
  reportType: 'summary' | 'student_performance_summary' | 'rank_list' | 'master_sheet' | 'performance' | 'report_card';
  onSelectReportType: (type: 'summary' | 'student_performance_summary' | 'rank_list' | 'master_sheet' | 'performance' | 'report_card') => void;
  onEditRemarksAttendance?: (student: Student) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  appData,
  activeClass,
  selectedYear,
  selectedSemester,
  reportType,
  onSelectReportType,
  onEditRemarksAttendance,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [isBatchPrinting, setIsBatchPrinting] = useState(false);

  const termAnalysisRes = calculateTermAnalysis(activeClass, selectedYear, selectedSemester);
  const fullAnalysisRes = calculateFullAnalysis(
    activeClass,
    selectedYear,
    selectedSemester,
    appData.settings.semesters
  );

  if (termAnalysisRes.error) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-gray-700">{termAnalysisRes.error}</p>
        <p className="text-xs text-gray-400 mt-1">
          Select a valid Class, Year, and Term with students and subjects defined.
        </p>
      </div>
    );
  }

  const { studentData: termStudents, subjects, termMaxScore } = termAnalysisRes.result!;
  const fullAnalysis = fullAnalysisRes.result;

  // Selected student for Report Card
  const activeStudentId =
    selectedStudentId && termStudents.some((s) => s.id === selectedStudentId)
      ? selectedStudentId
      : termStudents[0]?.id || '';

  const reportCardStudent = fullAnalysis?.studentData.find((s) => s.id === activeStudentId);
  const rawStudent = activeClass.students.find((s) => s.id === activeStudentId);

  // Student Attendance & Remarks
  const attendance = rawStudent?.attendance?.[selectedYear]?.[selectedSemester] || {
    presentDays: 98,
    totalDays: 100,
  };
  const attendanceRate =
    attendance.totalDays > 0
      ? ((attendance.presentDays / attendance.totalDays) * 100).toFixed(1)
      : '0';

  const remarks = rawStudent?.remarks?.[selectedYear]?.[selectedSemester] || {
    teacherRemark: 'Demonstrates exemplary conduct, diligence, and academic curiosity.',
    principalRemark: 'A commendable academic record with consistent dedication.',
    conduct: 'Exemplary',
  };

  // --- Handlers for CSV Downloads ---
  const handleDownloadRankListCSV = () => {
    if (!fullAnalysis) return;
    let csv = `Cumulative_Rank,Roll_No,Student_Name,Cumulative_Total,Cumulative_Max,Overall_Percentage,Cumulative_GPA,Grade\n`;
    fullAnalysis.studentData.forEach((s) => {
      csv += `${s.rank},${s.rollNo},"${s.name}",${s.cumulativeTotal},${s.cumulativeMaxScore},${s.overallAveragePercentage.toFixed(2)},${s.cumulativeGPA.toFixed(2)},${s.cumulativeGrade}\n`;
    });
    downloadCSV(`RankList_${activeClass.name}_${selectedYear}.csv`, csv);
  };

  const handleDownloadMasterCSV = () => {
    let csv = `Rank,Roll_No,Student_Name,${subjects.map((s) => `"${s.name}"`).join(',')},Total,Max_Score,Average_Percentage,Grade,GPA\n`;
    termStudents.forEach((s) => {
      const subjectCols = subjects.map((sub) => {
        const val = s.subjectMarks[sub.name]?.total;
        return val !== undefined ? val : '-';
      });
      csv += `${s.termRank},${s.rollNo},"${s.name}",${subjectCols.join(',')},${s.termTotal},${termMaxScore},${s.termAveragePercentage.toFixed(2)},${s.grade},${s.gpa.toFixed(2)}\n`;
    });
    downloadCSV(`MasterSheet_${activeClass.name}_${selectedSemester}_${selectedYear}.csv`, csv);
  };

  const handlePrint = () => {
    setIsBatchPrinting(false);
    setTimeout(() => window.print(), 50);
  };

  const handleBatchPrint = () => {
    setIsBatchPrinting(true);
    setTimeout(() => {
      window.print();
      setIsBatchPrinting(false);
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* Report Selector Pills */}
      <div className="flex flex-wrap gap-2 pb-2 no-print border-b border-gray-200">
        <button
          onClick={() => onSelectReportType('summary')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            reportType === 'summary'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          ⭐ Class Summary
        </button>
        <button
          id="tab-btn-performance-summary"
          onClick={() => onSelectReportType('student_performance_summary')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            reportType === 'student_performance_summary'
              ? 'bg-[#00A896] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span>🚀 Student Performance Summary</span>
        </button>
        <button
          onClick={() => onSelectReportType('master_sheet')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            reportType === 'master_sheet'
              ? 'bg-[#00A896] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          📑 Whole Term Master Sheet
        </button>
        <button
          onClick={() => onSelectReportType('rank_list')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            reportType === 'rank_list'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          📈 Cumulative Rank List
        </button>
        <button
          onClick={() => onSelectReportType('performance')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            reportType === 'performance'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          📊 Performance Analysis
        </button>
        <button
          onClick={() => onSelectReportType('report_card')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            reportType === 'report_card'
              ? 'bg-[#FFC300] text-[#003366] shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          🎓 Student Report Card
        </button>
      </div>

      {/* 1. Class Summary Report */}
      {reportType === 'summary' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-5 sm:p-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs font-bold text-[#00A896] uppercase tracking-wider">
                Term Grade Standings
              </span>
              <h3 className="text-lg font-black text-[#003366]">
                ⭐ Class Summary: {activeClass.name} &mdash; {selectedSemester}
              </h3>
            </div>
            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              Max Total: {termMaxScore} Marks
            </span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#003366]/5 text-[#003366] text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="py-3 px-4 text-center w-16 bg-amber-50/70">Rank</th>
                  <th className="py-3 px-4 w-20 text-center">Roll No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4 text-center">Term Total ({termMaxScore})</th>
                  <th className="py-3 px-4 text-center">Average %</th>
                  <th className="py-3 px-4 text-center">Grade</th>
                  <th className="py-3 px-4 text-center">GPA</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {termStudents.map((s) => {
                  const isPassing = s.termAveragePercentage >= 50;
                  const isAtRisk = s.termAveragePercentage < 40;
                  const gradeInfo = getGradeInfo(s.termAveragePercentage);

                  return (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3 px-4 text-center font-black bg-amber-50/40 text-[#003366]">
                        #{s.termRank}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-gray-600">
                        {s.rollNo}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">{s.name}</td>
                      <td className="py-3 px-4 text-center font-extrabold text-[#003366]">
                        {s.termTotal}
                      </td>
                      <td className="py-3 px-4 text-center font-black">
                        <span
                          className={
                            isAtRisk
                              ? 'text-red-600'
                              : isPassing
                              ? 'text-emerald-700'
                              : 'text-amber-600'
                          }
                        >
                          {s.termAveragePercentage.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${gradeInfo.badgeColor}`}
                        >
                          {s.grade || gradeInfo.grade}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-gray-700">
                        {(s.gpa !== undefined ? s.gpa : gradeInfo.gpa).toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isPassing ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> PASS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" /> FAIL
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Whole Term Master Sheet */}
      {reportType === 'master_sheet' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-5 sm:p-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs font-bold text-[#00A896] uppercase tracking-wider">
                Full Curriculum Overview
              </span>
              <h3 className="text-lg font-black text-[#003366]">
                📑 Master Sheet: {activeClass.name} &mdash; {selectedSemester}
              </h3>
            </div>
            <button
              onClick={handleDownloadMasterCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00A896] hover:bg-[#008f80] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Master CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-100/90 text-[#003366] text-xs font-bold uppercase tracking-wider border-b border-gray-300">
                  <th className="py-3 px-3.5 text-center w-14 bg-amber-50">Rank</th>
                  <th className="py-3 px-3.5 text-center w-16">Roll</th>
                  <th className="py-3 px-4 sticky left-0 bg-gray-100/90 z-10">Student Name</th>
                  {subjects.map((sub) => (
                    <th key={sub.name} className="py-3 px-4 text-center">
                      <div>{sub.name}</div>
                      <div className="text-[10px] text-gray-500 font-normal">
                        Max {s_max(sub)}
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center bg-blue-50 text-[#003366]">Total ({termMaxScore})</th>
                  <th className="py-3 px-4 text-center bg-blue-50 text-[#003366]">Avg %</th>
                  <th className="py-3 px-4 text-center bg-blue-50 text-[#003366]">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {termStudents.map((s) => {
                  const gradeInfo = getGradeInfo(s.termAveragePercentage);
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3 px-3.5 text-center font-black bg-amber-50/50 text-[#003366]">
                        #{s.termRank}
                      </td>
                      <td className="py-3 px-3.5 text-center font-bold text-gray-600">
                        {s.rollNo}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900 sticky left-0 bg-white shadow-xs">
                        {s.name}
                      </td>
                      {subjects.map((sub) => {
                        const markData = s.subjectMarks[sub.name];
                        const totalMark = markData ? markData.total : undefined;
                        const hasMark = totalMark !== undefined && totalMark !== null;
                        return (
                          <td key={sub.name} className="py-3 px-4 text-center font-medium">
                            {hasMark ? (
                              <span
                                className={`font-semibold ${
                                  totalMark < markData.maxScore * 0.5
                                    ? 'text-red-600'
                                    : 'text-gray-900'
                                }`}
                              >
                                {totalMark}
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-center font-black bg-blue-50/50 text-[#003366]">
                        {s.termTotal}
                      </td>
                      <td className="py-3 px-4 text-center font-black bg-blue-50/50 text-[#00A896]">
                        {s.termAveragePercentage.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-center bg-blue-50/50">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold border ${gradeInfo.badgeColor}`}
                        >
                          {s.grade || gradeInfo.grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Performance Summary with Up/Down Trend Indicators */}
      {reportType === 'student_performance_summary' && (
        <StudentPerformanceSummaryView
          activeClass={activeClass}
          academicYear={selectedYear}
          currentTerm={selectedSemester}
          allTerms={appData.settings.semesters}
          onOpenReportCardPrint={(studentId) => {
            setSelectedStudentId(studentId);
            onSelectReportType('report_card');
          }}
          onEditRemarksAttendance={onEditRemarksAttendance}
        />
      )}

      {/* 3. Cumulative Rank List */}
      {reportType === 'rank_list' && fullAnalysis && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-5 sm:p-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs font-bold text-[#00A896] uppercase tracking-wider">
                Full Year Cumulative Standings
              </span>
              <h3 className="text-lg font-black text-[#003366]">
                📈 Cumulative Rank List: {activeClass.name} ({selectedYear})
              </h3>
            </div>
            <button
              onClick={handleDownloadRankListCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[#003366] text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="py-3 px-4 text-center w-16 bg-amber-50">Rank</th>
                  <th className="py-3 px-4 w-20 text-center">Roll No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4 text-center">
                    Cumulative Total ({fullAnalysis.cumulativeMaxScore})
                  </th>
                  <th className="py-3 px-4 text-center">Overall %</th>
                  <th className="py-3 px-4 text-center">Cumulative Grade</th>
                  <th className="py-3 px-4 text-center">Cumulative GPA</th>
                  <th className="py-3 px-4 text-center">Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fullAnalysis.studentData.map((s) => {
                  const gradeInfo = getGradeInfo(s.overallAveragePercentage);
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3 px-4 text-center font-black bg-amber-50/50 text-[#003366]">
                        #{s.rank}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-gray-600">
                        {s.rollNo}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">{s.name}</td>
                      <td className="py-3 px-4 text-center font-black text-[#003366]">
                        {s.cumulativeTotal}
                      </td>
                      <td className="py-3 px-4 text-center font-black text-[#00A896]">
                        {s.overallAveragePercentage.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${gradeInfo.badgeColor}`}
                        >
                          {s.cumulativeGrade || gradeInfo.grade}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-gray-700">
                        {s.cumulativeGPA.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {s.rank === 1 && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                            🥇 1st Place
                          </span>
                        )}
                        {s.rank === 2 && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-200 px-2.5 py-0.5 rounded-full">
                            🥈 2nd Place
                          </span>
                        )}
                        {s.rank === 3 && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-200/60 px-2.5 py-0.5 rounded-full">
                            🥉 3rd Place
                          </span>
                        )}
                        {s.rank > 3 && (
                          <span className="text-xs text-gray-500 font-medium">Rank {s.rank}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Performance Analysis */}
      {reportType === 'performance' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-[#00A896] uppercase tracking-wider">
                  Cohort Analytics &amp; Ranges
                </span>
                <h3 className="text-lg font-black text-[#003366]">
                  📊 Performance Analysis &amp; Mark Range Distribution
                </h3>
              </div>
            </div>

            {/* Distribution Ranges */}
            <div className="mt-5 space-y-3">
              {getDistributions(termStudents).map((range) => (
                <div key={range.label} className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-gray-800">{range.label}</span>
                    <span className="text-gray-600">
                      {range.count} students ({range.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${range.color}`}
                      style={{ width: `${range.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Statistical Summary */}
          {fullAnalysis && (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-5 sm:p-6">
              <h4 className="text-sm font-bold text-[#003366] uppercase tracking-wider mb-4">
                Subject Statistical Summary &amp; Standard Deviation
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((sub) => {
                  const stat = fullAnalysis.subjectAnalysis[sub.name];
                  if (!stat) return null;
                  return (
                    <div key={sub.name} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="font-bold text-gray-900 text-sm">{sub.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Max Score: {stat.maxScore} pts</div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-white rounded-lg border border-gray-100">
                          <span className="text-gray-400 block text-[10px]">Cohort Mean</span>
                          <span className="font-black text-[#003366] text-sm">{stat.average.toFixed(1)}</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-gray-100">
                          <span className="text-gray-400 block text-[10px]">Std Deviation</span>
                          <span className="font-black text-[#00A896] text-sm">{stat.stdDev.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Student Report Card */}
      {reportType === 'report_card' && (
        <div className="space-y-4 animate-in fade-in duration-150">
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

          {/* Report Card Document */}
          {reportCardStudent && (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-6 sm:p-10 max-w-4xl mx-auto printable-report printable-report-card print:m-0 print:p-6 print:border-none print:shadow-none">
              {/* Card Header */}
              <div className="text-center pb-6 border-b-2 border-gray-800">
                <img
                  src={appData.settings.logo || '/icon.svg'}
                  alt="School Logo"
                  className="w-20 h-20 mx-auto object-contain mb-2 p-1 border-2 border-[#FFC300] rounded-full"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                  }}
                />
                <h1 className="text-2xl sm:text-3xl font-black text-[#003366] tracking-tight uppercase">
                  {appData.settings.name}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-gray-700 tracking-wider mt-1">
                  OFFICIAL ACADEMIC REPORT CARD &bull; {selectedSemester.toUpperCase()} ({selectedYear})
                </p>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 py-5 border-b border-gray-200 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-500 font-medium block text-[11px]">STUDENT NAME</span>
                  <span className="font-extrabold text-gray-900 text-base">{reportCardStudent.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block text-[11px]">ROLL NUMBER</span>
                  <span className="font-extrabold text-gray-900 text-base">#{reportCardStudent.rollNo}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block text-[11px]">CLASS COHORT</span>
                  <span className="font-extrabold text-gray-900 text-base">{activeClass.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block text-[11px]">ATTENDANCE RECORD</span>
                  <span className="font-semibold text-gray-800">
                    {attendance.presentDays} / {attendance.totalDays} days ({attendanceRate}%)
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block text-[11px]">TERM RANK</span>
                  <span className="font-bold text-[#003366]">
                    #{reportCardStudent.termRank} of {termStudents.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block text-[11px]">CUMULATIVE RANK</span>
                  <span className="font-black text-rose-600 text-base">
                    #{reportCardStudent.rank} of {fullAnalysis.studentData.length}
                  </span>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="mt-5">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Academic Performance &amp; Assessment Breakdown
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border border-gray-300 border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-300">
                        <th className="py-2.5 px-3 border-r border-gray-300">Subject</th>
                        <th className="py-2.5 px-3 text-center border-r border-gray-300">Assessment Breakdown</th>
                        <th className="py-2.5 px-3 text-center border-r border-gray-300 w-16">Max</th>
                        <th className="py-2.5 px-3 text-center border-r border-gray-300 w-20">Obtained</th>
                        <th className="py-2.5 px-3 text-center border-r border-gray-300 w-20">Grade</th>
                        <th className="py-2.5 px-3 text-center w-20">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {subjects.map((sub) => {
                        const markData = reportCardStudent.subjectMarks[sub.name];
                        const obtained = markData ? markData.total : 0;
                        const max = markData ? markData.maxScore : s_max(sub);
                        const isPass = max > 0 && obtained / max >= 0.5;
                        const breakdown = markData?.marks || {};
                        const gradeInfo = getGradeInfo(max > 0 ? (obtained / max) * 100 : 0);

                        return (
                          <tr key={sub.name} className="border-b border-gray-200">
                            <td className="py-2.5 px-3 font-bold text-gray-900 border-r border-gray-200">
                              {sub.name}
                            </td>
                            <td className="py-2.5 px-3 border-r border-gray-200 text-xs">
                              {sub.assessments.map((a) => (
                                <span key={a.id || a.name} className="mr-2 text-gray-600">
                                  {a.name}: <strong className="text-gray-900">{breakdown[a.name] ?? '-'}</strong>/{a.maxScore}
                                </span>
                              ))}
                            </td>
                            <td className="py-2.5 px-3 text-center font-semibold text-gray-600 border-r border-gray-200">
                              {max}
                            </td>
                            <td className="py-2.5 px-3 text-center font-extrabold text-[#003366] border-r border-gray-200">
                              {obtained}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold border-r border-gray-200">
                              <span
                                className={`px-2 py-0.5 rounded text-xs border ${gradeInfo.badgeColor}`}
                              >
                                {gradeInfo.grade}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold">
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
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
                        <td colSpan={2} className="py-2.5 px-3 text-right uppercase text-xs">
                          Term Grand Total:
                        </td>
                        <td className="py-2.5 px-3 text-center">{termMaxScore}</td>
                        <td className="py-2.5 px-3 text-center text-base">{reportCardStudent.termTotal}</td>
                        <td className="py-2.5 px-3 text-center text-sm font-black text-[#00A896]">
                          {reportCardStudent.grade}
                        </td>
                        <td className="py-2.5 px-3 text-center text-sm font-black text-[#00A896]">
                          {reportCardStudent.termAveragePercentage.toFixed(2)}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Cumulative Result Box */}
              <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border-2 border-dashed border-[#FFC300] text-center space-y-1">
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  CUMULATIVE ACADEMIC STANDING ({selectedYear})
                </p>
                <div className="text-base sm:text-lg font-black text-[#003366]">
                  {reportCardStudent.cumulativeTotal} / {reportCardStudent.cumulativeMaxScore} pts
                  &bull; Cumulative GPA: {reportCardStudent.cumulativeGPA.toFixed(1)} (Grade {reportCardStudent.cumulativeGrade})
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#00A896]">
                  OVERALL AVERAGE: {reportCardStudent.overallAveragePercentage.toFixed(2)}%
                </div>
              </div>

              {/* Remarks & Conduct */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-[#003366] tracking-wider">
                      Teacher Remark
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Conduct: {remarks.conduct || 'Exemplary'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 italic leading-relaxed">
                    &ldquo;{remarks.teacherRemark}&rdquo;
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase text-[#003366] tracking-wider block">
                    Principal&apos;s Endorsement
                  </span>
                  <p className="text-xs text-gray-700 italic leading-relaxed">
                    &ldquo;{remarks.principalRemark}&rdquo;
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="mt-10 pt-6 border-t border-gray-300 grid grid-cols-3 gap-4 text-center text-xs text-gray-600">
                <div>
                  <div className="border-b border-gray-400 pb-1 mb-1 font-medium">Class Teacher</div>
                  <span className="text-[10px] text-gray-400">Signature</span>
                </div>
                <div>
                  <div className="border-b border-gray-400 pb-1 mb-1 font-medium">
                    {new Date().toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <span className="text-[10px] text-gray-400">Issue Date</span>
                </div>
                <div>
                  <div className="border-b border-gray-400 pb-1 mb-1 font-medium">Principal / Headmaster</div>
                  <span className="text-[10px] text-gray-400">Signature &amp; Stamp</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function s_max(sub: { assessments: { maxScore: number }[] }): number {
  return sub.assessments.reduce((sum, a) => sum + (Number(a.maxScore) || 0), 0);
}

function getDistributions(students: { termAveragePercentage: number }[]) {
  const total = students.length;
  const ranges = [
    { min: 90, max: 1000, label: '90% and above (Excellent / A+)', color: 'bg-emerald-600' },
    { min: 80, max: 89.99, label: '80% - 89% (Very Good / A)', color: 'bg-teal-500' },
    { min: 70, max: 79.99, label: '70% - 79% (Good / B)', color: 'bg-blue-500' },
    { min: 60, max: 69.99, label: '60% - 69% (Satisfactory / C)', color: 'bg-amber-500' },
    { min: 50, max: 59.99, label: '50% - 59% (Pass / D)', color: 'bg-orange-500' },
    { min: 0, max: 49.99, label: 'Below 50% (Needs Improvement / F)', color: 'bg-rose-500' },
  ];

  return ranges.map((r) => {
    const count = students.filter(
      (s) => s.termAveragePercentage >= r.min && s.termAveragePercentage <= r.max
    ).length;
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
    return { ...r, count, percentage };
  });
}
