import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Users,
  GraduationCap,
} from 'lucide-react';
import { SchoolClass, Student } from '../types';
import { downloadRosterTemplateCSV, parseRosterCSV } from '../utils/calculations';

interface BulkStudentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: SchoolClass[];
  initialClassId?: string;
  onBulkUpload: (
    classId: string,
    newStudents: (Partial<Student> & { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other' })[]
  ) => void;
}

export const BulkStudentUploadModal: React.FC<BulkStudentUploadModalProps> = ({
  isOpen,
  onClose,
  classes,
  initialClassId,
  onBulkUpload,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || classes[0]?.id || ''
  );
  const [parsedStudents, setParsedStudents] = useState<
    Array<{
      rollNo: number;
      name: string;
      gender: 'Male' | 'Female' | 'Other';
      parentName?: string;
      parentContact?: string;
      dob?: string;
      bloodGroup?: string;
      address?: string;
      emergencyContact?: string;
    }>
  >([]);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const targetClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const handleProcessFile = (file: File) => {
    if (!file) return;
    setErrorMsg('');
    setIsSuccess(false);

    if (!file.name.endsWith('.csv')) {
      setErrorMsg('Please select a valid CSV file.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseRosterCSV(text);
        if (parsed.length === 0) {
          setErrorMsg('No valid student records found. Please check that your CSV matches the template format.');
          setParsedStudents([]);
          return;
        }
        setParsedStudents(parsed);
      } catch (err) {
        setErrorMsg('Error parsing CSV file: ' + String(err));
        setParsedStudents([]);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleConfirmImport = () => {
    if (!targetClass || parsedStudents.length === 0) return;

    // Filter out conflicting roll numbers in this target class
    const existingRolls = new Set(targetClass.students.map((s) => s.rollNo));
    const conflicts = parsedStudents.filter((s) => existingRolls.has(s.rollNo));

    if (conflicts.length === parsedStudents.length) {
      setErrorMsg(`All ${conflicts.length} students in this file have roll numbers that already exist in ${targetClass.name}.`);
      return;
    }

    // Adjust rolls if conflict or filter
    const validToAdd = parsedStudents.filter((s) => !existingRolls.has(s.rollNo));

    onBulkUpload(targetClass.id, validToAdd);
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
      setIsSuccess(false);
      setParsedStudents([]);
      setFileName('');
    }, 1200);
  };

  const existingRolls = new Set(targetClass?.students.map((s) => s.rollNo) || []);
  const validCount = parsedStudents.filter((s) => !existingRolls.has(s.rollNo)).length;
  const conflictCount = parsedStudents.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-[#003366] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-white">
              <UploadCloud className="w-6 h-6 text-[#00A896]" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Bulk Student Enrolment</h3>
              <p className="text-xs text-white/70">
                Import complete student rosters with parent/guardian contacts and demographic records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Target Class Selection & Template Download */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-3">
              <label className="font-bold text-gray-700 whitespace-nowrap">Target Cohort:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-300 bg-white font-semibold text-xs outline-none focus:border-[#00A896]"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.students.length} current students)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={downloadRosterTemplateCSV}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 font-bold rounded-xl border border-gray-300 transition shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#00A896]" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-[#00A896] bg-teal-50/50'
                : 'border-gray-300 hover:border-[#00A896] hover:bg-gray-50'
            }`}
          >
            <FileSpreadsheet className="w-10 h-10 text-[#00A896]" />
            <div className="font-bold text-gray-800">
              {fileName ? fileName : 'Drop your student CSV file here, or click to browse'}
            </div>
            <p className="text-[11px] text-gray-500 max-w-md">
              Supports columns: Roll_No, Student_Name, Gender, Parent_Name, Parent_Contact, Date_of_Birth, Blood_Group, Address
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProcessFile(file);
              }}
              accept=".csv"
              className="hidden"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Successfully enrolled {validCount} students into {targetClass?.name}!</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedStudents.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="font-bold text-gray-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#003366]" />
                  <span>Preview Records ({parsedStudents.length} Found)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {validCount} Ready to Enroll
                  </span>
                  {conflictCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]" title="Conflicting roll numbers will be skipped">
                      {conflictCount} Conflict (Will Skip)
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 overflow-x-auto max-h-56">
                <table className="w-full text-left border-collapse whitespace-nowrap text-[11px]">
                  <thead className="bg-gray-100 text-gray-600 uppercase font-bold sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Roll #</th>
                      <th className="py-2 px-3">Student Name</th>
                      <th className="py-2 px-3">Gender</th>
                      <th className="py-2 px-3">Parent Name</th>
                      <th className="py-2 px-3">Parent Contact</th>
                      <th className="py-2 px-3">DOB</th>
                      <th className="py-2 px-3">Blood Group</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {parsedStudents.map((s, idx) => {
                      const isConflict = existingRolls.has(s.rollNo);
                      return (
                        <tr
                          key={idx}
                          className={isConflict ? 'bg-amber-50/50 text-gray-400' : 'hover:bg-gray-50'}
                        >
                          <td className="py-2 px-3 font-mono font-bold">
                            #{s.rollNo} {isConflict && <span className="text-amber-600 text-[9px]">(Exists)</span>}
                          </td>
                          <td className="py-2 px-3 font-semibold text-gray-900">{s.name}</td>
                          <td className="py-2 px-3">{s.gender}</td>
                          <td className="py-2 px-3">{s.parentName || '-'}</td>
                          <td className="py-2 px-3 font-mono">{s.parentContact || '-'}</td>
                          <td className="py-2 px-3">{s.dob || '-'}</td>
                          <td className="py-2 px-3">{s.bloodGroup || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
            onClick={handleConfirmImport}
            disabled={validCount === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#008f80] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Enroll {validCount} Student{validCount !== 1 ? 's' : ''} Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
