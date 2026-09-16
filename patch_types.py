import re

with open('src/types.ts', 'r') as f:
    content = f.read()

# 1. Add Department and Branch
new_interfaces = """
export interface Department {
  id: string;
  name: string;
  headId?: string; // User ID
  description?: string;
}

export interface Branch {
  id: string;
  name: string;
  location?: string;
  branchHeadId?: string; // User ID
}

export interface SchoolLevel {
  id: string;
  admissionNumber?: string;
  name: string;
  order: number;
  headId?: string; // User ID
}
"""

content = re.sub(r'export interface SchoolLevel \{.*?\}', new_interfaces.strip(), content, flags=re.DOTALL)

# 2. Add to AppData
old_appdata = """export interface AppData {
  settings: Settings;
  levels?: SchoolLevel[];
  classes: SchoolClass[];
  events?: SchoolEvent[];
  users: UserProfile[];
  auditLogs?: AuditLog[];
  currentUser?: UserProfile;
}"""

new_appdata = """export interface AppData {
  settings: Settings;
  levels?: SchoolLevel[];
  departments?: Department[];
  branches?: Branch[];
  classes: SchoolClass[];
  events?: SchoolEvent[];
  users: UserProfile[];
  auditLogs?: AuditLog[];
  currentUser?: UserProfile;
}"""

content = content.replace(old_appdata, new_appdata)

with open('src/types.ts', 'w') as f:
    f.write(content)

