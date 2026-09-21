import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  CheckCircle2,
  GraduationCap,
  FileSpreadsheet,
  Settings as SettingsIcon,
  LogOut,
  Users,
  ShieldCheck,
  UserCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Building2,
  BookOpen,
  Layers,
  Network,
} from 'lucide-react';
import {
  AppData,
  SchoolClass,
  Subject,
  Settings,
  UserProfile,
  Student,
  StudentAttendance,
  StudentRemarks,
} from './types';
import { loadAppData, saveAppData, generateId, DB_STORAGE_KEY, loadAppDataFromCloud, saveAppDataToCloud } from './utils/storage';
import { DEFAULT_APP_DATA } from './utils/defaultData';
import { createAuditLog } from './utils/audit';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ManageClassesTab } from './components/ManageClassesTab';
import { AdminSchoolClassManagementTab } from './components/AdminSchoolClassManagementTab';
import { ManageSubjectsTab } from './components/ManageSubjectsTab';
import { ManageStudentsTab } from './components/ManageStudentsTab';
import { ManageStaffTab } from './components/ManageStaffTab';
import { ManageLevelsTab } from './components/ManageLevelsTab';
import { LandingView } from './components/LandingView';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { ClassesTab } from './components/ClassesTab';
import { ResultsTab } from './components/ResultsTab';
import { SettingsTab } from './components/SettingsTab';
import { StudentPortal } from './components/StudentPortal';
import { CalendarTab } from './components/CalendarTab';
import { TeacherDashboardTab } from './components/TeacherDashboardTab';
import { Calendar } from 'lucide-react';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { EditRemarksAttendanceModal } from './components/EditRemarksAttendanceModal';
import { RegistrarTab } from './components/RegistrarTab';
import { HcmTab } from './components/HcmTab';
import { RoleTransitionLoader } from './components/RoleTransitionLoader';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useTheme } from './utils/theme';

