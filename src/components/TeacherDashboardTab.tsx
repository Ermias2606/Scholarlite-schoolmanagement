import React, { useMemo } from 'react';
import { AppData, UserProfile } from '../types';
import { 
  BookOpen, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface TeacherDashboardTabProps {
  appData: AppData;
  currentUser: UserProfile;
  onNavigateTab: (tab: 'classes' | 'calendar' | 'results') => void;
}

export const TeacherDashboardTab: React.FC<TeacherDashboardTabProps> = ({
  appData,
  currentUser,
  onNavigateTab
}) => {
  const { classes, events, settings } = appData;
  const currentYear = settings.academicYear;
  const activeTerm = settings.semesters[0] || 'Term 1';

  // 1. Assigned Subjects
  const assignedSubjects = useMemo(() => {
    const subjects: { className: string; subjectName: string; classId: string; studentsCount: number }[] = [];
    classes.forEach(c => {
      // If class teacher, implicitly assigned to class
      // If subject teacher, check assigned subjects array
      const isClassTeacher = currentUser.role === 'class_teacher' && (currentUser.assignedClassIds?.includes(c.id) || currentUser.assignedClassId === c.id);
      
      c.subjects.forEach(sub => {
        // Here we simplify: if they are a class teacher, they might teach all.
        // If subject teacher, we check if the subject name is in their assignedSubjects.
        const isAssigned = isClassTeacher || (currentUser.assignedSubjects?.includes(sub.name));
        if (isAssigned) {
          subjects.push({
            className: c.name,
            subjectName: sub.name,
            classId: c.id,
            studentsCount: c.students.length
          });
        }
      });
    });
    return subjects;
  }, [classes, currentUser]);

  // 2. Upcoming Schedule (Upcoming Events)
  const upcomingEvents = useMemo(() => {
    if (!events) return [];
    const today = new Date().toISOString().split('T')[0];
    return events
      .filter(e => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [events]);

  // 3. Pending Remarks/Attendance (For Class Teachers mostly)
  const pendingActions = useMemo(() => {
    const actions: { id: string; studentName: string; type: 'remarks' | 'attendance'; className: string }[] = [];
    if (currentUser.role === 'class_teacher') {
      const myClasses = classes.filter(c => currentUser.assignedClassIds?.includes(c.id) || c.id === currentUser.assignedClassId);
      myClasses.forEach(myClass => {
        myClass.students.forEach(s => {
          // Check attendance
          const hasAttendance = s.attendance?.[currentYear]?.[activeTerm];
          if (!hasAttendance) {
            actions.push({
              id: `${s.id}-att`,
              studentName: s.name,
              type: 'attendance',
              className: myClass.name
            });
          }
          // Check remarks
          const hasRemarks = s.remarks?.[currentYear]?.[activeTerm]?.teacherRemark;
          if (!hasRemarks) {
            actions.push({
              id: `${s.id}-rem`,
              studentName: s.name,
              type: 'remarks',
              className: myClass.name
            });
          }
        });
      });
    }
    return actions;
  }, [classes, currentUser, currentYear, activeTerm]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {currentUser.name}. Here is your daily overview.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Assigned Subjects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Assigned Subjects
              </h3>
              <button 
                onClick={() => onNavigateTab('classes')}
                className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
              >
                View Classes <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            {assignedSubjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {assignedSubjects.map((sub, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 flex flex-col">
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{sub.subjectName}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300 mt-1">{sub.className}</span>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <UserCheck className="w-4 h-4" />
                      {sub.studentsCount} Students Enrolled
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>No subjects assigned currently.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Area */}
        <div className="space-y-6">
          
          {/* Upcoming Schedule */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                Upcoming
              </h3>
              <button 
                onClick={() => onNavigateTab('calendar')}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Calendar
              </button>
            </div>
            
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                      <span className="text-xs font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-lg font-black leading-none">{new Date(event.date).getDate()}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{event.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">{event.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No upcoming events found.</p>
              </div>
            )}
          </div>

          {/* Pending Action Items */}
          {currentUser.role === 'class_teacher' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Action Required</h3>
              </div>

              {pendingActions.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {pendingActions.map(action => (
                    <div key={action.id} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wide">
                          Missing {action.type}
                        </span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{action.studentName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{action.className}</p>
                      </div>
                      <button 
                        onClick={() => onNavigateTab('results')}
                        className="p-1.5 bg-white dark:bg-gray-800 rounded-lg text-amber-600 hover:bg-amber-100 transition-colors shadow-sm"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">All student remarks and attendance are up to date!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
