import fs from 'fs';
let content = fs.readFileSync('src/components/ClassesTab.tsx', 'utf8');

const targetStr = `                  <div className="text-xs text-gray-500">
                    or click "Bulk Upload (CSV)" above to browse
                  </div>`;
                  
const replacementStr = `                  <div className="text-xs text-gray-500">
                    or click "Bulk Upload (CSV)" above to browse
                  </div>
                  <button
                    type="button"
                    onClick={downloadRosterTemplateCSV}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-gray-600 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Student Template CSV
                  </button>`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/ClassesTab.tsx', content);
