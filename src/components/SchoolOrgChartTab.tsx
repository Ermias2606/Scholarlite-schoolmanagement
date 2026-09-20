import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Briefcase,
  Building,
  UserCircle2,
  X,
  Search,
  Building2,
  Crown,
  Award,
  DollarSign,
  Wrench,
  UserPlus
} from 'lucide-react';
import { UserProfile, UserRole, SchoolClass } from '../types';
import { generateId } from '../utils/storage';
import { motion, AnimatePresence } from 'motion/react';

interface SchoolOrgChartTabProps {
  appData: {
    users: UserProfile[];
    classes: SchoolClass[];
  };
  onUpdateUsers: (users: UserProfile[]) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export interface OrgOffice {
  category: 'Director Office' | 'Departments' | 'Other Organizational Component Offices';
  id: string;
  title: string;
  roleDescription: string;
  department: string;
  icon: any;
}

export const SCHOOL_OFFICES: OrgOffice[] = [
  {
    category: 'Director Office',
    id: 'director',
    title: 'Director Office',
    roleDescription: 'Executive Leadership & Institutional Governance',
    department: 'Executive Office',
    icon: Crown,
  },
  {
    category: 'Director Office',
    id: 'advisor_committee',
    title: 'Advisor Committee',
    roleDescription: 'Strategic Advisory & Policy Guidance',
    department: 'Governance',
    icon: Award,
  },
  {
    category: 'Director Office',
    id: 'deputy_director',
    title: 'Deputy Director Office',
    roleDescription: 'Operational Management & Coordination',
    department: 'Executive Administration',
    icon: Briefcase,
  },
  {
    category: 'Departments',
    id: 'head_education',
    title: 'Education Department',
    roleDescription: 'Curriculum, Faculty & Academic Standards',
    department: 'Academic Department',
    icon: GraduationCap,
  },
  {
    category: 'Departments',
    id: 'lectures_team',
    title: 'Lectures Team',
    roleDescription: 'Teaching Faculty & Subject Specialists',
    department: 'Academic Faculty',
    icon: BookOpen,
  },
  {
    category: 'Departments',
    id: 'student_coordinator',
    title: 'Student Coordinator Office',
    roleDescription: 'Student Welfare, Attendance & Guidance',
    department: 'Student Affairs',
    icon: Users,
  },
  {
    category: 'Departments',
    id: 'head_office_accounting',
    title: 'Office & Accounting Department',
    roleDescription: 'Financial Management, Accounts & Records',
    department: 'Finance & Administration',
    icon: DollarSign,
  },
  {
    category: 'Other Organizational Component Offices',
    id: 'senior_manager',
    title: 'Senior Manager Office',
    roleDescription: 'Senior Administrative Operations',
    department: 'Administration',
    icon: ShieldCheck,
  },
  {
    category: 'Other Organizational Component Offices',
    id: 'operational_staff',
    title: 'Operational Staff Office',
    roleDescription: 'Facility Maintenance & Campus Services',
    department: 'Operations',
    icon: Building,
  },
  {
    category: 'Other Organizational Component Offices',
    id: 'technician',
    title: 'Technical Support Office',
    roleDescription: 'IT Systems & Hardware Infrastructure',
    department: 'Information Technology',
    icon: Wrench,
  },
];

export const SchoolOrgChartTab: React.FC<SchoolOrgChartTabProps> = ({
  appData,
  onUpdateUsers,
  onAddAuditLog,
}) => {
  const users = appData.users || [];
  const classes = appData.classes || [];

  const [activeCategory, setActiveCategory] = useState<'Director Office' | 'Departments' | 'Other Organizational Component Offices'>('Director Office');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Executive Office');
  const [orgNodeId, setOrgNodeId] = useState('director');
  const [staffStatus, setStaffStatus] = useState<'active' | 'leave' | 'terminated'>('active');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(['class_teacher']);
  const [assignedClassIds, setAssignedClassIds] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const handleOpenForm = (prefillDept?: string, prefillNodeId?: string, user?: UserProfile) => {
    if (user) {
      setEditingUserId(user.id);
      setName(user.name);
      setUsername(user.username);
      setPassword(user.password || '');
      setTitle(user.title || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDepartment(user.department || prefillDept || 'Executive Office');
      setOrgNodeId((user as any).orgNodeId || prefillNodeId || 'director');
      setStaffStatus(user.staffStatus || 'active');
      setSelectedRoles(user.roles || [user.role]);
      setAssignedClassIds(user.assignedClassIds || (user.assignedClassId ? [user.assignedClassId] : []));
      setSelectedSubjects(user.assignedSubjects || []);
    } else {
      setEditingUserId(null);
      setName('');
      setUsername('');
      setPassword('');
      setTitle(prefillDept ? prefillDept : '');
      setEmail('');
      setPhone('');
      setDepartment(prefillDept || 'Executive Office');
      setOrgNodeId(prefillNodeId || 'director');
      setStaffStatus('active');
      setSelectedRoles(['class_teacher']);
      setAssignedClassIds([]);
      setSelectedSubjects([]);
    }
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || selectedRoles.length === 0) return;

    let updatedUsers = [...users];
    const existingIndex = updatedUsers.findIndex((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (existingIndex !== -1 && updatedUsers[existingIndex].id !== editingUserId) {
      alert('Username already taken by another staff member.');
      return;
    }

    const primaryRole = selectedRoles.includes('admin')
      ? 'admin'
      : selectedRoles.includes('class_teacher')
      ? 'class_teacher'
      : selectedRoles[0];

    const userData: UserProfile & { orgNodeId?: string } = {
      id: editingUserId || generateId('usr'),
      name: name.trim(),
      username: username.trim().toLowerCase(),
      password: password.trim(),
      role: primaryRole,
      roles: selectedRoles,
      title: title.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department: department.trim(),
      orgNodeId: orgNodeId,
      joinDate: new Date().toISOString().split('T')[0],
      staffStatus,
      assignedClassId: assignedClassIds[0],
      assignedClassIds,
      assignedSubjects: selectedRoles.includes('subject_teacher') ? selectedSubjects : undefined,
    };

    if (editingUserId) {
      updatedUsers = updatedUsers.map((u) => (u.id === editingUserId ? userData : u));
      onAddAuditLog('Update Org Staff', `Updated staff record for ${userData.name}`);
    } else {
      updatedUsers.push(userData);
      onAddAuditLog('Create Org Staff', `Added new staff member ${userData.name}`);
    }

    onUpdateUsers(updatedUsers);
    setIsFormOpen(false);
  };

  const handleDeleteUser = (id: string, userName: string) => {
    if (confirm(`Remove staff record for ${userName}?`)) {
      const updatedUsers = users.filter((u) => u.id !== id);
      onUpdateUsers(updatedUsers);
      onAddAuditLog('Delete Org Staff', `Removed staff member: ${userName}`);
    }
  };

  const staffUsers = users.filter((u) => u.role !== 'student');
  const activeOffices = SCHOOL_OFFICES.filter((o) => o.category === activeCategory);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Simple Top Banner & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#00A896]" />
            School Organizational Structure
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage Director Office, Departments, and Component Offices seamlessly.
          </p>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00A896] hover:bg-[#008f80] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Category Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(['Director Office', 'Departments', 'Other Organizational Component Offices'] as const).map((cat) => {
          const count = SCHOOL_OFFICES.filter((o) => o.category === cat).length;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                isActive
                  ? 'bg-[#003366] text-white border-[#003366] shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-teal-300' : 'text-gray-400'}`}>
                  Organizational Tier
                </div>
                <div className="text-sm font-black mt-0.5">{cat}</div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {count} Offices
              </span>
            </button>
          );
        })}
      </div>

      {/* Offices List for Active Category */}
      <div className="space-y-4">
        {activeOffices.map((office) => {
          const IconComp = office.icon;
          const officeStaff = staffUsers.filter(
            (u) => (u as any).orgNodeId === office.id || u.department === office.department || (u.title && u.title.toLowerCase().includes(office.title.toLowerCase()))
          );

          return (
            <div key={office.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-[#003366] flex items-center justify-center shrink-0">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900">{office.title}</h3>
                    <p className="text-xs text-gray-500">{office.roleDescription}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenForm(office.department, office.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#00A896]" />
                  <span>Assign Staff</span>
                </button>
              </div>

              {/* Staff Members in this Office */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {officeStaff.length === 0 ? (
                  <div className="col-span-full py-4 text-center text-xs text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No staff currently assigned to this office. Click "Assign Staff" above.
                  </div>
                ) : (
                  officeStaff.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200/60 transition group text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-8 h-8 rounded-lg bg-[#003366] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {staff.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-gray-900 truncate">{staff.name}</div>
                          <div className="text-[11px] text-gray-500 truncate">@{staff.username} &bull; {staff.title || staff.role}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                        <button
                          onClick={() => handleOpenForm(office.department, office.id, staff)}
                          className="p-1.5 hover:bg-white rounded-lg text-blue-600 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(staff.id, staff.name)}
                          className="p-1.5 hover:bg-white rounded-lg text-rose-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Staff Registration / Edit Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-5 bg-[#003366] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-white/10 text-[#00A896]">
                    <UserCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">
                      {editingUserId ? 'Edit Staff Profile' : 'Register New Staff Member'}
                    </h3>
                    <p className="text-xs text-white/70">Assign office and system credentials</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. John Doe"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-[#00A896]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="johndoe"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Password</label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Official Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior Lecturer"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Assigned Office</label>
                    <select
                      value={orgNodeId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOrgNodeId(val);
                        const found = SCHOOL_OFFICES.find((o) => o.id === val);
                        if (found) setDepartment(found.department);
                      }}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-bold outline-none"
                    >
                      {SCHOOL_OFFICES.map((office) => (
                        <option key={office.id} value={office.id}>
                          {office.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@school.edu"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Primary Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['admin', 'class_teacher', 'subject_teacher'] as UserRole[]).map((r) => {
                      const isSelected = selectedRoles.includes(r);
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setSelectedRoles([r])}
                          className={`p-2.5 rounded-xl border text-center font-bold capitalize transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#00A896]/10 border-[#00A896] text-[#003366]'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {r.replace('_', ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#00A896] hover:bg-[#008f80] text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                  >
                    {editingUserId ? 'Save Changes' : 'Register Staff'}
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
