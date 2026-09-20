import React, { useState, useEffect } from 'react';
import { X, UserCheck } from 'lucide-react';
import { Student } from '../types';

interface EditStudentModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onSave: (
    updatedStudent: Partial<Student> & {
      id: string;
      rollNo: number;
      name: string;
      gender: 'Male' | 'Female' | 'Other';
      editRemark?: string;
    }
  ) => void;
  existingRollNos?: number[];
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  student,
  onClose,
  onSave,
  existingRollNos = [],
}) => {
  const [rollNo, setRollNo] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [parentName, setParentName] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [studentStatus, setStudentStatus] = useState<'active' | 'graduated' | 'transferred' | 'suspended'>('active');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [editRemark, setEditRemark] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setRollNo(student.rollNo);
      setName(student.name);
      setGender(student.gender || 'Male');
      setParentName(student.parentName || '');
      setParentContact(student.parentContact || '');
      setDob(student.dob || '');
      setBloodGroup(student.bloodGroup || '');
      setStudentStatus(student.studentStatus || 'active');
      setAddress(student.address || '');
      setEmergencyContact(student.emergencyContact || '');
      setEditRemark('');
      setError('');
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  // Compute exact changes
  const changes: { label: string; previous: string; current: string }[] = [];
  if (rollNo !== '' && Number(rollNo) !== student.rollNo) {
    changes.push({ label: 'Roll Number', previous: `#${student.rollNo}`, current: `#${rollNo}` });
  }
  if (name.trim() !== student.name) {
    changes.push({ label: 'Student Name', previous: student.name, current: name.trim() });
  }
  if (gender !== (student.gender || 'Male')) {
    changes.push({ label: 'Gender', previous: student.gender || 'Male', current: gender });
  }
  if (parentName.trim() !== (student.parentName || '')) {
    changes.push({ label: 'Parent Name', previous: student.parentName || '(empty)', current: parentName.trim() || '(empty)' });
  }
  if (parentContact.trim() !== (student.parentContact || '')) {
    changes.push({ label: 'Parent Contact', previous: student.parentContact || '(empty)', current: parentContact.trim() || '(empty)' });
  }
  if (dob !== (student.dob || '')) {
    changes.push({ label: 'Date of Birth', previous: student.dob || '(empty)', current: dob || '(empty)' });
  }
  if (bloodGroup.trim() !== (student.bloodGroup || '')) {
    changes.push({ label: 'Blood Group', previous: student.bloodGroup || '(empty)', current: bloodGroup.trim() || '(empty)' });
  }
  if (studentStatus !== (student.studentStatus || 'active')) {
    changes.push({ label: 'Registry Status', previous: student.studentStatus || 'active', current: studentStatus });
  }
  if (address.trim() !== (student.address || '')) {
    changes.push({ label: 'Address', previous: student.address || '(empty)', current: address.trim() || '(empty)' });
  }
  if (emergencyContact.trim() !== (student.emergencyContact || '')) {
    changes.push({ label: 'Emergency Contact', previous: student.emergencyContact || '(empty)', current: emergencyContact.trim() || '(empty)' });
  }

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

    if (changes.length > 0 && !editRemark.trim()) {
      setError('Please enter a remark or reason for modifying this student record.');
      return;
    }

    onSave({
      id: student.id,
      rollNo: numRoll,
      name: trimmedName,
      gender,
      parentName: parentName.trim() || undefined,
      parentContact: parentContact.trim() || undefined,
      dob: dob || undefined,
      bloodGroup: bloodGroup.trim() || undefined,
      studentStatus,
      address: address.trim() || undefined,
      emergencyContact: emergencyContact.trim() || undefined,
      editRemark: editRemark.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#00A896]/10 text-[#00A896] rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Edit Student Record</h3>
              <p className="text-xs text-gray-500">Official registrar roster dossier</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Roll Number *</label>
              <input
                type="number"
                min="1"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-sm transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-sm transition bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Student Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-sm transition"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Parent / Guardian Name</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Guardian Full Name"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-sm transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Parent Phone / Contact</label>
              <input
                type="tel"
                value={parentContact}
                onChange={(e) => setParentContact(e.target.value)}
                placeholder="+1 234 567 8900"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-sm transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-xs transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Group</label>
              <input
                type="text"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                placeholder="e.g. O+, A+"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-xs transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Registry Status</label>
              <select
                value={studentStatus}
                onChange={(e) => setStudentStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-xs transition bg-white capitalize"
              >
                <option value="active">Active</option>
                <option value="graduated">Graduated</option>
                <option value="transferred">Transferred</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Residential Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full Street, City, State"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-sm transition"
            />
          </div>

          {/* Exact Changes Display */}
          {changes.length > 0 && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-amber-900 uppercase tracking-wider text-[10px]">
                <span>Detected Modifications ({changes.length})</span>
                <span className="text-amber-700 font-semibold lowercase">previous &rarr; new</span>
              </div>
              <div className="space-y-1 bg-white/70 rounded-lg p-2 border border-amber-100 divide-y divide-gray-100">
                {changes.map((c) => (
                  <div key={c.label} className="pt-1 first:pt-0 flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-semibold text-gray-700">{c.label}:</span>
                    <div className="flex items-center gap-1.5 font-mono text-right">
                      <span className="text-gray-400 line-through">{c.previous}</span>
                      <span className="text-gray-300">&rarr;</span>
                      <span className="text-amber-900 font-bold">{c.current}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-950 uppercase tracking-wider mb-1">
                  Remark / Justification for Edit *
                </label>
                <input
                  type="text"
                  value={editRemark}
                  onChange={(e) => setEditRemark(e.target.value)}
                  placeholder="e.g., Parent requested contact update, spelling correction"
                  className="w-full px-3 py-1.5 bg-white rounded-lg border border-amber-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-xs transition"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-sm font-semibold shadow-sm transition cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
