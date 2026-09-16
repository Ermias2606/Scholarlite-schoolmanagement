import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace any multiple consecutive currentUser={currentUser} with just one
content = re.sub(r'(\n\s*currentUser=\{currentUser\})+', r'\1', content)

# Remove currentUser={currentUser} from the new tabs that don't need it
# ManageClassesTab
content = re.sub(
    r'(<ManageClassesTab\s+appData=\{appData\}\s*)currentUser=\{currentUser\}',
    r'\1',
    content
)
# ManageSubjectsTab
content = re.sub(
    r'(<ManageSubjectsTab\s+appData=\{appData\}\s*)currentUser=\{currentUser\}',
    r'\1',
    content
)
# ManageStaffTab
content = re.sub(
    r'(<ManageStaffTab\s+appData=\{appData\}\s*)currentUser=\{currentUser\}',
    r'\1',
    content
)
# ManageLevelsTab
content = re.sub(
    r'(<ManageLevelsTab\s+appData=\{appData\}\s*)currentUser=\{currentUser\}',
    r'\1',
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
