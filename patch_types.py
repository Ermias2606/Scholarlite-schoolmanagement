import re

with open('src/types.ts', 'r') as f:
    content = f.read()

old_profile = """export interface UserProfile {
  id: string;
  admissionNumber?: string;
  name: string;
  role: UserRole; // Primary role
  roles?: UserRole[]; // All assigned roles
  username: string;
  password: string;
  email?: string;
  title?: string;
  assignedClassId?: string;
  assignedClassIds?: string[];
  assignedSubjects?: string[];
  assignedStudentId?: string;
}"""

new_profile = """export interface UserProfile {
  id: string;
  admissionNumber?: string;
  name: string;
  role: UserRole; // Primary role
  roles?: UserRole[]; // All assigned roles
  username: string;
  password: string;
  email?: string;
  title?: string;
  assignedClassId?: string;
  assignedClassIds?: string[];
  assignedSubjects?: string[];
  assignedStudentId?: string;
  // HCM Features
  phone?: string;
  department?: string;
  joinDate?: string;
  staffStatus?: 'active' | 'leave' | 'terminated';
  address?: string;
}"""

content = content.replace(old_profile, new_profile)

with open('src/types.ts', 'w') as f:
    f.write(content)

