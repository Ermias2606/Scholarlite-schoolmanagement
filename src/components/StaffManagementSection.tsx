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
} from 'lucide-react';
import { UserProfile, UserRole, SchoolClass } from '../types';
import { generateId } from '../utils/storage';

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

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(['class_teacher']);
  const [assignedClassIds, setAssignedClassIds] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Collect all unique subjects across all classes
  const allSubjects: string[] = Array.from(
    new Set(classes.flatMap((c) => c.subjects.map((s) => s.name)))
  );

  const handleToggleSubject = (subName: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subName) ? prev.filter((s) => s !== subName) : [...prev, subName]
    );
  };

  const handleToggleRole = (role: UserRole) => {
    setSelectedRoles((prev) => {
      if (prev.includes(role)) {
        if (prev.length === 1) return prev; // prevent emptying
        return prev.filter(r => r !== role);
      }
      return [...prev, role];
    });
  };

  const handleOpenForm = (user?: UserProfile) => {
    if (user) {
      setEditingUserId(user.id);
      setName(user.name);
      setUsername(user.username);
      setPassword(user.password || '');
      setTitle(user.title || '');
      setSelectedRoles(user.roles || [user.role]);
      setAssignedClassIds(user.assignedClassIds || (user.assignedClassId ? [user.assignedClassId] : []));
      setSelectedSubjects(user.assignedSubjects || []);
    } else {
      setEditingUserId(null);
      setName('');
      setUsername('');
      setPassword('');
      setTitle('');
      setSelectedRoles(['class_teacher']);
      setAssignedClassIds(classes[0]?.id ? [classes[0].id] : []);
      setSelectedSubjects([]);
    }
    setIsFormOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cleanUsername = (username.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')) || `user_${Date.now()}`;
    const cleanPassword = password.trim() || 'password123';

    // Determine primary role based on highest privilege
    let primaryRole: UserRole = 'student';
    if (selectedRoles.includes('admin')) primaryRole = 'admin';
    else if (selectedRoles.includes('class_teacher')) primaryRole = 'class_teacher';
    else if (selectedRoles.includes('subject_teacher')) primaryRole = 'subject_teacher';

    const userData: UserProfile = {
      id: editingUserId || generateId('usr'),
      name: name.trim(),
      username: cleanUsername,
      password: cleanPassword,
      role: primaryRole,
      roles: selectedRoles,
      title: title.trim() || `${primaryRole === 'admin' ? 'Administrator' : primaryRole === 'class_teacher' ? 'Class Teacher' : 'Subject Teacher'}`,
      assignedClassIds: selectedRoles.includes('admin') && !selectedRoles.includes('class_teacher') ? undefined : assignedClassIds,
      assignedSubjects: selectedRoles.includes('subject_teacher') ? selectedSubjects : undefined,
    };

    let updated: UserProfile[];
    if (editingUserId) {
      updated = users.map(u => u.id === editingUserId ? { ...u, ...userData } : u);
      onAddAuditLog('Staff Account Updated', `Updated user ${userData.name} (@${userData.username}).`);
    } else {
      updated = [...users, userData];
      onAddAuditLog('Staff Account Created', `Added user ${userData.name} (@${userData.username}).`);
    }
    
    onUpdateUsers(updated);
    setIsFormOpen(false);
  };

  const handleDeleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    if (target.role === 'admin' && users.filter((u) => u.role === 'admin').length <= 1) {
      alert('Cannot delete the sole Administrator account.');
      return;
    }

    if (confirm(`Remove staff account for ${target.name}?`)) {
      const updated = users.filter((u) => u.id !== userId);
      onUpdateUsers(updated);
      onAddAuditLog(
        'Staff Account Removed',
        `Removed staff account for ${target.name} (${target.role}).`
      );
    }
  };

  const getRoleIcon = (userRole: UserRole) => {
    switch (userRole) {
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-amber-500" />;
      case 'class_teacher':
        return <GraduationCap className="w-4 h-4 text-emerald-500" />;
      case 'subject_teacher':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-bold text-[#003366] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00A896]" />
            Staff Accounts &amp; Role-Based Access
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Manage school administrators, class heads, and subject faculty permissions
          </p>
        </div>

        <button
          onClick={() => isFormOpen ? setIsFormOpen(false) : handleOpenForm()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold rounded-xl transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isFormOpen ? 'Cancel' : 'Add Staff Member'}</span>
        </button>
      </div>

      {/* Add / Edit Staff Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSaveUser}
          className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 animate-in fade-in duration-200"
        >
          <h4 className="text-sm font-bold text-gray-900">
            {editingUserId ? 'Edit Staff Member' : 'New Staff Member Registration'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Robert Miller"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#00A896] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Designation / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Head of Sciences"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#00A896] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Login Username *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. robert.miller"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#00A896] outline-none"
              />
              <span className="text-[10px] text-gray-400">Used to sign in to their role portal</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Login Password *
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={editingUserId ? "Leave blank to keep unchanged" : "Default: password123"}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#00A896] outline-none"
              />
              <span className="text-[10px] text-gray-400">Can be changed anytime</span>
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Institutional Roles & Permissions *
              </label>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-white cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes('admin')}
                    onChange={() => handleToggleRole('admin')}
                    className="w-4 h-4 text-[#00A896] border-gray-300 rounded focus:ring-[#00A896]"
                  />
                  <span className="text-sm font-medium text-gray-800">Administrator</span>
                </label>
                <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-white cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes('class_teacher')}
                    onChange={() => handleToggleRole('class_teacher')}
                    className="w-4 h-4 text-[#00A896] border-gray-300 rounded focus:ring-[#00A896]"
                  />
                  <span className="text-sm font-medium text-gray-800">Class Teacher</span>
                </label>
                <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-white cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes('subject_teacher')}
                    onChange={() => handleToggleRole('subject_teacher')}
                    className="w-4 h-4 text-[#00A896] border-gray-300 rounded focus:ring-[#00A896]"
                  />
                  <span className="text-sm font-medium text-gray-800">Subject Teacher</span>
                </label>
              </div>
            </div>

            {selectedRoles.includes('class_teacher') && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Assigned Class Cohorts (for Class Teacher role)
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          isChecked
                            ? 'bg-[#00A896] text-white border-[#00A896]'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {c.name} {isChecked && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {selectedRoles.includes('subject_teacher') && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Assigned Teaching Subjects
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {allSubjects.map((sub) => {
                  const isChecked = selectedSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleToggleSubject(sub)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        isChecked
                          ? 'bg-[#00A896] text-white border-[#00A896]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {sub} {isChecked && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00A896] hover:bg-[#008072] text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
            >
              {editingUserId ? 'Save Changes' : 'Save Staff Member'}
            </button>
          </div>
        </form>
      )}

      {/* Staff Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Roles</th>
              <th className="py-3 px-4">Login Username</th>
              <th className="py-3 px-4">Assigned Cohort / Subjects</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => {
              const displayRoles = u.roles || [u.role];
              const assignedClasses = classes.filter(c => u.assignedClassIds?.includes(c.id) || c.id === u.assignedClassId);
              return (
                <tr key={u.id} className="hover:bg-gray-50/50 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        {getRoleIcon(u.role)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{u.name}</div>
                        {u.title && <div className="text-xs text-gray-500">{u.title}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {displayRoles.map(r => (
                        <span key={r} className="capitalize text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                          {r.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-gray-700">
                    <span className="px-2 py-0.5 bg-gray-100 rounded border border-gray-200">
                      @{u.username}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-gray-600">
                    {displayRoles.includes('admin') ? (
                      <span className="font-semibold text-amber-700">All Classes &amp; School</span>
                    ) : (
                      <div>
                        {assignedClasses.length > 0 && displayRoles.includes('class_teacher') && (
                          <div className="font-semibold text-gray-800">{assignedClasses.map(c => c.name).join(', ')}</div>
                        )}
                        {u.assignedSubjects && u.assignedSubjects.length > 0 && displayRoles.includes('subject_teacher') && (
                          <div className="text-gray-500 mt-0.5">
                            Subjects: {u.assignedSubjects.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenForm(u)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Edit staff account"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete staff account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
