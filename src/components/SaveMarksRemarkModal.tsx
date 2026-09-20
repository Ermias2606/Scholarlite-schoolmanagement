import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, History, ArrowRight, MessageSquareQuote } from 'lucide-react';
import { Student } from '../types';

export interface StudentMarkDiff {
  student: Student;
  changedAssessments: {
    name: string;
    oldMark: number;
    newMark: number;
  }[];
  oldTotal: number;
  newTotal: number;
}

interface SaveMarksRemarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectName: string;
  className: string;
  semester: string;
  year: string;
  changedStudents: StudentMarkDiff[];
  onConfirm: (remark: string) => void;
}

export const SaveMarksRemarkModal: React.FC<SaveMarksRemarkModalProps> = ({
  isOpen,
  onClose,
  subjectName,
  className: targetClassName,
  semester,
  year,
  changedStudents,
  onConfirm,
}) => {
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const quickRemarks = [
    'Clerical correction of marks tally',
    'Re-evaluation following script review',
    'Submitted makeup assessment paper',
    'Moderation adjustment per Academic Committee',
    'Grace marks awarded for approved co-curriculars',
  ];

  const handleConfirm = () => {
    if (!remark.trim()) {
      setError('Please provide a specific remark/reason for this mark revision.');
      return;
    }
    setError('');
    onConfirm(remark.trim());
    setRemark('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-800">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">
                  Mark Revision Audit Trail
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] uppercase tracking-wider border border-amber-200">
                  Editing Existing Scores
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                {subjectName} &bull; {targetClassName} &bull; {semester} ({year})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-amber-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold">Audit Policy Notice:</span> You are modifying marks that were previously submitted. The system records the previous score alongside your new score and will display both to the academic approver. A clear remark is mandatory before saving.
            </div>
          </div>

          {/* Diffs Table */}
          <div>
            <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px] mb-2">
              Detected Changes ({changedStudents.length} Student{changedStudents.length > 1 ? 's' : ''})
            </h4>
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50/50">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100/70 text-gray-600 text-[10px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Roll & Name</th>
                    <th className="py-2.5 px-3">Assessment</th>
                    <th className="py-2.5 px-3 text-center">Previous Score</th>
                    <th className="py-2.5 px-3 text-center">New Score</th>
                    <th className="py-2.5 px-3 text-right">Score Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60 bg-white">
                  {changedStudents.map((diff) => (
                    <React.Fragment key={diff.student.id}>
                      {diff.changedAssessments.map((a, idx) => {
                        const delta = a.newMark - a.oldMark;
                        return (
                          <tr key={`${diff.student.id}-${a.name}`} className="hover:bg-gray-50/50">
                            {idx === 0 && (
                              <td
                                rowSpan={diff.changedAssessments.length}
                                className="py-2.5 px-3 align-top font-semibold text-gray-900 border-r border-gray-100"
                              >
                                <div>#{diff.student.rollNo} &bull; {diff.student.name}</div>
                                <div className="text-[10px] text-gray-400 font-mono">
                                  Total: {diff.oldTotal} &rarr; {diff.newTotal}
                                </div>
                              </td>
                            )}
                            <td className="py-2 px-3 text-gray-700 font-medium">{a.name}</td>
                            <td className="py-2 px-3 text-center font-mono text-gray-500 line-through">
                              {a.oldMark}
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-[#003366]">
                              {a.newMark}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                                  delta > 0
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : delta < 0
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                {delta > 0 ? `+${delta}` : delta}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Remark Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center justify-between">
              <span>Remark / Justification for Revision *</span>
              <span className="text-[10px] text-gray-400 font-normal">Visible to Head of School & Approvers</span>
            </label>
            <textarea
              value={remark}
              onChange={(e) => {
                setRemark(e.target.value);
                if (error) setError('');
              }}
              rows={3}
              placeholder="Provide reason for editing existing marks (e.g., corrected script total, approved makeup exam)..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition ${
                error
                  ? 'border-rose-400 ring-2 ring-rose-100 focus:border-rose-500'
                  : 'border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20'
              }`}
            />
            {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

            {/* Quick Suggestions */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1 mb-1.5">
                <MessageSquareQuote className="w-3 h-3" /> Quick suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickRemarks.map((qr) => (
                  <button
                    key={qr}
                    type="button"
                    onClick={() => {
                      setRemark(qr);
                      if (error) setError('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] transition cursor-pointer"
                  >
                    + {qr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#008f80] text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Marks with Audit Remark</span>
          </button>
        </div>
      </div>
    </div>
  );
};
