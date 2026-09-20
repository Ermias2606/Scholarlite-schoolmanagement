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
  Edit3,
  XCircle,
  FileCheck2,
} from 'lucide-react';
import { AppData, SchoolClass, Subject, UserProfile, Student } from '../types';
import { downloadMarkTemplateCSV, parseMarksCSV } from '../utils/calculations';
import { ReportsView } from './ReportsView';
import { PrintReportCardModal } from './PrintReportCardModal';
import { ReviewMarksModal } from './ReviewMarksModal';
import { SaveMarksRemarkModal, StudentMarkDiff } from './SaveMarksRemarkModal';

interface ResultsTabProps {
  appData: AppData;
  initialClassId?: string | null;
  currentUser?: UserProfile;
  onApproveMarks?: (classId: string, year: string, semester: string, subjectName: string) => void;
  onRejectMarks?: (classId: string, year: string, semester: string, subjectName: string) => void;
  onSaveStudentMarks: (
    classId: string,
    year: string,
    semester: string,
    subjectName: string,
    marksMap: Record<string, { marks: Record<string, number>; total: number; previousMarks?: Record<string, number>; editRemark?: string; lastEditedAt?: string }>
  ) => void;
  onEditRemarksAttendance?: (student: Student) => void;
}

export const ResultsTab: React.FC<ResultsTabProps> = ({
  appData,
  initialClassId,
  currentUser,
  onApproveMarks,
  onRejectMarks,
  onSaveStudentMarks,
  onEditRemarksAttendance,
}) => {
  const { classes, settings } = appData;

  // Filter classes based on role
  const isClassTeacher = currentUser?.role === 'class_teacher';
  const visibleClasses = isClassTeacher
    ? classes.filter((c) => currentUser?.assignedClassIds?.includes(c.id) || c.id === currentUser?.assignedClassId)
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

  const canApprove = currentUser?.role === 'school_admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'admin' || currentUser?.role === 'class_teacher';
  
  const [subTab, setSubTab] = useState<'mark_entry' | 'approvals' | 'reports'>('mark_entry');
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
  const [reviewSubject, setReviewSubject] = useState<Subject | null>(null);

  // Mark Revision Modal States
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [pendingDiffs, setPendingDiffs] = useState<StudentMarkDiff[]>([]);
  const [pendingResultMap, setPendingResultMap] = useState<
    Record<
      string,
      {
        marks: Record<string, number>;
        total: number;
        previousMarks?: Record<string, number>;
        editRemark?: string;
        lastEditedAt?: string;
      }
    >
  >({});
  const [pendingWarnings, setPendingWarnings] = useState<string[]>([]);

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

  const activeSubject = availableSubjects.find((s) => s.name === selectedSubjectName) || availableSubjects[0] || null;
  const isSubjectApproved = activeClass?.students.some(s => s.results?.[selectedYear]?.[selectedSemester]?.[activeSubject?.name || '']?.approved) || false;

  // Enforce tab limits based on role
  useEffect(() => {
    if (!canApprove && subTab !== 'mark_entry') {
      setSubTab('mark_entry');
    }
  }, [canApprove, subTab]);

  // Default subject selection
  useEffect(() => {
    if (activeSubject && selectedSubjectName !== activeSubject.name) {
      setSelectedSubjectName(activeSubject.name);
    }
  }, [activeSubject, selectedSubjectName]);

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
    const resultMap: Record<string, { marks: Record<string, number>; total: number; previousMarks?: Record<string, number>; editRemark?: string; lastEditedAt?: string }> = {};
    const diffsList: StudentMarkDiff[] = [];

    activeClass.students.forEach((student) => {
      const existingEntry = student.results?.[selectedYear]?.[selectedSemester]?.[activeSubject.name];
      const existingMarks = existingEntry?.marks;
      const oldTotal = existingEntry?.total || 0;
      const studentScores = marksBuffer[student.id] || {};
      const marksClean: Record<string, number> = {};
      let total = 0;
      
      let studentHasEdits = false;
      const changedAssessments: { name: string; oldMark: number; newMark: number }[] = [];

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
        
        if (existingMarks && existingMarks[asm.name] !== undefined && existingMarks[asm.name] !== num) {
          studentHasEdits = true;
          changedAssessments.push({
            name: asm.name,
            oldMark: existingMarks[asm.name],
            newMark: num,
          });
        }
      });

      if (studentHasEdits) {
        diffsList.push({
          student,
          changedAssessments,
          oldTotal,
          newTotal: total,
        });
      }

      resultMap[student.id] = {
        marks: marksClean,
        total,
        ...(studentHasEdits ? { previousMarks: existingMarks } : {})
      };
    });

    if (diffsList.length > 0) {
      setPendingDiffs(diffsList);
      setPendingResultMap(resultMap);
      setPendingWarnings(warnings);
      setIsRemarkModalOpen(true);
      return;
    }

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

  const handleConfirmRevisionRemark = (remark: string) => {
    if (!activeClass || !activeSubject) return;

    const now = new Date().toISOString();
    const finalMap = { ...pendingResultMap };
    Object.keys(finalMap).forEach((studentId) => {
      if (finalMap[studentId].previousMarks) {
        finalMap[studentId].editRemark = remark;
        finalMap[studentId].lastEditedAt = now;
      }
    });

    onSaveStudentMarks(
      activeClass.id,
      selectedYear,
      selectedSemester,
      activeSubject.name,
      finalMap
    );

    setValidationWarnings(pendingWarnings);
    setSaveSuccessNotice(true);
    setIsRemarkModalOpen(false);
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

  const renderMarkEntryView = () => (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 sm:p-6 no-print">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
        <div>
          <span className="text-xs font-bold text-[#00A896] uppercase tracking-wider">
            Mark Entry Spreadsheet
          </span>
          <h3 className="text-lg font-black text-[#003366]">
            {activeSubject?.name} &mdash; {selectedSemester} ({selectedYear})
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
            Max Total: {activeSubjectTotalMax} Marks
          </span>
          {isSubjectApproved && (
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approved & Locked
            </span>
          )}
          {!isSubjectApproved && (
            <>
              <button
                onClick={() => activeClass && activeSubject && downloadMarkTemplateCSV(activeClass, activeSubject)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer"
                title="Download CSV template for bulk uploading marks"
              >
                <Download className="w-4 h-4 text-gray-500" />
                <span>Download Template</span>
              </button>
              <button
                onClick={handleSaveMarks}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00A896] hover:bg-[#008f80] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Marks</span>
            </button>
            </>
          )}
        </div>
      </div>

      {saveSuccessNotice && (
        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Marks successfully updated and saved!</span>
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

      {!isSubjectApproved && (
        <div
          className={`mt-4 border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
            isDragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300 bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-white rounded-full shadow-xs border border-gray-100 cursor-pointer" onClick={() => bulkUploadRef.current?.click()}>
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-sm font-semibold text-gray-700">
              Drag and drop your marks CSV file here
            </div>
            <div className="text-xs text-gray-500">
              or click the icon above to browse
            </div>
            <button
              type="button"
              onClick={() => activeClass && activeSubject && downloadMarkTemplateCSV(activeClass, activeSubject)}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-gray-600 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Marklist Template CSV
            </button>
            <input
              type="file"
              accept=".csv"
              ref={bulkUploadRef}
              onChange={handleBulkMarkUpload}
              className="hidden"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100/80 text-[#003366] text-xs font-bold uppercase tracking-wider border-b border-gray-200">
              <th className="py-3 px-3 w-16 text-center">Roll</th>
              <th className="py-3 px-4 min-w-[160px]">Student Name</th>
              {activeSubject?.assessments.map((a) => (
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!activeClass || activeClass.students.length === 0 ? (
              <tr>
                <td
                  colSpan={3 + (activeSubject?.assessments.length || 0)}
                  className="py-8 text-center text-gray-400 text-sm"
                >
                  No students found in this class.
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
                      {activeSubject?.assessments.map((a) => {
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
                              disabled={isSubjectApproved}
                              onChange={(e) =>
                                handleMarkChange(student.id, a.name, e.target.value)
                              }
                              className={`w-20 px-2 py-1.5 text-center text-sm font-bold rounded-lg border outline-none transition ${
                                isExceeded
                                  ? 'border-red-500 bg-red-50 text-red-700'
                                  : 'border-gray-300 focus:border-[#00A896] bg-white text-gray-800 disabled:bg-gray-50'
                              }`}
                              placeholder="0"
                            />
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-4 text-center font-black text-base bg-blue-50/40 text-[#003366]">
                        {liveRowTotal}
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderApprovalsView = () => {
    if (!activeClass) return null;
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 sm:p-6 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2 mb-6">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Approval Workflow
            </span>
            <h3 className="text-lg font-black text-[#003366]">
              {activeClass.name} &mdash; {selectedSemester} ({selectedYear})
            </h3>
            <p className="text-sm text-gray-500 mt-1">Review and approve subject marks entered by teachers.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeClass.subjects.map(subject => {
            // Check submission rate
            let hasMarks = 0;
            let isApproved = false;
            let isRejected = false;
            
            activeClass.students.forEach(student => {
              const res = student.results?.[selectedYear]?.[selectedSemester]?.[subject.name];
              if (res && res.total > 0) hasMarks++;
              if (res?.approved === true) isApproved = true;
              if (res?.approved === false) isRejected = true;
            });
            
            const totalStudents = activeClass.students.length;
            const progress = totalStudents > 0 ? (hasMarks / totalStudents) * 100 : 0;
            
            let statusBadge = (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200">
                Pending Entry
              </span>
            );
            
            if (isApproved) {
              statusBadge = (
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Approved
                </span>
              );
            } else if (isRejected) {
              statusBadge = (
                <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Rejected
                </span>
              );
            } else if (progress === 100) {
              statusBadge = (
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200 flex items-center gap-1">
                  Ready for Review
                </span>
              );
            }

            return (
              <div key={subject.name} className="border border-gray-200 rounded-xl p-4 flex flex-col hover:shadow-md transition bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 truncate">{subject.name}</h4>
                  {statusBadge}
                </div>
                
                <div className="text-xs text-gray-500 mb-4 flex-1">
                  <div className="flex justify-between mb-1">
                    <span>Submission Progress</span>
                    <span className="font-semibold text-gray-700">{hasMarks}/{totalStudents}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>

                
                <div className="flex mt-auto pt-3 border-t border-gray-200">
                  <button 
                    onClick={() => setReviewSubject(subject)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{isApproved || isRejected ? 'View Submission Details' : 'Review & Process Marks'}</span>
                  </button>
                </div>
              </div>
            );
          })}
          {activeClass.subjects.length === 0 && (
            <div className="col-span-full py-8 text-center text-gray-500 text-sm">
              No subjects assigned to this class.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Configuration Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 sm:p-6 no-print">
        
        {/* Module Sub-Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
          <button
            onClick={() => setSubTab('mark_entry')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              subTab === 'mark_entry'
                ? 'bg-[#003366] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Mark List & Roster</span>
          </button>
          
          {canApprove && (
            <>
              <button
                onClick={() => setSubTab('approvals')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  subTab === 'approvals'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approvals Workflow</span>
              </button>
              <button
                onClick={() => setSubTab('reports')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  subTab === 'reports'
                    ? 'bg-[#FFC300] text-[#003366] shadow-md ring-2 ring-[#FFC300]/50 ring-offset-1'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm'
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Reports & Master Sheet</span>
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 outline-none focus:border-[#00A896] transition"
            >
              {visibleClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              {visibleClasses.length === 0 && <option value="">No classes available</option>}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 outline-none focus:border-[#00A896] transition"
            >
              {settings.academicYears?.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
              {!settings.academicYears?.includes(selectedYear) && (
                <option value={selectedYear}>{selectedYear}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Term / Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 outline-none focus:border-[#00A896] transition"
            >
              {settings.semesters?.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
              {!settings.semesters?.includes(selectedSemester) && (
                <option value={selectedSemester}>{selectedSemester}</option>
              )}
            </select>
          </div>

          {subTab === 'mark_entry' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Subject
              </label>
              <select
                value={selectedSubjectName}
                onChange={(e) => setSelectedSubjectName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-[#003366] outline-none focus:border-[#00A896] transition"
              >
                {availableSubjects.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
                {availableSubjects.length === 0 && (
                  <option value="">No subjects assigned</option>
                )}
              </select>
            </div>
          )}
        </div>
      </div>

      {subTab === 'mark_entry' && renderMarkEntryView()}
      
      {subTab === 'approvals' && renderApprovalsView()}

      {/* Reports and Master Sheet Section */}
      {subTab === 'reports' && activeClass && (
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

      {/* Dedicated Print Report Card Modal */}
      {subTab === 'reports' && activeClass && (
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
      <ReviewMarksModal
        isOpen={!!reviewSubject}
        onClose={() => setReviewSubject(null)}
        subject={reviewSubject}
        activeClass={activeClass}
        year={selectedYear}
        semester={selectedSemester}
        onApprove={onApproveMarks}
        onReject={onRejectMarks}
      />
      <SaveMarksRemarkModal
        isOpen={isRemarkModalOpen}
        onClose={() => setIsRemarkModalOpen(false)}
        subjectName={activeSubject?.name || ''}
        className={activeClass?.name || ''}
        semester={selectedSemester}
        year={selectedYear}
        changedStudents={pendingDiffs}
        onConfirm={handleConfirmRevisionRemark}
      />
    </div>
  );
};
