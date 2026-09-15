import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Users,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { SchoolClass, StudentPerformanceTrend, TrendDirection, Student, SubjectTrend } from '../types';
import {
  calculateStudentPerformanceTrends,
  downloadStudentPerformanceSummaryCSV,
  getGradeInfo,
} from '../utils/calculations';

interface StudentPerformanceSummaryViewProps {
  activeClass: SchoolClass;
  academicYear: string;
  currentTerm: string;
  allTerms: string[];
  onOpenReportCardPrint?: (studentId: string) => void;
  onEditRemarksAttendance?: (student: Student) => void;
}

export const StudentPerformanceSummaryView: React.FC<StudentPerformanceSummaryViewProps> = ({
  activeClass,
  academicYear,
  currentTerm,
  allTerms,
  onOpenReportCardPrint,
}) => {
  // Automatically select previous term if available (term right before currentTerm in allTerms)
  const currentTermIndex = allTerms.indexOf(currentTerm);
  const defaultPrevTerm =
    currentTermIndex > 0
      ? allTerms[currentTermIndex - 1]
      : allTerms.length > 1
      ? allTerms[1]
      : allTerms[0] || '';

  const [selectedPrevTerm, setSelectedPrevTerm] = useState<string>(defaultPrevTerm);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState<'all' | 'up' | 'down' | 'neutral' | 'none'>('all');
  const [sortBy, setSortBy] = useState<'improvement' | 'decline' | 'rank' | 'current_score' | 'roll' | 'name'>('improvement');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // If currentTerm changes and matches selectedPrevTerm, adjust selectedPrevTerm
  const effectivePrevTerm =
    selectedPrevTerm === currentTerm
      ? defaultPrevTerm !== currentTerm
        ? defaultPrevTerm
        : allTerms.find((t) => t !== currentTerm) || ''
      : selectedPrevTerm;

  const analysisRes = useMemo(() => {
    return calculateStudentPerformanceTrends(
      activeClass,
      academicYear,
      currentTerm,
      effectivePrevTerm
    );
  }, [activeClass, academicYear, currentTerm, effectivePrevTerm]);

  if (analysisRes.error || !analysisRes.result) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-gray-200 shadow-xs">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h4 className="text-base font-bold text-gray-800">Cannot Generate Performance Summary</h4>
        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
          {analysisRes.error || 'Ensure students, subjects, and marks are entered for this class.'}
        </p>
      </div>
    );
  }

  const { trends, cohortSummary } = analysisRes.result;

  // Filter students
  const filteredTrends = trends.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toString().includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterDirection === 'all') return true;
    return student.trendDirection === filterDirection;
  });

  // Sort students
  const sortedTrends = [...filteredTrends].sort((a, b) => {
    switch (sortBy) {
      case 'improvement':
        // highest positive percentage change first
        return b.percentageDifference - a.percentageDifference;
      case 'decline':
        // lowest/most negative percentage change first
        return a.percentageDifference - b.percentageDifference;
      case 'current_score':
        return b.currentTotal - a.currentTotal;
      case 'rank':
        return a.currentRank - b.currentRank;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'roll':
      default:
        return a.rollNo - b.rollNo;
    }
  });

  const isFirstTermBaseline = !effectivePrevTerm || cohortSummary.noPriorCount === trends.length;

  const handleDownloadCSV = () => {
    if (analysisRes.result) {
      downloadStudentPerformanceSummaryCSV(analysisRes.result);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderTrendBadge = (trend: StudentPerformanceTrend) => {
    if (!trend.hasPreviousData) {
      return (
        <span
          id={`trend-badge-none-${trend.id}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200"
          title="First term / No previous marks on file"
        >
          <Minus className="w-3.5 h-3.5 text-gray-400" />
          <span>Baseline Term</span>
        </span>
      );
    }

    if (trend.trendDirection === 'up') {
      return (
        <span
          id={`trend-badge-up-${trend.id}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs"
          title={`Improved by +${trend.percentageDifference.toFixed(2)}% compared to ${effectivePrevTerm}`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
          <span>▲ +{trend.percentageDifference.toFixed(2)}%</span>
        </span>
      );
    }

    if (trend.trendDirection === 'down') {
      return (
        <span
          id={`trend-badge-down-${trend.id}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs"
          title={`Declined by ${trend.percentageDifference.toFixed(2)}% compared to ${effectivePrevTerm}`}
        >
          <TrendingDown className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
          <span>▼ {trend.percentageDifference.toFixed(2)}%</span>
        </span>
      );
    }

    return (
      <span
        id={`trend-badge-neutral-${trend.id}`}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200"
        title="Performance maintained with 0.0% variance"
      >
        <Minus className="w-3.5 h-3.5 text-gray-500" />
        <span>— 0.00%</span>
      </span>
    );
  };

  const renderRankChangeBadge = (trend: StudentPerformanceTrend) => {
    if (!trend.hasPreviousData) {
      return <span className="text-xs text-gray-400 font-medium">#{trend.currentRank}</span>;
    }

    if (trend.rankDifference > 0) {
      return (
        <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
          <span className="font-mono">#{trend.currentRank}</span>
          <span className="text-[11px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
            ▲ +{trend.rankDifference} {trend.rankDifference === 1 ? 'place' : 'places'}
          </span>
        </div>
      );
    }

    if (trend.rankDifference < 0) {
      return (
        <div className="flex items-center gap-1 text-xs font-bold text-rose-700">
          <span className="font-mono">#{trend.currentRank}</span>
          <span className="text-[11px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-semibold">
            ▼ {trend.rankDifference} {trend.rankDifference === -1 ? 'place' : 'places'}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
        <span className="font-mono">#{trend.currentRank}</span>
        <span className="text-[10px] text-gray-400 font-normal">(No shift)</span>
      </div>
    );
  };

  return (
    <div id="student-performance-summary-view" className="space-y-6">
      {/* Top Banner & Context Controls */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-5 sm:p-6 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#00A896]/10 text-[#00A896]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Term-Over-Term Progress Tracking</span>
              </span>
              <span className="text-xs font-semibold text-gray-400">&bull;</span>
              <span className="text-xs font-bold text-gray-600">{activeClass.name}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#003366] tracking-tight">
              Student Performance Summary
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Analyze individual and cohort grade progression with upward/downward trend indicators compared to the prior evaluation term.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="btn-download-trend-csv"
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              id="btn-print-performance-summary"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Summary</span>
            </button>
          </div>
        </div>

        {/* Term Comparison Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Current Evaluation Term
            </label>
            <div className="font-extrabold text-sm text-[#003366] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00A896]" />
              <span>{currentTerm}</span>
              <span className="text-xs font-normal text-gray-400">({academicYear})</span>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Compare Against Prior Term
            </label>
            <select
              id="select-comparison-term"
              value={effectivePrevTerm}
              onChange={(e) => setSelectedPrevTerm(e.target.value)}
              className="w-full px-2.5 py-1 text-xs font-bold text-gray-800 bg-white rounded-lg border border-gray-300 focus:border-[#003366] outline-none"
            >
              {allTerms
                .filter((t) => t !== currentTerm)
                .map((t) => (
                  <option key={t} value={t}>
                    {t} (Baseline)
                  </option>
                ))}
              {allTerms.filter((t) => t !== currentTerm).length === 0 && (
                <option value="">No Earlier Term</option>
              )}
            </select>
          </div>

          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Cohort Trend Status
            </label>
            <div className="text-xs font-extrabold text-gray-700 flex items-center gap-1.5">
              {cohortSummary.averagePercentageDelta > 0 ? (
                <>
                  <span className="text-emerald-600 flex items-center font-black">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                    +{cohortSummary.averagePercentageDelta.toFixed(2)}%
                  </span>
                  <span className="text-gray-400 font-normal">Class Growth</span>
                </>
              ) : cohortSummary.averagePercentageDelta < 0 ? (
                <>
                  <span className="text-rose-600 flex items-center font-black">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                    {cohortSummary.averagePercentageDelta.toFixed(2)}%
                  </span>
                  <span className="text-gray-400 font-normal">Class Shift</span>
                </>
              ) : (
                <span className="text-gray-500 font-medium">0.00% Stable</span>
              )}
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Class Roster Size
            </label>
            <div className="text-xs font-extrabold text-[#003366] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span>{trends.length} Enrolled Scholars</span>
            </div>
          </div>
        </div>

        {isFirstTermBaseline && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-[#003366] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00A896] flex-shrink-0" />
            <span>
              <strong>Initial Term Baseline:</strong> Currently showing {currentTerm}. As scores for subsequent terms are finalized, trend arrows (▲ / ▼) will dynamically benchmark growth against this baseline.
            </span>
          </div>
        )}
      </div>

      {/* Cohort Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 no-print">
        {/* Improved Scholars */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Improved Marks
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">
            {cohortSummary.improvedCount}
            <span className="text-xs sm:text-sm font-semibold text-gray-500 ml-1.5">
              ({cohortSummary.improvedPercentage.toFixed(0)}%)
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Scholars with upward arrow (▲)
          </p>
        </div>

        {/* Declined Scholars */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Declined Marks
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <TrendingDown className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 mt-2">
            {cohortSummary.declinedCount}
            <span className="text-xs sm:text-sm font-semibold text-gray-500 ml-1.5">
              ({cohortSummary.declinedPercentage.toFixed(0)}%)
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Scholars with downward arrow (▼)
          </p>
        </div>

        {/* Stable / Maintained */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Stable / First Record
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Minus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-800 mt-2">
            {cohortSummary.maintainedCount + cohortSummary.noPriorCount}
            <span className="text-xs sm:text-sm font-semibold text-gray-500 ml-1.5">
              scholars
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {cohortSummary.noPriorCount > 0
              ? `${cohortSummary.noPriorCount} baseline, ${cohortSummary.maintainedCount} stable`
              : 'Maintained exact benchmark'}
          </p>
        </div>

        {/* Top Advancer */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-[#FFC300]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Highest Improver
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          {cohortSummary.topGainer ? (
            <>
              <div className="text-sm sm:text-base font-black text-[#003366] mt-2 truncate">
                {cohortSummary.topGainer.name}
              </div>
              <p className="text-xs font-bold text-emerald-600 mt-0.5">
                ▲ +{cohortSummary.topGainer.delta.toFixed(2)}% overall gain
              </p>
            </>
          ) : (
            <>
              <div className="text-sm font-bold text-gray-400 mt-2">Baseline Phase</div>
              <p className="text-xs text-gray-400 mt-0.5">Pending comparison term</p>
            </>
          )}
        </div>
      </div>

      {/* Main Student Performance Trend Table Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Table Filters Toolbar */}
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 no-print">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-student-trends"
              type="text"
              placeholder="Search by student name or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-white rounded-xl border border-gray-200 focus:border-[#003366] outline-none"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Direction */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setFilterDirection('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterDirection === 'all'
                    ? 'bg-[#003366] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All ({trends.length})
              </button>
              <button
                onClick={() => setFilterDirection('up')}
                className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                  filterDirection === 'up'
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>Up ({cohortSummary.improvedCount})</span>
              </button>
              <button
                onClick={() => setFilterDirection('down')}
                className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                  filterDirection === 'down'
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <TrendingDown className="w-3 h-3" />
                <span>Down ({cohortSummary.declinedCount})</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
              <span className="hidden sm:inline">Sort:</span>
              <select
                id="select-trend-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs font-bold bg-white rounded-xl border border-gray-200 outline-none text-gray-800 cursor-pointer"
              >
                <option value="improvement">Top Improvement (▲ %)</option>
                <option value="decline">Top Decline (▼ %)</option>
                <option value="current_score">Current Score</option>
                <option value="rank">Current Rank</option>
                <option value="roll">Roll Number</option>
                <option value="name">Student Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Printable Official Header (visible only on print) */}
        <div className="hidden print:block p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-gray-900">
                Official Student Performance Summary &amp; Trend Report
              </h1>
              <p className="text-xs text-gray-600 mt-1">
                Class: {activeClass.name} &bull; Academic Year: {academicYear} &bull; Evaluation:{' '}
                {currentTerm} compared to {effectivePrevTerm || 'Baseline'}
              </p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <div>Printed: {new Date().toLocaleDateString()}</div>
              <div>ScholarLite Academic Intelligence</div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#003366]/5 text-[#003366] text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="py-3 px-3 w-16 text-center">Roll</th>
                <th className="py-3 px-4">Student Scholar</th>
                <th className="py-3 px-3 text-center bg-gray-100/60">
                  {effectivePrevTerm || 'Prior'} Total
                </th>
                <th className="py-3 px-3 text-center bg-blue-50/70">
                  {currentTerm} Total
                </th>
                <th className="py-3 px-3 text-center">Score Delta</th>
                <th className="py-3 px-3 text-center bg-amber-50/60">
                  Trend Indicator (vs {effectivePrevTerm || 'Prior'})
                </th>
                <th className="py-3 px-3 text-center">Rank Shift</th>
                <th className="py-3 px-3 text-center">Grade</th>
                <th className="py-3 px-3 text-center no-print w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedTrends.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-sm">No students match the current criteria.</p>
                  </td>
                </tr>
              ) : (
                sortedTrends.map((student) => {
                  const isExpanded = expandedStudentId === student.id;
                  const gradeInfo = getGradeInfo(student.currentPercentage);
                  const isTopGainer = cohortSummary.topGainer?.name === student.name;

                  return (
                    <React.Fragment key={student.id}>
                      <tr
                        className={`hover:bg-gray-50/60 transition ${
                          isExpanded ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center font-bold text-gray-600">
                          {student.rollNo}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-gray-900">{student.name}</span>
                            {isTopGainer && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded border border-amber-300">
                                🌟 Star Advancer
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {student.gender} &bull; Roll #{student.rollNo}
                          </div>
                        </td>

                        {/* Previous Term Total */}
                        <td className="py-3 px-3 text-center bg-gray-50/40">
                          {student.hasPreviousData ? (
                            <div>
                              <span className="font-bold text-gray-700">{student.previousTotal}</span>
                              <div className="text-[10px] text-gray-400">
                                {student.previousPercentage.toFixed(1)}% &bull; #{student.previousRank}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>

                        {/* Current Term Total */}
                        <td className="py-3 px-3 text-center bg-blue-50/40 font-black text-[#003366]">
                          <div>
                            <span className="text-sm">{student.currentTotal}</span>
                            <div className="text-[10px] text-[#00A896] font-bold">
                              {student.currentPercentage.toFixed(1)}%
                            </div>
                          </div>
                        </td>

                        {/* Score Difference */}
                        <td className="py-3 px-3 text-center font-bold">
                          {student.hasPreviousData ? (
                            <span
                              className={
                                student.totalDifference > 0
                                  ? 'text-emerald-600'
                                  : student.totalDifference < 0
                                  ? 'text-rose-600'
                                  : 'text-gray-500'
                              }
                            >
                              {student.totalDifference > 0 ? `+${student.totalDifference}` : student.totalDifference} pts
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Trend Indicator (The requested core feature) */}
                        <td className="py-3 px-3 text-center bg-amber-50/30">
                          {renderTrendBadge(student)}
                        </td>

                        {/* Rank Shift */}
                        <td className="py-3 px-3 text-center">
                          {renderRankChangeBadge(student)}
                        </td>

                        {/* Grade */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold border ${gradeInfo.badgeColor}`}
                          >
                            {student.currentGrade || gradeInfo.grade}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-center no-print">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() =>
                                setExpandedStudentId(isExpanded ? null : student.id)
                              }
                              className={`p-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                                isExpanded
                                  ? 'bg-[#003366] text-white border-[#003366]'
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                              }`}
                              title={isExpanded ? 'Hide subject trend details' : 'View subject breakdown'}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                            {onOpenReportCardPrint && (
                              <button
                                onClick={() => onOpenReportCardPrint(student.id)}
                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                                title="Print Report Card"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Subject Breakdown Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-gray-200">
                          <td colSpan={9} className="p-4 sm:p-5">
                            <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
                              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-[#00A896]" />
                                  <span className="font-extrabold text-xs text-[#003366] uppercase tracking-wider">
                                    Subject-by-Subject Trend Breakdown: {student.name}
                                  </span>
                                </div>
                                <span className="text-[11px] font-semibold text-gray-400">
                                  Comparing {currentTerm} vs {effectivePrevTerm || 'Baseline'}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(Object.values(student.subjectTrends) as SubjectTrend[]).map((sub: SubjectTrend) => {
                                  return (
                                    <div
                                      key={sub.subjectName}
                                      className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between"
                                    >
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="font-extrabold text-gray-800">
                                          {sub.subjectName}
                                        </span>
                                        {/* Sub trend arrow */}
                                        {sub.trend === 'up' ? (
                                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                            <TrendingUp className="w-3 h-3 text-emerald-600" />
                                            <span>+{sub.difference} pts (▲ +{sub.percentageDifference.toFixed(1)}%)</span>
                                          </span>
                                        ) : sub.trend === 'down' ? (
                                          <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                            <TrendingDown className="w-3 h-3 text-rose-600" />
                                            <span>{sub.difference} pts (▼ {sub.percentageDifference.toFixed(1)}%)</span>
                                          </span>
                                        ) : sub.trend === 'neutral' ? (
                                          <span className="inline-flex items-center gap-1 font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                            <Minus className="w-3 h-3 text-gray-400" />
                                            <span>0 pts (—)</span>
                                          </span>
                                        ) : (
                                          <span className="text-[10px] text-gray-400 font-medium">
                                            Initial Record
                                          </span>
                                        )}
                                      </div>

                                      <div className="mt-2.5 flex items-center justify-between text-xs text-gray-600 font-medium">
                                        <span>
                                          {effectivePrevTerm || 'Prior'}:{' '}
                                          <strong className="text-gray-800">
                                            {student.hasPreviousData ? sub.previousScore : '—'}
                                          </strong>
                                          /{sub.maxScore}
                                        </span>
                                        <ArrowRight className="w-3 h-3 text-gray-300" />
                                        <span>
                                          {currentTerm}:{' '}
                                          <strong className="text-[#003366]">
                                            {sub.currentScore}
                                          </strong>
                                          /{sub.maxScore} ({sub.currentPercentage.toFixed(0)}%)
                                        </span>
                                      </div>

                                      {/* Visual comparison progress bar */}
                                      <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all duration-300 ${
                                            sub.trend === 'up'
                                              ? 'bg-emerald-500'
                                              : sub.trend === 'down'
                                              ? 'bg-rose-500'
                                              : 'bg-[#00A896]'
                                          }`}
                                          style={{ width: `${Math.min(100, Math.max(0, sub.currentPercentage))}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
