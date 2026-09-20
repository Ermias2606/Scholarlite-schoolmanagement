import {
  SchoolClass,
  StudentTermAnalysis,
  StudentFullAnalysis,
  SubjectStatisticalAnalysis,
  TermAnalysisResult,
  FullAnalysisResult,
  Subject,
  GradeBoundary,
  StudentPerformanceTrend,
  SubjectTrend,
  TrendDirection,
  StudentPerformanceSummaryResult,
} from '../types';

export const GRADE_SCALE: GradeBoundary[] = [
  { grade: 'A+', minPercentage: 90, gpa: 4.0, remarks: 'Distinction', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { grade: 'A', minPercentage: 80, gpa: 3.7, remarks: 'Excellent', badgeColor: 'bg-teal-100 text-teal-800 border-teal-300' },
  { grade: 'B', minPercentage: 70, gpa: 3.0, remarks: 'Good', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300' },
  { grade: 'C', minPercentage: 60, gpa: 2.0, remarks: 'Satisfactory', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
  { grade: 'D', minPercentage: 50, gpa: 1.0, remarks: 'Pass', badgeColor: 'bg-orange-100 text-orange-800 border-orange-300' },
  { grade: 'F', minPercentage: 0, gpa: 0.0, remarks: 'Needs Improvement', badgeColor: 'bg-rose-100 text-rose-800 border-rose-300' },
];

export function getGradeInfo(percentage: number): GradeBoundary {
  const p = Math.max(0, Math.min(100, isNaN(percentage) ? 0 : percentage));
  for (const item of GRADE_SCALE) {
    if (p >= item.minPercentage) {
      return item;
    }
  }
  return GRADE_SCALE[GRADE_SCALE.length - 1];
}

export function calculateTermAnalysis(
  classData: SchoolClass,
  year: string,
  semester: string
): { error?: string; result?: TermAnalysisResult } {
  if (!classData || !classData.students || classData.students.length === 0) {
    return { error: 'No students found in the selected class.' };
  }

  const subjects = classData.subjects || [];
  if (subjects.length === 0) {
    return { error: 'No subjects defined for this class.' };
  }

  let termMaxScore = 0;
  const subjectMaxScores: Record<string, number> = {};

  subjects.forEach((sub) => {
    const subMax = sub.assessments.reduce((sum, a) => sum + (Number(a.maxScore) || 0), 0);
    termMaxScore += subMax;
    subjectMaxScores[sub.name] = subMax;
  });

  if (termMaxScore === 0) {
    return { error: 'Total maximum score for subjects is zero. Please configure assessment max scores.' };
  }

  const studentData: StudentTermAnalysis[] = classData.students.map((s) => {
    let termTotalObtained = 0;
    const subjectMarks: StudentTermAnalysis['subjectMarks'] = {};
    const yearResults = s.results?.[year] || {};
    const termResults = yearResults[semester] || {};

    subjects.forEach((sub) => {
      const markObj = termResults[sub.name];
      const subjectTotal = markObj ? Number(markObj.total) || 0 : 0;
      const marksBreakdown = markObj?.marks || undefined;
      const subMax = subjectMaxScores[sub.name] || 0;
      const subPct = subMax > 0 ? (subjectTotal / subMax) * 100 : 0;
      const subGradeInfo = getGradeInfo(subPct);

      subjectMarks[sub.name] = {
        total: subjectTotal,
        maxScore: subMax,
        percentage: subPct,
        grade: subGradeInfo.grade,
        marks: marksBreakdown,
      };

      termTotalObtained += subjectTotal;
    });

    const termAveragePercentage =
      termMaxScore > 0 ? (termTotalObtained / termMaxScore) * 100 : 0;
    const gradeInfo = getGradeInfo(termAveragePercentage);

    return {
      ...s,
      termTotal: termTotalObtained,
      termMaxScore,
      termAveragePercentage,
      termRank: 0,
      grade: gradeInfo.grade,
      gpa: gradeInfo.gpa,
      remarksText: gradeInfo.remarks,
      subjectMarks,
    };
  });

  // Sort descending by termTotal
  studentData.sort((a, b) => b.termTotal - a.termTotal);

  // Assign dense/standard competition ranking
  let currentRank = 1;
  let studentsProcessed = 0;
  studentData.forEach((student, index) => {
    if (index > 0 && student.termTotal < studentData[index - 1].termTotal) {
      currentRank = studentsProcessed + 1;
    }
    student.termRank = currentRank;
    studentsProcessed++;
  });

  return {
    result: {
      studentData,
      classData,
      year,
      semester,
      subjects,
      termMaxScore,
    },
  };
}

export function calculateFullAnalysis(
  classData: SchoolClass,
  year: string,
  semester: string,
  allTerms: string[]
): { error?: string; result?: FullAnalysisResult } {
  const termRes = calculateTermAnalysis(classData, year, semester);
  if (termRes.error || !termRes.result) {
    return { error: termRes.error };
  }

  const { studentData: termStudents, subjects, termMaxScore } = termRes.result;

  const studentData: StudentFullAnalysis[] = termStudents.map((s) => {
    let cumulativeTotal = 0;
    let cumulativeMaxScore = 0;
    const yearResults = s.results?.[year] || {};

    subjects.forEach((sub) => {
      const maxScoreSub = sub.assessments.reduce((sum, a) => sum + (Number(a.maxScore) || 0), 0);
      allTerms.forEach((term) => {
        const markObj = yearResults[term]?.[sub.name];
        cumulativeTotal += markObj ? Number(markObj.total) || 0 : 0;
        cumulativeMaxScore += maxScoreSub;
      });
    });

    const overallAveragePercentage =
      cumulativeMaxScore > 0 ? (cumulativeTotal / cumulativeMaxScore) * 100 : 0;
    const cumGradeInfo = getGradeInfo(overallAveragePercentage);

    return {
      ...s,
      cumulativeTotal,
      cumulativeMaxScore,
      overallAveragePercentage,
      cumulativeGrade: cumGradeInfo.grade,
      cumulativeGPA: cumGradeInfo.gpa,
      rank: 0,
    };
  });

  // Sort descending by cumulative total
  studentData.sort((a, b) => b.cumulativeTotal - a.cumulativeTotal);

  let currentRank = 1;
  let studentsProcessed = 0;
  studentData.forEach((student, index) => {
    if (index > 0 && student.cumulativeTotal < studentData[index - 1].cumulativeTotal) {
      currentRank = studentsProcessed + 1;
    }
    student.rank = currentRank;
    studentsProcessed++;
  });

  // Statistical analysis per subject
  const subjectAnalysis: Record<string, SubjectStatisticalAnalysis> = {};
  subjects.forEach((sub) => {
    const scores = studentData.map((s) => s.subjectMarks[sub.name]?.total || 0);
    const count = scores.length;
    const subMaxScore = termStudents[0]?.subjectMarks[sub.name]?.maxScore || 0;
    const totalScore = scores.reduce((sum, val) => sum + val, 0);
    const average = count > 0 ? totalScore / count : 0;
    const variance =
      count > 0
        ? scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / count
        : 0;
    const stdDev = Math.sqrt(variance);

    subjectAnalysis[sub.name] = {
      average,
      stdDev,
      maxScore: subMaxScore,
    };
  });

  return {
    result: {
      studentData,
      classData,
      year,
      semester,
      subjects,
      subjectAnalysis,
      termMaxScore,
      cumulativeMaxScore: studentData[0]?.cumulativeMaxScore || 0,
    },
  };
}

export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadRosterTemplateCSV(): void {
  const content = 'Roll_No,Student_Name,Gender,Parent_Name,Parent_Contact,Date_of_Birth,Blood_Group,Address,Emergency_Contact\n1,Alice Johnson,Female,John Johnson,555-0101,2010-05-14,O+,124 Maple Street,555-0999\n2,David Miller,Male,Sarah Miller,555-0102,2010-08-22,A+,45 Oak Avenue,555-0998\n3,Samira Khan,Female,Ali Khan,555-0103,2011-01-10,B+,78 Pine Road,555-0997';
  downloadCSV('Student_Roster_Template.csv', content);
}

export function downloadMarkTemplateCSV(classData: SchoolClass, subject: Subject): void {
  const assessmentHeaders = subject.assessments.map((a) => `${a.name} (Max ${a.maxScore})`);
  const header = ['Roll_No', 'Student_Name', ...assessmentHeaders].join(',');
  const rows = [...classData.students]
    .sort((a, b) => a.rollNo - b.rollNo)
    .map((s) => `${s.rollNo},"${s.name}",${','.repeat(subject.assessments.length)}`);
  const content = [header, ...rows].join('\n');
  downloadCSV(`Marks_Template_${classData.name}_${subject.name.replace(/\s+/g, '_')}.csv`, content);
}

export function parseRosterCSV(csv: string): {
  rollNo: number;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  parentName?: string;
  parentContact?: string;
  dob?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
}[] {
  const lines = csv.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const results: {
    rollNo: number;
    name: string;
    gender: 'Male' | 'Female' | 'Other';
    parentName?: string;
    parentContact?: string;
    dob?: string;
    bloodGroup?: string;
    address?: string;
    emergencyContact?: string;
  }[] = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim().replace(/^"(.*)"$/, '$1'));
    if (parts.length >= 2) {
      const rollNo = parseInt(parts[0], 10);
      const name = parts[1];
      const rawGender = (parts[2] || 'Other').toLowerCase();
      let gender: 'Male' | 'Female' | 'Other' = 'Other';
      if (rawGender.startsWith('m')) gender = 'Male';
      else if (rawGender.startsWith('f')) gender = 'Female';
      const parentName = parts[3] || undefined;
      const parentContact = parts[4] || undefined;
      const dob = parts[5] || undefined;
      const bloodGroup = parts[6] || undefined;
      const address = parts[7] || undefined;
      const emergencyContact = parts[8] || undefined;

      if (!isNaN(rollNo) && name) {
        results.push({
          rollNo,
          name,
          gender,
          parentName,
          parentContact,
          dob,
          bloodGroup,
          address,
          emergencyContact,
        });
      }
    }
  }
  return results;
}

export function parseMarksCSV(
  csv: string,
  assessments: { name: string; maxScore: number }[]
): { rollNo: number; marks: Record<string, number>; total: number; warnings: string[] }[] {
  const lines = csv.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const results: { rollNo: number; marks: Record<string, number>; total: number; warnings: string[] }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim().replace(/^"(.*)"$/, '$1'));
    if (parts.length >= 2) {
      const rollNo = parseInt(parts[0], 10);
      if (isNaN(rollNo)) continue;

      const marks: Record<string, number> = {};
      let total = 0;
      const warnings: string[] = [];

      assessments.forEach((asm, idx) => {
        const valStr = parts[2 + idx];
        const mark = valStr !== undefined && valStr !== '' ? parseInt(valStr, 10) || 0 : 0;
        if (mark > asm.maxScore) {
          warnings.push(`Score ${mark} exceeds maximum of ${asm.maxScore} for ${asm.name}`);
        }
        marks[asm.name] = mark;
        total += mark;
      });

      results.push({ rollNo, marks, total, warnings });
    }
  }
  return results;
}

