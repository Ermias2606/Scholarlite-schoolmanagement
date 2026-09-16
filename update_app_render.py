import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add imports
imports = """import { ManageClassesTab } from './components/ManageClassesTab';
import { ManageSubjectsTab } from './components/ManageSubjectsTab';
import { ManageStudentsTab } from './components/ManageStudentsTab';
import { ManageStaffTab } from './components/ManageStaffTab';
import { ManageLevelsTab } from './components/ManageLevelsTab';
"""

content = content.replace("import { LandingView } from './components/LandingView';", imports + "import { LandingView } from './components/LandingView';")

# Add renders
render_old = """                {activeTab === 'classes' && (
                  <ClassesTab
                    appData={appData}
                    classes={appData.classes}
                    selectedClassId={selectedClassId}
                    currentUser={currentUser}
                    onSelectClass={setSelectedClassId}
                    onAddClass={handleAddClass}
                    onDeleteClass={handleDeleteClass}
                    onSaveSubject={handleSaveSubject}
                    onDeleteSubject={handleDeleteSubject}
                    onAddStudent={handleAddStudent}
                    onUpdateStudent={handleUpdateStudent}
                    onDeleteStudent={handleDeleteStudent}
                    onBulkUploadStudents={handleBulkUploadStudents}
                    onEditRemarksAttendance={(student, className) =>
                      setEditingRemarksStudent({ student, className })
                    }
                  />
                )}"""

render_new = render_old + """
                {activeTab === 'manage_classes' && (
                  <ManageClassesTab
                    appData={appData}
                    onAddClass={(name, levelId) => {
                      updateAppData(prev => ({
                        ...prev,
                        classes: [...prev.classes, { id: generateId('class'), name, levelId, subjects: [], students: [] }]
                      }));
                      handleAddAuditLog('Add Class', `Added class: ${name}`);
                    }}
                    onDeleteClass={handleDeleteClass}
                  />
                )}
                {activeTab === 'manage_subjects' && (
                  <ManageSubjectsTab
                    appData={appData}
                    onSaveSubject={handleSaveSubject}
                    onDeleteSubject={handleDeleteSubject}
                  />
                )}
                {activeTab === 'manage_students' && (
                  <ManageStudentsTab
                    appData={appData}
                    onAddStudent={handleAddStudent}
                    onUpdateStudent={handleUpdateStudent}
                    onDeleteStudent={handleDeleteStudent}
                  />
                )}
                {activeTab === 'manage_staff' && (
                  <ManageStaffTab
                    appData={appData}
                    onUpdateUsers={(users) => {
                      updateAppData((prev) => ({ ...prev, users }));
                    }}
                    onAddAuditLog={handleAddAuditLog}
                  />
                )}
                {activeTab === 'manage_levels' && (
                  <ManageLevelsTab
                    appData={appData}
                    onUpdateLevels={(levels) => {
                      updateAppData((prev) => ({ ...prev, levels }));
                    }}
                    onAddAuditLog={handleAddAuditLog}
                  />
                )}
"""

content = content.replace(render_old, render_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)
