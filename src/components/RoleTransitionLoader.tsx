import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  GraduationCap,
  BookOpen,
  UserCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface RoleTransitionLoaderProps {
  user: UserProfile;
  targetDashboard: string;
  onComplete: () => void;
}

export const RoleTransitionLoader: React.FC<RoleTransitionLoaderProps> = ({
  user,
  targetDashboard,
  onComplete,
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-8 h-8 text-amber-400" />;
      case 'class_teacher':
        return <GraduationCap className="w-8 h-8 text-emerald-400" />;
      case 'subject_teacher':
        return <BookOpen className="w-8 h-8 text-blue-400" />;
      case 'student':
        return <UserCheck className="w-8 h-8 text-teal-400" />;
      default:
        return <ShieldCheck className="w-8 h-8 text-[#00A896]" />;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrator & Registrar', color: 'bg-amber-500/20 text-amber-300 border-amber-400/40' };
      case 'class_teacher':
        return { label: 'Class Teacher & Form Tutor', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' };
      case 'subject_teacher':
        return { label: 'Subject Specialist Faculty', color: 'bg-blue-500/20 text-blue-300 border-blue-400/40' };
      case 'student':
        return { label: 'Student / Guardian Portal', color: 'bg-teal-500/20 text-teal-300 border-teal-400/40' };
      default:
        return { label: role, color: 'bg-gray-500/20 text-gray-300 border-gray-400/40' };
    }
  };

  const steps = [
    'Verifying security credentials & permission tokens...',
    `Applying ${getRoleBadge(user.role).label} access policies...`,
    `Loading workspace configuration for ${user.name}...`,
    `Routing to ${targetDashboard}...`,
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setStepIndex(1), 200);
    const t2 = setTimeout(() => setStepIndex(2), 450);
    const t3 = setTimeout(() => setStepIndex(3), 700);
    const tEnd = setTimeout(() => {
      onComplete();
    }, 950);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(tEnd);
    };
  }, [onComplete]);

  const badge = getRoleBadge(user.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001F3F]/95 backdrop-blur-md text-white p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-7 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#00A896]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Spinner */}
        <div className="relative mb-5">
          <div className="w-18 h-18 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
            {getRoleIcon(user.role)}
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-2 border-2 border-dashed border-[#00A896]/40 rounded-3xl"
          />
        </div>

        {/* User Identity */}
        <div className="space-y-1.5 mb-5">
          <div className="flex items-center justify-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">{user.name}</h2>
          <p className="text-xs text-white/60">{user.title || user.department || 'Academic Member'}</p>
        </div>

        {/* Steps Progress */}
        <div className="w-full bg-black/20 rounded-2xl p-4 border border-white/5 text-left space-y-2.5 mb-5">
          {steps.map((text, idx) => {
            const isDone = stepIndex > idx;
            const isCurrent = stepIndex === idx;

            return (
              <div
                key={text}
                className={`flex items-center gap-2.5 text-xs transition-opacity duration-200 ${
                  isDone ? 'text-emerald-400 font-semibold' : isCurrent ? 'text-white font-bold' : 'text-white/30'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-[#00A896] border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                )}
                <span className="truncate">{text}</span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '15%' }}
            animate={{ width: `${Math.min(100, (stepIndex + 1) * 25)}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-[#00A896] to-emerald-400 rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
};
