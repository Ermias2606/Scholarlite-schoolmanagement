import React, { useState, useEffect, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Save,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Printer,
  TrendingUp,
} from 'lucide-react';
import { AppData, SchoolClass, Subject, UserProfile, Student } from '../types';
import { downloadMarkTemplateCSV, parseMarksCSV } from '../utils/calculations';
import { ReportsView } from './ReportsView';
import { PrintReportCardModal } from './PrintReportCardModal';

interface ResultsTabProps {
  appData: AppData;
  initialClassId?: string | null;
  currentUser?: UserProfile;
  onSaveStudentMarks: (
    classId: string,
    year: string,
    semester: string,
    subjectName: string,
    marksMap: Record<string, { marks: Record<string, number>; total: number }>
  ) => void;
  onEditRemarksAttendance?: (student: Student) => void;
}

export const ResultsTab: React.FC<ResultsTabProps> = ({
  appData,
  initialClassId,
  currentUser,
  onSaveStudentMarks,
  onEditRemarksAttendance,
}) => {
  const { classes, settings } = appData;

  // Filter classes based on role
  const isClassTeacher = currentUser?.role === 'class_teacher';
  const visibleClasses = isClassTeacher && currentUser?.assignedClassId
    ? classes.filter((c) => c.id === currentUser.assignedClassId)
    : classes;

  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || visibleClasses[0]?.id || classes[0]?.id || ''
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    settings.academicYear || '2024/2025'
  );
  const [selectedSemester, setSelectedSemester] = useState<string>(
    settings.semesters[0] || 'Term 1'
  );
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>('');

  const [reportType, setReportType] = useState<
    'summary' | 'student_performance_summary' | 'rank_list' | 'master_sheet' | 'performance' | 'report_card'
  >('summary');

  // Spreadsheet buffer state: studentId -> { [assessmentName]: number | '' }
  const [marksBuffer, setMarksBuffer] = useState<Record<string, Record<string, number | ''>>>({});
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printStudentId, setPrintStudentId] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);

  const bulkUploadRef = useRef<HTMLInputElement | null>(null);

  const activeClass = visibleClasses.find((c) => c.id === selectedClassId) || visibleClasses[0] || classes[0] || null;

  // If subject_teacher, only allow their assigned subjects
  const isSubjectTeacher = currentUser?.role === 'subject_teacher';
  const availableSubjects = activeClass?.subjects.filter((sub) => {
    if (isSubjectTeacher && currentUser?.assignedSubjects && currentUser.assignedSubjects.length > 0) {
      return currentUser.assignedSubjects.includes(sub.name);
    }
    return true;
  }) || [];

  const activeSubject = availableSubjects.find((s) => s.name === selectedSubjectName) || null;

  // Sync marksBuffer whenever selected subject, class, year, or term changes
  useEffect(() => {
    if (!activeClass || !activeSubject) {
      setMarksBuffer({});
      return;
    }

    const newBuffer: Record<string, Record<string, number | ''>> = {};

    activeClass.students.forEach((student) => {
      const existing = student.results?.[selectedYear]?.[selectedSemester]?.[activeSubject.name];
      const studentMarks: Record<string, number | ''> = {};

      activeSubject.assessments.forEach((asm) => {
        const val = existing?.marks?.[asm.name];
        studentMarks[asm.name] = val !== undefined ? val : '';
      });

      newBuffer[student.id] = studentMarks;
    });

    setMarksBuffer(newBuffer);
    setValidationWarnings([]);
  }, [activeClass, activeSubject, selectedYear, selectedSemester]);

  const handleMarkChange = (studentId: string, assessmentName: string, value: string) => {
    const num = value === '' ? '' : Number(value);
    setMarksBuffer((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [assessmentName]: num,
      },
    }));
  };

  const handleSaveMarks = () => {
    if (!activeClass || !activeSubject) {
      alert('Please select both a class and a subject before saving.');
      return;
    }

    const warnings: string[] = [];
    const resultMap: Record<string, { marks: Record<string, number>; total: number }> = {};

    activeClass.students.forEach((student) => {
      const studentScores = marksBuffer[student.id] || {};
      const marksClean: Record<string, number> = {};
      let total = 0;

      activeSubject.assessments.forEach((asm) => {
        const val = studentScores[asm.name];
        const num = typeof val === 'number' && !isNaN(val) ? val : 0;

        if (num > asm.maxScore) {
          warnings.push(
            `${student.name} score ${num} exceeds maximum ${asm.maxScore} for ${asm.name}`
          );
        }
        marksClean[asm.name] = num;
        total += num;
      });

      resultMap[student.id] = {
        marks: marksClean,
        total,
      };
    });

    onSaveStudentMarks(
      activeClass.id,
      selectedYear,
      selectedSemester,
      activeSubject.name,
      resultMap
    );

    setValidationWarnings(warnings);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 4000);
  };

  const processMarkFile = (file: File) => {
    if (!file || !activeClass || !activeSubject) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseMarksCSV(text, activeSubject.assessments);

        if (parsed.length === 0) {
          alert('No valid marks found in CSV file.');
          return;
        }

        const newBuffer = { ...marksBuffer };
        let matchCount = 0;
        const warnings: string[] = [];

        parsed.forEach((row) => {
          const student = activeClass.students.find((s) => s.rollNo === row.rollNo);
          if (student) {
            newBuffer[student.id] = row.marks;
            matchCount++;
            if (row.warnings.length > 0) {
              warnings.push(`${student.name}: ${row.warnings.join(', ')}`);
            }
          }
        });

        setMarksBuffer(newBuffer);
        setValidationWarnings(warnings);
        alert(`Loaded marks for ${matchCount} students from CSV.`);
      } catch (err) {
        alert('Error parsing marks CSV: ' + String(err));
      } finally {
        if (bulkUploadRef.current) bulkUploadRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleBulkMarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processMarkFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (activeSubject) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!activeSubject) return;
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      processMarkFile(file);
    } else {
      alert('Please drop a valid .csv file.');
    }
  };

  const activeSubjectTotalMax = activeSubject?.assessments.reduce(
    (sum, a) => sum + (Number(a.maxScore) || 0),
    0
  ) || 0;

  return (
    <div className="space-y-6">
      {/* Configuration Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 sm:p-6 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-[#003366] font-bold text-base">
            <FileSpreadsheet className="w-5 h-5" />
            <span>Results Processing &amp; Mark Entry Hub</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-results-print-report-card"
              type="button"
              onClick={() => {
                setPrintStudentId(undefined);
                setIsPrintModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 cursor-pointer"
              title="Print official student report card formatted for PDF"
            >
              <Printer className="w-4 h-4 text-[#FFC300]" />
              <span>Print Report Card</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#FFC300] text-[#003366]">
                PDF
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Select Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedSubjectName('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold outline-none focus:border-[#00A896] bg-white"
            >
              {visibleClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.students?.length || 0} students)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold outline-none focus:border-[#00A896] bg-white"
            >
              <option value={settings.academicYear}>{settings.academicYear}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Semester / Term</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold outline-none focus:border-[#00A896] bg-white"
            >
              {settings.semesters.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject select for Mark Entry */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-sm">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Select Subject (for Mark Entry Spreadsheet)
            </label>
            <select
              value={selectedSubjectName}
              onChange={(e) => setSelectedSubjectName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold outline-none focus:border-[#00A896] bg-white"
            >
              <option value="">-- No Subject (View Reports Only) --</option>
              {availableSubjects.map((sub) => (
                <option key={sub.name} value={sub.name}>
                  {sub.name} ({sub.assessments.reduce((sum, a) => sum + (Number(a.maxScore) || 0), 0)} pts)
                </option>
              ))}
            </select>
          </div>

          {!activeSubject && (
            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <button
                type="button"
                id="btn-open-performance-summary"
                onClick={() => setReportType('student_performance_summary')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#008f80] text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                <span>🚀 Open Student Performance Summary</span>
              </button>
            </div>
          )}

          {activeSubject && (
            <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
              <button
                onClick={() => downloadMarkTemplateCSV(activeClass, activeSubject)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition cursor-pointer"
                title="Download mark spreadsheet template"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                <span>Mark Template (CSV)</span>
              </button>

              <input
                type="file"
                ref={bulkUploadRef}
                accept=".csv"
                className="hidden"
                onChange={handleBulkMarkUpload}
              />

              <button
                onClick={() => bulkUploadRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Bulk upload marks from CSV"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Marks (CSV)</span>
              </button>

              <button
                onClick={handleSaveMarks}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Marks</span>
              </button>
            </div>
          )}
        </div>

        {/* Notices */}
        {saveSuccessNotice && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Marks successfully updated and saved to offline database!</span>
          </div>
        )}

        {validationWarnings.length > 0 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Score Validation Warnings:</span>
            </div>
            {validationWarnings.slice(0, 3).map((w, idx) => (
              <p key={idx} className="text-[11px] pl-5">
                &bull; {w}
              </p>
            ))}
            {validationWarnings.length > 3 && (
              <p className="text-[11px] pl-5 font-semibold">
                +{validationWarnings.length - 3} more warnings.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Spreadsheet Mark Entry Table (When Subject is selected) */}
      {activeSubject && activeClass && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 sm:p-6 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
            <div>
              <span className="text-xs font-bold text-[#00A896] uppercase tracking-wider">
                Mark Entry Spreadsheet
              </span>
              <h3 className="text-lg font-black text-[#003366]">
                {activeSubject.name} &mdash; {selectedSemester} ({selectedYear})
              </h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
              Max Total: {activeSubjectTotalMax} Marks
            </span>
          </div>

          <div
            className={`mt-4 border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
              isDragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300 bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-white rounded-full shadow-xs border border-gray-100">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-sm font-semibold text-gray-700">
                Drag and drop your marks CSV file here
              </div>
              <div className="text-xs text-gray-500">
                or click "Upload Marks (CSV)" above to browse
              </div>
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100/80 text-[#003366] text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="py-3 px-3 w-16 text-center">Roll</th>
                  <th className="py-3 px-4 min-w-[160px]">Student Name</th>
                  {activeSubject.assessments.map((a) => (
                    <th key={a.name} className="py-3 px-3 text-center min-w-[120px]">
                      <div>{a.name}</div>
                      <div className="text-[10px] text-gray-500 font-normal">
                        Max {a.maxScore}
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center min-w-[100px] bg-blue-50/80 text-[#003366]">
                    Total (Max {activeSubjectTotalMax})
                  </th>
                  <th className="py-3 px-3 text-center w-24 text-gray-500 font-semibold text-[11px]">
                    Report Card
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeClass.students.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4 + activeSubject.assessments.length}
                      className="py-8 text-center text-gray-400 text-sm"
                    >
                      No students found in this class. Add students from the Classes tab.
                    </td>
                  </tr>
                ) : (
                  [...activeClass.students]
                    .sort((a, b) => a.rollNo - b.rollNo)
                    .map((student) => {
                      const studentScores = marksBuffer[student.id] || {};
                      let liveRowTotal = 0;

                      return (
                        <tr key={student.id} className="hover:bg-gray-50/50 transition">
                          <td className="py-2.5 px-3 text-center font-bold text-gray-600">
                            {student.rollNo}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-gray-900">
                            {student.name}
                          </td>
                          {activeSubject.assessments.map((a) => {
                            const val = studentScores[a.name];
                            const numVal = typeof val === 'number' ? val : 0;
                            liveRowTotal += numVal;
                            const isExceeded = numVal > a.maxScore;

                            return (
                              <td key={a.name} className="py-2.5 px-3 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max={a.maxScore}
                                  value={val === undefined ? '' : val}
                                  onChange={(e) =>
                                    handleMarkChange(student.id, a.name, e.target.value)
                                  }
                                  className={`w-20 px-2 py-1.5 text-center text-sm font-bold rounded-lg border outline-none transition ${
                                    isExceeded
                                      ? 'border-red-500 bg-red-50 text-red-700'
                                      : 'border-gray-300 focus:border-[#00A896] bg-white text-gray-800'
                                  }`}
                                  placeholder="0"
                                />
                              </td>
                            );
                          })}
                          <td className="py-2.5 px-4 text-center font-black text-base bg-blue-50/40 text-[#003366]">
                            {liveRowTotal}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setPrintStudentId(student.id);
                                setIsPrintModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-[#003366] hover:text-white text-gray-700 text-xs font-bold transition cursor-pointer"
                              title={`Print Report Card for ${student.name}`}
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Print</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports and Master Sheet Section */}
      {activeClass && (
        <ReportsView
          appData={appData}
          activeClass={activeClass}
          selectedYear={selectedYear}
          selectedSemester={selectedSemester}
          reportType={reportType}
          onSelectReportType={setReportType}
          onEditRemarksAttendance={onEditRemarksAttendance}
        />
      )}

      {/* Dedicated Print Report Card Modal with CSS media print queries */}
      {activeClass && (
        <PrintReportCardModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          appData={appData}
          activeClass={activeClass}
          initialStudentId={printStudentId}
          selectedYear={selectedYear}
          selectedSemester={selectedSemester}
          onEditRemarksAttendance={onEditRemarksAttendance}
        />
      )}
    </div>
  );
};
