import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  UserCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { AppData, UserProfile, UserRole } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface LandingViewProps {
  appData: AppData;
  currentUser?: UserProfile;
  onEnter: (asUser?: UserProfile) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  appData,
  onEnter,
}) => {
  const slogans = appData.settings.slogans || ['Simplify your school year.'];
  const [currentSloganIndex, setCurrentSloganIndex] = useState(0);

  // Authentication State
  const [landingState, setLandingState] = useState<'portals' | 'login'>('portals');
  const [selectedPortal, setSelectedPortal] = useState<'staff' | 'student' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authSuccessUser, setAuthSuccessUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (slogans.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSloganIndex((prev) => (prev + 1) % slogans.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slogans.length]);

  const users = appData.users || [];
  const adminUser = users.find((u) => u.role === 'admin') || users[0];
  const classTeacherUser = users.find((u) => u.role === 'class_teacher') || users[1];
  const subjectTeacherUser = users.find((u) => u.role === 'subject_teacher') || users[2];
  const studentUser = users.find((u) => u.role === 'student') || users[3];

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setLoginError('Please enter credentials.');
      return;
    }

    if (selectedPortal === 'student') {
      let matchedStudent = null;
      let matchedClass = null;
      for (const c of appData.classes) {
        const student = c.students.find(s => 
          s.admissionNumber?.toLowerCase() === cleanUser || 
          s.rollNo.toString() === cleanUser
        );
        if (student) {
          matchedStudent = student;
          matchedClass = c;
          break;
        }
      }

      let matchedUser = users.find(
        (u) =>
          u.role === 'student' &&
          ((u.username?.toLowerCase() === cleanUser || u.email?.toLowerCase() === cleanUser) || 
           (matchedStudent && u.assignedStudentId === matchedStudent.id)) &&
          (u.password === cleanPass || (!u.password && cleanPass === 'password123'))
      );

      if (!matchedUser && matchedStudent && cleanPass === 'password123') {
        matchedUser = {
          id: `usr_dyn_${matchedStudent.id}`,
          name: matchedStudent.name,
          role: 'student',
          roles: ['student'],
          username: cleanUser,
          password: 'password123',
          title: `Student Portal (${matchedClass?.name})`,
          assignedClassId: matchedClass?.id,
          assignedStudentId: matchedStudent.id
        };
      }

      if (matchedUser) {
        setAuthSuccessUser(matchedUser);
        setTimeout(() => {
          onEnter(matchedUser);
        }, 800);
      } else {
        setLoginError('Invalid Student ID or password. (Demo password: password123)');
      }
    } else {
      const matchedUser = users.find(
        (u) =>
          u.role !== 'student' &&
          (u.username?.toLowerCase() === cleanUser || u.email?.toLowerCase() === cleanUser) &&
          (u.password === cleanPass || (!u.password && cleanPass === 'password123'))
      );

      if (matchedUser) {
        setAuthSuccessUser(matchedUser);
        setTimeout(() => {
          onEnter(matchedUser);
        }, 800);
      } else {
        setLoginError('Invalid Staff credentials. Check username or click a demo role below.');
      }
    }
  };

  const handleSelectDemoCredentials = (user: UserProfile) => {
    setUsername(user.username || '');
    setPassword(user.password || 'password123');
    setLoginError(null);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 } 
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <section className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-[#003366]/20 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-br from-blue-100/40 to-teal-100/40 blur-3xl" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-tr from-purple-100/40 to-blue-50/40 blur-3xl" 
        />
      </div>

      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50">
        <PWAInstallButton />
      </div>

      <AnimatePresence mode="wait">
        {authSuccessUser ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="z-10 flex flex-col items-center justify-center space-y-4"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/30"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-gray-900"
            >
              Welcome back, {authSuccessUser.name.split(' ')[0]}
            </motion.h2>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 w-full max-w-[420px]"
          >
            {/* Branding Header */}
            <motion.div variants={itemVariants} className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#003366] to-[#00A896] text-white shadow-xl shadow-blue-900/10 mb-6 relative">
                <GraduationCap className="w-8 h-8" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-yellow-900" />
                </div>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
                {appData.settings.name}
              </h1>
              <div className="h-6 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentSloganIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-gray-500 text-sm font-medium"
                  >
                    {slogans[currentSloganIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {landingState === 'portals' ? (
                  <motion.div 
                    key="portals"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">Select your portal to continue</h2>
                    <button
                      onClick={() => {
                        setSelectedPortal('staff');
                        setLandingState('login');
                      }}
                      className="w-full p-4 rounded-2xl border-2 border-transparent bg-blue-50/50 hover:bg-blue-50 hover:border-blue-200 transition-all text-left group flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Staff Portal</h3>
                        <p className="text-sm text-gray-500 font-medium">Teachers & Administrators</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedPortal('student');
                        setLandingState('login');
                      }}
                      className="w-full p-4 rounded-2xl border-2 border-transparent bg-teal-50/50 hover:bg-teal-50 hover:border-teal-200 transition-all text-left group flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-teal-600 group-hover:scale-105 transition-transform">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Student Portal</h3>
                        <p className="text-sm text-gray-500 font-medium">Results & Report Cards</p>
                      </div>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <button 
                        onClick={() => {
                          setLandingState('portals');
                          setLoginError(null);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500"
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </button>
                      <h2 className="text-lg font-bold text-gray-900 capitalize">
                        {selectedPortal} Sign In
                      </h2>
                    </div>

                    <form onSubmit={handleCredentialSubmit} className="space-y-4">
                      {loginError && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium flex gap-2 items-start"
                        >
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <p>{loginError}</p>
                        </motion.div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                            {selectedPortal === 'student' ? 'Student ID / Roll No' : 'Username'}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                              <User className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              required
                              value={username}
                              onChange={(e) => {
                                setUsername(e.target.value);
                                setLoginError(null);
                              }}
                              placeholder={selectedPortal === 'student' ? "e.g. STD-2024-001" : "Enter username"}
                              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition bg-gray-50/50 hover:bg-gray-50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                            Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                              <Lock className="w-4 h-4" />
                            </div>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value);
                                setLoginError(null);
                              }}
                              placeholder="Enter your password"
                              className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition bg-gray-50/50 hover:bg-gray-50"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-700 transition"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] hover:from-[#002244] hover:to-[#003366] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] mt-6"
                      >
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 text-center">
                        Quick Demo Accounts
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedPortal === 'staff' && adminUser && (
                          <button
                            onClick={() => handleSelectDemoCredentials(adminUser)}
                            className="p-2 rounded-xl border border-gray-100 bg-gray-50 hover:bg-amber-50 hover:border-amber-200 transition text-left group flex flex-col"
                          >
                            <span className="text-[10px] font-bold uppercase text-amber-600 mb-1">Admin</span>
                            <span className="text-xs font-bold text-gray-900 truncate">{adminUser.name}</span>
                          </button>
                        )}
                        {selectedPortal === 'staff' && classTeacherUser && (
                          <button
                            onClick={() => handleSelectDemoCredentials(classTeacherUser)}
                            className="p-2 rounded-xl border border-gray-100 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 transition text-left group flex flex-col"
                          >
                            <span className="text-[10px] font-bold uppercase text-emerald-600 mb-1">Teacher</span>
                            <span className="text-xs font-bold text-gray-900 truncate">{classTeacherUser.name}</span>
                          </button>
                        )}
                        {selectedPortal === 'student' && studentUser && (
                          <button
                            onClick={() => handleSelectDemoCredentials(studentUser)}
                            className="p-2 rounded-xl border border-gray-100 bg-gray-50 hover:bg-teal-50 hover:border-teal-200 transition text-left group flex flex-col col-span-2"
                          >
                            <span className="text-[10px] font-bold uppercase text-teal-600 mb-1">Student Demo</span>
                            <span className="text-xs font-bold text-gray-900 truncate">{studentUser.name}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-1.5 text-[11px] text-gray-400 font-medium">
              <span className="inline-flex items-center gap-1 font-medium text-gray-500">
                <Sparkles className="w-3.5 h-3.5 text-[#00A896]" />
                ScholarLite &bull; Progressive Web App
              </span>
              <span>Encrypted Data &bull; Role-Based Access Control</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
