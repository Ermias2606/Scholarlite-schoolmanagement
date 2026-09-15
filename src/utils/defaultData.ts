import { AppData } from '../types';

export const DEFAULT_APP_DATA: AppData = {
  settings: {
    name: 'ScholarLite Academy',
    logo: '/icon.svg',
    academicYear: '2024/2025',
    semesters: ['Term 1', 'Term 2', 'Term 3'],
    slogans: [
      'Simplify and empower your school year.',
      'Precision offline grade tracking & reporting.',
      'Instant Master Sheets, Rank Lists, and Report Cards.',
      'Engineered for teachers, administrators, and students.',
    ],
  },
  levels: [
    { id: 'level_preschool', name: 'Pre-School', order: 1 },
    { id: 'level_primary', name: 'Primary School', order: 2 },
    { id: 'level_middle', name: 'Middle School', order: 3 },
    { id: 'level_high', name: 'High School', order: 4 },
  ],
  events: [
    {
      id: 'event_1',
      title: 'Term 1 Midterm Exams',
      date: '2024-10-15',
      endDate: '2024-10-20',
      type: 'exam',
      description: 'Midterm examinations for all grades.'
    },
    {
      id: 'event_2',
      title: 'Winter Holiday',
      date: '2024-12-20',
      endDate: '2025-01-05',
      type: 'holiday',
      description: 'School closed for winter break.'
    },
    {
      id: 'event_3',
      title: 'Science Fair',
      date: '2025-03-12',
      type: 'event',
      description: 'Annual school science fair at the main auditorium.'
    }
  ],
  classes: [
    {
      id: 'class_grade_10a',
      name: 'Grade 10-A',
      levelId: 'level_high',
      subjects: [
        {
          name: 'Mathematics',
          assessments: [
            { id: 'asm_m1', name: 'Quiz & Assignments', maxScore: 20 },
            { id: 'asm_m2', name: 'Midterm Exam', maxScore: 30 },
            { id: 'asm_m3', name: 'Final Exam', maxScore: 50 },
          ],
        },
        {
          name: 'English Language',
          assessments: [
            { id: 'asm_e1', name: 'Coursework & Essay', maxScore: 25 },
            { id: 'asm_e2', name: 'Oral Presentation', maxScore: 15 },
            { id: 'asm_e3', name: 'Final Examination', maxScore: 60 },
          ],
        },
        {
          name: 'Integrated Science',
          assessments: [
            { id: 'asm_s1', name: 'Lab Practical', maxScore: 30 },
            { id: 'asm_s2', name: 'Theory Test', maxScore: 30 },
            { id: 'asm_s3', name: 'Final Exam', maxScore: 40 },
          ],
        },
        {
          name: 'Computer Science',
          assessments: [
            { id: 'asm_c1', name: 'Project & Coding', maxScore: 40 },
            { id: 'asm_c2', name: 'Theory Exam', maxScore: 60 },
          ],
        },
      ],
      students: [
        {
          id: 'stu_1',
          rollNo: 1,
          name: 'Alexander Wright',
          gender: 'Male',
          results: {
            '2024/2025': {
              'Term 1': {
                Mathematics: { marks: { 'Quiz & Assignments': 19, 'Midterm Exam': 28, 'Final Exam': 47 }, total: 94 },
                'English Language': { marks: { 'Coursework & Essay': 24, 'Oral Presentation': 14, 'Final Examination': 55 }, total: 93 },
                'Integrated Science': { marks: { 'Lab Practical': 29, 'Theory Test': 27, 'Final Exam': 38 }, total: 94 },
                'Computer Science': { marks: { 'Project & Coding': 39, 'Theory Exam': 58 }, total: 97 },
              },
              'Term 2': {
                Mathematics: { marks: { 'Quiz & Assignments': 18, 'Midterm Exam': 29, 'Final Exam': 46 }, total: 93 },
                'English Language': { marks: { 'Coursework & Essay': 23, 'Oral Presentation': 14, 'Final Examination': 56 }, total: 93 },
                'Integrated Science': { marks: { 'Lab Practical': 28, 'Theory Test': 28, 'Final Exam': 39 }, total: 95 },
                'Computer Science': { marks: { 'Project & Coding': 40, 'Theory Exam': 57 }, total: 97 },
              },
            },
          },
          attendance: {
            '2024/2025': {
              'Term 1': { presentDays: 98, totalDays: 100 },
              'Term 2': { presentDays: 99, totalDays: 100 },
            },
          },
          remarks: {
            '2024/2025': {
              'Term 1': {
                teacherRemark: 'Alexander consistently demonstrates stellar academic intellect and leadership in STEM subjects.',
                principalRemark: 'Exemplary scholar. An asset to ScholarLite Academy.',
                conduct: 'Exemplary',
              },
            },
          },
        },
        {
          id: 'stu_2',
          rollNo: 2,
          name: 'Beatrice Chen',
          gender: 'Female',
          attendance: {
            '2024/2025': {
              'Term 1': { presentDays: 96, totalDays: 100 },
              'Term 2': { presentDays: 97, totalDays: 100 },
            },
          },
          remarks: {
            '2024/2025': {
              'Term 1': {
                teacherRemark: 'Beatrice exhibits exceptional mastery in English and literature, with articulate analytical skills.',
                principalRemark: 'Outstanding performance. Keep up the high standard.',
                conduct: 'Exemplary',
              },
            },
          },
          results: {
            '2024/2025': {
              'Term 1': {
                Mathematics: { marks: { 'Quiz & Assignments': 18, 'Midterm Exam': 27, 'Final Exam': 45 }, total: 90 },
                'English Language': { marks: { 'Coursework & Essay': 25, 'Oral Presentation': 15, 'Final Examination': 58 }, total: 98 },
                'Integrated Science': { marks: { 'Lab Practical': 27, 'Theory Test': 26, 'Final Exam': 37 }, total: 90 },
                'Computer Science': { marks: { 'Project & Coding': 38, 'Theory Exam': 55 }, total: 93 },
              },
              'Term 2': {
                Mathematics: { marks: { 'Quiz & Assignments': 17, 'Midterm Exam': 26, 'Final Exam': 44 }, total: 87 },
                'English Language': { marks: { 'Coursework & Essay': 25, 'Oral Presentation': 15, 'Final Examination': 59 }, total: 99 },
                'Integrated Science': { marks: { 'Lab Practical': 26, 'Theory Test': 27, 'Final Exam': 36 }, total: 89 },
                'Computer Science': { marks: { 'Project & Coding': 37, 'Theory Exam': 54 }, total: 91 },
              },
            },
          },
        },
        {
          id: 'stu_3',
          rollNo: 3,
          name: 'Daniel Okonjo',
          gender: 'Male',
          results: {
            '2024/2025': {
              'Term 1': {
                Mathematics: { marks: { 'Quiz & Assignments': 16, 'Midterm Exam': 24, 'Final Exam': 42 }, total: 82 },
                'English Language': { marks: { 'Coursework & Essay': 20, 'Oral Presentation': 13, 'Final Examination': 49 }, total: 82 },
                'Integrated Science': { marks: { 'Lab Practical': 25, 'Theory Test': 25, 'Final Exam': 35 }, total: 85 },
                'Computer Science': { marks: { 'Project & Coding': 36, 'Theory Exam': 50 }, total: 86 },
              },
              'Term 2': {
                Mathematics: { marks: { 'Quiz & Assignments': 17, 'Midterm Exam': 25, 'Final Exam': 43 }, total: 85 },
                'English Language': { marks: { 'Coursework & Essay': 21, 'Oral Presentation': 14, 'Final Examination': 50 }, total: 85 },
                'Integrated Science': { marks: { 'Lab Practical': 26, 'Theory Test': 26, 'Final Exam': 36 }, total: 88 },
                'Computer Science': { marks: { 'Project & Coding': 38, 'Theory Exam': 52 }, total: 90 },
              },
            },
          },
        },
        {
          id: 'stu_4',
          rollNo: 4,
          name: 'Elena Rostova',
          gender: 'Female',
          results: {
            '2024/2025': {
              'Term 1': {
                Mathematics: { marks: { 'Quiz & Assignments': 15, 'Midterm Exam': 22, 'Final Exam': 38 }, total: 75 },
                'English Language': { marks: { 'Coursework & Essay': 22, 'Oral Presentation': 13, 'Final Examination': 51 }, total: 86 },
                'Integrated Science': { marks: { 'Lab Practical': 22, 'Theory Test': 21, 'Final Exam': 31 }, total: 74 },
                'Computer Science': { marks: { 'Project & Coding': 32, 'Theory Exam': 44 }, total: 76 },
              },
              'Term 2': {
                Mathematics: { marks: { 'Quiz & Assignments': 16, 'Midterm Exam': 23, 'Final Exam': 39 }, total: 78 },
                'English Language': { marks: { 'Coursework & Essay': 22, 'Oral Presentation': 14, 'Final Examination': 52 }, total: 88 },
                'Integrated Science': { marks: { 'Lab Practical': 23, 'Theory Test': 23, 'Final Exam': 32 }, total: 78 },
                'Computer Science': { marks: { 'Project & Coding': 34, 'Theory Exam': 46 }, total: 80 },
              },
            },
          },
        },
        {
          id: 'stu_5',
          rollNo: 5,
          name: 'Faisal Al-Mansoor',
          gender: 'Male',
          results: {
            '2024/2025': {
              'Term 1': {
                Mathematics: { marks: { 'Quiz & Assignments': 13, 'Midterm Exam': 18, 'Final Exam': 31 }, total: 62 },
                'English Language': { marks: { 'Coursework & Essay': 18, 'Oral Presentation': 11, 'Final Examination': 41 }, total: 70 },
                'Integrated Science': { marks: { 'Lab Practical': 19, 'Theory Test': 18, 'Final Exam': 28 }, total: 65 },
                'Computer Science': { marks: { 'Project & Coding': 28, 'Theory Exam': 38 }, total: 66 },
              },
            },
          },
        },
        {
          id: 'stu_6',
          rollNo: 6,
          name: 'Grace Hopper Patel',
          gender: 'Female',
          results: {
            '2024/2025': {
              'Term 1': {
                Mathematics: { marks: { 'Quiz & Assignments': 11, 'Midterm Exam': 14, 'Final Exam': 24 }, total: 49 },
                'English Language': { marks: { 'Coursework & Essay': 14, 'Oral Presentation': 9, 'Final Examination': 32 }, total: 55 },
                'Integrated Science': { marks: { 'Lab Practical': 15, 'Theory Test': 13, 'Final Exam': 20 }, total: 48 },
                'Computer Science': { marks: { 'Project & Coding': 22, 'Theory Exam': 30 }, total: 52 },
              },
            },
          },
        },
      ],
    },
    {
      id: 'class_grade_9b',
      name: 'Grade 9-B',
      subjects: [
        {
          name: 'Mathematics',
          assessments: [
            { id: 'asm_9m1', name: 'Continuous Assessment', maxScore: 40 },
            { id: 'asm_9m2', name: 'Final Exam', maxScore: 60 },
          ],
        },
        {
          name: 'General Science',
          assessments: [
            { id: 'asm_9s1', name: 'Practical Work', maxScore: 30 },
            { id: 'asm_9s2', name: 'Theory Exam', maxScore: 70 },
          ],
        },
      ],
      students: [
        { id: 'stu_9_1', rollNo: 1, name: 'Lucas Scott', gender: 'Male', results: {} },
        { id: 'stu_9_2', rollNo: 2, name: 'Maya Lin', gender: 'Female', results: {} },
        { id: 'stu_9_3', rollNo: 3, name: 'Noah Miller', gender: 'Male', results: {} },
      ],
    },
  ],
  users: [
    {
      id: 'usr_admin',
      name: 'Dr. Eleanor Vance',
      role: 'admin',
      roles: ['admin'],
      username: 'admin',
      password: 'password123',
      email: 'principal@scholarlite.edu',
      title: 'Principal & School Administrator',
    },
    {
      id: 'usr_teacher_10a',
      name: 'Mrs. Sarah Jenkins',
      role: 'class_teacher',
      roles: ['class_teacher'],
      username: 'teacher10a',
      password: 'password123',
      email: 's.jenkins@scholarlite.edu',
      title: 'Head Teacher (Grade 10-A)',
      assignedClassId: 'class_grade_10a',
    },
    {
      id: 'usr_teacher_stem',
      name: "Mr. David O'Connor",
      role: 'subject_teacher',
      roles: ['subject_teacher'],
      username: 'stemfaculty',
      password: 'password123',
      email: 'd.oconnor@scholarlite.edu',
      title: 'Mathematics & Computer Science Faculty',
      assignedClassId: 'class_grade_10a',
      assignedSubjects: ['Mathematics', 'Computer Science'],
    },
    {
      id: 'usr_student_alex',
      name: 'Alexander Wright',
      role: 'student',
      roles: ['student'],
      username: 'student1',
      password: 'password123',
      email: 'alex.wright@student.scholarlite.edu',
      title: 'Student / Parent Portal (Grade 10-A, Roll #1)',
      assignedClassId: 'class_grade_10a',
      assignedStudentId: 'stu_1',
    },
  ],
  auditLogs: [
    {
      id: 'log_1',
      timestamp: '2026-09-14 08:30',
      user: 'Dr. Eleanor Vance',
      role: 'admin',
      action: 'System Initialization',
      details: 'Academic Year 2024/2025 initialized with 2 cohort classes.',
    },
    {
      id: 'log_2',
      timestamp: '2026-09-14 08:45',
      user: 'Mrs. Sarah Jenkins',
      role: 'class_teacher',
      action: 'Student Roster Verification',
      details: 'Enrolled and verified 6 students for Grade 10-A.',
    },
    {
      id: 'log_3',
      timestamp: '2026-09-14 09:05',
      user: "Mr. David O'Connor",
      role: 'subject_teacher',
      action: 'Marks Saved',
      details: 'Recorded Term 1 and Term 2 assessment marks for Mathematics & CS.',
    },
  ],
};
