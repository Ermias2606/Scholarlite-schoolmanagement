import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

nav_old = """  const allNavItems = [
    { id: 'overview', label: 'Overview', icon: Home, roles: ['admin', 'class_teacher', 'subject_teacher'] },
    { id: 'teacher_dashboard', label: 'Teacher Dashboard', icon: UserCheck, roles: ['class_teacher', 'subject_teacher'] },
    { id: 'calendar', label: 'Calendar', icon: Calendar, roles: ['admin', 'class_teacher', 'subject_teacher'] },
    { id: 'classes', label: 'Classes & Students', icon: GraduationCap, roles: ['admin', 'class_teacher', 'subject_teacher'] },
    { id: 'results', label: 'Results & Reports', icon: FileSpreadsheet, roles: ['admin', 'class_teacher', 'subject_teacher'] },
    { id: 'settings', label: 'Settings & Security', icon: SettingsIcon, roles: ['admin'] },
  ] as const;"""

nav_new = """  const allNavItems = [
    { id: 'overview', label: 'Overview', icon: Home, roles: ['super_admin', 'school_admin', 'admin', 'class_teacher', 'subject_teacher'] },
    { id: 'teacher_dashboard', label: 'Teacher Dashboard', icon: UserCheck, roles: ['class_teacher', 'subject_teacher'] },
    { id: 'calendar', label: 'Calendar', icon: Calendar, roles: ['super_admin', 'school_admin', 'admin', 'class_teacher', 'subject_teacher'] },
    { id: 'manage_classes', label: 'Classes', icon: Building2, roles: ['super_admin', 'school_admin', 'admin'] },
    { id: 'manage_subjects', label: 'Subjects', icon: BookOpen, roles: ['super_admin', 'school_admin', 'admin'] },
    { id: 'manage_students', label: 'Students', icon: Users, roles: ['super_admin', 'school_admin', 'admin', 'class_teacher'] },
    { id: 'manage_staff', label: 'Staff', icon: ShieldCheck, roles: ['super_admin', 'school_admin', 'admin'] },
    { id: 'manage_levels', label: 'School Levels', icon: Layers, roles: ['super_admin'] },
    { id: 'results', label: 'Results & Reports', icon: FileSpreadsheet, roles: ['super_admin', 'school_admin', 'admin', 'class_teacher', 'subject_teacher'] },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, roles: ['super_admin', 'school_admin', 'admin'] },
  ] as const;"""

content = content.replace(nav_old, nav_new)

imports_old = """import {
  Home,
  GraduationCap,
  FileSpreadsheet,
  Settings as SettingsIcon,
  LogOut,
  Users,
  ShieldCheck,
  UserCheck,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';"""

imports_new = """import {
  Home,
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
} from 'lucide-react';"""

content = content.replace(imports_old, imports_new)

content = content.replace(
    "const [activeTab, setActiveTab] = useState<'overview' | 'teacher_dashboard' | 'classes' | 'results' | 'calendar' | 'settings'>('overview');",
    "const [activeTab, setActiveTab] = useState<'overview' | 'teacher_dashboard' | 'manage_classes' | 'manage_subjects' | 'manage_students' | 'manage_staff' | 'manage_levels' | 'classes' | 'results' | 'calendar' | 'settings'>('overview');"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
