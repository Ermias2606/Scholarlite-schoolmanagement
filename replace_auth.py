import re

with open('src/components/LandingView.tsx', 'r') as f:
    content = f.read()

replacement = """  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setLoginError('Please enter credentials.');
      return;
    }

    if (selectedPortal === 'student') {
      let matchedStudent = null;
      let matchedClass = null;
      for (const c of appData.classes) {
        const student = c.students.find(s => 
          s.admissionNumber?.toLowerCase() === cleanUser || 
          s.rollNo.toString() === cleanUser
        );
        if (student) {
          matchedStudent = student;
          matchedClass = c;
          break;
        }
      }

      // Check if there is an explicit user profile for this student
      let matchedUser = users.find(
        (u) =>
          u.role === 'student' &&
          ((u.username?.toLowerCase() === cleanUser || u.email?.toLowerCase() === cleanUser) ||
           (matchedStudent && u.assignedStudentId === matchedStudent.id)) &&
          (u.password === cleanPass || (!u.password && cleanPass === 'password123'))
      );

      if (!matchedUser && matchedStudent && cleanPass === 'password123') {
        // Dynamically create a user profile for a student without one (Demo mode fallback)
        matchedUser = {
          id: `usr_dyn_${matchedStudent.id}`,
          name: matchedStudent.name,
          role: 'student',
          roles: ['student'],
          username: cleanUser,
          password: 'password123',
          title: `Student Portal (${matchedClass?.name})`,
          assignedClassId: matchedClass?.id,
          assignedStudentId: matchedStudent.id
        };
      }

      if (matchedUser) {
        setAuthSuccessUser(matchedUser);
        setTimeout(() => {
          onEnter(matchedUser);
        }, 400);
      } else {
        setLoginError('Invalid Student ID or password. (Demo password: password123)');
      }
    } else {
      // Authenticate against staff user roster
      const matchedUser = users.find(
        (u) =>
          u.role !== 'student' &&
          (u.username?.toLowerCase() === cleanUser || u.email?.toLowerCase() === cleanUser) &&
          (u.password === cleanPass || (!u.password && cleanPass === 'password123'))
      );

      if (matchedUser) {
        setAuthSuccessUser(matchedUser);
        setTimeout(() => {
          onEnter(matchedUser);
        }, 400);
      } else {
        setLoginError('Invalid Staff credentials. Check username or click a demo role below.');
      }
    }
  };"""

new_content = re.sub(
    r'  const handleCredentialSubmit = \(e: React.FormEvent\) => \{.*?\n  \};\n',
    replacement + '\n',
    content,
    flags=re.DOTALL
)

with open('src/components/LandingView.tsx', 'w') as f:
    f.write(new_content)
