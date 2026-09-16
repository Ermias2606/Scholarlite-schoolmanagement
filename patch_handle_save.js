import fs from 'fs';
let content = fs.readFileSync('src/components/ResultsTab.tsx', 'utf8');

const oldSaveMarks = `  const handleSaveMarks = () => {
    if (!activeClass || !activeSubject) {
      alert('Please select both a class and a subject before saving.');
      return;
    }

    const warnings: string[] = [];
    const resultMap: Record<string, { marks: Record<string, number>; total: number }> = {};

    activeClass.students.forEach((student) => {
      const studentScores = marksBuffer[student.id] || {};
      const marksClean: Record<string, number> = {};
      let total = 0;

      activeSubject.assessments.forEach((asm) => {
        const val = studentScores[asm.name];
        const num = typeof val === 'number' && !isNaN(val) ? val : 0;
        if (num > asm.maxScore) {
          warnings.push(
            \`\${student.name} score \${num} exceeds maximum \${asm.maxScore} for \${asm.name}\`
          );
        }
        marksClean[asm.name] = num;
        total += num;
      });

      resultMap[student.id] = {
        marks: marksClean,
        total,
      };
    });

    onSaveStudentMarks(
      activeClass.id,
      selectedYear,
      selectedSemester,
      activeSubject.name,
      resultMap
    );`;

const newSaveMarks = `  const handleSaveMarks = () => {
    if (!activeClass || !activeSubject) {
      alert('Please select both a class and a subject before saving.');
      return;
    }

    const warnings: string[] = [];
    const resultMap: Record<string, { marks: Record<string, number>; total: number; previousMarks?: Record<string, number>; editRemark?: string; lastEditedAt?: string }> = {};

    let hasEdits = false;

    activeClass.students.forEach((student) => {
      const existingEntry = student.results?.[selectedYear]?.[selectedSemester]?.[activeSubject.name];
      const existingMarks = existingEntry?.marks;
      const studentScores = marksBuffer[student.id] || {};
      const marksClean: Record<string, number> = {};
      let total = 0;
      
      let studentHasEdits = false;

      activeSubject.assessments.forEach((asm) => {
        const val = studentScores[asm.name];
        const num = typeof val === 'number' && !isNaN(val) ? val : 0;
        
        if (num > asm.maxScore) {
          warnings.push(
            \`\${student.name} score \${num} exceeds maximum \${asm.maxScore} for \${asm.name}\`
          );
        }
        
        marksClean[asm.name] = num;
        total += num;
        
        if (existingMarks && existingMarks[asm.name] !== undefined && existingMarks[asm.name] !== num) {
          studentHasEdits = true;
          hasEdits = true;
        }
      });

      resultMap[student.id] = {
        marks: marksClean,
        total,
        ...(studentHasEdits ? { previousMarks: existingMarks } : {})
      };
    });
    
    let globalEditRemark = '';
    if (hasEdits) {
      const remark = window.prompt("You are modifying existing marks. Please provide a reason for this change:");
      if (remark === null) {
        return; // Cancelled
      }
      globalEditRemark = remark || 'No remark provided';
    }
    
    // Apply remark to edited students
    if (hasEdits) {
      const now = new Date().toISOString();
      Object.keys(resultMap).forEach(studentId => {
        if (resultMap[studentId].previousMarks) {
          resultMap[studentId].editRemark = globalEditRemark;
          resultMap[studentId].lastEditedAt = now;
        }
      });
    }

    onSaveStudentMarks(
      activeClass.id,
      selectedYear,
      selectedSemester,
      activeSubject.name,
      resultMap
    );`;

content = content.replace(oldSaveMarks, newSaveMarks);
fs.writeFileSync('src/components/ResultsTab.tsx', content);
