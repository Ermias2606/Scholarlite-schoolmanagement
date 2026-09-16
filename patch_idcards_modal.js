import fs from 'fs';

const modalCode = `import React, { useState } from 'react';
import { X, Printer, LayoutGrid, CheckSquare, Settings2 } from 'lucide-react';
import { SchoolClass, Settings } from '../types';
import { IdCardTemplate } from './IdCardTemplate';
import { IdCardBackTemplate } from './IdCardBackTemplate';

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
  const [printMode, setPrintMode] = useState<'front' | 'back' | 'both'>('front');

  if (!isOpen || !activeClass) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:p-0 print:bg-transparent print:static print:inset-auto">
      {/* Modal Container */}
      <div className="bg-gray-100 w-full max-w-5xl h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden print:w-full print:h-auto print:rounded-none print:shadow-none print:bg-white print:overflow-visible">
        
        {/* Header (No print) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white border-b border-gray-200 print:hidden shrink-0 gap-4">
          <div>
            <h2 className="text-xl font-black text-[#003366]">Print ID Cards</h2>
            <p className="text-sm text-gray-500">
              Student ID Cards for <strong className="text-gray-900">{activeClass.name}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Print Mode Selector */}
            <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200 mr-2">
              <button
                onClick={() => setPrintMode('front')}
                className={\`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors \${printMode === 'front' ? 'bg-white shadow text-[#003366]' : 'text-gray-500 hover:text-gray-700'}\`}
              >
                Fronts Only
              </button>
              <button
                onClick={() => setPrintMode('back')}
                className={\`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors \${printMode === 'back' ? 'bg-white shadow text-[#003366]' : 'text-gray-500 hover:text-gray-700'}\`}
              >
                Backs Only
              </button>
              <button
                onClick={() => setPrintMode('both')}
                className={\`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors \${printMode === 'both' ? 'bg-white shadow text-[#003366]' : 'text-gray-500 hover:text-gray-700'}\`}
              >
                Front & Back
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-5 py-2.5 w-full sm:w-auto bg-[#00A896] hover:bg-[#008f80] text-white font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>Print {activeClass.students.length} Cards</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition cursor-pointer hidden sm:block"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview / Print Area */}
        <div className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible bg-gray-100 print:bg-white print:m-0">
          <div className="flex flex-wrap justify-center gap-6 print:gap-4 print:justify-start max-w-5xl mx-auto print:mx-0">
            {activeClass.students.map((student) => (
              <React.Fragment key={student.id}>
                {(printMode === 'front' || printMode === 'both') && (
                  <IdCardTemplate
                    student={student}
                    activeClass={activeClass}
                    settings={settings}
                  />
                )}
                {(printMode === 'back' || printMode === 'both') && (
                  <IdCardBackTemplate
                    student={student}
                    activeClass={activeClass}
                    settings={settings}
                  />
                )}
              </React.Fragment>
            ))}

            {activeClass.students.length === 0 && (
              <div className="w-full text-center py-12 text-gray-400 font-medium">
                No students enrolled in this class yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/PrintIdCardsModal.tsx', modalCode);
