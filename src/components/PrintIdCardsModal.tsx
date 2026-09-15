import React from 'react';
import { X, Printer, User } from 'lucide-react';
import { SchoolClass, Settings } from '../types';

interface PrintIdCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeClass: SchoolClass | null;
  settings: Settings;
}

export const PrintIdCardsModal: React.FC<PrintIdCardsModalProps> = ({
  isOpen,
  onClose,
  activeClass,
  settings,
}) => {
  if (!isOpen || !activeClass) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:p-0 print:bg-transparent print:static print:inset-auto">
      {/* Modal Container */}
      <div className="bg-gray-100 w-full max-w-5xl h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden print:w-full print:h-auto print:rounded-none print:shadow-none print:bg-white print:overflow-visible">
        
        {/* Header (No print) */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200 print:hidden shrink-0">
          <div>
            <h2 className="text-xl font-black text-[#003366]">Print ID Cards</h2>
            <p className="text-sm text-gray-500">
              Student ID Cards for {activeClass.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00A896] hover:bg-[#008f80] text-white font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              Print Cards
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview / Print Area */}
        <div className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible bg-gray-100 print:bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4 max-w-5xl mx-auto">
            {activeClass.students.map((student) => (
              <div
                key={student.id}
                className="w-full max-w-[324px] h-[204px] bg-white rounded-xl border-2 border-gray-800 p-3 flex flex-col shadow-sm mx-auto overflow-hidden relative print:border-gray-500 print:shadow-none print:break-inside-avoid print:w-[3.375in] print:h-[2.125in]"
                style={{ aspectRatio: '3.375 / 2.125' }}
              >
                {/* ID Header */}
                <div className="text-center border-b-2 border-gray-800 pb-1 mb-2">
                  <div className="font-black text-[#003366] text-sm uppercase tracking-wider truncate leading-tight">
                    {settings.schoolName}
                  </div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                    Student Identity Card
                  </div>
                </div>

                {/* ID Body */}
                <div className="flex gap-3 flex-1 items-center overflow-hidden">
                  {/* Photo Placeholder */}
                  <div className="w-20 h-24 bg-gray-100 border border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 flex-shrink-0">
                    <User className="w-8 h-8 mb-1" />
                    <span className="text-[8px] font-bold text-gray-400">PHOTO</span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-1.5 text-xs truncate">
                    <div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase">Name</div>
                      <div className="font-extrabold text-gray-900 leading-tight truncate">
                        {student.name}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase">Roll No</div>
                        <div className="font-bold text-[#00A896]">{student.rollNo}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase">Class</div>
                        <div className="font-bold text-gray-800 truncate">{activeClass.name}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase">Academic Year</div>
                      <div className="font-bold text-gray-800">{settings.academicYear}</div>
                    </div>
                  </div>
                </div>

                {/* Barcode/Footer */}
                <div className="mt-2 pt-1.5 border-t border-gray-200 flex justify-center items-center h-4">
                  <div className="w-3/4 h-3 flex items-center justify-between opacity-40">
                    {/* Fake barcode lines */}
                    {[...Array(24)].map((_, i) => (
                      <div
                        key={i}
                        className={`bg-gray-800 h-full ${
                          i % 4 === 0 ? 'w-1' : i % 2 === 0 ? 'w-0.5' : 'w-1.5'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {activeClass.students.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-400">
                No students enrolled in this class yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
