import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldAdd = `  const handleAddStudent = (
    classId: string,
    student: { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other' }
  ) => {
    updateAppData((prev) => {
      const classes = prev.classes.map((c) => {
        if (c.id !== classId) return c;
        const newStu = {
          id: generateId('stu'),
          admissionNumber: generateAdmissionNumber(),
          rollNo: student.rollNo,
          name: student.name,
          gender: student.gender,
          status: 'pending' as const,
          results: {},
        };`;

const newAdd = `  const handleAddStudent = (
    classId: string,
    student: { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other'; parentName?: string; parentContact?: string; }
  ) => {
    updateAppData((prev) => {
      const classes = prev.classes.map((c) => {
        if (c.id !== classId) return c;
        const newStu = {
          id: generateId('stu'),
          admissionNumber: generateAdmissionNumber(),
          rollNo: student.rollNo,
          name: student.name,
          gender: student.gender,
          parentName: student.parentName,
          parentContact: student.parentContact,
          status: 'pending' as const,
          results: {},
        };`;

content = content.replace(oldAdd, newAdd);

const oldUpdate = `  const handleUpdateStudent = (
    classId: string,
    updatedStudent: { id: string; rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other' }
  ) => {
    updateAppData((prev) => ({
      ...prev,
      classes: prev.classes.map((c) => {
        if (c.id !== classId) return c;
        return {
          ...c,
          students: c.students.map((s) => {
            if (s.id !== updatedStudent.id) return s;
            return {
              ...s,
              rollNo: updatedStudent.rollNo,
              name: updatedStudent.name,
              gender: updatedStudent.gender,
            };
          }),`;

const newUpdate = `  const handleUpdateStudent = (
    classId: string,
    updatedStudent: { id: string; rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other'; parentName?: string; parentContact?: string; }
  ) => {
    updateAppData((prev) => ({
      ...prev,
      classes: prev.classes.map((c) => {
        if (c.id !== classId) return c;
        return {
          ...c,
          students: c.students.map((s) => {
            if (s.id !== updatedStudent.id) return s;
            return {
              ...s,
              rollNo: updatedStudent.rollNo,
              name: updatedStudent.name,
              gender: updatedStudent.gender,
              parentName: updatedStudent.parentName,
              parentContact: updatedStudent.parentContact,
            };
          }),`;

content = content.replace(oldUpdate, newUpdate);

const oldBulk = `  const handleBulkUploadStudents = (
    classId: string,
    newStudents: { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other' }[]
  ) => {
    updateAppData((prev) => {
      const classes = prev.classes.map((c) => {
        if (c.id !== classId) return c;

        // Ensure rollNo uniqueness within the same class
        const existingRollNos = new Set(c.students.map((s) => s.rollNo));
        const toAdd = newStudents.filter((ns) => !existingRollNos.has(ns.rollNo));

        const newlyConstructed = toAdd.map((stu) => ({
          id: generateId('stu'),
          admissionNumber: generateAdmissionNumber(),
          rollNo: stu.rollNo,
          name: stu.name,
          gender: stu.gender,
          status: 'pending' as const,
          results: {},
        }));`;

const newBulk = `  const handleBulkUploadStudents = (
    classId: string,
    newStudents: { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other'; parentName?: string; parentContact?: string; }[]
  ) => {
    updateAppData((prev) => {
      const classes = prev.classes.map((c) => {
        if (c.id !== classId) return c;

        // Ensure rollNo uniqueness within the same class
        const existingRollNos = new Set(c.students.map((s) => s.rollNo));
        const toAdd = newStudents.filter((ns) => !existingRollNos.has(ns.rollNo));

        const newlyConstructed = toAdd.map((stu) => ({
          id: generateId('stu'),
          admissionNumber: generateAdmissionNumber(),
          rollNo: stu.rollNo,
          name: stu.name,
          gender: stu.gender,
          parentName: stu.parentName,
          parentContact: stu.parentContact,
          status: 'pending' as const,
          results: {},
        }));`;

content = content.replace(oldBulk, newBulk);

fs.writeFileSync('src/App.tsx', content);
