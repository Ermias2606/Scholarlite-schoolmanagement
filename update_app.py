import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

# Make onOpenRoleSwitcher conditional
new_navbar = """      <Navbar
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
        onOpenRoleSwitcher={['super_admin', 'school_admin', 'admin'].includes(currentUser.role) ? () => setIsRoleSwitcherOpen(true) : undefined}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />"""
content = re.sub(
    r'<Navbar\s+appData=\{appData\}\s+currentUser=\{currentUser\}.*?isMobileMenuOpen=\{isMobileMenuOpen\}\s+/>',
    new_navbar,
    content,
    flags=re.DOTALL
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
