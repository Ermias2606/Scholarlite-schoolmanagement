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
  Phone,
  Mail,
  CalendarDays,
  Lock,
  Building,
  UserCircle2,
  X,
  Search,
  Filter
} from 'lucide-react';
import { UserProfile, UserRole, SchoolClass } from '../types';
import { generateId } from '../utils/storage';
import { motion, AnimatePresence } from 'motion/react';

interface StaffManagementSectionProps {
  users: UserProfile[];
  classes: SchoolClass[];
  onUpdateUsers: (users: UserProfile[]) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export const StaffManagementSection: React.FC<StaffManagementSectionProps> = ({
  users,
  classes,
  onUpdateUsers,
  onAddAuditLog,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // HCM Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form State (HCM Extended)
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [staffStatus, setStaffStatus] = useState<'active' | 'leave' | 'terminated'>('active');
  const [address, setAddress] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(['class_teacher']);
  const [assignedClassIds, setAssignedClassIds] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Collect unique departments
  const departments = Array.from(new Set(users.map(u => u.department).filter(Boolean))) as string[];
  
  const allSubjects = Array.from(
    new Set(classes.flatMap((c) => c.subjects.map((s) => s.name)))
    ) as string[];
  allSubjects.sort();

  const handleOpenForm = (user?: UserProfile) => {
    if (user) {
      setEditingUserId(user.id);
      setName(user.name);
      setUsername(user.username);
      setPassword(user.password || '');
      setTitle(user.title || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDepartment(user.department || '');
      setJoinDate(user.joinDate || '');
      setStaffStatus(user.staffStatus || 'active');
      setAddress(user.address || '');
      setSelectedRoles(user.roles || [user.role]);
      setAssignedClassIds(user.assignedClassIds || (user.assignedClassId ? [user.assignedClassId] : []));
      setSelectedSubjects(user.assignedSubjects || []);
    } else {
      setEditingUserId(null);
      setName('');
      setUsername('');
      setPassword('');
      setTitle('');
      setEmail('');
      setPhone('');
      setDepartment('');
      setJoinDate(new Date().toISOString().split('T')[0]);
      setStaffStatus('active');
      setAddress('');
      setSelectedRoles(['class_teacher']);
      setAssignedClassIds([]);
      setSelectedSubjects([]);
    }
    setIsFormOpen(true);
  };

  const handleToggleRole = (role: UserRole) => {
    if (role === 'admin') {
      setSelectedRoles(['admin']);
      return;
    }
    let newRoles = selectedRoles.filter(r => r !== 'admin');
    if (newRoles.includes(role)) {
      newRoles = newRoles.filter((r) => r !== role);
      if (newRoles.length === 0) newRoles = ['class_teacher'];
    } else {
      newRoles.push(role);
    }
    setSelectedRoles(newRoles);
  };

  const handleToggleSubject = (subjectName: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectName)
        ? prev.filter((s) => s !== subjectName)
        : [...prev, subjectName]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || selectedRoles.length === 0) return;

    let updatedUsers = [...users];
    
    // Check for username collision (ignore self)
    const existingIndex = updatedUsers.findIndex((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (existingIndex !== -1 && updatedUsers[existingIndex].id !== editingUserId) {
      alert("Username already taken by another staff member.");
      return;
    }

    const primaryRole = selectedRoles.includes('admin') ? 'admin' 
                      : selectedRoles.includes('class_teacher') ? 'class_teacher' 
                      : selectedRoles[0];

    const userData: UserProfile = {
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
      joinDate,
      staffStatus,
      address: address.trim(),
      assignedClassId: assignedClassIds[0],
      assignedClassIds,
      assignedSubjects: selectedRoles.includes('subject_teacher') ? selectedSubjects : undefined,
    };

    if (editingUserId) {
      updatedUsers = updatedUsers.map((u) => (u.id === editingUserId ? userData : u));
      onAddAuditLog('Update Staff', `Updated HCM profile for ${userData.name}`);
    } else {
      updatedUsers.push(userData);
      onAddAuditLog('Create Staff', `Created HCM profile for ${userData.name}`);
    }

    onUpdateUsers(updatedUsers);
    setIsFormOpen(false);
  };

  const handleDeleteUser = (id: string, userName: string) => {
    if (confirm(`Terminate & Delete HCM record for ${userName}?`)) {
      const updatedUsers = users.filter((u) => u.id !== id);
      onUpdateUsers(updatedUsers);
      onAddAuditLog('Delete Staff', `Terminated & Deleted profile: ${userName}`);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <ShieldCheck className="w-5 h-5 text-amber-600" />;
      case 'school_admin': return <ShieldCheck className="w-5 h-5 text-rose-600" />;
      case 'super_admin': return <ShieldCheck className="w-5 h-5 text-purple-600" />;
      case 'class_teacher': return <GraduationCap className="w-5 h-5 text-emerald-600" />;
      case 'subject_teacher': return <BookOpen className="w-5 h-5 text-blue-600" />;
      default: return <UserCircle2 className="w-5 h-5 text-gray-400" />;
    }
  };

  const staffUsers = users.filter(u => u.role !== 'student');
  const activeStaff = staffUsers.filter(u => u.staffStatus !== 'leave' && u.staffStatus !== 'terminated');
  const onLeaveStaff = staffUsers.filter(u => u.staffStatus === 'leave');

  const filteredStaff = staffUsers.filter(u => {
    if (departmentFilter !== 'all' && u.department !== departmentFilter) return false;
    if (statusFilter !== 'all' && (u.staffStatus || 'active') !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || 
             u.username.toLowerCase().includes(q) || 
             (u.department || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* HCM Header & Metrics */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600" />
            Human Capital Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage staff profiles, roles, credentials, and institutional access.</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Staff
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-900">{staffUsers.length}</div>
            <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Total Staff</div>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-900">{activeStaff.length}</div>
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Active Status</div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-amber-600 flex items-center justify-center">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-900">{onLeaveStaff.length}</div>
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">On Leave</div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 shadow-sm relative mb-6">
              <button 
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <UserCircle2 className="w-5 h-5 text-indigo-600" />
                {editingUserId ? 'Edit Staff Profile' : 'Register New Staff Member'}
              </h3>

              <form onSubmit={handleSave} className="space-y-8">
                {/* Section 1: Basic Profile */}
                <div>
                  <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Profile & Contact</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Official Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                        placeholder="e.g. Head of Science"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                        placeholder="e.g. Sciences"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Residential Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Employment Status */}
                <div>
                  <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Employment Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Join Date</label>
                      <input
                        type="date"
                        value={joinDate}
                        onChange={(e) => setJoinDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Staff Status</label>
                      <select
                        value={staffStatus}
                        onChange={(e) => setStaffStatus(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 font-semibold"
                      >
                        <option value="active">Active (Employed)</option>
                        <option value="leave">On Leave</option>
                        <option value="terminated">Terminated / Resigned</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Credentials */}
                <div>
                  <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">System Credentials</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Username *</label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 font-mono text-sm"
                        placeholder="johndoe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Initial Password *</label>
                      <input
                        type="text"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 font-mono text-sm"
                        placeholder="Set initial password..."
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Staff will use this password to access the portal.</p>
                    </div>
                  </div>
                </div>

                {/* Section 4: Roles & Permissions */}
                <div>
                  <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Roles & Permissions</h4>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    <label className={`flex items-center gap-2 px-4 py-2 border rounded-xl cursor-pointer transition ${selectedRoles.includes('admin') ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes('admin')}
                        onChange={() => handleToggleRole('admin')}
                        className="hidden"
                      />
                      <ShieldCheck className={`w-4 h-4 ${selectedRoles.includes('admin') ? 'text-amber-600' : 'text-gray-400'}`} />
                      <span className="text-sm font-bold">Administrator</span>
                    </label>

                    <label className={`flex items-center gap-2 px-4 py-2 border rounded-xl cursor-pointer transition ${selectedRoles.includes('class_teacher') && !selectedRoles.includes('admin') ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'} ${selectedRoles.includes('admin') ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes('class_teacher')}
                        onChange={() => handleToggleRole('class_teacher')}
                        className="hidden"
                        disabled={selectedRoles.includes('admin')}
                      />
                      <GraduationCap className={`w-4 h-4 ${selectedRoles.includes('class_teacher') ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <span className="text-sm font-bold">Class Teacher</span>
                    </label>

                    <label className={`flex items-center gap-2 px-4 py-2 border rounded-xl cursor-pointer transition ${selectedRoles.includes('subject_teacher') && !selectedRoles.includes('admin') ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'} ${selectedRoles.includes('admin') ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes('subject_teacher')}
                        onChange={() => handleToggleRole('subject_teacher')}
                        className="hidden"
                        disabled={selectedRoles.includes('admin')}
                      />
                      <BookOpen className={`w-4 h-4 ${selectedRoles.includes('subject_teacher') ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="text-sm font-bold">Subject Faculty</span>
                    </label>
                  </div>

                  {selectedRoles.includes('class_teacher') && !selectedRoles.includes('admin') && (
                    <div className="mb-6 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <label className="block text-xs font-bold text-emerald-900 mb-2">
                        Assigned Class Cohorts (Class Teacher Responsibility)
                      </label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {classes.map((c) => {
                          const isChecked = assignedClassIds.includes(c.id);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setAssignedClassIds(prev => 
                                  prev.includes(c.id) 
                                    ? prev.filter(id => id !== c.id)
                                    : [...prev, c.id]
                                );
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                isChecked
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-400'
                              }`}
                            >
                              {c.name} {isChecked && '✓'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedRoles.includes('subject_teacher') && !selectedRoles.includes('admin') && (
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                      <label className="block text-xs font-bold text-blue-900 mb-2">
                        Assigned Teaching Subjects (Faculty Responsibility)
                      </label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {allSubjects.map((sub) => {
                          const isChecked = selectedSubjects.includes(sub);
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => handleToggleSubject(sub)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                isChecked
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                              }`}
                            >
                              {sub} {isChecked && '✓'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {editingUserId ? 'Update Profile' : 'Save New Staff'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Directory Section */}
      <div>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff by name, username, or department..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="pl-8 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold appearance-none"
              >
                <option value="all">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="py-4 px-4">Staff Member</th>
                <th className="py-4 px-4">Contact Info</th>
                <th className="py-4 px-4">Status & Dep.</th>
                <th className="py-4 px-4">Roles & Access</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredStaff.map((u) => {
                const displayRoles = u.roles || [u.role];
                return (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                          {getRoleIcon(u.role)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{u.name}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 text-xs text-gray-600">
                        {u.email && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {u.email}</div>}
                        {u.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {u.phone}</div>}
                        {!u.email && !u.phone && <span className="text-gray-400 italic">No contact provided</span>}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          (u.staffStatus || 'active') === 'active' ? 'bg-emerald-100 text-emerald-800' :
                          u.staffStatus === 'leave' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {u.staffStatus || 'Active'}
                        </span>
                        {u.department && (
                          <span className="text-xs font-semibold flex items-center gap-1 text-gray-600">
                            <Building className="w-3 h-3 text-gray-400" /> {u.department}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {displayRoles.map(r => (
                          <span key={r} className={`capitalize text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            r === 'admin' || r === 'super_admin' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                            r === 'class_teacher' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                            'bg-blue-50 border-blue-200 text-blue-800'
                          }`}>
                            {r.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenForm(u)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
                          title="Edit staff profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {u.role !== 'admin' && u.role !== 'super_admin' && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            title="Terminate & Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 font-medium">
                    No staff records found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
