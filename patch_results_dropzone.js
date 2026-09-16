import fs from 'fs';
let content = fs.readFileSync('src/components/ResultsTab.tsx', 'utf8');

const targetStr = `            <div className="text-xs text-gray-500">
              or click the icon above to browse
            </div>`;
                  
const replacementStr = `            <div className="text-xs text-gray-500">
              or click the icon above to browse
            </div>
            <button
              type="button"
              onClick={() => activeClass && activeSubject && downloadMarkTemplateCSV(activeClass, activeSubject)}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-gray-600 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Marklist Template CSV
            </button>`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/ResultsTab.tsx', content);
