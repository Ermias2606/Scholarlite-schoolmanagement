import fs from 'fs';
let content = fs.readFileSync('src/components/ClassesTab.tsx', 'utf8');

const oldProps = `  onAddStudent: (classId: string, student: { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other' }) => void;
  onUpdateStudent: (classId: string, student: { id: string; rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other' }) => void;
  onDeleteStudent: (classId: string, studentId: string) => void;
  onBulkUploadStudents: (classId: string, students: { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other' }[]) => void;`;

const newProps = `  onAddStudent: (classId: string, student: { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other'; parentName?: string; parentContact?: string; }) => void;
  onUpdateStudent: (classId: string, student: { id: string; rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other'; parentName?: string; parentContact?: string; }) => void;
  onDeleteStudent: (classId: string, studentId: string) => void;
  onBulkUploadStudents: (classId: string, students: { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other'; parentName?: string; parentContact?: string; }[]) => void;`;

content = content.replace(oldProps, newProps);

const oldState = `  const [newStudentGender, setNewStudentGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [searchQuery, setSearchQuery] = useState('');`;

const newState = `  const [newStudentGender, setNewStudentGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [newParentName, setNewParentName] = useState('');
  const [newParentContact, setNewParentContact] = useState('');
  const [searchQuery, setSearchQuery] = useState('');`;

content = content.replace(oldState, newState);

const oldSubmit = `  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRollNo || !newStudentName || !activeClass) return;
    onAddStudent(activeClass.id, {
      rollNo: Number(newRollNo),
      name: newStudentName,
      gender: newStudentGender,
    });
    setNewRollNo('');
    setNewStudentName('');
  };`;
  
const newSubmit = `  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRollNo || !newStudentName || !activeClass) return;
    onAddStudent(activeClass.id, {
      rollNo: Number(newRollNo),
      name: newStudentName,
      gender: newStudentGender,
      parentName: newParentName,
      parentContact: newParentContact,
    });
    setNewRollNo('');
    setNewStudentName('');
    setNewParentName('');
    setNewParentContact('');
  };`;

content = content.replace(oldSubmit, newSubmit);

fs.writeFileSync('src/components/ClassesTab.tsx', content);