export function calculateStudentPerformanceTrends(
  classData: SchoolClass,
  year: string,
  currentTerm: string,
  previousTerm: string
): { error?: string; result?: StudentPerformanceSummaryResult } {
  const currentRes = calculateTermAnalysis(classData, year, currentTerm);
  if (currentRes.error || !currentRes.result) {
    return { error: currentRes.error || 'Failed to calculate current term analysis.' };
  }

  let prevRes: { error?: string; result?: TermAnalysisResult } | null = null;
  if (previousTerm && previousTerm !== currentTerm) {
    prevRes = calculateTermAnalysis(classData, year, previousTerm);
  }

  const currentStudents = currentRes.result.studentData;
  const prevStudentsMap = new Map<string, StudentTermAnalysis>();
  if (prevRes?.result) {
    prevRes.result.studentData.forEach((s) => prevStudentsMap.set(s.id, s));
  }

  const subjects = classData.subjects || [];

  const trends: StudentPerformanceTrend[] = currentStudents.map((curr) => {
    const prev = prevStudentsMap.get(curr.id);

    // Verify if previous term actually has scores recorded for this student
    const hasPreviousData = Boolean(
      prev &&
        (prev.termTotal > 0 ||
          (curr.results?.[year]?.[previousTerm] &&
            Object.keys(curr.results[year][previousTerm] || {}).length > 0))
    );

    const prevTotal = hasPreviousData && prev ? prev.termTotal : 0;
    const prevMax = hasPreviousData && prev ? prev.termMaxScore : 0;
    const prevPct = hasPreviousData && prev ? prev.termAveragePercentage : 0;
    const prevGrade = hasPreviousData && prev ? prev.grade : 'N/A';
    const prevGPA = hasPreviousData && prev ? prev.gpa : 0;
    const prevRank = hasPreviousData && prev ? prev.termRank : 0;

    const totalDiff = hasPreviousData ? curr.termTotal - prevTotal : 0;
    const pctDiff = hasPreviousData ? curr.termAveragePercentage - prevPct : 0;
    // Rank diff: previous rank minus current rank (e.g. from 5 to 2 = +3 positions gained)
    const rankDiff =
      hasPreviousData && prevRank > 0 && curr.termRank > 0 ? prevRank - curr.termRank : 0;

    let trendDirection: TrendDirection = 'none';
    if (!hasPreviousData) {
      trendDirection = 'none';
    } else if (pctDiff > 0.05) {
      trendDirection = 'up';
    } else if (pctDiff < -0.05) {
      trendDirection = 'down';
    } else {
      trendDirection = 'neutral';
    }

    const subjectTrends: Record<string, SubjectTrend> = {};
    subjects.forEach((sub) => {
      const currSub = curr.subjectMarks[sub.name];
      const prevSub = prev?.subjectMarks[sub.name];
      const currScore = currSub ? currSub.total : 0;
      const prevScore = hasPreviousData && prevSub ? prevSub.total : 0;
      const maxScore = currSub?.maxScore || prevSub?.maxScore || 100;
      const currPct = maxScore > 0 ? (currScore / maxScore) * 100 : 0;
      const prevPctSub = maxScore > 0 && hasPreviousData ? (prevScore / maxScore) * 100 : 0;
      const diff = hasPreviousData ? currScore - prevScore : 0;
      const pctDiffSub = hasPreviousData ? currPct - prevPctSub : 0;

      let subTrend: TrendDirection = 'none';
      if (!hasPreviousData) {
        subTrend = 'none';
      } else if (diff > 0) {
        subTrend = 'up';
      } else if (diff < 0) {
        subTrend = 'down';
      } else {
        subTrend = 'neutral';
      }

      subjectTrends[sub.name] = {
        subjectName: sub.name,
        currentScore: currScore,
        previousScore: prevScore,
        maxScore,
        currentPercentage: currPct,
        previousPercentage: prevPctSub,
        difference: diff,
        percentageDifference: pctDiffSub,
        trend: subTrend,
      };
    });

    return {
      id: curr.id,
      rollNo: curr.rollNo,
      name: curr.name,
      gender: curr.gender,
      currentTotal: curr.termTotal,
      currentMaxScore: curr.termMaxScore,
      currentPercentage: curr.termAveragePercentage,
      currentGrade: curr.grade,
      currentGPA: curr.gpa,
      currentRank: curr.termRank,

      previousTotal: prevTotal,
      previousMaxScore: prevMax,
      previousPercentage: prevPct,
      previousGrade: prevGrade,
      previousGPA: prevGPA,
      previousRank: prevRank,
      hasPreviousData,

      totalDifference: totalDiff,
      percentageDifference: pctDiff,
      rankDifference: rankDiff,
      trendDirection,

      subjectTrends,
    };
  });

  let improvedCount = 0;
  let declinedCount = 0;
  let maintainedCount = 0;
  let noPriorCount = 0;
  let totalDeltaSum = 0;
  let validStudentsCount = 0;

  let topGainer: { name: string; rollNo: number; delta: number } | undefined = undefined;
  let topDecline: { name: string; rollNo: number; delta: number } | undefined = undefined;

  trends.forEach((t) => {
    if (!t.hasPreviousData) {
      noPriorCount++;
    } else {
      validStudentsCount++;
      totalDeltaSum += t.percentageDifference;

      if (t.trendDirection === 'up') {
        improvedCount++;
        if (!topGainer || t.percentageDifference > topGainer.delta) {
          topGainer = { name: t.name, rollNo: t.rollNo, delta: t.percentageDifference };
        }
      } else if (t.trendDirection === 'down') {
        declinedCount++;
        if (!topDecline || t.percentageDifference < topDecline.delta) {
          topDecline = { name: t.name, rollNo: t.rollNo, delta: t.percentageDifference };
        }
      } else {
        maintainedCount++;
      }
    }
  });

  const totalEvaluated = trends.length;
  const improvedPercentage = validStudentsCount > 0 ? (improvedCount / validStudentsCount) * 100 : 0;
  const declinedPercentage = validStudentsCount > 0 ? (declinedCount / validStudentsCount) * 100 : 0;
  const averagePercentageDelta = validStudentsCount > 0 ? totalDeltaSum / validStudentsCount : 0;

  return {
    result: {
      trends,
      cohortSummary: {
        totalStudents: totalEvaluated,
        improvedCount,
        declinedCount,
        maintainedCount,
        noPriorCount,
        improvedPercentage,
        declinedPercentage,
        averagePercentageDelta,
        topGainer,
        topDecline,
      },
      currentTerm,
      previousTerm,
      year,
      classData,
    },
  };
}

