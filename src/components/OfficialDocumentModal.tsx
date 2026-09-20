import React from 'react';
import { X, Printer, FileText, CheckCircle2, ShieldCheck, Award } from 'lucide-react';
import { Settings, SchoolClass, Student, UserProfile } from '../types';

export type DocumentType = 'enrollment_cert' | 'transfer_cert' | 'faculty_appointment' | 'class_roster';

interface OfficialDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: DocumentType;
  settings: Settings;
  student?: Student | null;
  schoolClass?: SchoolClass | null;
  teacher?: UserProfile | null;
}

export const OfficialDocumentModal: React.FC<OfficialDocumentModalProps> = ({
  isOpen,
  onClose,
  documentType,
  settings,
  student,
  schoolClass,
  teacher,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const serialNo = `REG-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden print:w-full print:max-w-none print:h-auto print:max-h-none print:rounded-none print:shadow-none">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#003366]/10 text-[#003366] rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {documentType === 'enrollment_cert' && 'Official Certificate of Enrollment'}
                {documentType === 'transfer_cert' && 'Official Transfer Certificate (TC)'}
                {documentType === 'faculty_appointment' && 'Faculty Appointment & Assignment Order'}
                {documentType === 'class_roster' && 'Official Registrar Class Roster'}
              </h3>
              <p className="text-xs text-gray-500">Official document ready for verification and printing</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#00A896] hover:bg-[#008f80] text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-12 print:p-8 bg-gray-100 print:bg-white flex justify-center">
          <div className="w-full max-w-2xl bg-white border border-gray-300 print:border-none p-8 sm:p-12 shadow-sm rounded-xl print:rounded-none print:shadow-none min-h-[800px] flex flex-col justify-between text-gray-900 relative font-serif">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
              <span className="text-8xl font-black uppercase transform -rotate-45 font-sans">
                {settings.name}
              </span>
            </div>

            {/* Header / Letterhead */}
            <div>
              <div className="text-center pb-6 border-b-2 border-[#003366]">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-lg border border-amber-400 p-1 flex items-center justify-center bg-white shadow-xs">
                    <img
                      src={settings.logo || '/icon.svg'}
                      alt="Crest"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                      }}
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-[#003366] uppercase font-sans">
                      {settings.name}
                    </h1>
                    <p className="text-xs font-sans text-gray-500 font-medium tracking-wide">
                      OFFICE OF THE REGISTRAR &bull; ACADEMIC RECORDS BUREAU
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] font-sans text-gray-500 pt-3 border-t border-gray-100">
                  <span>Doc Ref: <strong className="font-mono text-gray-800">{serialNo}</strong></span>
                  <span>Academic Year: <strong className="text-gray-800">{settings.academicYear}</strong></span>
                  <span>Issue Date: <strong className="text-gray-800">{todayStr}</strong></span>
                </div>
              </div>

              {/* Document Title Banner */}
              <div className="my-8 text-center">
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#003366]/5 border border-[#003366]/20 text-[#003366] text-xs font-bold uppercase tracking-widest font-sans mb-3">
                  Official Administrative Record
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-gray-900 underline underline-offset-8 decoration-amber-500">
                  {documentType === 'enrollment_cert' && 'Certificate of Bonafide Enrollment'}
                  {documentType === 'transfer_cert' && 'Official Student Transfer Certificate'}
                  {documentType === 'faculty_appointment' && 'Faculty Appointment & Assignment Order'}
                  {documentType === 'class_roster' && `Official Administrative Cohort Roster: ${schoolClass?.name || 'Class'}`}
                </h2>
              </div>

              {/* Body Content depending on documentType */}
              {documentType === 'enrollment_cert' && student && (
                <div className="space-y-6 text-sm leading-relaxed text-gray-800 font-sans">
                  <p>
                    This is to officially certify that <strong>{student.name}</strong>, holder of Admission / Student ID Number{' '}
                    <span className="font-mono font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">
                      {student.admissionNumber || 'PENDING'}
                    </span>
                    , is a registered, bona fide student of <strong>{settings.name}</strong> enrolled in{' '}
                    <strong>{schoolClass?.name || 'Academic Class'}</strong> for the Academic Session{' '}
                    <strong>{settings.academicYear}</strong>.
                  </p>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500 block">Class Roll Number</span>
                      <strong className="text-sm font-mono text-gray-900">#{student.rollNo}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Gender</span>
                      <strong className="text-sm text-gray-900">{student.gender}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Parent / Guardian Name</span>
                      <strong className="text-sm text-gray-900">{student.parentName || 'Recorded on File'}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Guardian Emergency Contact</span>
                      <strong className="text-sm text-gray-900">{student.parentContact || 'On Record'}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Enrollment Status</span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold uppercase text-[10px]">
                        {student.studentStatus || 'Active Enrolled'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Date of Admission</span>
                      <strong className="text-sm text-gray-900">{student.enrollmentDate || settings.academicYear}</strong>
                    </div>
                  </div>

                  <p>
                    During their academic tenure at this institution, the aforementioned student has maintained regular attendance
                    and adhered to the standards of academic conduct set forth by the school administration.
                  </p>
                  <p className="text-xs text-gray-600 italic">
                    This certificate is issued at the request of the parent/guardian for all official and administrative purposes.
                  </p>
                </div>
              )}

              {documentType === 'transfer_cert' && student && (
                <div className="space-y-6 text-sm leading-relaxed text-gray-800 font-sans">
                  <p>
                    This document serves as the official <strong>Transfer & Clearance Certificate</strong> for student{' '}
                    <strong>{student.name}</strong> (Roll #{student.rollNo}, Admission ID #{student.admissionNumber || 'N/A'}),
                    formerly enrolled in <strong>{schoolClass?.name || 'Class'}</strong>.
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 block">Academic Year Cleared</span>
                      <strong className="text-gray-900">{settings.academicYear}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Clearance Status</span>
                      <span className="font-bold text-emerald-700">Dues & Library Cleared</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">General Conduct</span>
                      <strong className="text-gray-900">Good & Satisfactory</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Transfer Status</span>
                      <span className="font-bold text-blue-700 uppercase">Released for Relocation</span>
                    </div>
                  </div>
                  <p>
                    The school conveys its best wishes to the student in their future academic endeavors at their next institution.
                  </p>
                </div>
              )}

              {documentType === 'faculty_appointment' && teacher && (
                <div className="space-y-6 text-sm leading-relaxed text-gray-800 font-sans">
                  <p>
                    The Office of the Registrar, in concurrence with the School Board, confirms the faculty appointment and
                    academic workload allocation for <strong>{teacher.name}</strong> for the Academic Session{' '}
                    <strong>{settings.academicYear}</strong>.
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500 block">Official Title</span>
                      <strong className="text-sm text-gray-900">{teacher.title || 'Faculty Member'}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Department</span>
                      <strong className="text-sm text-gray-900">{teacher.department || 'Academic Instruction'}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Primary Roles</span>
                      <strong className="text-sm text-gray-900 capitalize">{(teacher.roles || [teacher.role]).join(', ').replace(/_/g, ' ')}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Staff Status</span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold uppercase text-[10px]">
                        {teacher.staffStatus || 'Active Faculty'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 block mb-1">Assigned Subjects / Teaching Allocation</span>
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.assignedSubjects && teacher.assignedSubjects.length > 0 ? (
                          teacher.assignedSubjects.map((sub) => (
                            <span key={sub} className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold text-xs">
                              {sub}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 italic">General Academic Allocation</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p>
                    The appointee is vested with full administrative and instructional authority for their allocated classes
                    in accordance with the school governance policies.
                  </p>
                </div>
              )}

              {documentType === 'class_roster' && schoolClass && (
                <div className="space-y-4 text-xs font-sans">
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div>
                      <span className="text-gray-500">Cohort:</span> <strong>{schoolClass.name}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Enrolled Headcount:</span> <strong>{schoolClass.students.length} Students</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Curricular Subjects:</span> <strong>{schoolClass.subjects.length}</strong>
                    </div>
                  </div>

                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b-2 border-gray-300 bg-gray-100 font-bold text-gray-700">
                        <th className="py-2 px-2">Roll</th>
                        <th className="py-2 px-2">Admission No</th>
                        <th className="py-2 px-2">Student Name</th>
                        <th className="py-2 px-2">Gender</th>
                        <th className="py-2 px-2">Guardian Contact</th>
                        <th className="py-2 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {schoolClass.students.map((st) => (
                        <tr key={st.id}>
                          <td className="py-1.5 px-2 font-mono font-bold">#{st.rollNo}</td>
                          <td className="py-1.5 px-2 font-mono text-gray-500">{st.admissionNumber || '-'}</td>
                          <td className="py-1.5 px-2 font-bold text-gray-900">{st.name}</td>
                          <td className="py-1.5 px-2">{st.gender}</td>
                          <td className="py-1.5 px-2 text-gray-600">{st.parentContact || st.parentName || 'On Record'}</td>
                          <td className="py-1.5 px-2">
                            <span className="capitalize text-[10px] font-semibold text-emerald-700">
                              {st.studentStatus || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Official Signatures & Seal Footer */}
            <div className="pt-12 border-t border-gray-300 mt-12 font-sans">
              <div className="grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="h-14 border-b border-gray-400 mb-2 flex items-end justify-center pb-1">
                    <span className="font-serif italic text-gray-600 text-sm">Official Records Bureau</span>
                  </div>
                  <strong className="text-gray-800 block">Registrar of Records</strong>
                  <span className="text-gray-500 text-[10px]">{settings.name}</span>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-600/60 flex items-center justify-center text-amber-700 text-[9px] font-black uppercase text-center p-1 leading-tight select-none">
                    OFFICIAL REGISTRAR SEAL
                  </div>
                </div>

                <div>
                  <div className="h-14 border-b border-gray-400 mb-2 flex items-end justify-center pb-1">
                    <span className="font-serif italic text-gray-600 text-sm">Office of the Principal</span>
                  </div>
                  <strong className="text-gray-800 block">Principal / Head of School</strong>
                  <span className="text-gray-500 text-[10px]">Academic Authority</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-gray-400 mt-6 pt-2 border-t border-gray-100">
                This computer-generated administrative transcript is certified by {settings.name}. Security Serial: {serialNo}.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
