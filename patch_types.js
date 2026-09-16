import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf8');

const oldStudent = `export interface Student {
  id: string;
  admissionNumber?: string;
  rollNo: number;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  status?: 'pending' | 'approved';
  // results: [academicYear][term][subjectName] -> StudentMarks
  results: Record<string, Record<string, Record<string, StudentMarks>>>;
  // attendance: [academicYear][term] -> StudentAttendance
  attendance?: Record<string, Record<string, StudentAttendance>>;
  // remarks: [academicYear][term] -> StudentRemarks
  remarks?: Record<string, Record<string, StudentRemarks>>;
}`;

const newStudent = `export interface Student {
  id: string;
  admissionNumber?: string;
  rollNo: number;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  parentName?: string;
  parentContact?: string;
  status?: 'pending' | 'approved';
  // results: [academicYear][term][subjectName] -> StudentMarks
  results: Record<string, Record<string, Record<string, StudentMarks>>>;
  // attendance: [academicYear][term] -> StudentAttendance
  attendance?: Record<string, Record<string, StudentAttendance>>;
  // remarks: [academicYear][term] -> StudentRemarks
  remarks?: Record<string, Record<string, StudentRemarks>>;
}`;

content = content.replace(oldStudent, newStudent);
fs.writeFileSync('src/types.ts', content);
