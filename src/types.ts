export interface AssessmentComponent {
  id: string;
  name: string;
  maxScore: number;
}

export interface Subject {
  name: string;
  assessments: AssessmentComponent[];
}

export interface StudentMarks {
  marks: Record<string, number>; // assessmentName -> mark
  total: number;
}

export interface StudentAttendance {
  presentDays: number;
  totalDays: number;
}

export interface StudentRemarks {
  teacherRemark: string;
  principalRemark?: string;
  conduct?: string; // 'Exemplary' | 'Good' | 'Satisfactory' | 'Needs Improvement'
}

export interface Student {
  id: string;
  rollNo: number;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  // results: [academicYear][term][subjectName] -> StudentMarks
  results: Record<string, Record<string, Record<string, StudentMarks>>>;
  // attendance: [academicYear][term] -> StudentAttendance
  attendance?: Record<string, Record<string, StudentAttendance>>;
  // remarks: [academicYear][term] -> StudentRemarks
  remarks?: Record<string, Record<string, StudentRemarks>>;
}

export interface SchoolClass {
  id: string;
  name: string;
  levelId?: string;
  subjects: Subject[];
  students: Student[];
}

export type UserRole = 'admin' | 'class_teacher' | 'subject_teacher' | 'student';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole; // Primary role
  roles?: UserRole[]; // All assigned roles
  username: string;
  password: string;
  email?: string;
  title?: string;
  assignedClassId?: string;
  assignedSubjects?: string[];
  assignedStudentId?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
}

export interface GradeBoundary {
  grade: string;
  minPercentage: number;
  gpa: number;
  remarks: string;
  badgeColor: string;
}

export interface Settings {
  name: string;
  logo: string;
  academicYear: string;
  semesters: string[];
  slogans: string[];
}

export type EventType = 'holiday' | 'exam' | 'event';

export interface SchoolEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  type: EventType;
  description?: string;
}

export interface SchoolLevel {
  id: string;
  name: string;
  order: number;
}

export interface AppData {
  settings: Settings;
  levels?: SchoolLevel[];
  classes: SchoolClass[];
  events?: SchoolEvent[];
  users: UserProfile[];
  auditLogs?: AuditLog[];
  currentUser?: UserProfile;
}

export interface StudentTermAnalysis extends Student {
  termTotal: number;
  termMaxScore: number;
  termAveragePercentage: number;
  termRank: number;
  grade: string;
  gpa: number;
  remarksText: string;
  subjectMarks: Record<
    string,
    {
      total: number;
      maxScore: number;
      percentage: number;
      grade: string;
      marks?: Record<string, number>;
    }
  >;
}

export interface StudentFullAnalysis extends StudentTermAnalysis {
  cumulativeTotal: number;
  cumulativeMaxScore: number;
  overallAveragePercentage: number;
  cumulativeGrade: string;
  cumulativeGPA: number;
  rank: number;
}

export interface SubjectStatisticalAnalysis {
  average: number;
  stdDev: number;
  maxScore: number;
}

export interface TermAnalysisResult {
  studentData: StudentTermAnalysis[];
  classData: SchoolClass;
  year: string;
  semester: string;
  subjects: Subject[];
  termMaxScore: number;
}

export interface FullAnalysisResult extends TermAnalysisResult {
  studentData: StudentFullAnalysis[];
  subjectAnalysis: Record<string, SubjectStatisticalAnalysis>;
  cumulativeMaxScore: number;
}

export type TrendDirection = 'up' | 'down' | 'neutral' | 'none';

export interface SubjectTrend {
  subjectName: string;
  currentScore: number;
  previousScore: number;
  maxScore: number;
  currentPercentage: number;
  previousPercentage: number;
  difference: number;
  percentageDifference: number;
  trend: TrendDirection;
}

export interface StudentPerformanceTrend {
  id: string;
  rollNo: number;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  currentTotal: number;
  currentMaxScore: number;
  currentPercentage: number;
  currentGrade: string;
  currentGPA: number;
  currentRank: number;

  previousTotal: number;
  previousMaxScore: number;
  previousPercentage: number;
  previousGrade: string;
  previousGPA: number;
  previousRank: number;
  hasPreviousData: boolean;

  totalDifference: number;
  percentageDifference: number;
  rankDifference: number;
  trendDirection: TrendDirection;

  subjectTrends: Record<string, SubjectTrend>;
}

export interface CohortTrendSummary {
  totalStudents: number;
  improvedCount: number;
  declinedCount: number;
  maintainedCount: number;
  noPriorCount: number;
  improvedPercentage: number;
  declinedPercentage: number;
  averagePercentageDelta: number;
  topGainer?: { name: string; rollNo: number; delta: number };
  topDecline?: { name: string; rollNo: number; delta: number };
}

export interface StudentPerformanceSummaryResult {
  trends: StudentPerformanceTrend[];
  cohortSummary: CohortTrendSummary;
  currentTerm: string;
  previousTerm: string;
  year: string;
  classData: SchoolClass;
}