export function downloadStudentPerformanceSummaryCSV(
  result: StudentPerformanceSummaryResult
): void {
  const { trends, currentTerm, previousTerm, classData } = result;
  const subjects = classData.subjects || [];
  const subjectHeaders = subjects
    .map(
      (s) =>
        `"${s.name} (${previousTerm})","${s.name} (${currentTerm})","${s.name} Change"`
    )
    .join(',');

  const header = [
    'Roll_No',
    'Student_Name',
    'Gender',
    `Rank_${previousTerm}`,
    `Rank_${currentTerm}`,
    'Rank_Change',
    `Score_${previousTerm}`,
    `Score_${currentTerm}`,
    'Total_Change',
    `Percentage_${previousTerm}`,
    `Percentage_${currentTerm}`,
    'Percentage_Change',
    'Trend_Indicator',
    `Grade_${currentTerm}`,
    subjectHeaders,
  ]
    .filter(Boolean)
    .join(',');

  const rows = trends.map((t) => {
    const subCols = subjects
      .map((sub) => {
        const st = t.subjectTrends[sub.name];
        if (!st) return '0,0,0';
        return `${st.previousScore},${st.currentScore},${st.difference > 0 ? '+' : ''}${st.difference}`;
      })
      .join(',');

    const trendText =
      t.trendDirection === 'up'
        ? `UP (+${t.percentageDifference.toFixed(2)}%)`
        : t.trendDirection === 'down'
        ? `DOWN (${t.percentageDifference.toFixed(2)}%)`
        : t.trendDirection === 'neutral'
        ? 'STABLE (0.00%)'
        : 'N/A (First Term)';

    const rankChangeText = t.hasPreviousData
      ? t.rankDifference > 0
        ? `+${t.rankDifference}`
        : `${t.rankDifference}`
      : 'N/A';

    return [
      t.rollNo,
      `"${t.name}"`,
      t.gender,
      t.hasPreviousData ? t.previousRank : 'N/A',
      t.currentRank,
      rankChangeText,
      t.hasPreviousData ? t.previousTotal : 'N/A',
      t.currentTotal,
      t.hasPreviousData
        ? t.totalDifference > 0
          ? `+${t.totalDifference}`
          : `${t.totalDifference}`
        : 'N/A',
      t.hasPreviousData ? `${t.previousPercentage.toFixed(2)}%` : 'N/A',
      `${t.currentPercentage.toFixed(2)}%`,
      t.hasPreviousData
        ? `${t.percentageDifference > 0 ? '+' : ''}${t.percentageDifference.toFixed(2)}%`
        : 'N/A',
      `"${trendText}"`,
      t.currentGrade,
      subCols,
    ].join(',');
  });

  const content = [header, ...rows].join('\n');
  downloadCSV(
    `Student_Performance_Summary_${classData.name.replace(/\s+/g, '_')}_${currentTerm.replace(/\s+/g, '_')}_vs_${previousTerm.replace(/\s+/g, '_')}.csv`,
    content
  );
}
