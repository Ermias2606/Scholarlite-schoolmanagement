import React, { useState } from 'react';
import { X, Save, Calendar, MessageSquare, Award, CheckCircle2 } from 'lucide-react';
import { Student, StudentAttendance, StudentRemarks } from '../types';

interface EditRemarksAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  className: string;
  year: string;
  term: string;
  onSave: (
    studentId: string,
    year: string,
    term: string,
    attendance: StudentAttendance,
    remarks: StudentRemarks
  ) => void;
}

export const EditRemarksAttendanceModal: React.FC<EditRemarksAttendanceModalProps> = ({
  isOpen,
  onClose,
  student,
  className,
  year,
  term,
  onSave,
}) => {
  if (!isOpen || !student) return null;

  const existingAttendance = student.attendance?.[year]?.[term] || {
    presentDays: 95,
    totalDays: 100,
  };

  const existingRemarks = student.remarks?.[year]?.[term] || {
    teacherRemark: '',
    principalRemark: '',
    conduct: 'Exemplary',
  };

  const [presentDays, setPresentDays] = useState<number>(existingAttendance.presentDays);
  const [totalDays, setTotalDays] = useState<number>(existingAttendance.totalDays);
  const [conduct, setConduct] = useState<string>(existingRemarks.conduct || 'Exemplary');
  const [teacherRemark, setTeacherRemark] = useState<string>(existingRemarks.teacherRemark || '');
  const [principalRemark, setPrincipalRemark] = useState<string>(existingRemarks.principalRemark || '');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      student.id,
      year,
      term,
      {
        presentDays: Math.max(0, Number(presentDays) || 0),
        totalDays: Math.max(1, Number(totalDays) || 1),
      },
      {
        conduct,
        teacherRemark: teacherRemark.trim(),
        principalRemark: principalRemark.trim(),
      }
    );
    onClose();
  };

  const attendancePercent = totalDays > 0 ? Math.min(100, ((presentDays / totalDays) * 100)).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#003366] text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Remarks &amp; Attendance</h3>
            <p className="text-xs text-white/80">
              {student.name} (#{student.rollNo}) &bull; {className} &bull; {term} ({year})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Attendance Section */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#003366] tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#00A896]" />
                Attendance Record
              </span>
              <span className="text-xs font-bold text-[#00A896] bg-[#00A896]/10 px-2 py-0.5 rounded-full">
                {attendancePercent}% Attendance
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Days Present
                </label>
                <input
                  type="number"
                  min={0}
                  max={totalDays}
                  value={presentDays}
                  onChange={(e) => setPresentDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Total School Days
                </label>
                <input
                  type="number"
                  min={1}
                  value={totalDays}
                  onChange={(e) => setTotalDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Conduct Rating */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#FFC300]" />
              Student Conduct &amp; Demeanor
            </label>
            <select
              value={conduct}
              onChange={(e) => setConduct(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00A896]"
            >
              <option value="Exemplary">Exemplary / Outstanding</option>
              <option value="Good">Good / Respectful</option>
              <option value="Satisfactory">Satisfactory</option>
              <option value="Needs Improvement">Needs Improvement</option>
            </select>
          </div>

          {/* Class Teacher's Remark */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#003366]" />
              Class Teacher&apos;s Remark
            </label>
            <textarea
              rows={3}
              value={teacherRemark}
              onChange={(e) => setTeacherRemark(e.target.value)}
              placeholder="e.g., Alexander exhibits exceptional dedication and leadership in group STEM projects..."
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00A896] resize-none"
            />
          </div>

          {/* Principal's Remark */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#003366]" />
              Principal / Headmaster&apos;s Remark
            </label>
            <textarea
              rows={2}
              value={principalRemark}
              onChange={(e) => setPrincipalRemark(e.target.value)}
              placeholder="e.g., An exemplary scholar with a commendable attitude towards continuous learning."
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00A896] resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A896] hover:bg-[#008072] text-white text-sm font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
