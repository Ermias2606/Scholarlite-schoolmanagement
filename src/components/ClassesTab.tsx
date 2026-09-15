import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  Search,
  BookOpen,
  GraduationCap,
  Users,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';
import { SchoolClass, Student, Subject, UserProfile, AppData } from '../types';
import { generateId } from '../utils/storage';
import { downloadRosterTemplateCSV, parseRosterCSV } from '../utils/calculations';
import { SubjectModal } from './SubjectModal';
import { EditStudentModal } from './EditStudentModal';
import { PrintIdCardsModal } from './PrintIdCardsModal';

interface ClassesTabProps {
  appData: AppData;
  classes: SchoolClass[];
  selectedClassId: string | null;
  currentUser?: UserProfile;
  onSelectClass: (id: string) => void;
  onAddClass: (className: string) => void;
  onDeleteClass: (classId: string) => void;
  onSaveSubject: (classId: string, subject: Subject, originalName?: string) => void;
  onDeleteSubject: (classId: string, subjectName: string) => void;
  onAddStudent: (classId: string, student: { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other' }) => void;
  onUpdateStudent: (classId: string, student: { id: string; rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other' }) => void;
  onDeleteStudent: (classId: string, studentId: string) => void;
  onBulkUploadStudents: (classId: string, students: { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other' }[]) => void;
  onEditRemarksAttendance?: (student: Student, className: string) => void;
}

export const ClassesTab: React.FC<ClassesTabProps> = ({
  appData,
  classes,
  selectedClassId,
  currentUser,
  onSelectClass,
  onAddClass,
  onDeleteClass,
  onSaveSubject,
  onDeleteSubject,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBulkUploadStudents,
  onEditRemarksAttendance,
}) => {
  const [newClassName, setNewClassName] = useState('');
  const [newRollNo, setNewRollNo] = useState<number | ''>('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isPrintIdModalOpen, setIsPrintIdModalOpen] = useState(false);

  // Modals state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // If user is a class teacher, prioritize their assigned class
  const isAdmin = !currentUser || currentUser.role === 'admin';
  const isClassTeacher = currentUser?.role === 'class_teacher';
  
  const visibleClasses = isClassTeacher
    ? classes.filter((c) => currentUser?.assignedClassIds?.includes(c.id) || c.id === currentUser?.assignedClassId)
    : classes;

  const activeClass =
    classes.find((c) => c.id === selectedClassId) ||
    visibleClasses[0] ||
    classes[0] ||
    null;

  const handleAddClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newClassName.trim();
    if (!trimmed) return;
    onAddClass(trimmed);
    setNewClassName('');
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass) return;
    const numRoll = Number(newRollNo);
    const trimmedName = newStudentName.trim();
    if (isNaN(numRoll) || numRoll <= 0 || !trimmedName) {
      alert('Please provide a valid Roll Number and Student Name.');
      return;
    }
    if (activeClass.students?.some((s) => s.rollNo === numRoll)) {
      alert(`Roll number ${numRoll} already exists in ${activeClass.name}.`);
      return;
    }

    onAddStudent(activeClass.id, {
      rollNo: numRoll,
      name: trimmedName,
      gender: newStudentGender,
    });

    setNewRollNo('');
    setNewStudentName('');
  };

  const processFile = (file: File) => {
    if (!file || !activeClass) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseRosterCSV(text);
        if (parsed.length === 0) {
          alert('No valid student records found in the CSV. Please make sure the CSV matches the template format.');
          return;
        }

        // Filter out duplicate roll numbers
        const currentRolls = new Set(activeClass.students.map((s) => s.rollNo));
        const newValidStudents = parsed.filter((s) => !currentRolls.has(s.rollNo));

        if (newValidStudents.length === 0) {
          alert('All students in the CSV had conflicting roll numbers with existing students.');
          return;
        }

        onBulkUploadStudents(activeClass.id, newValidStudents);
        alert(`Successfully imported ${newValidStudents.length} students into ${activeClass.name}!`);
      } catch (err) {
        alert('Failed to parse CSV file: ' + String(err));
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      processFile(file);
    } else {
      alert('Please drop a valid .csv file.');
    }
  };

  const filteredStudents = (activeClass?.students || [])
    .filter((s) => {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toString().includes(q) ||
        (s.admissionNumber || '').toLowerCase().includes(q) ||
        s.gender.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => a.rollNo - b.rollNo);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Sidebar: Class Cohorts */}
      <div className="w-full lg:w-72 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[#003366] font-bold text-base">
            <GraduationCap className="w-5 h-5" />
            <span>Class Cohorts</span>
          </div>
          <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {classes.length}
          </span>
        </div>

        {/* Add Class Form (Admin Only) */}
        {isAdmin && (
          <form onSubmit={handleAddClassSubmit} className="flex gap-1.5 mb-4">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="New Class (e.g. 10-A)"
              className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm outline-none focus:border-[#00A896] transition"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-sm shadow-xs transition cursor-pointer"
              title="Add Class"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Class List */}
        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
          {visibleClasses.length === 0 ? (
            <p className="text-xs text-gray-400 py-3 text-center">No assigned classes found.</p>
          ) : (
            visibleClasses.map((c) => {
              const isActive = activeClass?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectClass(c.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition text-sm font-semibold ${
                    isActive
                      ? 'bg-[#00A896] text-white shadow-sm'
                      : 'bg-gray-50/70 hover:bg-gray-100 text-gray-700 border border-gray-100'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-200/70 text-gray-600'
                      }`}
                    >
                      {c.students?.length || 0}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              `Delete ${c.name}? This will remove all students and marks associated with this class.`
                            )
                          ) {
                            onDeleteClass(c.id);
                          }
                        }}
                        className={`p-1 rounded transition ${
                          isActive ? 'hover:bg-white/20 text-white' : 'text-gray-400 hover:text-red-600'
                        }`}
                        title="Delete Class"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Details for Selected Class */}
      <div className="flex-1 w-full space-y-6">
        {activeClass ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <div>
                <span className="text-xs font-bold text-[#00A896] uppercase tracking-wider">
                  Currently Managing
                </span>
                <h2 className="text-2xl font-black text-[#003366] mt-0.5">{activeClass.name}</h2>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#003366]" />
                  {activeClass.subjects?.length || 0} Subjects
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#00A896]" />
                  {activeClass.students?.length || 0} Students
                </span>
              </div>
            </div>

            {/* Card 1: Subjects & Assessments */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-[#003366]">Subject &amp; Assessment Setup</h3>
                  <p className="text-xs text-gray-500">
                    Define subject weightings and assessment breakdown
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingSubject(null);
                    setIsSubjectModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs sm:text-sm font-semibold shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Subject</span>
                </button>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[#003366] text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                      <th className="py-3 px-4">Subject Name</th>
                      <th className="py-3 px-4 text-center">Max Score</th>
                      <th className="py-3 px-4">Assessment Components</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {!activeClass.subjects || activeClass.subjects.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
                          No subjects defined for this class. Click &quot;Add New Subject&quot; above.
                        </td>
                      </tr>
                    ) : (
                      activeClass.subjects.map((sub) => {
                        const maxScore = sub.assessments.reduce(
                          (sum, a) => sum + (Number(a.maxScore) || 0),
                          0
                        );
                        return (
                          <tr key={sub.name} className="hover:bg-gray-50/50 transition">
                            <td className="py-3 px-4 font-bold text-gray-900">{sub.name}</td>
                            <td className="py-3 px-4 text-center font-extrabold text-[#003366]">
                              <span className="px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-xs">
                                {maxScore} pts
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1.5">
                                {sub.assessments.map((a) => (
                                  <span
                                    key={a.id || a.name}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#00A896]/10 text-[#00A896] px-2 py-0.5 rounded-md"
                                  >
                                    {a.name} ({a.maxScore})
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setEditingSubject(sub);
                                  setIsSubjectModalOpen(true);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Delete ${sub.name}? All recorded marks for this subject will be removed.`
                                    )
                                  ) {
                                    onDeleteSubject(activeClass.id, sub.name);
                                  }
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card 2: Student Roster */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-[#003366]">Student Roster</h3>
                  <p className="text-xs text-gray-500">
                    Enroll students, upload CSV batches, and manage roll numbers
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    onClick={() => setIsPrintIdModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FFC300] hover:bg-[#e6b000] text-[#003366] text-xs font-bold shadow-xs transition cursor-pointer"
                    title="Print Student ID Cards"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>Print IDs</span>
                  </button>
                  <button
                    onClick={downloadRosterTemplateCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition cursor-pointer"
                    title="Download student roster CSV template"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                    <span>Template</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00A896] hover:bg-[#008f80] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                    title="Upload student roster via CSV"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Bulk Upload (CSV)</span>
                  </button>
                </div>
              </div>

              <div
                className={`mt-4 border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                  isDragging ? 'border-[#00A896] bg-[#00A896]/10' : 'border-gray-300 bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-white rounded-full shadow-xs border border-gray-100">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    Drag and drop your CSV file here
                  </div>
                  <div className="text-xs text-gray-500">
                    or click "Bulk Upload (CSV)" above to browse
                  </div>
                </div>
              </div>

              {/* Add Student Quick Form */}
              <form
                onSubmit={handleAddStudentSubmit}
                className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200/80 flex flex-col md:flex-row items-stretch md:items-center gap-3"
              >
                <div className="w-full md:w-28">
                  <input
                    type="number"
                    min="1"
                    value={newRollNo}
                    onChange={(e) => setNewRollNo(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Roll No"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs font-medium outline-none focus:border-[#00A896]"
                    required
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Student Full Name (e.g. Maya Lin)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs font-medium outline-none focus:border-[#00A896]"
                    required
                  />
                </div>
                <div className="w-full md:w-32">
                  <select
                    value={newStudentGender}
                    onChange={(e) => setNewStudentGender(e.target.value as 'Male' | 'Female' | 'Other')}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs font-medium outline-none focus:border-[#00A896]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold shadow-xs transition whitespace-nowrap"
                >
                  Add Student
                </button>
              </form>

              {/* Search input */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="relative w-full max-w-xs">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, admission no..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#00A896]"
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  Showing {filteredStudents.length} of {activeClass.students.length} students
                </span>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[#003366] text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                      <th className="py-3 px-4 w-20 text-center">Roll No</th>
                      <th className="py-3 px-4 w-32">Unique ID</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4 text-center">Gender</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                          {activeClass.students.length === 0
                            ? 'No students enrolled yet. Add a student or upload a CSV above.'
                            : 'No students matched your search.'}
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50/50 transition">
                          <td className="py-3 px-4 text-center font-extrabold text-[#003366]">
                            #{s.rollNo}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs font-medium text-gray-500">
                            {s.admissionNumber || '-'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900">{s.name}</td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                s.gender === 'Female'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : s.gender === 'Male'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}
                            >
                              {s.gender}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                            {onEditRemarksAttendance && (
                              <button
                                onClick={() => onEditRemarksAttendance(s, activeClass.name)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition cursor-pointer"
                                title="Edit Remarks & Attendance"
                              >
                                Remarks &amp; Attendance
                              </button>
                            )}
                            <button
                              onClick={() => setEditingStudent(s)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Remove ${s.name} (Roll #${s.rollNo})? All associated marks will be deleted.`
                                  )
                                ) {
                                  onDeleteStudent(activeClass.id, s.id);
                                }
                              }}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No Class Selected</h3>
            <p className="text-sm text-gray-500 mt-1">
              Select an existing class from the sidebar or add a new cohort.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        editingSubject={editingSubject}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingSubject(null);
        }}
        onSave={(subject, originalName) => {
          if (activeClass) {
            onSaveSubject(activeClass.id, subject, originalName);
          }
        }}
      />

      <EditStudentModal
        isOpen={!!editingStudent}
        student={editingStudent}
        existingRollNos={activeClass ? activeClass.students.map((s) => s.rollNo) : []}
        onClose={() => setEditingStudent(null)}
        onSave={(updated) => {
          if (activeClass) {
            onUpdateStudent(activeClass.id, updated);
          }
        }}
      />

      <PrintIdCardsModal
        isOpen={isPrintIdModalOpen}
        onClose={() => setIsPrintIdModalOpen(false)}
        activeClass={activeClass}
        settings={appData.settings}
      />
    </div>
  );
};
