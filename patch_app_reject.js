import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const rejectMarksCode = `  const handleRejectMarks = (classId: string, year: string, semester: string, subjectName: string) => {
    setAppData((prev) => {
      const newClasses = prev.classes.map((cls) => {
        if (cls.id !== classId) return cls;
        return {
          ...cls,
          students: cls.students.map((student) => {
            const results = student.results || {};
            const yearData = results[year] || {};
            const semData = yearData[semester] || {};
            const subData = semData[subjectName] || { marks: {}, total: 0 };
            
            return {
              ...student,
              results: {
                ...results,
                [year]: {
                  ...yearData,
                  [semester]: {
                    ...semData,
                    [subjectName]: {
                      ...subData,
                      approved: false, // explicitly false means rejected
                      approvedBy: undefined,
                    }
                  }
                }
              }
            };
          }),
        };
      });
      return { ...prev, classes: newClasses };
    });
    alert(\`Marks for \${subjectName} have been rejected.\`);
  };

  const handleSaveStudentMarks`;

content = content.replace("  const handleSaveStudentMarks", rejectMarksCode);
content = content.replace(
  "onApproveMarks={handleApproveMarks}",
  "onApproveMarks={handleApproveMarks}\n                    onRejectMarks={handleRejectMarks}"
);

fs.writeFileSync('src/App.tsx', content);
