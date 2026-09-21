import React, { useState, useMemo, useRef } from 'react';
import {
  Users,
  GraduationCap,
  ShieldCheck,
  Building2,
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  Printer,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  FileText,
  Edit2,
  Trash2,
  ChevronRight,
  UserCheck,
  BookOpen,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Award,
  MoreVertical,
  Check,
  X,
  CreditCard,
  Briefcase
} from 'lucide-react';
import {
  AppData,
  SchoolClass,
  Student,
  UserProfile,
  UserRole,
  Settings
} from '../types';
import { EditStudentModal } from './EditStudentModal';
import { OfficialDocumentModal, DocumentType } from './OfficialDocumentModal';
import { PrintIdCardsModal } from './PrintIdCardsModal';
import { BulkStudentUploadModal } from './BulkStudentUploadModal';
import { generateId } from '../utils/storage';

interface RegistrarTabProps {
  appData: AppData;
  currentUser: UserProfile;
  onAddStudent: (classId: string, student: Partial<Student> & { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other' }) => void;
  onUpdateStudent: (classId: string, student: Partial<Student> & { id: string }) => void;
  onDeleteStudent: (classId: string, studentId: string) => void;
  onBulkUploadStudents: (classId: string, students: any[]) => void;
  onUpdateUsers: (users: UserProfile[]) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export const RegistrarTab: React.FC<RegistrarTabProps> = ({
  appData,
  currentUser,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBulkUploadStudents,
  onUpdateUsers,
  onAddAuditLog,
}) => {
  // Navigation Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<'students' | 'faculty' | 'workload' | 'approvals' | 'documents'>('students');

  // Student Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>('all');

  // Teacher Filters
  const [staffSearch, setStaffSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedStaffRoleFilter, setSelectedStaffRoleFilter] = useState<string>('all');
  const [selectedStaffStatusFilter, setSelectedStaffStatusFilter] = useState<string>('all');

  // Selection for bulk operations
  const [selectedStudentKeys, setSelectedStudentKeys] = useState<string[]>([]); // Format: "classId:studentId"

  // Modals state
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [editingStudentData, setEditingStudentData] = useState<{ student: Student; classId: string } | null>(null);

  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTargetStudent, setTransferTargetStudent] = useState<{ student: Student; classId: string } | null>(null);
  const [targetTransferClassId, setTargetTransferClassId] = useState<string>('');

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffUser, setEditingStaffUser] = useState<UserProfile | null>(null);

  // Document modal
  const [docModalConfig, setDocModalConfig] = useState<{
    isOpen: boolean;
    type: DocumentType;
    student?: Student | null;
    schoolClass?: SchoolClass | null;
    teacher?: UserProfile | null;
  }>({
    isOpen: false,
    type: 'enrollment_cert',
  });

  // ID Cards Modal
  const [idCardModalClass, setIdCardModalClass] = useState<SchoolClass | null>(null);

  // Bulk Upload Modal
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);

  // Bulk Promotion/Transfer Wizard State
  const [isBulkWizardOpen, setIsBulkWizardOpen] = useState(false);
  const [bulkWizardActionType, setBulkWizardActionType] = useState<'migrate' | 'status'>('migrate');
  const [bulkWizardTargetClassId, setBulkWizardTargetClassId] = useState<string>(appData.classes[0]?.id || '');
  const [bulkWizardNewStatus, setBulkWizardNewStatus] = useState<'active' | 'graduated' | 'transferred' | 'suspended'>('active');

  // CSV File Input ref
  const csvInputRef = useRef<HTMLInputElement | null>(null);

