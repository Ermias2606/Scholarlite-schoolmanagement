import React from 'react';
import { AppData } from '../types';
import { calculateTermAnalysis, getGradeInfo } from '../utils/calculations';
import { BarChart3, Users, Award, BookOpen } from 'lucide-react';

interface GenderGradeDistributionViewProps {
  appData: AppData;
  selectedYear: string;
  selectedSemester: string;
}

export const GenderGradeDistributionView: React.FC<GenderGradeDistributionViewProps> = ({
  appData,
  selectedYear,
  selectedSemester,
}) => {
  const { classes } = appData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#003366]">Subject Grading Distribution by Gender</h3>
          <p className="text-xs text-gray-500">Breakdown of grade achievements (A+ to F) split by Male and Female scholars across all classes and subjects.</p>
        </div>
      </div>

      {classes.map((cls) => {
        const analysis = calculateTermAnalysis(cls, selectedYear, selectedSemester);
        if (analysis.error || !analysis.result) return null;

        const { studentData, subjects } = analysis.result;

        return (
          <div key={cls.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#003366]/10 text-[#003366]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-gray-900 text-base">{cls.name}</h4>
              </div>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {studentData.length} Students Enrolled
              </span>
            </div>

            {subjects.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs">No subjects configured for this class.</div>
            ) : (
              <div className="space-y-6">
                {subjects.map((sub) => {
                  // Compute grade distribution for this subject by gender
                  const maleGrades: Record<string, number> = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
                  const femaleGrades: Record<string, number> = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };

                  studentData.forEach((s) => {
                    const studentRaw = cls.students.find((st) => st.id === s.id);
                    const gender = studentRaw?.gender;
                    const subMark = s.subjectMarks[sub.name];
                    if (!subMark) return;

                    const max = subMark.maxScore || 100;
                    const pct = max > 0 ? (subMark.total / max) * 100 : 0;
                    const gradeInfo = getGradeInfo(pct);
                    const grade = gradeInfo.grade;

                    if (gender === 'Male' || gender === 'M') {
                      if (maleGrades[grade] !== undefined) maleGrades[grade]++;
                      else maleGrades['F']++;
                    } else if (gender === 'Female' || gender === 'F') {
                      if (femaleGrades[grade] !== undefined) femaleGrades[grade]++;
                      else femaleGrades['F']++;
                    }
                  });

                  return (
                    <div key={sub.name} className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-[#003366] text-sm">{sub.name}</h5>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white px-2.5 py-0.5 rounded-md border border-gray-200">
                          Subject Analysis
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Male Distribution */}
                        <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-blue-600" /> Male Scholars
                            </span>
                          </div>
                          <div className="grid grid-cols-6 gap-1 text-center">
                            {['A+', 'A', 'B', 'C', 'D', 'F'].map((g) => (
                              <div key={g} className="bg-blue-50/60 p-1.5 rounded-lg">
                                <span className="text-[10px] font-bold text-blue-800 block">{g}</span>
                                <span className="text-xs font-black text-blue-900">{maleGrades[g]}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Female Distribution */}
                        <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-teal-900">
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-teal-600" /> Female Scholars
                            </span>
                          </div>
                          <div className="grid grid-cols-6 gap-1 text-center">
                            {['A+', 'A', 'B', 'C', 'D', 'F'].map((g) => (
                              <div key={g} className="bg-teal-50/60 p-1.5 rounded-lg">
                                <span className="text-[10px] font-bold text-teal-800 block">{g}</span>
                                <span className="text-xs font-black text-teal-900">{femaleGrades[g]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