export default function App() {
  useTheme(); // Initialize global theme on app load
  const [appData, setAppData] = useState<AppData>(() => loadAppData());
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState<'overview' | 'registrar' | 'teacher_dashboard' | 'manage_classes' | 'manage_subjects' | 'manage_students' | 'manage_staff' | 'manage_levels' | 'classes' | 'results' | 'calendar' | 'settings'>('overview');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [roleTransitionState, setRoleTransitionState] = useState<{
    user: UserProfile;
    targetDashboard: string;
    targetTab?: typeof activeTab;
  } | null>(null);

  const [showSaveToast, setShowSaveToast] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerSaveToast = () => {
    setShowSaveToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setShowSaveToast(false);
    }, 2500);
  };


  // Role and User state
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const initial = loadAppData();
    return (
      initial.currentUser ||
      initial.users?.[0] || {
        id: 'usr_admin',
        name: 'Dr. Sarah Jenkins',
        role: 'admin',
        title: 'Principal & Head of School',
      }
    );
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      if (user) {
        // User logged in via Firebase
        const { data, success } = await loadAppDataFromCloud();
        setAppData(data);
        if (success) setLastSyncTime(new Date());
        
        // Find existing user by email or UID
        let profile = data.users?.find((u) => u.email === user.email || u.id === user.uid);
        
        // If it's a new user logging in with Google, register them as an admin for demo purposes
        if (!profile) {
          profile = {
            id: user.uid,
            name: user.displayName || 'New User',
            role: 'admin', 
            username: user.email?.split('@')[0] || 'user',
            password: '',
            email: user.email || '',
          };
          data.users = [...(data.users || []), profile];
          const saveSuccess = await saveAppDataToCloud(data);
          if (saveSuccess) setLastSyncTime(new Date());
          setAppData(data);
        }
        
        setCurrentUser(profile);
        setSelectedClassId(data.classes[0]?.id || null);
        setView('dashboard');
      } else {
        // Logged out
        const localData = loadAppData();
        setAppData(localData);
        setCurrentUser(
          localData.currentUser ||
          localData.users?.[0] || {
            id: 'usr_admin',
            name: 'Demo Admin',
            role: 'admin',
            title: 'Administrator',
            username: 'admin',
            password: 'password123',
          }
        );
        setView('landing');
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [selectedClassId, setSelectedClassId] = useState<string | null>(() => {
    const loaded = loadAppData();
    return loaded.classes[0]?.id || null;
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [editingRemarksStudent, setEditingRemarksStudent] = useState<{
    student: Student;
    className: string;
  } | null>(null);

  // Sync mutations to localStorage and Firebase
  const updateAppData = (updater: (prev: AppData) => AppData) => {
    setAppData((prev) => {
      const next = updater(prev);
      saveAppData(next); // Local backup
      if (auth.currentUser) {
        saveAppDataToCloud(next).then(success => {
          if (success) setLastSyncTime(new Date());
        });
      }
      return next;
    });
  };

  // Helper for audit logs
  const handleAddAuditLog = (action: string, details: string) => {
    const log = createAuditLog(currentUser, action, details);
    updateAppData((prev) => ({
      ...prev,
      auditLogs: [log, ...(prev.auditLogs || [])],
    }));
  };

  // Switch persona and keep in appData with smooth role-permission loading
  const handleSelectUser = (user: UserProfile, targetTabOverride?: typeof activeTab) => {
    let targetTab: typeof activeTab = 'overview';
    let targetLabel = 'Executive Overview Hub';

    if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'school_admin') {
      targetTab = targetTabOverride || (activeTab === 'registrar' ? 'registrar' : 'overview');
      targetLabel = targetTab === 'registrar' ? 'Registrar Office & Academic Registry' : 'Executive Overview Hub';
    } else if (user.role === 'class_teacher') {
      targetTab = 'teacher_dashboard';
      targetLabel = 'Class Teacher Dashboard & Roster';
    } else if (user.role === 'subject_teacher') {
      targetTab = 'teacher_dashboard';
      targetLabel = 'Subject Faculty Gradebook & Entry';
    } else if (user.role === 'student') {
      targetTab = 'overview';
      targetLabel = 'Student & Parent Academic Portal';
    }

    setRoleTransitionState({
      user,
      targetDashboard: targetLabel,
      targetTab,
    });
    setView('dashboard');
  };

  const handleCompleteRoleTransition = () => {
    if (!roleTransitionState) return;
    const { user, targetTab } = roleTransitionState;
    setCurrentUser(user);
    if (targetTab) {
      setActiveTab(targetTab);
    }
    if (user.assignedClassId) {
      setSelectedClassId(user.assignedClassId);
    } else if (user.assignedClassIds && user.assignedClassIds.length > 0) {
      setSelectedClassId(user.assignedClassIds[0]);
    }
    updateAppData((prev) => ({
      ...prev,
      currentUser: user,
    }));
    handleAddAuditLog('Role Switch', `Switched active persona to ${user.name} (${user.role}) - Loaded ${targetTab} dashboard`);
    setRoleTransitionState(null);
  };

  // Update staff list
  const handleUpdateUsers = (users: UserProfile[]) => {
    updateAppData((prev) => ({
      ...prev,
      users,
    }));
  };

  // Save student remarks and attendance
  const handleSaveRemarksAttendance = (
    studentId: string,
    year: string,
    term: string,
    attendance: StudentAttendance,
    remarks: StudentRemarks
  ) => {
    updateAppData((prev) => {
      const classes = prev.classes.map((c) => {
        const studentIndex = c.students.findIndex((s) => s.id === studentId);
        if (studentIndex === -1) return c;

        const students = [...c.students];
        const currentStudent = students[studentIndex];

        const updatedAttendance = { ...(currentStudent.attendance || {}) };
        if (!updatedAttendance[year]) updatedAttendance[year] = {};
        updatedAttendance[year][term] = attendance;

        const updatedRemarks = { ...(currentStudent.remarks || {}) };
        if (!updatedRemarks[year]) updatedRemarks[year] = {};
        updatedRemarks[year][term] = remarks;

        students[studentIndex] = {
          ...currentStudent,
          attendance: updatedAttendance,
          remarks: updatedRemarks,
        };

        return { ...c, students };
      });

      return { ...prev, classes };
    });

    handleAddAuditLog(
      'Update Remarks & Attendance',
      `Saved evaluation for Student #${editingRemarksStudent?.student.rollNo} (${term} ${year})`
    );
  };

  // --- Handlers for Classes ---
  const handleAddClass = (className: string) => {
    const newId = generateId('class');
    updateAppData((prev) => {
      const newClass: SchoolClass = {
        id: newId,
        name: className,
        subjects: [],
        students: [],
      };
      return {
        ...prev,
        classes: [...prev.classes, newClass],
      };
    });
    setSelectedClassId(newId);
    handleAddAuditLog('Add Class Cohort', `Created class ${className}`);
  };

  const handleDeleteClass = (classId: string) => {
    const classToDelete = appData.classes.find((c) => c.id === classId);
    updateAppData((prev) => {
      const updated = prev.classes.filter((c) => c.id !== classId);
      return {
        ...prev,
        classes: updated,
      };
    });
    if (selectedClassId === classId) {
      const remaining = appData.classes.filter((c) => c.id !== classId);
      setSelectedClassId(remaining[0]?.id || null);
    }
    handleAddAuditLog('Delete Class Cohort', `Removed class ${classToDelete?.name || classId}`);
  };

  // --- Handlers for Subjects ---
  const handleSaveSubject = (classId: string, subject: Subject, originalName?: string) => {
    updateAppData((prev) => {
      const classes = prev.classes.map((c) => {
        if (c.id !== classId) return c;
        let subjects = [...c.subjects];
        if (originalName) {
          // Edit existing
          subjects = subjects.map((s) => (s.name === originalName ? subject : s));
        } else {
          // Add new
          if (subjects.some((s) => s.name === subject.name)) {
            alert('A subject with this name already exists in this class.');
            return c;
          }
          subjects.push(subject);
        }
        return { ...c, subjects };
      });
      return { ...prev, classes };
    });
    handleAddAuditLog(
      originalName ? 'Edit Subject' : 'Add Subject',
      `${originalName ? 'Updated' : 'Created'} subject ${subject.name}`
    );
  };

  const handleDeleteSubject = (classId: string, subjectName: string) => {
    updateAppData((prev) => {
      const classes = prev.classes.map((c) => {
        if (c.id !== classId) return c;
        const subjects = c.subjects.filter((s) => s.name !== subjectName);

        // Remove marks for this subject from all students in the class
        const students = c.students.map((student) => {
          const results = { ...student.results };
          Object.keys(results).forEach((year) => {
            Object.keys(results[year]).forEach((term) => {
              if (results[year][term]?.[subjectName]) {
                delete results[year][term][subjectName];
              }
            });
          });
          return { ...student, results };
        });

        return { ...c, subjects, students };
      });
      return { ...prev, classes };
    });
    handleAddAuditLog('Delete Subject', `Removed subject ${subjectName}`);
  };

  // --- Handlers for Students ---
  const generateAdmissionNumber = () => {
    const year = new Date().getFullYear();
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    return `SL-${year}-${randomCode}`;
  };

  const handleAddStudent = (
    classId: string,
    student: Partial<Student> & { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other' }
  ) => {
    updateAppData((prev) => {
      const classes = prev.classes.map((c) => {
        if (c.id !== classId) return c;
        const newStu: Student = {
          id: student.id || generateId('stu'),
          admissionNumber: student.admissionNumber || generateAdmissionNumber(),
          rollNo: student.rollNo,
          name: student.name,
          gender: student.gender,
          parentName: student.parentName,
          parentContact: student.parentContact,
          dob: student.dob,
          bloodGroup: student.bloodGroup,
          address: student.address,
          emergencyContact: student.emergencyContact,
          status: student.status || 'approved',
          studentStatus: student.studentStatus || 'active',
          results: student.results || {},
          attendance: student.attendance || {},
          remarks: student.remarks || {},
        };
        return {
          ...c,
          students: [...c.students, newStu],
        };
      });
      return { ...prev, classes };
    });
    handleAddAuditLog('Enroll Student', `Enrolled ${student.name} (Roll #${student.rollNo})`);
  };

  const handleUpdateStudent = (
    classId: string,
    updated: Partial<Student> & { id: string }
  ) => {
    updateAppData((prev) => {
      const classes = prev.classes.map((c) => {
        if (c.id !== classId) return c;
        const students = c.students.map((s) => (s.id === updated.id ? { ...s, ...updated } : s));
        return { ...c, students };
      });
      return { ...prev, classes };
    });
    handleAddAuditLog('Update Student Record', `Updated profile for ${updated.name || 'student'}`);
  };

  const handleDeleteStudent = (classId: string, studentId: string) => {
    updateAppData((prev) => {
      const classes = prev.classes.map((c) => {
        if (c.id !== classId) return c;
        const students = c.students.filter((s) => s.id !== studentId);
        return { ...c, students };
      });
      return { ...prev, classes };
    });
    handleAddAuditLog('Remove Student', `Removed student record ID ${studentId}`);
  };

  const handleBulkUploadStudents = (
    classId: string,
    newStudents: (Partial<Student> & { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other' })[]
  ) => {
    updateAppData((prev) => {
      const classes = prev.classes.map((c) => {
        if (c.id !== classId) return c;
        const formatted: Student[] = newStudents.map((s) => ({
          id: s.id || generateId('stu'),
          admissionNumber: s.admissionNumber || generateAdmissionNumber(),
          rollNo: s.rollNo,
          name: s.name,
          gender: s.gender,
          parentName: s.parentName,
          parentContact: s.parentContact,
          dob: s.dob,
          address: s.address,
          bloodGroup: s.bloodGroup,
          status: s.status || 'approved',
          studentStatus: s.studentStatus || 'active',
          results: s.results || {},
          attendance: s.attendance || {},
          remarks: s.remarks || {},
        }));
        return {
          ...c,
          students: [...c.students, ...formatted],
        };
      });
      return { ...prev, classes };
    });
    handleAddAuditLog('Bulk Student Upload', `Imported ${newStudents.length} students via CSV with parent records`);
  };

  // --- Handlers for Marks ---
  const handleApproveMarks = (classId: string, year: string, semester: string, subjectName: string) => {
    setAppData((prev) => {
      const newClasses = prev.classes.map((cls) => {
        if (cls.id !== classId) return cls;
        return {
          ...cls,
          students: cls.students.map((student) => {
            const results = student.results || {};
            const yearData = results[year] || {};
            const semData = yearData[semester] || {};
            const subData = semData[subjectName] || { marks: {}, total: 0 };
            
            return {
              ...student,
              results: {
                ...results,
                [year]: {
                  ...yearData,
                  [semester]: {
                    ...semData,
                    [subjectName]: {
                      ...subData,
                      approved: true,
                      approvedBy: currentUser?.id,
                    }
                  }
                }
              }
            };
          }),
        };
      });
      return { ...prev, classes: newClasses };
    });
    alert(`Marks for ${subjectName} approved successfully!`);
  };

  const handleRejectMarks = (classId: string, year: string, semester: string, subjectName: string) => {
    setAppData((prev) => {
      const newClasses = prev.classes.map((cls) => {
        if (cls.id !== classId) return cls;
        return {
          ...cls,
          students: cls.students.map((student) => {
            const results = student.results || {};
            const yearData = results[year] || {};
            const semData = yearData[semester] || {};
            const subData = semData[subjectName] || { marks: {}, total: 0 };
            
            return {
              ...student,
              results: {
                ...results,
                [year]: {
                  ...yearData,
                  [semester]: {
                    ...semData,
                    [subjectName]: {
                      ...subData,
                      approved: false, // explicitly false means rejected
                      approvedBy: undefined,
                    }
                  }
                }
              }
            };
          }),
        };
      });
      return { ...prev, classes: newClasses };
    });
    alert(`Marks for ${subjectName} have been rejected.`);
  };

  const handleSaveStudentMarks = (
    classId: string,
    year: string,
    semester: string,
    subjectName: string,
    marksMap: Record<string, { marks: Record<string, number>; total: number; previousMarks?: Record<string, number>; editRemark?: string; lastEditedAt?: string }>
  ) => {
    updateAppData((prev) => {
      const classes = prev.classes.map((c) => {
        if (c.id !== classId) return c;

        const students = c.students.map((student) => {
          const entry = marksMap[student.id];
          if (!entry) return student;

          const results = { ...(student.results || {}) };
          if (!results[year]) results[year] = {};
          if (!results[year][semester]) results[year][semester] = {};

          
          // Preserve approved status if updating an existing entry
          const existingEntry = results[year][semester][subjectName];
          results[year][semester][subjectName] = {
            ...entry,
            approved: existingEntry?.approved,
            approvedBy: existingEntry?.approvedBy,
          };

          return {
            ...student,
            results,
          };
        });

        return { ...c, students };
      });

      return { ...prev, classes };
    });

    handleAddAuditLog(
      'Enter Subject Marks',
      `Saved scores for subject ${subjectName} (${semester} ${year})`
    );
  };

  // --- Handlers for Calendar Events ---
  const handleSaveEvent = (event: typeof appData.events[0]) => {
    updateAppData((prev) => {
      const events = prev.events || [];
      const existing = events.findIndex(e => e.id === event.id);
      if (existing >= 0) {
        events[existing] = event;
      } else {
        events.push(event);
      }
      return { ...prev, events: [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) };
    });
    handleAddAuditLog('Calendar Update', `Saved event: ${event.title}`);
  };

  const handleDeleteEvent = (id: string) => {
    updateAppData((prev) => {
      const events = (prev.events || []).filter(e => e.id !== id);
      return { ...prev, events };
    });
    handleAddAuditLog('Calendar Update', `Deleted event ID: ${id}`);
  };

  const handleUpdateLevels = (levels: typeof appData.levels) => {
    updateAppData((prev) => ({
      ...prev,
      levels,
    }));
  };

  // --- Handlers for Settings & Recovery ---
  const handleUpdateSettings = (settings: Settings) => {
    updateAppData((prev) => ({
      ...prev,
      settings,
    }));
  };

  const handleRestoreData = (restored: AppData) => {
    setAppData(restored);
    saveAppData(restored);
    setSelectedClassId(restored.classes[0]?.id || null);
  };

  const handleFactoryReset = () => {
    localStorage.removeItem(DB_STORAGE_KEY);
    setAppData(DEFAULT_APP_DATA);
    saveAppData(DEFAULT_APP_DATA);
    setSelectedClassId(DEFAULT_APP_DATA.classes[0]?.id || null);
    setView('landing');
  };

  // Landing Page View
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#001F3F] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00A896]/20 blur-[100px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center gap-6"
        >
          {/* Logo animation */}
          <div className="relative">
            <motion.img 
              src="/icon.svg" 
              alt="ScholarLite Logo" 
              className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-2xl z-10 relative"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Spinning ring around the logo */}
            <motion.div 
              className="absolute -inset-4 border border-dashed border-[#00A896]/30 rounded-[35px] sm:rounded-[40px] z-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute -inset-8 border border-[#00A896]/10 rounded-[45px] sm:rounded-[50px] z-0"
              animate={{ rotate: -360, scale: [1, 1.05, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-cinzel"
            >
              ScholarLite
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[#00A896] text-sm sm:text-base font-medium tracking-wide uppercase"
            >
              Initializing Workspace
            </motion.p>
          </div>

          {/* Progress bar */}
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100%" }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-48 sm:w-64 h-1 mt-4 bg-white/10 rounded-full overflow-hidden"
          >
            <motion.div 
              className="h-full bg-gradient-to-r from-[#00E5FF] to-[#00A896] rounded-full"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <LandingView
        appData={appData}
        currentUser={currentUser}
        onEnter={(asUser) => {
          if (asUser) {
            handleSelectUser(asUser);
          }
          setView('dashboard');
        }}
      />
    );
  }

  // Define tab navigation based on current role permissions
  const allNavItems = [
    { id: 'overview', label: 'Overview', icon: Home, roles: ['super_admin', 'school_admin', 'admin', 'class_teacher', 'subject_teacher'] },
    { id: 'registrar', label: 'Registrar Office', icon: Building2, roles: ['super_admin', 'school_admin', 'admin'] },
    { id: 'hcm', label: 'HCM (Human Capital)', icon: Users, roles: ['super_admin', 'school_admin', 'admin'] },
    { id: 'teacher_dashboard', label: 'Teacher Dashboard', icon: UserCheck, roles: ['class_teacher', 'subject_teacher'] },
    { id: 'calendar', label: 'Calendar', icon: Calendar, roles: ['super_admin', 'school_admin', 'admin', 'class_teacher', 'subject_teacher'] },
    { id: 'manage_classes', label: 'Classes', icon: Building2, roles: ['super_admin', 'school_admin', 'admin'] },
    { id: 'manage_subjects', label: 'Subjects', icon: BookOpen, roles: ['super_admin', 'school_admin', 'admin'] },
    { id: 'manage_students', label: 'Students', icon: Users, roles: ['super_admin', 'school_admin', 'admin', 'class_teacher'] },
    { id: 'manage_staff', label: 'School Organization', icon: Network, roles: ['super_admin', 'school_admin', 'admin'] },
    { id: 'manage_levels', label: 'School Levels', icon: Layers, roles: ['super_admin'] },
    { id: 'results', label: 'Results & Reports', icon: FileSpreadsheet, roles: ['super_admin', 'school_admin', 'admin', 'class_teacher', 'subject_teacher'] },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, roles: ['super_admin', 'school_admin', 'admin'] },
  ] as const;

  const hasRole = (roles: readonly string[]) => {
    if (currentUser.roles && currentUser.roles.length > 0) {
      return currentUser.roles.some((r) => roles.includes(r as any));
    }
    return roles.includes(currentUser.role as any);
  };

  const navItems = allNavItems.filter((item) => hasRole(item.roles));

  // Determine active student for student portal
  const firstClass = appData.classes[0];
  const activeStudentId = firstClass?.students[0]?.id || '';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-gray-800">
      {/* Top Navbar */}
            <Navbar
        appData={appData}
        currentUser={currentUser}
        lastSyncTime={lastSyncTime}
        onLogout={() => {
          if (auth.currentUser) {
            signOut(auth);
          } else {
            setView('landing');
          }
        }}
        onOpenRoleSwitcher={['super_admin', 'school_admin', 'admin'].includes(currentUser.role) ? () => setIsRoleSwitcherOpen(true) : undefined}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* If user is Student, provide dedicated Student Portal */}
        {currentUser.role === 'student' ? (
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              <StudentPortal
                appData={appData}
                    currentUser={currentUser}
                studentId={activeStudentId}
                classId={firstClass?.id}
              />
            </div>
          </main>
        ) : (
          <>
            {/* Sidebar for Desktop */}
            <aside className={`hidden md:flex bg-[#003366] text-white flex-col justify-between py-6 flex-shrink-0 transition-all duration-300 no-print ${isSidebarCollapsed ? 'w-20 px-2' : 'w-64 px-3'}`}>
              <div className="space-y-1">
                <div className="flex items-center justify-between px-3 pb-3">
                  {!isSidebarCollapsed && (
                    <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                      Navigation
                    </span>
                  )}
                  <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors mx-auto"
                    title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                  >
                    {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                  </button>
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      title={isSidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 py-3 rounded-xl font-semibold text-sm transition cursor-pointer ${
                        isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5'
                      } ${
                        isActive
                          ? 'bg-[#00A896] text-white shadow-sm'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </div>

              {/* Sidebar Footer */}
              <div className={`pt-6 border-t border-white/10 px-3 space-y-1 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
                <div className="font-semibold text-white/80 text-xs truncate">{appData.settings.name}</div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Offline Storage Active</span>
                </div>
                <div className="text-[11px] text-[#FFC300]">v8.9 &bull; PWA RBAC Edition</div>
              </div>
            </aside>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
              <div className="fixed inset-0 z-40 md:hidden no-print">
                <div
                  className="fixed inset-0 bg-black/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <div className="fixed inset-y-0 left-0 w-64 bg-[#003366] text-white p-5 flex flex-col justify-between shadow-xl">
                  <div>
                    <div className="flex items-center gap-3 pb-6 border-b border-white/10 mb-4">
                      <img
                        src={appData.settings.logo || '/icon.svg'}
                        alt="Logo"
                        className="w-8 h-8 rounded-lg"
                      />
                      <span className="font-bold text-sm truncate">{appData.settings.name}</span>
                    </div>
                    <div className="space-y-1">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id as any);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition cursor-pointer ${
                              isActive
                                ? 'bg-[#00A896] text-white'
                                : 'text-white/80 hover:bg-white/10'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setView('landing');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white pt-4 border-t border-white/10 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Return to Welcome Screen</span>
                  </button>
                </div>
              </div>
            )}

            {/* Main Workspace */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                {activeTab === 'overview' && (
                  <OverviewTab
                    appData={appData}
                    currentUser={currentUser}
                    onNavigateTab={(tab) => setActiveTab(tab as any)}
                    onSelectClass={(id) => setSelectedClassId(id)}
                  />
                )}

                {activeTab === 'registrar' && (
                  <RegistrarTab
                    appData={appData}
                    currentUser={currentUser}
                    onAddStudent={handleAddStudent}
                    onUpdateStudent={handleUpdateStudent}
                    onDeleteStudent={handleDeleteStudent}
                    onBulkUploadStudents={handleBulkUploadStudents}
                    onUpdateUsers={handleUpdateUsers}
                    onAddAuditLog={handleAddAuditLog}
                  />
                )}

                {activeTab === 'teacher_dashboard' && (
                  <TeacherDashboardTab
                    appData={appData}
                    currentUser={currentUser}
                    onNavigateTab={(tab) => setActiveTab(tab as any)}
                  />
                )}

                {activeTab === 'calendar' && (
                  <CalendarTab
                    appData={appData}
                    currentUser={currentUser}
                    onSaveEvent={handleSaveEvent}
                    onDeleteEvent={handleDeleteEvent}
                  />
                )}

                {activeTab === 'classes' && (
                  <ClassesTab
                    appData={appData}
                    currentUser={currentUser}
                    classes={appData.classes}
                    selectedClassId={selectedClassId}
                    onSelectClass={setSelectedClassId}
                    onAddClass={handleAddClass}
                    onDeleteClass={handleDeleteClass}
                    onSaveSubject={handleSaveSubject}
                    onDeleteSubject={handleDeleteSubject}
                    onAddStudent={handleAddStudent}
                    onUpdateStudent={handleUpdateStudent}
                    onDeleteStudent={handleDeleteStudent}
                    onBulkUploadStudents={handleBulkUploadStudents}
                    onEditRemarksAttendance={(student, className) =>
                      setEditingRemarksStudent({ student, className })
                    }
                  />
                )}
                {activeTab === 'manage_classes' && (
                  <AdminSchoolClassManagementTab
                    appData={appData}
                    onUpdateClasses={(classes) => {
                      updateAppData((prev) => ({ ...prev, classes }));
                    }}
                    onUpdateLevels={(levels) => {
                      updateAppData((prev) => ({ ...prev, levels }));
                    }}
                    onAddAuditLog={handleAddAuditLog}
                  />
                )}
                {activeTab === 'manage_subjects' && (
                  <ManageSubjectsTab
                    appData={appData}
                    
                    onSaveSubject={handleSaveSubject}
                    onDeleteSubject={handleDeleteSubject}
                  />
                )}
                {activeTab === 'manage_students' && (
                  <ManageStudentsTab
                    appData={appData}
                    currentUser={currentUser}
                    onAddStudent={handleAddStudent}
                    onUpdateStudent={handleUpdateStudent}
                    onDeleteStudent={handleDeleteStudent}
                  />
                )}
                {activeTab === 'manage_staff' && (
                  <ManageStaffTab
                    appData={appData}
                    
                    onUpdateUsers={(users) => {
                      updateAppData((prev) => ({ ...prev, users }));
                    }}
                    onAddAuditLog={handleAddAuditLog}
                  />
                )}
                {activeTab === 'hcm' && (
                  <HcmTab
                    appData={appData}
                    onUpdateUsers={(users) => {
                      updateAppData((prev) => ({ ...prev, users }));
                    }}
                    onAddAuditLog={handleAddAuditLog}
                  />
                )}
                {activeTab === 'manage_levels' && (
                  <ManageLevelsTab
                    appData={appData}
                    
                    onUpdateLevels={(levels) => {
                      updateAppData((prev) => ({ ...prev, levels }));
                    }}
                    onAddAuditLog={handleAddAuditLog}
                  />
                )}


                {activeTab === 'results' && (
                  <ResultsTab
                    appData={appData}
                    currentUser={currentUser}
                    initialClassId={selectedClassId}
                    onApproveMarks={handleApproveMarks}
                    onRejectMarks={handleRejectMarks}
              onSaveStudentMarks={handleSaveStudentMarks}
                    onEditRemarksAttendance={(student) => {
                      const foundClass = appData.classes.find((c) =>
                        c.students.some((s) => s.id === student.id)
                      );
                      setEditingRemarksStudent({
                        student,
                        className: foundClass?.name || '',
                      });
                    }}
                  />
                )}

                {activeTab === 'settings' && currentUser.role === 'admin' && (
                  <SettingsTab
                    appData={appData}
                    currentUser={currentUser}
                    onUpdateSettings={handleUpdateSettings}
                    onUpdateLevels={handleUpdateLevels}
                    onRestoreData={handleRestoreData}
                    onFactoryReset={handleFactoryReset}
                    onUpdateUsers={handleUpdateUsers}
                    onAddAuditLog={handleAddAuditLog}
                  />
                )}
              </div>
            </main>
          </>
        )}
      </div>

      {/* Role Switcher Persona Modal */}
      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
        users={appData.users || []}
        currentUser={currentUser}
        onSelectUser={(user) => {
          setIsRoleSwitcherOpen(false);
          handleSelectUser(user);
        }}
      />

      {/* Role Transition Loader */}
      {roleTransitionState && (
        <RoleTransitionLoader
          user={roleTransitionState.user}
          targetDashboard={roleTransitionState.targetDashboard}
          onComplete={handleCompleteRoleTransition}
        />
      )}

      {/* Edit Student Remarks & Attendance Modal */}
      <EditRemarksAttendanceModal
        isOpen={!!editingRemarksStudent}
        onClose={() => setEditingRemarksStudent(null)}
        student={editingRemarksStudent?.student || null}
        className={editingRemarksStudent?.className || ''}
        year={appData.settings.academicYear}
        term={appData.settings.semesters[0] || 'Term 1'}
        onSave={handleSaveRemarksAttendance}
      />

      
      {/* Auto-save Toast */}
      <AnimatePresence>
        {showSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-gray-900/90 backdrop-blur-sm text-white rounded-xl shadow-lg border border-gray-700/50 pointer-events-none"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium">Auto-saved</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
