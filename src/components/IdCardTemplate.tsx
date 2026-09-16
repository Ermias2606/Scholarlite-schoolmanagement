import React from 'react';
import { SchoolClass, Settings, Student } from '../types';
import { User } from 'lucide-react';

interface IdCardTemplateProps {
  student: Student;
  activeClass: SchoolClass;
  settings: Settings;
}

export const IdCardTemplate: React.FC<IdCardTemplateProps> = ({
  student,
  activeClass,
  settings,
}) => {
  return (
    <div className="w-[54mm] h-[86mm] bg-white rounded-xl shadow-md overflow-hidden relative border border-gray-200 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid box-border flex flex-col items-center">
      
      {/* Background Graphic */}
      <div className="absolute top-0 left-0 right-0 h-[35mm] bg-[#003366] rounded-b-[20%] z-0 overflow-hidden">
        {/* Subtle pattern or gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#002244] to-[#00A896] opacity-90"></div>
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Header Info */}
      <div className="relative z-10 w-full text-center pt-3 px-2 flex flex-col items-center">
        {settings.logo ? (
          <img src={settings.logo} alt="Logo" className="w-8 h-8 object-contain bg-white rounded-full p-0.5 mb-1 shadow-sm" />
        ) : (
          <div className="w-8 h-8 bg-white rounded-full p-1 mb-1 shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-[#FFC300] rounded-full"></div>
          </div>
        )}
        <h2 className="text-[10px] font-black text-white uppercase leading-tight tracking-tight">
          {settings.name}
        </h2>
        <p className="text-[7px] font-bold text-white/80 uppercase tracking-widest mt-0.5">
          Student ID Card
        </p>
      </div>

      {/* Photo Area */}
      <div className="relative z-10 mt-3 w-20 h-24 bg-white rounded-lg border-2 border-white shadow-md flex items-center justify-center overflow-hidden shrink-0">
        <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
          <User className="w-8 h-8" />
        </div>
      </div>

      {/* Student Details */}
      <div className="relative z-10 w-full px-4 mt-2 text-center flex-1 flex flex-col">
        <h3 className="text-sm font-black text-[#003366] leading-tight truncate">
          {student.name}
        </h3>
        <p className="text-[9px] font-bold text-[#00A896] uppercase tracking-wider mt-0.5">
          {activeClass.name}
        </p>

        <div className="mt-2 w-full grid grid-cols-2 gap-x-2 gap-y-1 text-left px-2">
          <div className="flex flex-col">
            <span className="text-[6px] font-bold text-gray-400 uppercase">Roll No</span>
            <span className="text-[9px] font-bold text-gray-800">{student.rollNo}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[6px] font-bold text-gray-400 uppercase">DOB</span>
            <span className="text-[9px] font-bold text-gray-800">--/--/----</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[6px] font-bold text-gray-400 uppercase">Blood Grp</span>
            <span className="text-[9px] font-bold text-gray-800">N/A</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[6px] font-bold text-gray-400 uppercase">Valid Thru</span>
            <span className="text-[9px] font-bold text-gray-800">{settings.academicYear}</span>
          </div>
        </div>
      </div>

      {/* Footer / Barcode */}
      <div className="w-full bg-gray-50 h-[10mm] mt-auto flex items-center justify-center border-t border-gray-200">
        <div className="w-3/4 h-4 flex items-center justify-between opacity-60">
          {/* Fake barcode lines - random widths */}
          {[1, 2, 1, 3, 1, 1, 2, 1, 4, 1, 2, 1, 3, 1, 2, 1].map((w, i) => (
            <div
              key={i}
              className={`bg-black h-full`}
              style={{ width: `${w}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
