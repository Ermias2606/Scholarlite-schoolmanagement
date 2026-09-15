import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add lastSyncTime state
content = content.replace(
    "const [activeTab, setActiveTab] = useState<'overview' | 'teacher_dashboard' | 'classes' | 'results' | 'calendar' | 'settings'>('overview');",
    "const [activeTab, setActiveTab] = useState<'overview' | 'teacher_dashboard' | 'classes' | 'results' | 'calendar' | 'settings'>('overview');\n  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);"
)

# 2. Update updateAppData
update_app_data_old = """  const updateAppData = (updater: (prev: AppData) => AppData) => {
    setAppData((prev) => {
      const next = updater(prev);
      saveAppData(next); // Local backup
      if (auth.currentUser) {
        saveAppDataToCloud(next); // Cloud sync
      }
      return next;
    });
  };"""

update_app_data_new = """  const updateAppData = (updater: (prev: AppData) => AppData) => {
    setAppData((prev) => {
      const next = updater(prev);
      saveAppData(next); // Local backup
      if (auth.currentUser) {
        saveAppDataToCloud(next).then(success => {
          if (success) setLastSyncTime(new Date());
        });
      }
      return next;
    });
  };"""

content = content.replace(update_app_data_old, update_app_data_new)

# 3. Update loadAppDataFromCloud usages
auth_old = """        const data = await loadAppDataFromCloud();
        setAppData(data);
        
        // Find existing user by email or UID
        let profile = data.users?.find((u) => u.email === user.email || u.id === user.uid);
        
        // If it's a new user logging in with Google, register them as an admin for demo purposes
        if (!profile) {
          profile = {
            id: user.uid,
            name: user.displayName || 'New User',
            role: 'admin', 
            username: user.email?.split('@')[0] || 'user',
            password: '',
            email: user.email || '',
          };
          data.users = [...(data.users || []), profile];
          await saveAppDataToCloud(data);
          setAppData(data);
        }
        
        setCurrentUser(profile);
        setSelectedClassId(data.classes[0]?.id || null);"""

auth_new = """        const { data, success } = await loadAppDataFromCloud();
        setAppData(data);
        if (success) setLastSyncTime(new Date());
        
        // Find existing user by email or UID
        let profile = data.users?.find((u) => u.email === user.email || u.id === user.uid);
        
        // If it's a new user logging in with Google, register them as an admin for demo purposes
        if (!profile) {
          profile = {
            id: user.uid,
            name: user.displayName || 'New User',
            role: 'admin', 
            username: user.email?.split('@')[0] || 'user',
            password: '',
            email: user.email || '',
          };
          data.users = [...(data.users || []), profile];
          const saveSuccess = await saveAppDataToCloud(data);
          if (saveSuccess) setLastSyncTime(new Date());
          setAppData(data);
        }
        
        setCurrentUser(profile);
        setSelectedClassId(data.classes[0]?.id || null);"""

content = content.replace(auth_old, auth_new)

# 4. Pass lastSyncTime to Navbar
navbar_old = """      <Navbar
        appData={appData}
        currentUser={currentUser}
        onLogout={() => {
          if (auth.currentUser) {
            signOut(auth);
          } else {
            setView('landing');
          }
        }}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />"""

navbar_new = """      <Navbar
        appData={appData}
        currentUser={currentUser}
        lastSyncTime={lastSyncTime}
        onLogout={() => {
          if (auth.currentUser) {
            signOut(auth);
          } else {
            setView('landing');
          }
        }}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />"""

content = content.replace(navbar_old, navbar_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)
