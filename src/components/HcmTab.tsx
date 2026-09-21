import React, { useState } from 'react';
import { AppData, UserProfile, UserRole } from '../types';
import { Users, UserPlus, Briefcase, Mail, Phone, Shield, Trash2, Edit2, Search, CheckCircle2, X, Award, GraduationCap, BarChart3, BookOpen, Building2 } from 'lucide-react';
import { generateId } from '../utils/storage';
import { motion, AnimatePresence } from 'motion/react';

interface HcmTabProps {
  appData: AppData;
  onUpdateUsers: (users: UserProfile[]) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export const HcmTab: React.FC<HcmTabProps> = ({ appData, onUpdateUsers, onAddAuditLog }) => {
  const users = appData.users || [];
  const classes = appData.classes || [];
  const staffList = users.filter((u) => u.role !== 'student');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<UserProfile | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('password123');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Executive Management');
  const [categoryType, setCategoryType] = useState<'managerial' | 'faculty' | 'teaching'>('managerial');
  const [title, setTitle] = useState('Director / Principal');
  const [role, setRole] = useState<UserRole>('admin');
  const [qualification, setQualification] = useState('');
  const [staffStatus, setStaffStatus] = useState<'active' | 'leave' | 'terminated'>('active');
  const [assignedClassId, setAssignedClassId] = useState<string>('');
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);

  // Analytics Metrics
  const totalStaff = staffList.length;
  const activeStaff = staffList.filter(s => (s.staffStatus || 'active') === 'active').length;
  const managerialCount = staffList.filter(s => s.role === 'admin' || s.role === 'school_admin' || s.role === 'super_admin').length;
  const facultyHeadCount = staffList.filter(s => s.role === 'department_head').length;
  const teachingCount = staffList.filter(s => s.role === 'class_teacher' || s.role === 'subject_teacher').length;

  const handleOpenModal = (staff?: UserProfile) => {
    if (staff) {
      setEditingStaff(staff);
      setName(staff.name);
      setUsername(staff.username || '');
      setPassword(staff.password || 'password123');
      setEmail(staff.email || '');
      setPhone(staff.phone || '');
      setDepartment(staff.department || 'Academic Department');
      setTitle(staff.title || 'Subject Teacher');
      setRole(staff.role || 'subject_teacher');
      setQualification(staff.qualification || '');
      setStaffStatus(staff.staffStatus || 'active');
      setAssignedClassId(staff.assignedClassId || '');
      setAssignedSubjects(staff.assignedSubjects || []);

      if (staff.role === 'admin' || staff.role === 'school_admin' || staff.role === 'super_admin') {
        setCategoryType('managerial');
      } else if (staff.role === 'department_head') {
        setCategoryType('faculty');
      } else {
        setCategoryType('teaching');
      }
    } else {
      setEditingStaff(null);
      setName('');
      setUsername('');
      setPassword('password123');
      setEmail('');
      setPhone('');
      setDepartment('Executive Management');
      setCategoryType('managerial');
      setTitle('Director / Principal');
      setRole('admin');
      setQualification('');
      setStaffStatus('active');
      setAssignedClassId('');
      setAssignedSubjects([]);
    }
    setIsModalOpen(true);
  };

  const handleCategoryChange = (cat: 'managerial' | 'faculty' | 'teaching') => {
    setCategoryType(cat);
    if (cat === 'managerial') {
      setTitle('Director / Principal');
      setRole('admin');
      setDepartment('Executive Management');
    } else if (cat === 'faculty') {
      setTitle('Department Head');
      setRole('department_head' as any);
      setDepartment('Academic Departments');
    } else {
      setTitle('Subject Teacher');
      setRole('subject_teacher');
      setDepartment('Teaching Faculty');
    }
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return;

    const newStaff: UserProfile = {
      id: editingStaff ? editingStaff.id : generateId('usr'),
      name: name.trim(),
      username: username.trim().toLowerCase(),
      password: password.trim() || 'password123',
      email: email.trim(),
      phone: phone.trim(),
      department: department.trim(),
      title: title.trim(),
      role: role,
      roles: [role],
      qualification: qualification.trim(),
      staffStatus: staffStatus,
      assignedClassId: assignedClassId || undefined,
      assignedClassIds: assignedClassId ? [assignedClassId] : [],
      assignedSubjects: assignedSubjects.length > 0 ? assignedSubjects : undefined,
    };

    let updatedUsers = [...users];
    if (editingStaff) {
      updatedUsers = updatedUsers.map((u) => (u.id === editingStaff.id ? newStaff : u));
      onAddAuditLog('Update Staff Profile (HCM)', `Updated staff profile & assignments for ${name} (${title})`);
    } else {
      updatedUsers.push(newStaff);
      onAddAuditLog('Create Staff Profile (HCM)', `Created new staff profile for ${name} as ${title}`);
    }

    onUpdateUsers(updatedUsers);
    setIsModalOpen(false);
  };

