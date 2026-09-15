import React from 'react';
import {
  X,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  UserCheck,
  Check,
  Lock,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSelectUser,
}) => {
  if (!isOpen) return null;

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-5 h-5 text-amber-500" />;
      case 'class_teacher':
        return <GraduationCap className="w-5 h-5 text-emerald-500" />;
      case 'subject_teacher':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'student':
        return <UserCheck className="w-5 h-5 text-teal-500" />;
      default:
        return <UserCheck className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'class_teacher':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'subject_teacher':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'student':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'class_teacher':
        return 'Class Teacher';
      case 'subject_teacher':
        return 'Subject Teacher';
      case 'student':
        return 'Student / Parent';
      default:
        return role;
    }
  };

  const getPermissionsSummary = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Full administrative privileges: Curriculums, Classes, Mark Entry, Staff Management, Grade Boundaries, Backups & Reset.';
      case 'class_teacher':
        return 'Class-level authority: Student roster enrollment, all subject marks entry for assigned class, report cards, and conduct remarks.';
      case 'subject_teacher':
        return 'Subject-level authority: Mark entry & continuous assessment uploads strictly for assigned subjects and classes.';
      case 'student':
        return 'Read-only access: Personal academic standing, term grades breakdown, attendance record, and printable official report cards.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#003366] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#FFC300]" />
            <div>
              <h3 className="text-lg font-bold">Role-Based Access Switcher</h3>
              <p className="text-xs text-white/70">
                Switch active persona to test and experience tailored permissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Persona List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {users.map((user) => {
            const isSelected = user.id === currentUser.id;
            return (
              <div
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'border-[#00A896] bg-[#00A896]/5 ring-2 ring-[#00A896]/30 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getRoleIcon(user.role)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">{user.name}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getRoleBadge(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                      {user.username && (
                        <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                          @{user.username}
                        </span>
                      )}
                    </div>
                    {user.title && (
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">{user.title}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed bg-white/70 p-2 rounded-lg border border-gray-100">
                      {getPermissionsSummary(user.role)}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0 pt-1">
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#00A896] bg-[#00A896]/10 px-2.5 py-1 rounded-full">
                      <Check className="w-3.5 h-3.5" />
                      Active
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="text-xs font-bold text-[#003366] hover:text-[#00A896] px-2.5 py-1 rounded-lg border border-gray-200 hover:border-[#003366]"
                    >
                      Switch
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
          <span>Current Persona: <strong className="text-gray-800">{currentUser.name}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
