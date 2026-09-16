import fs from 'fs';
let content = fs.readFileSync('src/components/ResultsTab.tsx', 'utf8');

const targetStr = `          {!isSubjectApproved && (
            <button
              onClick={handleSaveMarks}`;
              
const replacementStr = `          {!isSubjectApproved && (
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
                onClick={handleSaveMarks}`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/ResultsTab.tsx', content);
