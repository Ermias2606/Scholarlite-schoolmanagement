import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add routeUserToTab helper
routing_helper = """
  const routeUserToTab = (role: string) => {
    if (['class_teacher', 'subject_teacher'].includes(role)) {
      setActiveTab('teacher_dashboard');
    } else {
      setActiveTab('overview');
    }
  };
"""
content = content.replace("const [showSaveToast, setShowSaveToast] = useState(false);", routing_helper + "\n  const [showSaveToast, setShowSaveToast] = useState(false);")

# Update onAuthStateChanged
content = content.replace("setCurrentUser(profile);", "setCurrentUser(profile);\n        routeUserToTab(profile.role);")

# Update handleSelectUser
content = content.replace("setCurrentUser(user);", "setCurrentUser(user);\n    routeUserToTab(user.role);")

with open('src/App.tsx', 'w') as f:
    f.write(content)
