import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Award,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { AppData, UserProfile, SchoolClass } from '../types';
import { calculateTermAnalysis, getGradeInfo } from '../utils/calculations';

interface OverviewTabProps {
  appData: AppData;
  currentUser: UserProfile;
  onNavigateTab: (tab: 'classes' | 'results' | 'settings') => void;
  onSelectClass?: (classId: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  appData,
  currentUser,
  onNavigateTab,
  onSelectClass,
}) => {
  const { classes, settings } = appData;
  const currentYear = settings.academicYear;
  const semesters = settings.semesters;
  const activeTerm = semesters[0] || 'Term 1';

  // Filter classes if user is a class teacher
  const visibleClasses =
    currentUser.role === 'class_teacher'
      ? classes.filter((c) => currentUser.assignedClassIds?.includes(c.id) || c.id === currentUser.assignedClassId)
      : classes;

  const totalClasses = visibleClasses.length;
  const totalStudents = visibleClasses.reduce((sum, c) => sum + (c.students?.length || 0), 0);
  const totalSubjects = visibleClasses.reduce((sum, c) => sum + (c.subjects?.length || 0), 0);
  const totalTerms = semesters.length;

  const isAdmin = ['super_admin', 'school_admin', 'admin'].includes(currentUser.role);
  const isTeacher = ['class_teacher', 'subject_teacher'].includes(currentUser.role);

  // Admin Specific Metric
  const pendingStudentsCount = appData.classes.reduce((sum, c) => 
    sum + c.students.filter(s => s.status === 'pending').length
  , 0);

  const totalStaff = appData.users?.length || 0;

  // Aggregate student academic metrics across visible classes for the active term academic metrics across visible classes for the active term
  interface StudentMetric {
    id: string;
    name: string;
    rollNo: number;
    className: string;
    percentage: number;
    grade: string;
    gender?: string;
  }

  const allStudentMetrics: StudentMetric[] = [];
  const gradeCounts: Record<string, number> = { 'A+': 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
  let maleTotalScore = 0;
  let maleCount = 0;
  let femaleTotalScore = 0;
  let femaleCount = 0;

  visibleClasses.forEach((c) => {
    const analysis = calculateTermAnalysis(c, currentYear, activeTerm);
    if (analysis.result) {
      analysis.result.studentData.forEach((s) => {
        const studentRaw = c.students.find((st) => st.id === s.id);
        const gender = studentRaw?.gender;
        const pct = s.termAveragePercentage;
        const grade = s.grade || getGradeInfo(pct).grade;

        if (gradeCounts[grade] !== undefined) {
          gradeCounts[grade]++;
        } else {
          gradeCounts['F']++;
        }

        if (gender === 'M') {
          maleTotalScore += pct;
          maleCount++;
        } else if (gender === 'F') {
          femaleTotalScore += pct;
          femaleCount++;
        }

        allStudentMetrics.push({
          id: s.id,
          name: s.name,
          rollNo: s.rollNo,
          className: c.name,
          percentage: pct,
          grade,
          gender,
        });
      });
    }
  });

  // Top Achievers (sorted descending by %)
  const topAchievers = [...allStudentMetrics]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  // At-Risk scholars (< 50%)
  const atRiskStudents = allStudentMetrics.filter((s) => s.percentage < 50);

  const maleAvg = maleCount > 0 ? (maleTotalScore / maleCount).toFixed(1) : 'N/A';
  const femaleAvg = femaleCount > 0 ? (femaleTotalScore / femaleCount).toFixed(1) : 'N/A';

  const upcomingEvents = [...(appData.events || [])]
    .filter(e => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'holiday': return 'bg-emerald-100 text-emerald-800';
      case 'exam': return 'bg-rose-100 text-rose-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#00A896] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-[#FFC300] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ScholarLite Academic Engine &bull; Role: {currentUser.role.replace('_', ' ').toUpperCase()}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.name}
          </h2>
          <p className="text-white/80 text-sm sm:text-base mt-2">
            {['super_admin', 'school_admin', 'admin'].includes(currentUser.role)
              ? `Principal administrative workspace for ${settings.name}. Manage school cohorts, verify terminal grades, and inspect institutional audit logs.`
              : currentUser.role === 'class_teacher'
              ? `Class management cockpit. You have authority over student rosters, terminal attendance, and report cards for your assigned class.`
              : `Academic faculty portal. Record continuous assessment scores and review student course performance.`}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('results')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFC300] hover:bg-[#ffd140] text-[#003366] font-bold text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Enter Marks &amp; Reports</span>
            </button>
            {currentUser.role === 'admin' && (
              <button
                onClick={() => onNavigateTab('classes')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm border border-white/20 transition cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Manage Class Rosters</span>
              </button>
            )}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => onNavigateTab('settings')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Staff &amp; Settings</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs border-l-4 border-l-[#003366] transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {currentUser.role === 'class_teacher' ? 'Your Class' : 'Total Classes'}
            </span>
            <div className="p-2 rounded-xl bg-[#003366]/10 text-[#003366]">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#003366] mt-2">{totalClasses}</div>
          <p className="text-xs text-gray-500 mt-1">Active class cohorts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs border-l-4 border-l-[#00A896] transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Students</span>
            <div className="p-2 rounded-xl bg-[#00A896]/10 text-[#00A896]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#00A896] mt-2">{totalStudents}</div>
          <p className="text-xs text-gray-500 mt-1">Scholars enrolled</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs border-l-4 border-l-[#FFC300] transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Honor Roll (A/A+)</span>
            <div className="p-2 rounded-xl bg-[#FFC300]/20 text-[#b38600]">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2">
            {(gradeCounts['A+'] || 0) + (gradeCounts['A'] || 0)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Scholars with distinction</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs border-l-4 border-l-rose-500 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">At-Risk Alerts</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 mt-2">{atRiskStudents.length}</div>
          <p className="text-xs text-gray-500 mt-1">Below 50% threshold</p>
        </div>
      </div>

      {/* Upcoming Events (New Calendar Feature) */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#003366]">Upcoming Events</h3>
              <p className="text-xs text-gray-500">School calendar schedule</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('calendar' as any)}
            className="text-xs font-semibold text-[#00A896] hover:text-[#008072] flex items-center gap-1 cursor-pointer"
          >
            <span>Full Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingEvents.length === 0 ? (
            <div className="md:col-span-3 text-center py-6 text-gray-400 text-sm">
              No upcoming events scheduled.
            </div>
          ) : (
            upcomingEvents.map(event => (
              <div key={event.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${getEventStyle(event.type)}`}>
                    {event.type}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm truncate">{event.title}</h4>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  {event.endDate && event.endDate !== event.date && ` - ${new Date(event.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Grade Distribution & Top Achievers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Distribution Bar */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#003366] uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00A896]" />
              Grade Distribution ({activeTerm})
            </h3>
            <span className="text-xs text-gray-400 font-semibold">{totalStudents} Total</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(gradeCounts).map(([grade, count]) => {
              const pct = totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(0) : '0';
              const color =
                grade === 'A+' || grade === 'A'
                  ? 'bg-emerald-500'
                  : grade === 'B'
                  ? 'bg-blue-500'
                  : grade === 'C'
                  ? 'bg-amber-500'
                  : grade === 'D'
                  ? 'bg-orange-500'
                  : 'bg-rose-500';

              return (
                <div key={grade} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-800">Grade {grade}</span>
                    <span className="text-gray-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gender Equity Metric */}
          <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 bg-blue-50/60 rounded-xl">
              <div className="text-gray-500">Male Avg ({maleCount})</div>
              <div className="font-extrabold text-blue-700 text-sm mt-0.5">{maleAvg}%</div>
            </div>
            <div className="p-2 bg-rose-50/60 rounded-xl">
              <div className="text-gray-500">Female Avg ({femaleCount})</div>
              <div className="font-extrabold text-rose-700 text-sm mt-0.5">{femaleAvg}%</div>
            </div>
          </div>
        </div>

        {/* Top 5 Honor Roll */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#003366] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FFC300]" />
              Top Academic Achievers
            </h3>
            <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
              Honor Roll
            </span>
          </div>

          <div className="space-y-2.5">
            {topAchievers.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No scores recorded yet.</p>
            ) : (
              topAchievers.map((s, idx) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 bg-gray-50/70 hover:bg-gray-100/70 rounded-2xl border border-gray-100 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        idx === 0
                          ? 'bg-[#FFC300] text-[#003366]'
                          : idx === 1
                          ? 'bg-gray-300 text-gray-800'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-xs">{s.name}</div>
                      <div className="text-[10px] text-gray-500">{s.className}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-[#00A896] text-xs">
                      {s.percentage.toFixed(1)}%
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">Grade {s.grade}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Academic Intervention / At Risk */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-rose-700 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Intervention Watchlist (&lt;50%)
            </h3>
            <span className="text-xs text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full">
              {atRiskStudents.length} Students
            </span>
          </div>

          <div className="space-y-2.5">
            {atRiskStudents.length === 0 ? (
              <div className="p-6 text-center text-emerald-600 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-1 text-emerald-500" />
                <div className="font-bold text-xs">All Scholars Passing!</div>
                <p className="text-[10px] text-emerald-700 mt-0.5">
                  Every scholar is currently performing at or above the 50% benchmark.
                </p>
              </div>
            ) : (
              atRiskStudents.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 bg-rose-50/40 rounded-2xl border border-rose-100"
                >
                  <div>
                    <div className="font-bold text-gray-900 text-xs">{s.name}</div>
                    <div className="text-[10px] text-gray-500">{s.className} &bull; Roll #{s.rollNo}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-rose-600 text-xs">
                      {s.percentage.toFixed(1)}%
                    </div>
                    <span className="text-[10px] font-bold text-rose-500">Grade {s.grade}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Class Status Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-[#003366]">Class Status &amp; Term Progress</h3>
            <p className="text-xs text-gray-500">Live overview of mark submissions for {currentYear}</p>
          </div>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => onNavigateTab('classes')}
              className="text-xs font-semibold text-[#00A896] hover:text-[#008072] flex items-center gap-1 cursor-pointer"
            >
              <span>Add Class</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-[#003366] text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="py-3 px-4">Class Name</th>
                <th className="py-3 px-4 text-center">Students</th>
                <th className="py-3 px-4 text-center">Subjects</th>
                {semesters.map((term) => (
                  <th key={term} className="py-3 px-4 text-center">
                    {term} Status
                  </th>
                ))}
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleClasses.length === 0 ? (
                <tr>
                  <td colSpan={4 + semesters.length} className="text-center py-8 text-gray-400 text-sm">
                    No classes registered.
                  </td>
                </tr>
              ) : (
                visibleClasses.map((c) => {
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00A896]" />
                        {c.name}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-gray-700">
                        {c.students?.length || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-gray-700">
                        {c.subjects?.length || 0}
                      </td>
                      {semesters.map((term) => {
                        const hasMarks = c.students?.some((s) => {
                          const yearObj = s.results?.[currentYear];
                          const termObj = yearObj?.[term];
                          return termObj && Object.keys(termObj).length > 0;
                        });

                        return (
                          <td key={term} className="py-3.5 px-4 text-center">
                            {hasMarks ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Entered
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                                <AlertCircle className="w-3 h-3 text-gray-400" />
                                Pending
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            if (onSelectClass) onSelectClass(c.id);
                            onNavigateTab('results');
                          }}
                          className="text-xs font-bold text-[#003366] hover:text-[#00A896] hover:underline"
                        >
                          View Results &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions FAB (Admin Only) */}
      {currentUser.role === 'admin' && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
          <AnimatePresence>
            {isFabOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="flex flex-col gap-2 pointer-events-auto"
              >
                <button
                  onClick={() => onNavigateTab('manage_students')}
                  className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 hover:text-indigo-600 transition group"
                >
                  <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600">Register Student</span>
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <UserPlus className="w-4 h-4" />
                  </div>
                </button>
                <button
                  onClick={() => onNavigateTab('calendar')}
                  className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 hover:text-emerald-600 transition group"
                >
                  <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-600">Add School Event</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CalendarPlus className="w-4 h-4" />
                  </div>
                </button>
                <button
                  onClick={() => onNavigateTab('results')}
                  className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 hover:text-amber-600 transition group"
                >
                  <span className="text-sm font-bold text-gray-700 group-hover:text-amber-600">Generate Report Cards</span>
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <FilePlus2 className="w-4 h-4" />
                  </div>
                </button>
                <button
                  onClick={() => onNavigateTab('manage_staff')}
                  className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 hover:text-rose-600 transition group"
                >
                  <span className="text-sm font-bold text-gray-700 group-hover:text-rose-600">Create Department / Staff</span>
                  <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                    <SettingsIcon className="w-4 h-4" />
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => setIsFabOpen(!isFabOpen)}
            className={`w-14 h-14 rounded-full bg-[#003366] text-white shadow-xl shadow-blue-900/20 flex items-center justify-center hover:bg-[#002244] transition-all transform pointer-events-auto ${isFabOpen ? 'rotate-45 bg-[#00A896]' : 'hover:scale-105'}`}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

    </div>
  );
};
