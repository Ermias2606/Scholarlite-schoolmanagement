import React, { useState } from 'react';
import { AppData, Student, SchoolClass } from '../types';
import { Users, Plus, Edit2, Trash2, Search, GraduationCap } from 'lucide-react';
import { EditStudentModal } from './EditStudentModal';
import { generateId } from '../utils/storage';

import { UserProfile } from '../types';

interface ManageStudentsTabProps {
  currentUser?: UserProfile;
  appData: AppData;
  onAddStudent: (classId: string, student: { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other' }) => void;
  onUpdateStudent: (classId: string, student: { id: string; rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other' }) => void;
  onDeleteStudent: (classId: string, studentId: string) => void;
}

export const ManageStudentsTab: React.FC<ManageStudentsTabProps> = ({ appData, currentUser, onAddStudent, onUpdateStudent, onDeleteStudent }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<{ student: Student; classId: string } | null>(null);

  // For adding a new student directly from this panel
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddClassId, setNewAddClassId] = useState(appData.classes[0]?.id || '');
  const [newRollNo, setNewRollNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  const allStudents = appData.classes.flatMap(c => c.students.map(s => ({ student: s, schoolClass: c })));
  
  const filteredStudents = allStudents.filter(item => {
    if (selectedClassId !== 'all' && item.schoolClass.id !== selectedClassId) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.student.name.toLowerCase().includes(q) ||
      item.student.rollNo.toString().includes(q) ||
      (item.student.admissionNumber || '').toLowerCase().includes(q)
    );
  }).sort((a, b) => a.student.name.localeCompare(b.student.name));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddClassId || !newName.trim() || !newRollNo) return;
    const canApprove = ['super_admin', 'school_admin'].includes(currentUser?.role || '');
    onAddStudent(newAddClassId, {
      rollNo: parseInt(newRollNo, 10),
      name: newName.trim(),
      gender: newGender,
      ...(canApprove ? { status: 'approved' } : { status: 'pending' })
    } as any);
    setNewName('');
    setNewRollNo('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Manage Students</h2>
            <p className="text-sm text-gray-500">Directory and registration</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center gap-2"
        >
          {showAddForm ? <Users className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'View Directory' : 'Register Student'}
        </button>
      </div>

      {showAddForm ? (
        <form onSubmit={handleAddSubmit} className="bg-teal-50/50 p-6 rounded-2xl border border-teal-100 mb-6">
          <h3 className="font-bold text-teal-900 mb-4">Register New Student</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Assign to Class</label>
              <select
                value={newAddClassId}
                onChange={(e) => setNewAddClassId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                required
              >
                {appData.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Roll Number</label>
              <input
                type="number"
                value={newRollNo}
                onChange={(e) => setNewRollNo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Gender</label>
              <select
                value={newGender}
                onChange={(e) => setNewGender(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700">
              Save Registration
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students by name, roll, or ID..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="all">All Classes</option>
              {appData.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                <tr>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">ID / Admission</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map(({ student, schoolClass }) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-500">{student.rollNo}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{student.name}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500 bg-gray-100/50 rounded px-2">{student.admissionNumber || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs font-semibold w-max">
                        <GraduationCap className="w-3.5 h-3.5" /> {schoolClass.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{student.gender}</td>
                    <td className="px-4 py-3">
                      {student.status === 'pending' ? (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold">Pending</span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-bold">Approved</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                      {student.status === 'pending' && ['super_admin', 'school_admin'].includes(currentUser?.role || '') && (
                        <button
                          onClick={() => onUpdateStudent(schoolClass.id, { ...student, status: 'approved' } as any)}
                          className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded hover:bg-emerald-600 transition"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingStudent({ student, classId: schoolClass.id });
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition mr-1"
                        title="Edit Student"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${student.name} from the system?`)) {
                            onDeleteStudent(schoolClass.id, student.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No students found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {isEditModalOpen && editingStudent && (
        <EditStudentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          student={editingStudent.student}
          onSave={(updates) => onUpdateStudent(editingStudent.classId, updates)}
        />
      )}
    </div>
  );
};
