import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Change label from 'School Levels' to 'Organization'
content = content.replace("{ id: 'manage_levels', label: 'School Levels', icon: Layers, roles: ['super_admin'] },", "{ id: 'manage_levels', label: 'Organization', icon: Layers, roles: ['super_admin', 'admin'] },")

old_manage = """                {activeTab === 'manage_levels' && (
                  <ManageLevelsTab
                    appData={appData}
                    
                    onUpdateLevels={(levels) => {
                      updateAppData((prev) => ({ ...prev, levels }));
                    }}
                    onAddAuditLog={handleAddAuditLog}
                  />
                )}"""

new_manage = """                {activeTab === 'manage_levels' && (
                  <ManageLevelsTab
                    appData={appData}
                    onUpdateLevels={(levels) => updateAppData(prev => ({ ...prev, levels }))}
                    onUpdateDepartments={(departments) => updateAppData(prev => ({ ...prev, departments }))}
                    onUpdateBranches={(branches) => updateAppData(prev => ({ ...prev, branches }))}
                    onAddAuditLog={handleAddAuditLog}
                  />
                )}"""

content = content.replace(old_manage, new_manage)

with open('src/App.tsx', 'w') as f:
    f.write(content)
