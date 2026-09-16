import fs from 'fs';
let content = fs.readFileSync('src/components/ClassesTab.tsx', 'utf8');

const oldForm = `                <div className="w-full md:w-32">
                  <select
                    value={newStudentGender}
                    onChange={(e) => setNewStudentGender(e.target.value as 'Male' | 'Female' | 'Other')}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs font-medium outline-none focus:border-[#00A896]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button`;

const newForm = `                <div className="flex-1">
                  <input
                    type="text"
                    value={newParentName}
                    onChange={(e) => setNewParentName(e.target.value)}
                    placeholder="Parent/Guardian Name"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs font-medium outline-none focus:border-[#00A896]"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={newParentContact}
                    onChange={(e) => setNewParentContact(e.target.value)}
                    placeholder="Parent Contact (Phone)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs font-medium outline-none focus:border-[#00A896]"
                  />
                </div>
                <div className="w-full md:w-28">
                  <select
                    value={newStudentGender}
                    onChange={(e) => setNewStudentGender(e.target.value as 'Male' | 'Female' | 'Other')}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs font-medium outline-none focus:border-[#00A896]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button`;

content = content.replace(oldForm, newForm);
fs.writeFileSync('src/components/ClassesTab.tsx', content);
