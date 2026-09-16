import fs from 'fs';
let content = fs.readFileSync('src/components/EditStudentModal.tsx', 'utf8');

const oldProps = `  onSave: (updatedStudent: { id: string; rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other' }) => void;`;
const newProps = `  onSave: (updatedStudent: { id: string; rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other'; parentName?: string; parentContact?: string; }) => void;`;

content = content.replace(oldProps, newProps);

const oldState = `  const [rollNo, setRollNo] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [error, setError] = useState('');`;

const newState = `  const [rollNo, setRollNo] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [parentName, setParentName] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [error, setError] = useState('');`;

content = content.replace(oldState, newState);

const oldEffect = `  useEffect(() => {
    if (student) {
      setRollNo(student.rollNo);
      setName(student.name);
      setGender(student.gender);
      setError('');
    }
  }, [student]);`;

const newEffect = `  useEffect(() => {
    if (student) {
      setRollNo(student.rollNo);
      setName(student.name);
      setGender(student.gender);
      setParentName(student.parentName || '');
      setParentContact(student.parentContact || '');
      setError('');
    }
  }, [student]);`;

content = content.replace(oldEffect, newEffect);

const oldSubmit = `  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || rollNo === '') return;

    const numRoll = Number(rollNo);
    if (numRoll !== student.rollNo && existingRollNos.includes(numRoll)) {
      setError(\`Roll Number \${numRoll} is already in use by another student in this class.\`);
      return;
    }

    onSave({
      id: student.id,
      rollNo: numRoll,
      name,
      gender,
    });
  };`;

const newSubmit = `  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || rollNo === '') return;

    const numRoll = Number(rollNo);
    if (numRoll !== student.rollNo && existingRollNos.includes(numRoll)) {
      setError(\`Roll Number \${numRoll} is already in use by another student in this class.\`);
      return;
    }

    onSave({
      id: student.id,
      rollNo: numRoll,
      name,
      gender,
      parentName,
      parentContact,
    });
  };`;

content = content.replace(oldSubmit, newSubmit);

const oldFormUi = `            <div>
              <label className="block text-sm font-semibold text-[#003366] mb-1.5">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:bg-white focus:border-[#00A896] outline-none transition"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>`;

const newFormUi = `            <div>
              <label className="block text-sm font-semibold text-[#003366] mb-1.5">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:bg-white focus:border-[#00A896] outline-none transition"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-[#003366] mb-1.5">
                Guardian Name
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="E.g., John Doe"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:bg-white focus:border-[#00A896] outline-none transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-[#003366] mb-1.5">
                Guardian Contact
              </label>
              <input
                type="text"
                value={parentContact}
                onChange={(e) => setParentContact(e.target.value)}
                placeholder="E.g., 555-0100"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:bg-white focus:border-[#00A896] outline-none transition"
              />
            </div>`;

content = content.replace(oldFormUi, newFormUi);

fs.writeFileSync('src/components/EditStudentModal.tsx', content);