  const handleDeleteStaff = (id: string, staffName: string) => {
    if (confirm(`Are you sure you want to delete staff profile for "${staffName}"?`)) {
      const updated = users.filter((u) => u.id !== id);
      onUpdateUsers(updated);
      onAddAuditLog('Delete Staff Profile (HCM)', `Removed staff profile for ${staffName}`);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.title && s.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedCategoryFilter === 'managerial') {
      return matchesSearch && (s.role === 'admin' || s.role === 'school_admin' || s.role === 'super_admin');
    }
    if (selectedCategoryFilter === 'faculty') {
      return matchesSearch && s.role === 'department_head';
    }
    if (selectedCategoryFilter === 'teaching') {
      return matchesSearch && (s.role === 'class_teacher' || s.role === 'subject_teacher');
    }
    return matchesSearch;
  });

  // Collect all unique subjects across classes for assignment
  const allSchoolSubjects = Array.from(new Set(classes.flatMap(c => c.subjects.map(sub => sub.name)))).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003366]/15 text-xs font-bold text-[#003366] mb-2 uppercase tracking-wide">
            Human Capital Management (HCM)
          </div>
          <h2 className="text-xl font-black text-[#003366]">School Staff Creation &amp; Instructional Allocation</h2>
          <p className="text-xs text-gray-500">Centralized staff registry, repositioning, and teacher class/subject assignments.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs shadow-md transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff Member</span>
        </button>
      </div>

      {/* Dedicated HCM Analytic Dashboard & Overview Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Personnel</div>
            <div className="text-2xl font-black text-[#003366] mt-1">{totalStaff}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">{activeStaff} Active Staff</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#003366] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Managerial &amp; Executive</div>
            <div className="text-2xl font-black text-gray-900 mt-1">{managerialCount}</div>
            <div className="text-[11px] text-gray-500 font-medium mt-0.5">Leadership &amp; Governance</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Faculty Department Heads</div>
            <div className="text-2xl font-black text-gray-900 mt-1">{facultyHeadCount}</div>
            <div className="text-[11px] text-gray-500 font-medium mt-0.5">Academic Deans &amp; Heads</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Teaching Staff</div>
            <div className="text-2xl font-black text-gray-900 mt-1">{teachingCount}</div>
            <div className="text-[11px] text-gray-500 font-medium mt-0.5">Class &amp; Subject Instructors</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs">
          {[
            { id: 'all', label: 'All Personnel' },
            { id: 'managerial', label: 'Managerial & Executive' },
            { id: 'faculty', label: 'Faculty Department Heads' },
            { id: 'teaching', label: 'Teaching Staff' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-4 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategoryFilter === cat.id
                  ? 'bg-[#003366] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff by name or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#003366] bg-gray-50"
          />
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((staff) => {
          const assignedClass = classes.find(c => c.id === staff.assignedClassId || staff.assignedClassIds?.includes(c.id));

          return (
            <div key={staff.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#003366]/10 text-[#003366] flex items-center justify-center font-black text-lg">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{staff.name}</h3>
                    <p className="text-xs font-semibold text-[#00A896]">{staff.title || staff.role}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                  staff.staffStatus === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {staff.staffStatus || 'active'}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                  <span>Department: <strong className="text-gray-800">{staff.department || 'General'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{staff.email || 'No email specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{staff.phone || 'No phone specified'}</span>
                </div>
                {assignedClass && (
                  <div className="flex items-center gap-2 text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Assigned Class: <strong>{assignedClass.name}</strong></span>
                  </div>
                )}
                {staff.assignedSubjects && staff.assignedSubjects.length > 0 && (
                  <div className="text-[11px] text-gray-500 pt-1">
                    <span>Subjects: </span>
                    <span className="font-semibold text-gray-800">{staff.assignedSubjects.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Username: @{staff.username}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenModal(staff)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                    title="Edit Profile & Assignments"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(staff.id, staff.name)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                    title="Delete Staff"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 text-gray-400">
          No staff members found matching the criteria.
        </div>
      )}

      {/* Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200"
          >
            <div className="flex items-center justify-between px-6 py-4 bg-[#003366] text-white">
              <h3 className="font-bold text-base">{editingStaff ? 'Edit Staff Profile & Assignments' : 'Register New Staff Member (HCM)'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Staff Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'managerial', label: 'Managerial' },
                    { id: 'faculty', label: 'Faculty Head' },
                    { id: 'teaching', label: 'Teaching' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleCategoryChange(c.id as any)}
                      className={`py-2 px-3 rounded-xl font-bold border transition cursor-pointer ${
                        categoryType === c.id
                          ? 'bg-[#003366] text-white border-[#003366]'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Specific Title &amp; Role</label>
                <select
                  value={title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTitle(val);
                    if (val === 'General Manager' || val === 'Director / Principal' || val === 'Assistant Principal') {
                      setRole('admin');
                      setDepartment('Executive Management');
                    } else if (val === 'Department Head') {
                      setRole('department_head' as any);
                      setDepartment('Academic Departments');
                    } else if (val === 'Class Teacher') {
                      setRole('class_teacher');
                      setDepartment('Teaching Faculty');
                    } else {
                      setRole('subject_teacher');
                      setDepartment('Teaching Faculty');
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-[#003366] bg-gray-50"
                >
                  {categoryType === 'managerial' && (
                    <>
                      <option value="Director / Principal">Director / Principal</option>
                      <option value="General Manager">General Manager</option>
                      <option value="Assistant Principal">Assistant Principal</option>
                    </>
                  )}
                  {categoryType === 'faculty' && (
                    <>
                      <option value="Department Head">Department Head (Language, Science, etc.)</option>
                      <option value="Dean of Faculty">Dean of Faculty</option>
                    </>
                  )}
                  {categoryType === 'teaching' && (
                    <>
                      <option value="Class Teacher">Class Teacher</option>
                      <option value="Subject Teacher">Subject Teacher</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Robert Vance"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-[#003366] bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Username (Login ID) *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. rvance"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-[#003366] bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@school.edu"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-[#003366] bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-[#003366] bg-gray-50"
                  />
                </div>
              </div>

              {categoryType === 'teaching' && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <h4 className="font-bold text-gray-800">Teacher Class &amp; Subject Assignments</h4>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Assign Homeroom / Primary Class</label>
                    <select
                      value={assignedClassId}
                      onChange={(e) => setAssignedClassId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-medium"
                    >
                      <option value="">-- No Class Assigned --</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Assign Subjects (Multi-select)</label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {allSchoolSubjects.length === 0 ? (
                        <span className="text-gray-400 italic">No subjects configured in school yet.</span>
                      ) : (
                        allSchoolSubjects.map(subName => {
                          const isSelected = assignedSubjects.includes(subName);
                          return (
                            <button
                              key={subName}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setAssignedSubjects(assignedSubjects.filter(s => s !== subName));
                                } else {
                                  setAssignedSubjects([...assignedSubjects, subName]);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                                isSelected
                                  ? 'bg-[#00A896] text-white shadow-xs'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {subName} {isSelected && '✓'}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Natural Sciences"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-[#003366] bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. Ph.D. in Education"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-[#003366] bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Staff Employment Status &amp; Repositioning</label>
                <select
                  value={staffStatus}
                  onChange={(e) => setStaffStatus(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-[#003366] bg-gray-50"
                >
                  <option value="active">Active</option>
                  <option value="leave">On Leave</option>
                  <option value="terminated">Terminated / Resigned</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold shadow-md transition cursor-pointer"
                >
                  Save Staff Profile
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
