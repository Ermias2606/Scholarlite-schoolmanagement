import re
with open('src/components/SettingsTab.tsx', 'r') as f:
    content = f.read()

# Remove staff tab
content = content.replace("<button\n            onClick={() => setActiveSubTab('staff')}", "{/* <button\n            onClick={() => setActiveSubTab('staff')}")
content = content.replace("Staff Management\n          </button>", "Staff Management\n          </button> */}")

# Remove Levels section
content = re.sub(
    r'<div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm mt-6 mb-8">\n.*?<h3 className="text-sm font-bold text-gray-900 mb-1">School Levels</h3>.*?</div>\n\s*</div>',
    '',
    content,
    flags=re.DOTALL
)

with open('src/components/SettingsTab.tsx', 'w') as f:
    f.write(content)
