import re

with open('src/components/ManageStudentsTab.tsx', 'r') as f:
    content = f.read()

# Pass currentUser to check roles
content = content.replace("interface ManageStudentsTabProps {", "import { UserProfile } from '../types';\n\ninterface ManageStudentsTabProps {\n  currentUser?: UserProfile;")
content = content.replace("export const ManageStudentsTab: React.FC<ManageStudentsTabProps> = ({ appData, onAddStudent, onUpdateStudent, onDeleteStudent }) => {", "export const ManageStudentsTab: React.FC<ManageStudentsTabProps> = ({ appData, currentUser, onAddStudent, onUpdateStudent, onDeleteStudent }) => {")

# Add Add logic for pending/approved
add_old = """    onAddStudent(newAddClassId, {
      rollNo: parseInt(newRollNo, 10),
      name: newName.trim(),
      gender: newGender
    });"""

add_new = """    const canApprove = ['super_admin', 'school_admin'].includes(currentUser?.role || '');
    onAddStudent(newAddClassId, {
      rollNo: parseInt(newRollNo, 10),
      name: newName.trim(),
      gender: newGender,
      ...(canApprove ? { status: 'approved' } : { status: 'pending' })
    } as any);"""

content = content.replace(add_old, add_new)

# Table Header
header_old = """                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3 text-right">Actions</th>"""
header_new = """                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>"""
content = content.replace(header_old, header_new)

# Table Row
row_old = """                    <td className="px-4 py-3 text-gray-500">{student.gender}</td>
                    <td className="px-4 py-3 text-right">"""
row_new = """                    <td className="px-4 py-3 text-gray-500">{student.gender}</td>
                    <td className="px-4 py-3">
                      {student.status === 'pending' ? (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold">Pending</span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-bold">Approved</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                      {student.status === 'pending' && ['super_admin', 'school_admin'].includes(currentUser?.role || '') && (
                        <button
                          onClick={() => onUpdateStudent(schoolClass.id, { ...student, status: 'approved' } as any)}
                          className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded hover:bg-emerald-600 transition"
                        >
                          Approve
                        </button>
                      )}"""
content = content.replace(row_old, row_new)

# Remove extra flex from action td end
content = content.replace("</td>\n                  </tr>", "</td>\n                  </tr>")

with open('src/components/ManageStudentsTab.tsx', 'w') as f:
    f.write(content)
