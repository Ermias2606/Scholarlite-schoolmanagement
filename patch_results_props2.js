import fs from 'fs';
let content = fs.readFileSync('src/components/ResultsTab.tsx', 'utf8');

const oldSignature = `  onSaveStudentMarks: (
    classId: string,
    year: string,
    semester: string,
    subjectName: string,
    marksMap: Record<string, { marks: Record<string, number>; total: number }>
  ) => void;`;

const newSignature = `  onSaveStudentMarks: (
    classId: string,
    year: string,
    semester: string,
    subjectName: string,
    marksMap: Record<string, { marks: Record<string, number>; total: number; previousMarks?: Record<string, number>; editRemark?: string; lastEditedAt?: string }>
  ) => void;`;

content = content.replace(oldSignature, newSignature);
fs.writeFileSync('src/components/ResultsTab.tsx', content);
