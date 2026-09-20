import React from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, FileSpreadsheet, User, BarChart } from 'lucide-react';
import { SchoolClass, Subject } from '../types';

interface ReviewMarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  activeClass: SchoolClass | null;
  year: string;
  semester: string;
  onApprove?: (classId: string, year: string, semester: string, subjectName: string) => void;
  onReject?: (classId: string, year: string, semester: string, subjectName: string) => void;
}

export const ReviewMarksModal: React.FC<ReviewMarksModalProps> = ({
  isOpen,
  onClose,
  subject,
  activeClass,
  year,
  semester,
  onApprove,
  onReject
}) => {
  if (!isOpen || !subject || !activeClass) return null;

  const maxPossibleScore = subject.assessments.reduce((sum, a) => sum + (Number(a.maxScore) || 0), 0);

  let submittedCount = 0;
  let totalScore = 0;
  let highestScore = 0;
  let lowestScore = maxPossibleScore;
  let isApproved = false;
  let isRejected = false;

  const studentRows = [...activeClass.students].sort((a, b) => a.rollNo - b.rollNo).map(student => {
    const res = student.results?.[year]?.[semester]?.[subject.name];
    const hasMarks = res !== undefined && Object.keys(res.marks || {}).length > 0;
    const total = res?.total || 0;
    
    if (hasMarks) {
      submittedCount++;
      totalScore += total;
      if (total > highestScore) highestScore = total;
      if (total < lowestScore) lowestScore = total;
    }

    if (res?.approved === true) isApproved = true;
    if (res?.approved === false) isRejected = true;

    return {
      ...student,
      hasMarks,
      total,
      marks: res?.marks || {},
      previousMarks: res?.previousMarks,
      editRemark: res?.editRemark,
      lastEditedAt: res?.lastEditedAt,
    };
  });

  const average = submittedCount > 0 ? (totalScore / submittedCount).toFixed(1) : '0.0';
  if (submittedCount === 0) lowestScore = 0;

  const editedRows = studentRows.filter((r) => r.editRemark || (r.previousMarks && Object.keys(r.previousMarks).length > 0));

  const handleApprove = () => {
    if (onApprove) onApprove(activeClass.id, year, semester, subject.name);
    onClose();
  };

  const handleReject = () => {
    if (onReject) onReject(activeClass.id, year, semester, subject.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50 shrink-0">
          <div>
            <h2 className="text-xl font-black text-[#003366] flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-[#00A896]" />
              Marks Review: {subject.name}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {activeClass.name} &bull; {semester} ({year})
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-blue-500 mb-1"><User className="w-5 h-5" /></div>
              <div className="text-2xl font-black text-blue-900">{submittedCount} <span className="text-sm font-semibold text-blue-600">/ {activeClass.students.length}</span></div>
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mt-1">Submitted</div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="text-emerald-500 mb-1"><BarChart className="w-5 h-5" /></div>
              <div className="text-2xl font-black text-emerald-900">{average}</div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mt-1">Average Score</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="text-purple-500 mb-1"><CheckCircle2 className="w-5 h-5" /></div>
              <div className="text-2xl font-black text-purple-900">{highestScore}</div>
              <div className="text-xs font-bold text-purple-700 uppercase tracking-wider mt-1">Highest Score</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="text-amber-500 mb-1"><AlertTriangle className="w-5 h-5" /></div>
              <div className="text-2xl font-black text-amber-900">{activeClass.students.length - submittedCount}</div>
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mt-1">Missing Entries</div>
            </div>
          </div>

          {/* Status Banner */}
          {isApproved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5" />
              These marks have already been approved and locked.
            </div>
          )}
          {isRejected && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 text-sm font-bold">
              <XCircle className="w-5 h-5" />
              These marks were previously rejected and are awaiting correction.
            </div>
          )}

          {/* Audit Trail Banner for Approver */}
          {editedRows.length > 0 && (
            <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Mark Revision Audit Notice ({editedRows.length} Student{editedRows.length > 1 ? 's' : ''} Modified)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                  Requires Close Review
                </span>
              </div>
              <p className="text-xs text-amber-800">
                The submitter modified previously recorded marks for this subject. The table below highlights both the original score and revised score, accompanied by the mandatory teacher remark.
              </p>
            </div>
          )}

          {/* Data Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Detailed Student Entries</h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-300 inline-block" />
                  <span>Standard Entry</span>
                </span>
                <span className="flex items-center gap-1.5 text-amber-800 font-semibold">
                  <span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300 inline-block" />
                  <span>Revised Score</span>
                </span>
              </div>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200 font-bold">
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Student Name</th>
                    {subject.assessments.map(a => (
                      <th key={a.name} className="py-3 px-3 text-center">{a.name} ({a.maxScore})</th>
                    ))}
                    <th className="py-3 px-4 text-center bg-gray-100/50">Total ({maxPossibleScore})</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-left min-w-[220px]">Teacher Remark / Audit Trail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {studentRows.map(row => {
                    const hasRevision = Boolean(row.editRemark || (row.previousMarks && Object.keys(row.previousMarks).length > 0));

                    return (
                      <tr
                        key={row.id}
                        className={`transition ${hasRevision ? 'bg-amber-50/50 hover:bg-amber-50/80' : 'hover:bg-gray-50'}`}
                      >
                        <td className="py-2.5 px-4 font-bold text-gray-700">#{row.rollNo}</td>
                        <td className="py-2.5 px-4 font-semibold text-gray-900">
                          <div>{row.name}</div>
                          {hasRevision && (
                            <div className="text-[10px] text-amber-700 font-bold flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Score Revised</span>
                            </div>
                          )}
                        </td>
                        {subject.assessments.map(a => {
                          const currentMark = row.hasMarks && row.marks[a.name] !== undefined ? row.marks[a.name] : '-';
                          const prevMark = row.previousMarks && row.previousMarks[a.name] !== undefined ? row.previousMarks[a.name] : null;
                          const isEdited = prevMark !== null && prevMark !== currentMark && typeof currentMark === 'number';
                          const delta = isEdited ? (currentMark as number) - (prevMark as number) : 0;

                          return (
                            <td key={a.name} className={`py-2.5 px-3 text-center ${isEdited ? 'bg-amber-100/40' : ''}`}>
                              <div className="flex flex-col items-center justify-center">
                                <span className={isEdited ? 'text-amber-900 font-extrabold text-sm' : 'text-gray-800 font-medium'}>
                                  {currentMark}
                                </span>
                                {isEdited && (
                                  <div className="flex items-center gap-1 mt-1 text-[10px]">
                                    <span className="line-through text-gray-400 font-mono">
                                      {prevMark}
                                    </span>
                                    <span
                                      className={`px-1 py-0.2 rounded font-bold font-mono ${
                                        delta > 0
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-rose-100 text-rose-800'
                                      }`}
                                    >
                                      {delta > 0 ? `+${delta}` : delta}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-4 text-center font-black text-[#003366] bg-gray-50/60">
                          {row.hasMarks ? row.total : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {row.hasMarks ? (
                            row.editRemark ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                                <AlertTriangle className="w-3 h-3 text-amber-600" /> Revised
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Original
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                              Missing
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-left text-xs">
                          {row.editRemark ? (
                            <div className="bg-white/80 p-2 rounded-lg border border-amber-200/80 shadow-2xs">
                              <p className="text-gray-800 font-medium italic">"{row.editRemark}"</p>
                              {row.lastEditedAt && (
                                <p className="text-[10px] text-gray-400 mt-1 font-mono">
                                  Revision: {new Date(row.lastEditedAt).toLocaleDateString()} {new Date(row.lastEditedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic">No revision</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 shrink-0 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium hidden sm:block">Please review all entries carefully before approving.</span>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handleReject}
              disabled={(!isApproved && submittedCount === 0) || isRejected}
              className="flex-1 sm:flex-none justify-center px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl transition flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <button 
              onClick={handleApprove}
              disabled={isApproved || submittedCount === 0}
              className="flex-1 sm:flex-none justify-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