  // Form states for New Student Registration
  const [enrollClassId, setEnrollClassId] = useState(appData.classes[0]?.id || '');
  const [enrollRollNo, setEnrollRollNo] = useState('');
  const [enrollName, setEnrollName] = useState('');
  const [enrollGender, setEnrollGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [enrollParentName, setEnrollParentName] = useState('');
  const [enrollParentContact, setEnrollParentContact] = useState('');
  const [enrollDob, setEnrollDob] = useState('');
  const [enrollAddress, setEnrollAddress] = useState('');
  const [enrollBloodGroup, setEnrollBloodGroup] = useState('');
  const [enrollStatus, setEnrollStatus] = useState<'active' | 'pending'>('active');

  // Form states for Faculty Member
  const [staffFormName, setStaffFormName] = useState('');
  const [staffFormUsername, setStaffFormUsername] = useState('');
  const [staffFormPassword, setStaffFormPassword] = useState('');
  const [staffFormTitle, setStaffFormTitle] = useState('');
  const [staffFormEmail, setStaffFormEmail] = useState('');
  const [staffFormPhone, setStaffFormPhone] = useState('');
  const [staffFormDept, setStaffFormDept] = useState('Academic');
  const [staffFormRoles, setStaffFormRoles] = useState<UserRole[]>(['class_teacher']);
  const [staffFormStatus, setStaffFormStatus] = useState<'active' | 'leave' | 'terminated'>('active');
  const [staffFormAssignedClassId, setStaffFormAssignedClassId] = useState<string>('');
  const [staffFormSubjects, setStaffFormSubjects] = useState<string[]>([]);

  // Collect all students flatly with their class
  const allFlatStudents = useMemo(() => {
    return appData.classes.flatMap((c) =>
      c.students.map((s) => ({
        student: s,
        schoolClass: c,
        key: `${c.id}:${s.id}`,
      }))
    );
  }, [appData.classes]);

  // Overall Statistics
  const totalStudents = allFlatStudents.length;
  const activeStudentsCount = allFlatStudents.filter(s => (s.student.studentStatus || 'active') === 'active' && s.student.status !== 'pending').length;
  const pendingStudentsCount = allFlatStudents.filter(s => s.student.status === 'pending').length;
  const graduatedStudentsCount = allFlatStudents.filter(s => s.student.studentStatus === 'graduated').length;
  const transferredStudentsCount = allFlatStudents.filter(s => s.student.studentStatus === 'transferred').length;

  const maleCount = allFlatStudents.filter(s => s.student.gender === 'Male').length;
  const femaleCount = allFlatStudents.filter(s => s.student.gender === 'Female').length;
  const otherGenderCount = allFlatStudents.filter(s => s.student.gender === 'Other').length;

  const totalStaffCount = appData.users.length;
  const teachersCount = appData.users.filter(u => u.role === 'class_teacher' || u.role === 'subject_teacher' || u.roles?.includes('class_teacher') || u.roles?.includes('subject_teacher')).length;
  const studentToTeacherRatio = teachersCount > 0 ? Math.round(totalStudents / teachersCount) : totalStudents;

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return allFlatStudents.filter(({ student, schoolClass }) => {
      if (selectedClassFilter !== 'all' && schoolClass.id !== selectedClassFilter) return false;
      if (selectedGenderFilter !== 'all' && student.gender !== selectedGenderFilter) return false;
      if (selectedStatusFilter !== 'all') {
        if (selectedStatusFilter === 'pending' && student.status !== 'pending') return false;
        if (selectedStatusFilter !== 'pending' && (student.studentStatus || 'active') !== selectedStatusFilter) return false;
      }

      if (!studentSearch.trim()) return true;
      const q = studentSearch.toLowerCase();
      return (
        student.name.toLowerCase().includes(q) ||
        (student.admissionNumber || '').toLowerCase().includes(q) ||
        student.rollNo.toString().includes(q) ||
        (student.parentName || '').toLowerCase().includes(q) ||
        (student.parentContact || '').toLowerCase().includes(q)
      );
    });
  }, [allFlatStudents, selectedClassFilter, selectedGenderFilter, selectedStatusFilter, studentSearch]);

  // Filtered Staff
  const filteredStaff = useMemo(() => {
    return appData.users.filter((user) => {
      if (selectedDeptFilter !== 'all' && user.department !== selectedDeptFilter) return false;
      if (selectedStaffRoleFilter !== 'all') {
        const roles = user.roles || [user.role];
        if (!roles.includes(selectedStaffRoleFilter as any)) return false;
      }
      if (selectedStaffStatusFilter !== 'all' && (user.staffStatus || 'active') !== selectedStaffStatusFilter) return false;

      if (!staffSearch.trim()) return true;
      const q = staffSearch.toLowerCase();
      return (
        user.name.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q) ||
        (user.email || '').toLowerCase().includes(q) ||
        (user.title || '').toLowerCase().includes(q) ||
        (user.department || '').toLowerCase().includes(q)
      );
    });
  }, [appData.users, selectedDeptFilter, selectedStaffRoleFilter, selectedStaffStatusFilter, staffSearch]);

  // Unique Departments
  const departments = useMemo(() => {
    const set = new Set(appData.users.map(u => u.department).filter(Boolean));
    return Array.from(set) as string[];
  }, [appData.users]);

  // Unique Subjects across school
  const allSchoolSubjects = useMemo(() => {
    const set = new Set(appData.classes.flatMap(c => c.subjects.map(s => s.name)));
    return Array.from(set).sort();
  }, [appData.classes]);

  // Handle Quick Enroll
  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollClassId || !enrollName.trim() || !enrollRollNo) return;

    onAddStudent(enrollClassId, {
      rollNo: parseInt(enrollRollNo, 10),
      name: enrollName.trim(),
      gender: enrollGender,
      parentName: enrollParentName.trim() || undefined,
      parentContact: enrollParentContact.trim() || undefined,
      dob: enrollDob || undefined,
      address: enrollAddress.trim() || undefined,
      bloodGroup: enrollBloodGroup.trim() || undefined,
      status: enrollStatus,
      studentStatus: 'active',
    });

    onAddAuditLog('Registrar Enrollment', `Officially enrolled ${enrollName.trim()} to class`);

    // Reset Form
    setEnrollName('');
    setEnrollRollNo('');
    setEnrollParentName('');
    setEnrollParentContact('');
    setEnrollDob('');
    setEnrollAddress('');
    setEnrollBloodGroup('');
    setIsEnrollModalOpen(false);
  };

  // Handle Transfer / Promotion
  const handleExecuteTransfer = () => {
    if (!transferTargetStudent || !targetTransferClassId || transferTargetStudent.classId === targetTransferClassId) {
      alert('Please choose a different target class for transfer.');
      return;
    }

    const { student, classId: sourceClassId } = transferTargetStudent;
    const targetClass = appData.classes.find(c => c.id === targetTransferClassId);
    if (!targetClass) return;

    // Calculate next available roll in target class
    const nextRollNo = targetClass.students.length > 0
      ? Math.max(...targetClass.students.map(s => s.rollNo)) + 1
      : 1;

    // 1. Remove from source class
    onDeleteStudent(sourceClassId, student.id);

    // 2. Add to target class with preserved history
    onAddStudent(targetTransferClassId, {
      ...student,
      rollNo: nextRollNo,
      studentStatus: 'active',
    });

    onAddAuditLog(
      'Student Transfer',
      `Transferred ${student.name} from ${appData.classes.find(c => c.id === sourceClassId)?.name} to ${targetClass.name} (Assigned Roll #${nextRollNo})`
    );

    setIsTransferModalOpen(false);
    setTransferTargetStudent(null);
  };

  // Bulk Approve Selected
  const handleBulkApprove = () => {
    if (selectedStudentKeys.length === 0) return;
    selectedStudentKeys.forEach(key => {
      const [classId, studentId] = key.split(':');
      onUpdateStudent(classId, { id: studentId, status: 'approved' });
    });
    onAddAuditLog('Bulk Student Approval', `Approved ${selectedStudentKeys.length} student registrations`);
    setSelectedStudentKeys([]);
  };

  // Bulk Status Change
  const handleBulkChangeStatus = (newStatus: 'active' | 'graduated' | 'transferred' | 'suspended') => {
    if (selectedStudentKeys.length === 0) return;
    selectedStudentKeys.forEach(key => {
      const [classId, studentId] = key.split(':');
      onUpdateStudent(classId, { id: studentId, studentStatus: newStatus });
    });
    onAddAuditLog('Bulk Status Update', `Updated status to "${newStatus}" for ${selectedStudentKeys.length} students`);
    setSelectedStudentKeys([]);
  };

  // Bulk Promotion/Transfer Wizard Execution
  const handleExecuteBulkWizard = () => {
    if (selectedStudentKeys.length === 0) return;

    if (bulkWizardActionType === 'migrate') {
      if (!bulkWizardTargetClassId) {
        alert('Please select a target destination class level.');
        return;
      }
      const targetClass = appData.classes.find(c => c.id === bulkWizardTargetClassId);
      if (!targetClass) return;

      let successCount = 0;
      selectedStudentKeys.forEach(key => {
        const [sourceClassId, studentId] = key.split(':');
        if (sourceClassId === bulkWizardTargetClassId) return;

        const sourceClass = appData.classes.find(c => c.id === sourceClassId);
        const student = sourceClass?.students.find(s => s.id === studentId);
        if (!student) return;

        const nextRollNo = targetClass.students.length > 0
          ? Math.max(...targetClass.students.map(s => s.rollNo)) + 1 + successCount
          : 1 + successCount;

        onDeleteStudent(sourceClassId, studentId);
        onAddStudent(bulkWizardTargetClassId, {
          ...student,
          rollNo: nextRollNo,
          studentStatus: 'active',
        });
        successCount++;
      });

      onAddAuditLog(
        'Bulk Promotion / Transfer Wizard',
        `Successfully migrated ${successCount} students to class cohort ${targetClass.name}`
      );
    } else {
      selectedStudentKeys.forEach(key => {
        const [classId, studentId] = key.split(':');
        onUpdateStudent(classId, { id: studentId, studentStatus: bulkWizardNewStatus });
      });
      onAddAuditLog(
        'Bulk Status Update (Wizard)',
        `Updated registry status to "${bulkWizardNewStatus}" for ${selectedStudentKeys.length} students`
      );
    }

    setIsBulkWizardOpen(false);
    setSelectedStudentKeys([]);
  };

  // Export Student Registry CSV
  const handleExportStudentCSV = () => {
    const headers = [
      'Admission Number',
      'Roll Number',
      'Class Name',
      'Student Name',
      'Gender',
      'Parent Name',
      'Parent Contact',
      'Date of Birth',
      'Blood Group',
      'Address',
      'Status',
      'Registry Status'
    ];

    const rows = filteredStudents.map(({ student, schoolClass }) => [
      student.admissionNumber || '',
      student.rollNo,
      schoolClass.name,
      `"${student.name.replace(/"/g, '""')}"`,
      student.gender,
      `"${(student.parentName || '').replace(/"/g, '""')}"`,
      `"${student.parentContact || ''}"`,
      student.dob || '',
      student.bloodGroup || '',
      `"${(student.address || '').replace(/"/g, '""')}"`,
      student.status || 'approved',
      student.studentStatus || 'active'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Student_Registry_${appData.settings.academicYear.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Staff Form Open
  const handleOpenStaffModal = (user?: UserProfile) => {
    if (user) {
      setEditingStaffUser(user);
      setStaffFormName(user.name);
      setStaffFormUsername(user.username);
      setStaffFormPassword(user.password || '');
      setStaffFormTitle(user.title || '');
      setStaffFormEmail(user.email || '');
      setStaffFormPhone(user.phone || '');
      setStaffFormDept(user.department || 'Academic');
      setStaffFormRoles(user.roles || [user.role]);
      setStaffFormStatus(user.staffStatus || 'active');
      setStaffFormAssignedClassId(user.assignedClassId || user.assignedClassIds?.[0] || '');
      setStaffFormSubjects(user.assignedSubjects || []);
    } else {
      setEditingStaffUser(null);
      setStaffFormName('');
      setStaffFormUsername(`staff_${Math.floor(100 + Math.random() * 900)}`);
      setStaffFormPassword('password123');
      setStaffFormTitle('Teacher');
      setStaffFormEmail('');
      setStaffFormPhone('');
      setStaffFormDept('Academic');
      setStaffFormRoles(['class_teacher']);
      setStaffFormStatus('active');
      setStaffFormAssignedClassId(appData.classes[0]?.id || '');
      setStaffFormSubjects([]);
    }
    setIsStaffModalOpen(true);
  };

  // Handle Staff Save
  const handleSaveStaffForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFormName.trim() || !staffFormUsername.trim() || staffFormRoles.length === 0) return;

    let updatedUsers = [...appData.users];
    const isEditing = Boolean(editingStaffUser);

    if (isEditing && editingStaffUser) {
      updatedUsers = updatedUsers.map(u => {
        if (u.id === editingStaffUser.id) {
          return {
            ...u,
            name: staffFormName.trim(),
            username: staffFormUsername.trim(),
            password: staffFormPassword || u.password,
            title: staffFormTitle.trim(),
            email: staffFormEmail.trim(),
            phone: staffFormPhone.trim(),
            department: staffFormDept.trim(),
            roles: staffFormRoles,
            role: staffFormRoles[0],
            staffStatus: staffFormStatus,
            assignedClassId: staffFormAssignedClassId || undefined,
            assignedClassIds: staffFormAssignedClassId ? [staffFormAssignedClassId] : [],
            assignedSubjects: staffFormSubjects,
          };
        }
        return u;
      });
      onAddAuditLog('Update Faculty Record', `Updated credentials and role for ${staffFormName}`);
    } else {
      const newUser: UserProfile = {
        id: generateId('usr'),
        name: staffFormName.trim(),
        username: staffFormUsername.trim(),
        password: staffFormPassword || 'password123',
        title: staffFormTitle.trim() || 'Teacher',
        email: staffFormEmail.trim(),
        phone: staffFormPhone.trim(),
        department: staffFormDept.trim(),
        roles: staffFormRoles,
        role: staffFormRoles[0],
        staffStatus: staffFormStatus,
        assignedClassId: staffFormAssignedClassId || undefined,
        assignedClassIds: staffFormAssignedClassId ? [staffFormAssignedClassId] : [],
        assignedSubjects: staffFormSubjects,
        joinDate: new Date().toISOString().split('T')[0],
      };
      updatedUsers.push(newUser);
      onAddAuditLog('New Faculty Appointed', `Created faculty account for ${staffFormName} (${staffFormRoles.join(', ')})`);
    }

    onUpdateUsers(updatedUsers);
    setIsStaffModalOpen(false);
  };

  // Toggle selection
  const handleToggleSelectAll = () => {
    if (selectedStudentKeys.length === filteredStudents.length) {
      setSelectedStudentKeys([]);
    } else {
      setSelectedStudentKeys(filteredStudents.map(f => f.key));
    }
  };

  const handleToggleStudentKey = (key: string) => {
    setSelectedStudentKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner with Official School Identity */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#003366] text-amber-400 flex items-center justify-center shadow-sm">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#003366] tracking-tight">Office of the Registrar</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                Admin Exclusive
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Comprehensive student lifecycle, faculty allocations, registry archives, and official document bureau
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsEnrollModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00A896] hover:bg-[#008f80] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
          <button
            onClick={() => setIsBulkUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            title="Bulk CSV Enrolment"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Enrolment</span>
          </button>
          <button
            onClick={() => handleOpenStaffModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Add Faculty</span>
          </button>
          <button
            onClick={handleExportStudentCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition cursor-pointer"
            title="Export Registry CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Registrar Executive Vitals Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Enrolled</span>
            <GraduationCap className="w-4 h-4 text-[#003366]" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-[#003366]">{totalStudents}</span>
            <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
              <span className="text-emerald-700 font-semibold">{activeStudentsCount} Active</span>
              &bull;
              <span>{appData.classes.length} Cohorts</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Academic Faculty</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-gray-900">{totalStaffCount}</span>
            <div className="text-[11px] text-gray-500 mt-0.5">
              <span>{teachersCount} Teaching Staff</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Student/Teacher</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-gray-900">{studentToTeacherRatio} : 1</span>
            <div className="text-[11px] text-gray-500 mt-0.5">
              <span>Faculty Load Ratio</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Gender Ratio</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-blue-700">{maleCount} M</span>
              <span className="text-gray-300">/</span>
              <span className="text-base font-bold text-pink-700">{femaleCount} F</span>
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              <span>{otherGenderCount > 0 ? `${otherGenderCount} Other` : 'Balanced Cohort'}</span>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs flex flex-col justify-between ${
          pendingStudentsCount > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
            <Clock className={`w-4 h-4 ${pendingStudentsCount > 0 ? 'text-amber-600 animate-pulse' : 'text-gray-400'}`} />
          </div>
          <div className="mt-2">
            <span className={`text-2xl font-black ${pendingStudentsCount > 0 ? 'text-amber-700' : 'text-gray-900'}`}>
              {pendingStudentsCount}
            </span>
            <div className="text-[11px] text-gray-500 mt-0.5">
              {pendingStudentsCount > 0 ? (
                <button
                  onClick={() => {
                    setSelectedStatusFilter('pending');
                    setActiveSubTab('students');
                  }}
                  className="text-amber-800 font-bold hover:underline cursor-pointer"
                >
                  Review Admissions Queue &rarr;
                </button>
              ) : (
                <span className="text-emerald-700 font-semibold">All Admissions Cleared</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Registrar Navigation Sub-Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-xl px-2 py-1 shadow-xs gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'students'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student Registry ({totalStudents})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('faculty')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'faculty'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Faculty & Staff Directory ({totalStaffCount})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('workload')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'workload'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Academic Allocation & Workload</span>
        </button>

        <button
          onClick={() => setActiveSubTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap relative ${
            activeSubTab === 'approvals'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Clearance & Approvals</span>
          {pendingStudentsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('documents')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'documents'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Official Documents Bureau</span>
        </button>
      </div>

      {/* SUB-TAB 1: STUDENT REGISTRY & LIFECYCLE */}
      {activeSubTab === 'students' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search by student name, roll #, admission ID, parent name or phone..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-xs transition bg-gray-50/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium text-gray-700 bg-white outline-none focus:border-[#00A896]"
              >
                <option value="all">All Classes ({appData.classes.length})</option>
                {appData.classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.students.length})
                  </option>
                ))}
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium text-gray-700 bg-white outline-none focus:border-[#00A896]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Enrolled</option>
                <option value="pending">Pending Approval</option>
                <option value="graduated">Graduated</option>
                <option value="transferred">Transferred</option>
                <option value="suspended">Suspended</option>
              </select>

              <select
                value={selectedGenderFilter}
                onChange={(e) => setSelectedGenderFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium text-gray-700 bg-white outline-none focus:border-[#00A896]"
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Bulk Selection Actions Bar */}
          {selectedStudentKeys.length > 0 && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-teal-900">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>{selectedStudentKeys.length} Students Selected</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleBulkApprove}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
                >
                  Approve Selected
                </button>
                <button
                  onClick={() => handleBulkChangeStatus('active')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition cursor-pointer"
                >
                  Mark Active
                </button>
                <button
                  onClick={() => handleBulkChangeStatus('graduated')}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition cursor-pointer"
                >
                  Mark Graduated
                </button>
                <button
                  onClick={() => handleBulkChangeStatus('transferred')}
                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition cursor-pointer"
                >
                  Mark Transferred
                </button>
                <button
                  onClick={() => setIsBulkWizardOpen(true)}
                  className="px-3.5 py-1.5 bg-[#003366] hover:bg-[#002244] text-white font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Bulk Promotion / Transfer Wizard</span>
                </button>
                <button
                  onClick={() => setSelectedStudentKeys([])}
                  className="px-2.5 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-teal-100 rounded-lg transition cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Main Registry Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-8">
                    <input
                      type="checkbox"
                      checked={selectedStudentKeys.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={handleToggleSelectAll}
                      className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3">Roll & ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-3">Class Cohort</th>
                  <th className="py-3 px-3">Gender</th>
                  <th className="py-3 px-4">Parent / Guardian & Phone</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Registrar Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map(({ student, schoolClass, key }) => {
                  const isSelected = selectedStudentKeys.includes(key);
                  const isPending = student.status === 'pending';
                  const status = student.studentStatus || 'active';

                  return (
                    <tr
                      key={key}
                      className={`hover:bg-gray-50/80 transition ${isSelected ? 'bg-teal-50/30' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleStudentKey(key)}
                          className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-gray-900">#{student.rollNo}</div>
                        <div className="text-[10px] font-mono text-gray-500">{student.admissionNumber || 'PENDING'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 text-sm">{student.name}</div>
                        {student.dob && (
                          <div className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>DOB: {student.dob}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>{schoolClass.name}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          student.gender === 'Male' ? 'bg-blue-50 text-blue-700' :
                          student.gender === 'Female' ? 'bg-pink-50 text-pink-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {student.gender}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{student.parentName || <span className="text-gray-400 italic">Not recorded</span>}</div>
                        {student.parentContact ? (
                          <div className="text-[11px] text-teal-700 font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{student.parentContact}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400">No phone</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        ) : status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        ) : status === 'graduated' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-900 border border-purple-300">
                            Graduated
                          </span>
                        ) : status === 'transferred' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-800 border border-gray-300">
                            Transferred
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-900 border border-rose-300">
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isPending && (
                            <button
                              onClick={() => {
                                onUpdateStudent(schoolClass.id, { id: student.id, status: 'approved' });
                                onAddAuditLog('Student Approved', `Approved admission for ${student.name}`);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition cursor-pointer"
                              title="Approve Student Admission"
                            >
                              Approve
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditingStudentData({ student, classId: schoolClass.id });
                              setIsEditStudentOpen(true);
                            }}
                            className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit Student Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setTransferTargetStudent({ student, classId: schoolClass.id });
                              setTargetTransferClassId(appData.classes.find(c => c.id !== schoolClass.id)?.id || '');
                              setIsTransferModalOpen(true);
                            }}
                            className="p-1.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition cursor-pointer"
                            title="Transfer or Promote to Another Class"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setDocModalConfig({
                                isOpen: true,
                                type: 'enrollment_cert',
                                student,
                                schoolClass,
                              });
                            }}
                            className="p-1.5 text-gray-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                            title="Official Certificate of Enrollment"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setIdCardModalClass(schoolClass);
                            }}
                            className="p-1.5 text-gray-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                            title="Print Student ID Card"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Remove ${student.name} from the school registry? This will erase their enrollments.`)) {
                                onDeleteStudent(schoolClass.id, student.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Student Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="font-medium">No students match your criteria.</p>
                      <p className="text-[11px] text-gray-400 mt-1">Try resetting the search or filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: FACULTY & STAFF DIRECTORY */}
      {activeSubTab === 'faculty' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                placeholder="Search faculty by name, title, department, username or email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-xs transition bg-gray-50/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium text-gray-700 bg-white outline-none focus:border-[#00A896]"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              <select
                value={selectedStaffRoleFilter}
                onChange={(e) => setSelectedStaffRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium text-gray-700 bg-white outline-none focus:border-[#00A896]"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrator</option>
                <option value="class_teacher">Class Teacher</option>
                <option value="subject_teacher">Subject Teacher</option>
              </select>

              <select
                value={selectedStaffStatusFilter}
                onChange={(e) => setSelectedStaffStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium text-gray-700 bg-white outline-none focus:border-[#00A896]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="leave">On Leave</option>
                <option value="terminated">Terminated / Exited</option>
              </select>

              <button
                onClick={() => handleOpenStaffModal()}
                className="px-3.5 py-2 bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((user) => {
              const assignedClass = appData.classes.find(c => c.id === user.assignedClassId || user.assignedClassIds?.includes(c.id));
              const roles = user.roles || [user.role];

              return (
                <div
                  key={user.id}
                  className="bg-gray-50/50 rounded-2xl border border-gray-200 p-5 flex flex-col justify-between hover:border-gray-300 hover:shadow-sm transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#003366] text-white font-bold text-base flex items-center justify-center shadow-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm leading-tight">{user.name}</h4>
                          <span className="text-xs text-gray-500">{user.title || 'Staff Member'}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        user.staffStatus === 'leave'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : user.staffStatus === 'terminated'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {user.staffStatus || 'active'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                        <span>Department: <strong>{user.department || 'General Academic'}</strong></span>
                      </div>

                      {user.email && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      )}

                      {user.phone && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{user.phone}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                        <span>
                          Class Teacher:{' '}
                          {assignedClass ? (
                            <strong className="text-teal-800 font-bold">{assignedClass.name}</strong>
                          ) : (
                            <span className="text-gray-400 italic">None assigned</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Subjects taught */}
                    {user.assignedSubjects && user.assignedSubjects.length > 0 && (
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                          Teaching Subjects
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {user.assignedSubjects.map((sub) => (
                            <span key={sub} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-semibold">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 font-mono text-[11px] text-gray-400">
                      @{user.username}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setDocModalConfig({
                            isOpen: true,
                            type: 'faculty_appointment',
                            teacher: user,
                          });
                        }}
                        className="p-1.5 text-gray-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                        title="Official Appointment Order Document"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenStaffModal(user)}
                        className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Edit Faculty Record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove faculty account for ${user.name}?`)) {
                              onUpdateUsers(appData.users.filter(u => u.id !== user.id));
                              onAddAuditLog('Remove Faculty', `Removed faculty member: ${user.name}`);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete Faculty Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ACADEMIC ALLOCATION & WORKLOAD MATRIX */}
      {activeSubTab === 'workload' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900">Academic Allocation & Workload Matrix</h3>
              <p className="text-xs text-gray-500">Class teacher assignments, subject instructional coverage, and cohort rosters</p>
            </div>
          </div>

          <div className="space-y-4">
            {appData.classes.map((cls) => {
              // Find Class Teacher
              const classTeacher = appData.users.find(
                u => u.assignedClassId === cls.id || u.assignedClassIds?.includes(cls.id)
              );

              return (
                <div key={cls.id} className="border border-gray-200 rounded-2xl p-5 bg-gray-50/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base leading-tight">{cls.name}</h4>
                        <span className="text-xs text-gray-500 font-medium">
                          {cls.students.length} Enrolled Students &bull; {cls.subjects.length} Subjects Offered
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setDocModalConfig({
                            isOpen: true,
                            type: 'class_roster',
                            schoolClass: cls,
                          });
                        }}
                        className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Official Roster</span>
                      </button>

                      <button
                        onClick={() => setIdCardModalClass(cls)}
                        className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Print Class ID Cards</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Class Teacher Allocation */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between">
                      <div>
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                          Appointed Class Teacher
                        </span>
                        {classTeacher ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                              {classTeacher.name.charAt(0)}
                            </div>
                            <div>
                              <strong className="text-gray-900 block">{classTeacher.name}</strong>
                              <span className="text-[11px] text-gray-500">{classTeacher.email || `@${classTeacher.username}`}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-700 font-semibold">
                            <AlertTriangle className="w-4 h-4" />
                            <span>No Class Teacher Assigned</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenStaffModal(classTeacher || undefined)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition cursor-pointer text-[11px]"
                      >
                        {classTeacher ? 'Reassign' : 'Assign Now'}
                      </button>
                    </div>

                    {/* Subject Instructional Coverage */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block mb-2">
                        Curricular Subject Teachers
                      </span>
                      {cls.subjects.length > 0 ? (
                        <div className="space-y-1.5">
                          {cls.subjects.map((sub) => {
                            const subTeacher = appData.users.find(u => u.assignedSubjects?.includes(sub.name));
                            return (
                              <div key={sub.name} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-none">
                                <span className="font-semibold text-gray-800">{sub.name}</span>
                                {subTeacher ? (
                                  <span className="text-teal-700 font-medium text-[11px] flex items-center gap-1">
                                    <Check className="w-3 h-3 text-teal-500" /> {subTeacher.name}
                                  </span>
                                ) : (
                                  <span className="text-amber-600 italic text-[11px]">Unassigned</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No subjects configured for this class cohort yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: ADMISSIONS QUEUE & CLEARANCES */}
      {activeSubTab === 'approvals' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900">Admissions Queue & Academic Clearances</h3>
              <p className="text-xs text-gray-500">Verify new student admissions and school-wide administrative grade submission statuses</p>
            </div>

            {pendingStudentsCount > 0 && (
              <button
                onClick={() => {
                  allFlatStudents.filter(s => s.student.status === 'pending').forEach(({ student, schoolClass }) => {
                    onUpdateStudent(schoolClass.id, { id: student.id, status: 'approved' });
                  });
                  onAddAuditLog('Batch Admission Approval', `Approved all ${pendingStudentsCount} pending admission requests`);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Approve All Pending ({pendingStudentsCount})
              </button>
            )}
          </div>

          {/* Pending Review Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Pending Student Enrollment Applications ({pendingStudentsCount})
            </h4>

            {pendingStudentsCount > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-amber-50/60 border-b border-amber-200 text-amber-900 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Applicant Name</th>
                      <th className="py-3 px-3">Class Assigned</th>
                      <th className="py-3 px-3">Proposed Roll</th>
                      <th className="py-3 px-4">Guardian / Contact</th>
                      <th className="py-3 px-3">Gender</th>
                      <th className="py-3 px-4 text-right">Clearance Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allFlatStudents
                      .filter(s => s.student.status === 'pending')
                      .map(({ student, schoolClass }) => (
                        <tr key={student.id} className="hover:bg-amber-50/30 transition">
                          <td className="py-3 px-4 font-bold text-gray-900">{student.name}</td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-blue-800">{schoolClass.name}</span>
                          </td>
                          <td className="py-3 px-3 font-mono">#{student.rollNo}</td>
                          <td className="py-3 px-4 text-gray-600">
                            <div>{student.parentName || 'Recorded'}</div>
                            <div className="text-[10px] text-teal-700 font-mono">{student.parentContact || 'No contact'}</div>
                          </td>
                          <td className="py-3 px-3">{student.gender}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  onUpdateStudent(schoolClass.id, { id: student.id, status: 'approved' });
                                  onAddAuditLog('Admissions Clearance', `Approved admission for ${student.name}`);
                                }}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                              >
                                Approve Enrollment
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Reject enrollment for ${student.name}?`)) {
                                    onDeleteStudent(schoolClass.id, student.id);
                                    onAddAuditLog('Admissions Rejected', `Rejected enrollment application for ${student.name}`);
                                  }
                                }}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-gray-200 rounded-xl text-center text-gray-500 bg-gray-50/50">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-gray-800">Clearance Queue Empty</p>
                <p className="text-xs text-gray-500 mt-0.5">All student admissions are currently approved and verified.</p>
              </div>
            )}
          </div>

          {/* Academic Mark Submission Matrix Status */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Grade & Mark Submission Clearance Matrix ({appData.settings.academicYear})
            </h4>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Class</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Enrolled Count</th>
                    <th className="py-2.5 px-3">Marked Students</th>
                    <th className="py-2.5 px-3">Admin Clearance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appData.classes.flatMap((cls) =>
                    cls.subjects.map((sub) => {
                      const activeTerm = appData.settings.semesters[0] || 'Term 1';
                      const year = appData.settings.academicYear;

                      const markedCount = cls.students.filter(
                        s => s.results?.[year]?.[activeTerm]?.[sub.name]?.total !== undefined
                      ).length;

                      const isApproved = cls.students.some(
                        s => s.results?.[year]?.[activeTerm]?.[sub.name]?.approved
                      );

                      return (
                        <tr key={`${cls.id}:${sub.name}`} className="hover:bg-gray-50/60 transition">
                          <td className="py-2.5 px-4 font-bold text-gray-900">{cls.name}</td>
                          <td className="py-2.5 px-3 font-semibold text-blue-800">{sub.name}</td>
                          <td className="py-2.5 px-3">{cls.students.length}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono">
                              {markedCount} / {cls.students.length}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {isApproved ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approved by Registrar
                              </span>
                            ) : markedCount === cls.students.length && markedCount > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                                <Clock className="w-3.5 h-3.5" /> Pending Clearance
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[11px] italic">In Progress</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: OFFICIAL DOCUMENTS BUREAU */}
      {activeSubTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">Official Document Bureau</h3>
            <p className="text-xs text-gray-500">
              Generate, preview, and print verifiable institutional certifications, transfer certificates, appointment letters, and administrative rosters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-b from-gray-50/50 to-white flex flex-col justify-between hover:border-gray-300 transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Certificate of Bonafide Enrollment</h4>
                <p className="text-xs text-gray-500 mb-4">
                  Official verifiable letterhead document certifying student enrollment, academic session, guardian info, and good standing.
                </p>
              </div>
              <button
                onClick={() => {
                  const firstStu = allFlatStudents[0];
                  if (firstStu) {
                    setDocModalConfig({
                      isOpen: true,
                      type: 'enrollment_cert',
                      student: firstStu.student,
                      schoolClass: firstStu.schoolClass,
                    });
                  } else {
                    alert('Please enroll at least one student first.');
                  }
                }}
                className="w-full py-2 bg-[#00A896] hover:bg-[#008f80] text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Certificate</span>
              </button>
            </div>

            <div className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-b from-gray-50/50 to-white flex flex-col justify-between hover:border-gray-300 transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-3">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Student Transfer Certificate (TC)</h4>
                <p className="text-xs text-gray-500 mb-4">
                  Formal departure clearance certificate certifying dues paid, conduct, and official release for relocation.
                </p>
              </div>
              <button
                onClick={() => {
                  const firstStu = allFlatStudents[0];
                  if (firstStu) {
                    setDocModalConfig({
                      isOpen: true,
                      type: 'transfer_cert',
                      student: firstStu.student,
                      schoolClass: firstStu.schoolClass,
                    });
                  } else {
                    alert('Please enroll at least one student first.');
                  }
                }}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Issue Transfer Letter</span>
              </button>
            </div>

            <div className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-b from-gray-50/50 to-white flex flex-col justify-between hover:border-gray-300 transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Faculty Appointment Order</h4>
                <p className="text-xs text-gray-500 mb-4">
                  Official registrar document establishing faculty credentials, appointed roles, departments, and instructional allocation.
                </p>
              </div>
              <button
                onClick={() => {
                  const firstStaff = appData.users[0];
                  if (firstStaff) {
                    setDocModalConfig({
                      isOpen: true,
                      type: 'faculty_appointment',
                      teacher: firstStaff,
                    });
                  }
                }}
                className="w-full py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Issue Appointment Order</span>
              </button>
            </div>

            <div className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-b from-gray-50/50 to-white flex flex-col justify-between hover:border-gray-300 transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-3">
                  <Printer className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Official Administrative Roster</h4>
                <p className="text-xs text-gray-500 mb-4">
                  Print-ready signed class roster sheet with rolls, admission numbers, gender splits, and guardian contacts.
                </p>
              </div>
              <button
                onClick={() => {
                  const firstClass = appData.classes[0];
                  if (firstClass) {
                    setDocModalConfig({
                      isOpen: true,
                      type: 'class_roster',
                      schoolClass: firstClass,
                    });
                  }
                }}
                className="w-full py-2 bg-gray-800 hover:bg-black text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Roster</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ENROLL NEW STUDENT */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#00A896]/10 text-[#00A896] rounded-xl">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Official Student Enrollment</h3>
                  <p className="text-xs text-gray-500">Registrar admission file creation</p>
                </div>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Class *</label>
                  <select
                    value={enrollClassId}
                    onChange={(e) => {
                      setEnrollClassId(e.target.value);
                      const targetClass = appData.classes.find(c => c.id === e.target.value);
                      if (targetClass) {
                        const nextRoll = targetClass.students.length > 0
                          ? Math.max(...targetClass.students.map(s => s.rollNo)) + 1
                          : 1;
                        setEnrollRollNo(String(nextRoll));
                      }
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-xs transition bg-white"
                    required
                  >
                    {appData.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Roll Number *</label>
                  <input
                    type="number"
                    min="1"
                    value={enrollRollNo}
                    onChange={(e) => setEnrollRollNo(e.target.value)}
                    placeholder="e.g. 1, 2"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-xs transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Student Name *</label>
                <input
                  type="text"
                  value={enrollName}
                  onChange={(e) => setEnrollName(e.target.value)}
                  placeholder="e.g. Johnathan Doe"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-sm transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Gender *</label>
                  <select
                    value={enrollGender}
                    onChange={(e) => setEnrollGender(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-xs transition bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Initial Status</label>
                  <select
                    value={enrollStatus}
                    onChange={(e) => setEnrollStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-xs transition bg-white"
                  >
                    <option value="active">Active & Verified</option>
                    <option value="pending">Pending Admissions Review</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Parent / Guardian Name</label>
                  <input
                    type="text"
                    value={enrollParentName}
                    onChange={(e) => setEnrollParentName(e.target.value)}
                    placeholder="Father/Mother Full Name"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-xs transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Parent Contact Phone</label>
                  <input
                    type="tel"
                    value={enrollParentContact}
                    onChange={(e) => setEnrollParentContact(e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-xs transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={enrollDob}
                    onChange={(e) => setEnrollDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-xs transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={enrollBloodGroup}
                    onChange={(e) => setEnrollBloodGroup(e.target.value)}
                    placeholder="e.g. O+, A-, B+"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-xs transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={enrollAddress}
                  onChange={(e) => setEnrollAddress(e.target.value)}
                  placeholder="Street Address, City, State"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-xs transition"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A896] hover:bg-[#008f80] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TRANSFER / PROMOTE STUDENT */}
      {isTransferModalOpen && transferTargetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Transfer / Promote Student</h3>
                  <p className="text-xs text-gray-500">Move student record to another cohort</p>
                </div>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                <span className="text-gray-500 block">Student to Transfer:</span>
                <strong className="text-sm font-bold text-gray-900">{transferTargetStudent.student.name}</strong>
                <div className="text-gray-500 mt-1">
                  Current Class: <strong>{appData.classes.find(c => c.id === transferTargetStudent.classId)?.name}</strong> (Roll #{transferTargetStudent.student.rollNo})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Destination Class *</label>
                <select
                  value={targetTransferClassId}
                  onChange={(e) => setTargetTransferClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-xs transition bg-white"
                >
                  {appData.classes
                    .filter(c => c.id !== transferTargetStudent.classId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.students.length} current students)
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-gray-500 mt-1">
                  The student will be moved to the chosen cohort with an automatically assigned roll number while preserving all historical results.
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteTransfer}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Complete Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT FACULTY MEMBER */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#003366]/10 text-[#003366] rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingStaffUser ? 'Edit Faculty Record' : 'Appoint Faculty Member'}
                  </h3>
                  <p className="text-xs text-gray-500">Official academic appointment and allocation</p>
                </div>
              </div>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaffForm} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={staffFormName}
                    onChange={(e) => setStaffFormName(e.target.value)}
                    placeholder="e.g. Dr. Robert Hayes"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 outline-none text-xs transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Official Title</label>
                  <input
                    type="text"
                    value={staffFormTitle}
                    onChange={(e) => setStaffFormTitle(e.target.value)}
                    placeholder="e.g. Senior Science Teacher"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 outline-none text-xs transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Username *</label>
                  <input
                    type="text"
                    value={staffFormUsername}
                    onChange={(e) => setStaffFormUsername(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 outline-none text-xs transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={staffFormPassword}
                    onChange={(e) => setStaffFormPassword(e.target.value)}
                    placeholder={editingStaffUser ? 'Leave blank to keep current' : 'Temporary password'}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 outline-none text-xs transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={staffFormDept}
                    onChange={(e) => setStaffFormDept(e.target.value)}
                    placeholder="e.g. Science, Mathematics, English"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 outline-none text-xs transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Staff Status</label>
                  <select
                    value={staffFormStatus}
                    onChange={(e) => setStaffFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 outline-none text-xs transition bg-white"
                  >
                    <option value="active">Active Faculty</option>
                    <option value="leave">On Leave</option>
                    <option value="terminated">Terminated / Exited</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={staffFormEmail}
                    onChange={(e) => setStaffFormEmail(e.target.value)}
                    placeholder="teacher@school.org"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 outline-none text-xs transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={staffFormPhone}
                    onChange={(e) => setStaffFormPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 outline-none text-xs transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assign Class Teacher Role To</label>
                <select
                  value={staffFormAssignedClassId}
                  onChange={(e) => setStaffFormAssignedClassId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 outline-none text-xs transition bg-white"
                >
                  <option value="">None (Subject Teacher / Admin Only)</option>
                  {appData.classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teaching Subject Allocations */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Teaching Subjects Assigned</label>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-gray-200 bg-gray-50/50 max-h-32 overflow-y-auto">
                  {allSchoolSubjects.map((subName) => {
                    const isChecked = staffFormSubjects.includes(subName);
                    return (
                      <button
                        key={subName}
                        type="button"
                        onClick={() => {
                          setStaffFormSubjects(prev =>
                            prev.includes(subName) ? prev.filter(s => s !== subName) : [...prev, subName]
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          isChecked
                            ? 'bg-[#003366] text-white'
                            : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {isChecked ? `✓ ${subName}` : subName}
                      </button>
                    );
                  })}
                  {allSchoolSubjects.length === 0 && (
                    <span className="text-xs text-gray-400 italic">No subjects configured yet.</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Save Faculty Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT STUDENT MODAL */}
      {isEditStudentOpen && editingStudentData && (
        <EditStudentModal
          isOpen={isEditStudentOpen}
          student={editingStudentData.student}
          onClose={() => {
            setIsEditStudentOpen(false);
            setEditingStudentData(null);
          }}
          onSave={(updates) => {
            onUpdateStudent(editingStudentData.classId, updates);
            onAddAuditLog('Update Student Record', `Updated profile dossier for ${updates.name || editingStudentData.student.name}`);
          }}
          existingRollNos={
            appData.classes
              .find(c => c.id === editingStudentData.classId)
              ?.students.filter(s => s.id !== editingStudentData.student.id)
              .map(s => s.rollNo) || []
          }
        />
      )}

      {/* MODAL 5: OFFICIAL DOCUMENT MODAL */}
      {docModalConfig.isOpen && (
        <OfficialDocumentModal
          isOpen={docModalConfig.isOpen}
          onClose={() => setDocModalConfig(prev => ({ ...prev, isOpen: false }))}
          documentType={docModalConfig.type}
          settings={appData.settings}
          student={docModalConfig.student}
          schoolClass={docModalConfig.schoolClass}
          teacher={docModalConfig.teacher}
        />
      )}

      {/* MODAL 6: PRINT ID CARDS MODAL */}
      {idCardModalClass && (
        <PrintIdCardsModal
          isOpen={Boolean(idCardModalClass)}
          onClose={() => setIdCardModalClass(null)}
          activeClass={idCardModalClass}
          settings={appData.settings}
        />
      )}

      {/* MODAL 7: BULK ENROLMENT CSV MODAL */}
      {isBulkUploadModalOpen && (
        <BulkStudentUploadModal
          isOpen={isBulkUploadModalOpen}
          onClose={() => setIsBulkUploadModalOpen(false)}
          classes={appData.classes}
          initialClassId={selectedClassFilter === 'all' ? appData.classes[0]?.id : selectedClassFilter}
          onBulkUpload={(classId, students) => {
            onBulkUploadStudents(classId, students);
            onAddAuditLog('Bulk Student Enrolment', `Imported roster of ${students.length} students into class ID: ${classId}`);
          }}
        />
      )}

      {/* MODAL 8: BULK PROMOTION / TRANSFER WIZARD MODAL */}
      {isBulkWizardOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 bg-[#003366] text-white">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5" />
                <h3 className="font-bold text-base">Bulk Promotion / Transfer Wizard</h3>
              </div>
              <button onClick={() => setIsBulkWizardOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="p-3 bg-blue-50 text-blue-900 rounded-xl font-medium border border-blue-200 flex items-center justify-between">
                <span>Selected Students for Bulk Operation:</span>
                <span className="font-bold text-sm bg-blue-600 text-white px-2.5 py-0.5 rounded-full">{selectedStudentKeys.length} Students</span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Select Bulk Action Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBulkWizardActionType('migrate')}
                    className={`py-3 px-4 rounded-xl font-bold border transition cursor-pointer text-left ${
                      bulkWizardActionType === 'migrate'
                        ? 'bg-[#003366] text-white border-[#003366] shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-sm font-black mb-0.5">Migrate / Promote Cohort</div>
                    <div className="text-[11px] opacity-80">Move selected students to a new class level with auto roll numbering.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkWizardActionType('status')}
                    className={`py-3 px-4 rounded-xl font-bold border transition cursor-pointer text-left ${
                      bulkWizardActionType === 'status'
                        ? 'bg-[#003366] text-white border-[#003366] shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-sm font-black mb-0.5">Update Registry Status</div>
                    <div className="text-[11px] opacity-80">Change status (active, graduated, transferred, suspended) in bulk.</div>
                  </button>
                </div>
              </div>

              {bulkWizardActionType === 'migrate' ? (
                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">Target Destination Class Cohort *</label>
                  <select
                    value={bulkWizardTargetClassId}
                    onChange={(e) => setBulkWizardTargetClassId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-[#003366]"
                  >
                    <option value="">-- Choose Target Class --</option>
                    {appData.classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (Current Students: {c.students.length})</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-500 mt-1">Students will be removed from their current classes and added to the destination class with sequential roll numbers.</p>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">New Registry Lifecycle Status *</label>
                  <select
                    value={bulkWizardNewStatus}
                    onChange={(e) => setBulkWizardNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-[#003366]"
                  >
                    <option value="active">Active Enrolled</option>
                    <option value="graduated">Graduated</option>
                    <option value="transferred">Transferred</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsBulkWizardOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBulkWizard}
                  className="px-6 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold shadow-md transition cursor-pointer"
                >
                  Execute Bulk Operation ({selectedStudentKeys.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
