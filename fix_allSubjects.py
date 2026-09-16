with open('src/components/StaffManagementSection.tsx', 'r') as f:
    content = f.read()

content = content.replace(") as string[]).sort();", "  ) as string[];\n  allSubjects.sort();")

with open('src/components/StaffManagementSection.tsx', 'w') as f:
    f.write(content)

