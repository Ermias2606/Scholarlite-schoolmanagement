import React, { useState, useEffect } from 'react';
import { X, UserCheck } from 'lucide-react';
import { Student } from '../types';

interface EditStudentModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onSave: (updatedStudent: { id: string; rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other'; parentName?: string; parentContact?: string; }) => void;
  existingRollNos: number[];
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  student,
  onClose,
  onSave,
  existingRollNos,
}) => {
  const [rollNo, setRollNo] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [parentName, setParentName] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setRollNo(student.rollNo);
      setName(student.name);
      setGender(student.gender || 'Male');
      setError('');
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numRoll = Number(rollNo);
    const trimmedName = name.trim();

    if (isNaN(numRoll) || numRoll <= 0) {
      setError('Please enter a valid positive Roll Number.');
      return;
    }
    if (!trimmedName) {
      setError('Student name cannot be empty.');
      return;
    }

    // Check roll duplicate if changed
    if (numRoll !== student.rollNo && existingRollNos.includes(numRoll)) {
      setError(`Roll Number ${numRoll} is already assigned to another student in this class.`);
      return;
    }

    onSave({
      id: student.id,
      rollNo: numRoll,
      name: trimmedName,
      gender,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#00A896]/10 text-[#00A896] rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Edit Student</h3>
              <p className="text-xs text-gray-500">Update student roster record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Roll Number</label>
            <input
              type="number"
              min="1"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-sm transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Student Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-sm transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-sm transition bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-sm font-semibold shadow-sm transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
