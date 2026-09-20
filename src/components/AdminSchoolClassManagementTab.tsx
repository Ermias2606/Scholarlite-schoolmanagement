import React, { useState } from 'react';
import {
  Building2,
  Layers,
  Plus,
  Trash2,
  Edit2,
  BookOpen,
  UserCheck,
  Calendar,
  X,
  CheckCircle2,
  MapPin,
  Users,
  Shield,
  Clock,
  Briefcase
} from 'lucide-react';
import { AppData, SchoolClass, SchoolLevel, Subject, UserProfile } from '../types';
import { generateId } from '../utils/storage';
import { motion, AnimatePresence } from 'motion/react';

interface AdminSchoolClassManagementTabProps {
  appData: AppData;
  onUpdateClasses: (classes: SchoolClass[]) => void;
  onUpdateLevels: (levels: SchoolLevel[]) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export const AdminSchoolClassManagementTab: React.FC<AdminSchoolClassManagementTabProps> = ({
  appData,
  onUpdateClasses,
  onUpdateLevels,
  onAddAuditLog,
}) => {
  const classes = appData.classes || [];
  const levels = appData.levels || [];
  const users = appData.users || [];
  const staffUsers = users.filter((u) => u.role !== 'student');

  const [activeSubTab, setActiveSubTab] = useState<'classes' | 'levels' | 'branches'>('classes');

  // New Level state
  const [newLevelName, setNewLevelName] = useState('');
  const [newLevelBranch, setNewLevelBranch] = useState('Main Campus');

  // Branches state (derived or managed in settings/classes)
  const [branches, setBranches] = useState<string[]>(['Main Campus', 'North Branch', 'City Campus']);
  const [newBranchName, setNewBranchName] = useState('');

  // Class Form Modal state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [className, setClassName] = useState('');
  const [classLevelId, setClassLevelId] = useState(levels[0]?.id || '');
  const [classBranch, setClassBranch] = useState('Main Campus');
  const [classTeacherId, setClassTeacherId] = useState('');
  const [classSubjects, setClassSubjects] = useState<string>('Mathematics, English, Science, Social Studies');
  const [classSchedule, setClassSchedule] = useState('');

  const handleAddLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLevelName.trim()) return;
    const newLvl: SchoolLevel = {
      id: generateId('lvl'),
      name: newLevelName.trim(),
      order: levels.length + 1,
    };
    const updated = [...levels, newLvl];
    onUpdateLevels(updated);
    onAddAuditLog('Add School Level', `Added school level: ${newLevelName.trim()}`);
    setNewLevelName('');
  };

  const handleDeleteLevel = (id: string, name: string) => {
    if (confirm(`Delete school level "${name}"?`)) {
      const updated = levels.filter((l) => l.id !== id);
      onUpdateLevels(updated);
      onAddAuditLog('Delete School Level', `Deleted school level: ${name}`);
    }
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newBranchName.trim();
    if (!trimmed || branches.includes(trimmed)) return;
    setBranches([...branches, trimmed]);
    onAddAuditLog('Add Branch', `Created campus branch: ${trimmed}`);
    setNewBranchName('');
  };

  const handleDeleteBranch = (branch: string) => {
    if (confirm(`Remove branch "${branch}"?`)) {
      setBranches(branches.filter((b) => b !== branch));
      onAddAuditLog('Delete Branch', `Removed campus branch: ${branch}`);
    }
  };

  const handleOpenClassModal = (cls?: SchoolClass) => {
    if (cls) {
      setEditingClassId(cls.id);
      setClassName(cls.name);
      setClassLevelId(cls.levelId || levels[0]?.id || '');
      setClassBranch((cls as any).branch || 'Main Campus');
      setClassTeacherId((cls as any).classTeacherId || '');
      setClassSubjects(cls.subjects.map((s) => s.name).join(', '));
      setClassSchedule((cls as any).schedule || 'Mon-Fri: 08:00 AM - 02:00 PM');
    } else {
      setEditingClassId(null);
      setClassName('');
      setClassLevelId(levels[0]?.id || '');
      setClassBranch('Main Campus');
      setClassTeacherId('');
      setClassSubjects('Mathematics, English, Science, Social Studies');
      setClassSchedule('Mon-Fri: 08:00 AM - 02:00 PM');
    }
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    const subjectsArr: Subject[] = classSubjects
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({
        name,
        assessments: [
          { id: generateId('asm'), name: 'Test 1', maxScore: 20 },
          { id: generateId('asm'), name: 'Mid Term', maxScore: 30 },
          { id: generateId('asm'), name: 'Exam', maxScore: 50 },
        ],
      }));

    let updatedClasses = [...classes];
    if (editingClassId) {
      updatedClasses = updatedClasses.map((c) => {
        if (c.id === editingClassId) {
          return {
            ...c,
            name: className.trim(),
            levelId: classLevelId || undefined,
            branch: classBranch,
            classTeacherId: classTeacherId || undefined,
            schedule: classSchedule,
            subjects: subjectsArr.length > 0 ? subjectsArr : c.subjects,
          };
        }
        return c;
      });
      onAddAuditLog('Update Class', `Updated class structure for ${className.trim()}`);
    } else {
      const newClass: SchoolClass = {
        id: generateId('class'),
        name: className.trim(),
        levelId: classLevelId || undefined,
        branch: classBranch,
        classTeacherId: classTeacherId || undefined,
        schedule: classSchedule,
        subjects: subjectsArr,
        students: [],
      } as any;
      updatedClasses.push(newClass);
      onAddAuditLog('Create Class', `Created new class: ${className.trim()} at ${classBranch}`);
    }

    onUpdateClasses(updatedClasses);
    setIsClassModalOpen(false);
  };

  const handleDeleteClass = (id: string, name: string) => {
    if (confirm(`Delete class "${name}" and all its student records?`)) {
      const updated = classes.filter((c) => c.id !== id);
      onUpdateClasses(updated);
      onAddAuditLog('Delete Class', `Deleted class: ${name}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-[#003366] text-[10px] font-black uppercase tracking-wider">
            Admin Exclusive Management
          </span>
          <h2 className="text-xl font-black text-[#003366] mt-1 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#00A896]" />
            School Class & Structure Management
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Dedicated administration for school levels, campus branches, classes, home room teachers, and schedules.
          </p>
        </div>

        <button
          onClick={() => handleOpenClassModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00A896] hover:bg-[#008f80] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Class</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex bg-gray-200/70 p-1.5 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveSubTab('classes')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'classes' ? 'bg-white text-[#003366] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Classes ({classes.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('levels')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'levels' ? 'bg-white text-[#003366] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>School Levels ({levels.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('branches')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'branches' ? 'bg-white text-[#003366] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Branches ({branches.length})</span>
        </button>
      </div>

      {/* Sub-Tab 1: Classes Management */}
      {activeSubTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const levelObj = levels.find((l) => l.id === cls.levelId);
            const teacherObj = staffUsers.find((u) => u.id === (cls as any).classTeacherId);
            const branchName = (cls as any).branch || 'Main Campus';
            const scheduleInfo = (cls as any).schedule || 'Mon-Fri: 08:00 AM - 02:00 PM';

            return (
              <div key={cls.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                        {levelObj?.name || 'General Level'}
                      </span>
                      <h3 className="text-lg font-black text-gray-900 mt-1">{cls.name}</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {branchName}
                    </span>
                  </div>

                  <div className="space-y-2.5 my-4 pt-3 border-t border-gray-100 text-xs">
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="font-bold flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#00A896]" /> Homeroom Teacher:
                      </span>
                      <span className="font-semibold text-gray-900">{teacherObj ? teacherObj.name : 'Not Assigned'}</span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600">
                      <span className="font-bold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" /> Students Enrolled:
                      </span>
                      <span className="font-semibold text-gray-900">{cls.students.length} Students</span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600">
                      <span className="font-bold flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-purple-600" /> Subjects Taught:
                      </span>
                      <span className="font-semibold text-gray-900">{cls.subjects.length} Subjects</span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600">
                      <span className="font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> Schedule:
                      </span>
                      <span className="font-semibold text-gray-900 truncate max-w-[160px]" title={scheduleInfo}>
                        {scheduleInfo}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenClassModal(cls)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Edit Class</span>
                  </button>

                  <button
                    onClick={() => handleDeleteClass(cls.id, cls.name)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Delete Class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {classes.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-200">
              No classes created yet. Click "Create New Class" to begin.
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: School Levels Management */}
      {activeSubTab === 'levels' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm max-w-3xl space-y-6">
          <h3 className="text-base font-black text-gray-900">Configure School Levels</h3>

          <form onSubmit={handleAddLevel} className="flex gap-3">
            <input
              type="text"
              required
              value={newLevelName}
              onChange={(e) => setNewLevelName(e.target.value)}
              placeholder="Level Name (e.g. Senior Secondary)"
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:border-[#00A896]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00A896] hover:bg-[#008f80] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Level
            </button>
          </form>

          <div className="space-y-3">
            {levels.sort((a, b) => a.order - b.order).map((lvl) => (
              <div key={lvl.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                    {lvl.order}
                  </div>
                  <span className="font-bold text-gray-900 text-sm">{lvl.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteLevel(lvl.id, lvl.name)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Delete Level"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Branches Management */}
      {activeSubTab === 'branches' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm max-w-3xl space-y-6">
          <h3 className="text-base font-black text-gray-900">Configure Campus Branches</h3>

          <form onSubmit={handleAddBranch} className="flex gap-3">
            <input
              type="text"
              required
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="Branch Name (e.g. Westside Campus)"
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:border-[#00A896]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00A896] hover:bg-[#008f80] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Branch
            </button>
          </form>

          <div className="space-y-3">
            {branches.map((branch) => (
              <div key={branch} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#003366] flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-gray-900 text-sm">{branch}</span>
                </div>
                {branches.length > 1 && (
                  <button
                    onClick={() => handleDeleteBranch(branch)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Remove Branch"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Class Create / Edit Modal */}
      <AnimatePresence>
        {isClassModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-5 bg-[#003366] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-white/10 text-[#00A896]">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">
                      {editingClassId ? 'Edit Class & Assignments' : 'Create New Class'}
                    </h3>
                    <p className="text-xs text-white/70">Assign levels, branches, homeroom teachers, and subjects</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsClassModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveClass} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Class Name *</label>
                  <input
                    type="text"
                    required
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g. Grade 10-A"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-[#00A896]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">School Level</label>
                    <select
                      value={classLevelId}
                      onChange={(e) => setClassLevelId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold outline-none"
                    >
                      <option value="">Select Level</option>
                      {levels.map((lvl) => (
                        <option key={lvl.id} value={lvl.id}>
                          {lvl.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Campus Branch</label>
                    <select
                      value={classBranch}
                      onChange={(e) => setClassBranch(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold outline-none"
                    >
                      {branches.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assigned Homeroom Teacher</label>
                  <select
                    value={classTeacherId}
                    onChange={(e) => setClassTeacherId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold outline-none"
                  >
                    <option value="">Select Homeroom Teacher</option>
                    {staffUsers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} (@{teacher.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Subjects (Comma separated)</label>
                  <input
                    type="text"
                    value={classSubjects}
                    onChange={(e) => setClassSubjects(e.target.value)}
                    placeholder="Mathematics, English, Physics, Chemistry"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Class Schedule & Timings</label>
                  <input
                    type="text"
                    value={classSchedule}
                    onChange={(e) => setClassSchedule(e.target.value)}
                    placeholder="Mon-Fri: 08:00 AM - 02:00 PM"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsClassModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#00A896] hover:bg-[#008f80] text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                  >
                    {editingClassId ? 'Save Changes' : 'Create Class'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
