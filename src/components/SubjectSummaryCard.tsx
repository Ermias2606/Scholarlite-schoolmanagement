import React from 'react';
import { SchoolClass, Subject } from '../types';
import { getGradeInfo } from '../utils/calculations';
import { BarChart3 } from 'lucide-react';

interface SubjectSummaryCardProps {
  activeClass: SchoolClass;
  activeSubject: Subject | null;
  selectedYear: string;
  selectedSemester: string;
}

export const SubjectSummaryCard: React.FC<SubjectSummaryCardProps> = ({
  activeClass,
  activeSubject,
  selectedYear,
  selectedSemester,
}) => {
  if (!activeSubject) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center text-gray-500">
        Please select a subject to view the Subject Summary distribution.
      </div>
    );
  }

  const students = activeClass.students;
  let totalScoreSum = 0;
  const gradeCounts: Record<string, number> = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
  const scoresList: number[] = [];
  const subjectMax = activeSubject.assessments.reduce((sum, a) => sum + (Number(a.maxScore) || 0), 0) || 100;

  students.forEach((student) => {
    const markData = student.results?.[selectedYear]?.[selectedSemester]?.[activeSubject.name];
    const obtained = markData ? markData.total : 0;
    scoresList.push(obtained);
    totalScoreSum += obtained;

    const pct = subjectMax > 0 ? (obtained / subjectMax) * 100 : 0;
    const grade = getGradeInfo(pct).grade;
    if (gradeCounts[grade] !== undefined) gradeCounts[grade]++;
    else gradeCounts['F']++;
  });

  const classAverage = students.length > 0 ? totalScoreSum / students.length : 0;
  const averagePercentage = subjectMax > 0 ? (classAverage / subjectMax) * 100 : 0;
  const highestScore = scoresList.length > 0 ? Math.max(...scoresList) : 0;
  const lowestScore = scoresList.length > 0 ? Math.min(...scoresList) : 0;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#003366]/10 text-[#003366]">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#003366]">{activeSubject.name} — Subject Summary Card</h3>
            <p className="text-xs font-semibold text-gray-500">
              {activeClass.name} &bull; {selectedSemester} ({selectedYear}) &bull; {students.length} Students Evaluated
            </p>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#003366] text-xs font-bold border border-blue-100">
          Max Score: {subjectMax} pts
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Class Average</span>
          <div className="text-2xl font-black text-[#003366]">
            {classAverage.toFixed(1)} <span className="text-xs font-bold text-gray-400">({averagePercentage.toFixed(1)}%)</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Highest Score</span>
          <div className="text-2xl font-black text-emerald-900">{highestScore} pts</div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Lowest Score</span>
          <div className="text-2xl font-black text-amber-900">{lowestScore} pts</div>
        </div>
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">Assessments</span>
          <div className="text-2xl font-black text-purple-900">{activeSubject.assessments.length} Items</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">Grade Distribution Across Class</h4>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {['A+', 'A', 'B', 'C', 'D', 'F'].map((grade) => {
            const count = gradeCounts[grade] || 0;
            const percentage = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
            return (
              <div key={grade} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-2">
                <span className="text-xs font-black px-2.5 py-1 rounded-md bg-[#003366] text-white inline-block">
                  Grade {grade}
                </span>
                <div>
                  <div className="text-xl font-black text-gray-900">{count}</div>
                  <div className="text-[10px] font-semibold text-gray-500">{percentage}% of class</div>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#00A896] h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
