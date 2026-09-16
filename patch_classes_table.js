import fs from 'fs';
let content = fs.readFileSync('src/components/ClassesTab.tsx', 'utf8');

const oldTable = `                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[#003366] text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                      <th className="py-3 px-4 w-20 text-center">Roll No</th>
                      <th className="py-3 px-4 w-32">Unique ID</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4 text-center">Gender</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                          {activeClass.students.length === 0
                            ? 'No students enrolled yet. Add a student or upload a CSV above.'
                            : 'No students matched your search.'}
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50/50 transition">
                          <td className="py-3 px-4 text-center font-extrabold text-[#003366]">
                            #{s.rollNo}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs font-medium text-gray-500">
                            {s.admissionNumber || '-'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900">{s.name}</td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={\`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium \${
                                s.gender === 'Female'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : s.gender === 'Male'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }\`}
                            >
                              {s.gender}
                            </span>
                          </td>`;

const newTable = `                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[#003366] text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                      <th className="py-3 px-4 w-20 text-center">Roll No</th>
                      <th className="py-3 px-4 w-32">Unique ID</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Guardian Info</th>
                      <th className="py-3 px-4 text-center">Gender</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400 text-sm">
                          {activeClass.students.length === 0
                            ? 'No students enrolled yet. Add a student or upload a CSV above.'
                            : 'No students matched your search.'}
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50/50 transition">
                          <td className="py-3 px-4 text-center font-extrabold text-[#003366]">
                            #{s.rollNo}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs font-medium text-gray-500">
                            {s.admissionNumber || '-'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900">{s.name}</td>
                          <td className="py-3 px-4 text-xs">
                            <div className="font-medium text-gray-700">{s.parentName || '-'}</div>
                            <div className="text-gray-500">{s.parentContact || ''}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={\`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium \${
                                s.gender === 'Female'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : s.gender === 'Male'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }\`}
                            >
                              {s.gender}
                            </span>
                          </td>`;

content = content.replace(oldTable, newTable);
fs.writeFileSync('src/components/ClassesTab.tsx', content);
