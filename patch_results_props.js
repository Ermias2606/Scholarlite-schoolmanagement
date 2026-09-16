import fs from 'fs';
let content = fs.readFileSync('src/components/ResultsTab.tsx', 'utf8');

// I need to add onApproveMarks to the destructuring
content = content.replace(
  "  onSaveStudentMarks,\n  onEditRemarksAttendance,\n}) => {",
  "  onApproveMarks,\n  onSaveStudentMarks,\n  onEditRemarksAttendance,\n}) => {"
);

fs.writeFileSync('src/components/ResultsTab.tsx', content);
