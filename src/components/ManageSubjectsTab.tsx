import React, { useState } from 'react';
import { AppData, Subject } from '../types';
import { Plus, Trash2, BookOpen, Edit2, Calendar, Clock, Printer, Users } from 'lucide-react';
import { SubjectModal } from './SubjectModal';

interface ManageSubjectsTabProps {
  appData: AppData;
  onSaveSubject: (classId: string, subject: Subject, originalName?: string) => void;
  onDeleteSubject: (classId: string, subjectName: string) => void;
}

export const ManageSubjectsTab: React.FC<ManageSubjectsTabProps> = ({ appData, onSaveSubject, onDeleteSubject }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(appData.classes[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<'subjects' | 'schedules' | 'workload'>('subjects');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const activeClass = appData.classes.find(c => c.id === selectedClassId);
  const staffUsers = (appData.users || []).filter(u => u.role !== 'student');

  // Days and periods for timetable generator
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6, 7];

  // Generate timetable mapping based on periods per week
  const generateTimetable = () => {
    if (!activeClass || activeClass.subjects.length === 0) return {};
    
    const slotPool: string[] = [];
    activeClass.subjects.forEach(sub => {
      const p = sub.periodsPerWeek || 4;
      for (let i = 0; i < p; i++) {
        slotPool.push(sub.name);
      }
    });

    const timetable: Record<string, Record<number, string>> = {};
    let poolIndex = 0;

    days.forEach(day => {
      timetable[day] = {};
      periods.forEach(period => {
        if (period === 4) {
          timetable[day][period] = 'Break / Recess';
        } else {
          if (slotPool.length > 0) {
            timetable[day][period] = slotPool[poolIndex % slotPool.length];
            poolIndex++;
          } else {
            timetable[day][period] = 'Free Period';
          }
        }
      });
    });

    return timetable;
  };

  const classTimetable = generateTimetable();

  // Compute teacher workload allocation across all classes
  const teacherWorkloads = staffUsers.map(teacher => {
    let totalPeriods = 0;
    const assignedClassesDetails: { className: string; subjectName: string; periods: number }[] = [];

    appData.classes.forEach(cls => {
      const isHomeroom = cls.classTeacherId === teacher.id;
      cls.subjects.forEach(sub => {
        const isAssigned = isHomeroom || teacher.assignedSubjects?.includes(sub.name) || (cls.subjects.length > 0 && teacher.role === 'subject_teacher');
        if (isAssigned) {
          const p = sub.periodsPerWeek || 4;
          totalPeriods += p;
          assignedClassesDetails.push({
            className: cls.name,
            subjectName: sub.name,
            periods: p,
          });
        }
      });
    });

    return {
      teacher,
      totalPeriods,
      assignedClassesDetails,
    };
  });

  const handleUpdatePeriods = (sub: Subject, periodsCount: number) => {
    if (!activeClass) return;
    onSaveSubject(
      activeClass.id,
      {
        ...sub,
        periodsPerWeek: Math.max(1, Math.min(10, periodsCount)),
      },
      sub.name
    );
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#003366]">Subject & Schedule Management</h2>
            <p className="text-xs text-gray-500">Configure subjects, weekly periods, class timetables, and teacher allocations</p>
          </div>
        </div>
        
        {appData.classes.length > 0 && activeSubTab !== 'workload' && (
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A896] outline-none font-bold text-xs"
          >
            {appData.classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl max-w-lg text-xs">
        <button
          onClick={() => setActiveSubTab('subjects')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'subjects' ? 'bg-white text-[#003366] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Subjects &amp; Periods</span>
        </button>
        <button
          onClick={() => setActiveSubTab('schedules')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'schedules' ? 'bg-white text-[#003366] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Class Timetable</span>
        </button>
        <button
          onClick={() => setActiveSubTab('workload')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'workload' ? 'bg-white text-[#003366] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Teacher Allocation</span>
        </button>
      </div>

      {!activeClass && activeSubTab !== 'workload' ? (
        <div className="text-center py-8 text-gray-500">Please create a class first.</div>
      ) : activeSubTab === 'subjects' ? (
        <>
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-sm">Subjects &amp; Weekly Periods for {activeClass?.name}</h3>
            <button
              onClick={() => {
                setEditingSubject(null);
                setIsModalOpen(true);
              }}
              className="px-3.5 py-2 bg-[#00A896] hover:bg-[#008f80] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Subject
            </button>
          </div>

          <div className="space-y-3">
            {activeClass?.subjects.map(sub => {
              const maxScore = sub.assessments.reduce((sum, a) => sum + a.maxScore, 0);
              const periodsPerWeek = sub.periodsPerWeek || 4;
              return (
                <div key={sub.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-gray-300 bg-gray-50/70 transition gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-gray-900 text-sm">{sub.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">{maxScore} pts total</span>
                    </div>
                    <div className="text-xs text-gray-500 flex gap-2 flex-wrap">
                      {sub.assessments.map(a => (
                        <span key={a.id} className="bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600 font-medium">{a.name} ({a.maxScore})</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
                      <Clock className="w-3.5 h-3.5 text-[#00A896]" />
                      <span className="font-bold text-gray-700">Periods/Week:</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={periodsPerWeek}
                        onChange={(e) => handleUpdatePeriods(sub, parseInt(e.target.value) || 4)}
                        className="w-12 px-2 py-1 bg-gray-50 border border-gray-300 rounded font-bold text-center text-xs outline-none focus:border-[#00A896]"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingSubject(sub);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition cursor-pointer"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete subject ${sub.name}?`)) {
                            onDeleteSubject(activeClass.id, sub.name);
                          }
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {activeClass?.subjects.length === 0 && (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                No subjects assigned to this class yet. Click "Add Subject" to configure subjects and periods.
              </div>
            )}
          </div>
        </>
      ) : activeSubTab === 'schedules' ? (
        /* Weekly Timetable Matrix View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#003366] text-sm">Weekly Period Schedule Table: {activeClass?.name}</h3>
              <p className="text-xs text-gray-500">Auto-generated schedule based on configured periods per week</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md no-print"
            >
              <Printer className="w-4 h-4" /> Print Timetable
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#003366] text-white">
                  <th className="p-3 font-bold border-b border-r border-[#002244] w-28">Day / Period</th>
                  {periods.map(p => (
                    <th key={p} className="p-3 font-bold border-b border-r border-[#002244] text-center">
                      {p === 4 ? 'Break (P4)' : `Period ${p}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map(day => (
                  <tr key={day} className="hover:bg-gray-50/80 transition">
                    <td className="p-3 font-bold bg-gray-50 text-gray-800 border-b border-r border-gray-200">
                      {day}
                    </td>
                    {periods.map(p => {
                      const subjectName = classTimetable[day]?.[p] || 'Free Period';
                      const isBreak = p === 4;
                      return (
                        <td
                          key={p}
                          className={`p-3 border-b border-r border-gray-200 text-center font-semibold ${
                            isBreak
                              ? 'bg-amber-50 text-amber-800 italic'
                              : subjectName === 'Free Period'
                              ? 'text-gray-400'
                              : 'text-[#003366] bg-blue-50/30'
                          }`}
                        >
                          {subjectName}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Teacher Period Allocation & Workload View */
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-[#003366] text-sm">Teacher Period Allocation &amp; Workload Matrix</h3>
            <p className="text-xs text-gray-500">Monitor weekly teaching hours and period distributions across all campus teachers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacherWorkloads.map(({ teacher, totalPeriods, assignedClassesDetails }) => {
              const isOverloaded = totalPeriods > 25;
              return (
                <div key={teacher.id} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/60 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#003366] uppercase tracking-wide">
                        {teacher.role.replace('_', ' ')}
                      </span>
                      <h4 className="font-black text-gray-900 text-sm mt-1">{teacher.name}</h4>
                      <p className="text-xs text-gray-500">@{teacher.username}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 ${
                      isOverloaded ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{totalPeriods} Periods / Wk</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-gray-600 block">Assigned Teaching Load:</span>
                    {assignedClassesDetails.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {assignedClassesDetails.map((item, idx) => (
                          <span key={idx} className="bg-white border border-gray-200 px-2.5 py-1 rounded-xl text-xs text-gray-700 font-medium flex items-center gap-1">
                            <span className="font-bold text-[#003366]">{item.className}:</span> {item.subjectName} ({item.periods}p)
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No periods allocated yet.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isModalOpen && activeClass && (
        <SubjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(subject) => onSaveSubject(activeClass.id, subject, editingSubject?.name)}
          existingSubject={editingSubject || undefined}
        />
      )}
    </div>
  );
};

