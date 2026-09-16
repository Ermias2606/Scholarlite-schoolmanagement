import React from 'react';
import { SchoolClass, Settings, Student } from '../types';

interface IdCardBackTemplateProps {
  student: Student;
  activeClass: SchoolClass;
  settings: Settings;
}

export const IdCardBackTemplate: React.FC<IdCardBackTemplateProps> = ({
  student,
  activeClass,
  settings,
}) => {
  return (
    <div className="w-[54mm] h-[86mm] bg-white rounded-xl shadow-md overflow-hidden relative border border-gray-200 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid box-border flex flex-col">
      
      {/* Top Warning/Instruction bar */}
      <div className="w-full h-8 bg-gray-800 flex items-center justify-center shrink-0">
        <span className="text-[7px] font-bold text-white uppercase tracking-widest text-center px-4 leading-tight">
          This card is the property of<br/>{settings.name}
        </span>
      </div>

      <div className="flex-1 p-3 flex flex-col text-[7px] text-gray-700 leading-snug space-y-2">
        <p>
          <strong className="text-gray-900 block mb-0.5 uppercase tracking-wider text-[6px]">Terms & Conditions:</strong>
          1. This card must be worn at all times within the school premises.<br/>
          2. It is non-transferable and must be presented upon request.<br/>
          3. Loss of this card must be reported immediately to the administration.
        </p>

        <p className="mt-2">
          <strong className="text-gray-900 block mb-0.5 uppercase tracking-wider text-[6px]">Guardian Contact:</strong>
          {student.parentName ? (
            <>
              <strong>{student.parentName}</strong><br/>
              Phone: {student.parentContact || 'N/A'}<br/>
            </>
          ) : (
            <>
              Parent/Guardian not listed.<br/>
            </>
          )}
        </p>
        <p className="mt-2">
          <strong className="text-gray-900 block mb-0.5 uppercase tracking-wider text-[6px]">If found, return to:</strong>
          <strong>{settings.name}</strong><br/>
        </p>
      </div>

      {/* QR Code Placeholder */}
      <div className="mt-auto pb-3 flex flex-col items-center justify-center shrink-0">
        <div className="w-12 h-12 border-2 border-gray-300 rounded flex items-center justify-center bg-gray-50 relative">
          <div className="absolute inset-1 border border-gray-300 border-dashed"></div>
          <div className="w-8 h-8 grid grid-cols-2 gap-0.5 opacity-50">
            <div className="bg-gray-800 rounded-sm"></div>
            <div className="bg-gray-600 rounded-sm"></div>
            <div className="bg-gray-700 rounded-sm"></div>
            <div className="bg-gray-900 rounded-sm"></div>
          </div>
        </div>
        <span className="text-[6px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
          Scan to Verify
        </span>
      </div>

      {/* Footer bar */}
      <div className="w-full h-[6mm] bg-[#003366] flex items-center justify-center shrink-0">
        <span className="text-[6px] font-bold text-white uppercase tracking-widest">
          Valid for {settings.academicYear}
        </span>
      </div>
    </div>
  );
};
