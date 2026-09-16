import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldSaveMarks = `  const handleSaveStudentMarks = (
    classId: string,
    year: string,
    semester: string,
    subjectName: string,
    marksMap: Record<string, { marks: Record<string, number>; total: number }>
  ) => {`;

const newSaveMarks = `  const handleSaveStudentMarks = (
    classId: string,
    year: string,
    semester: string,
    subjectName: string,
    marksMap: Record<string, { marks: Record<string, number>; total: number; previousMarks?: Record<string, number>; editRemark?: string; lastEditedAt?: string }>
  ) => {`;

content = content.replace(oldSaveMarks, newSaveMarks);

const oldResultsUpdate = `          results[year][semester][subjectName] = entry;`;
const newResultsUpdate = `          
          // Preserve approved status if updating an existing entry
          const existingEntry = results[year][semester][subjectName] || {};
          results[year][semester][subjectName] = {
            ...entry,
            approved: existingEntry.approved,
            approvedBy: existingEntry.approvedBy,
          };`;

content = content.replace(oldResultsUpdate, newResultsUpdate);

fs.writeFileSync('src/App.tsx', content);
