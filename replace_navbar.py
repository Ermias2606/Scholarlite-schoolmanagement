import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

import_stmt = "import { StudentSmartSearch } from './StudentSmartSearch';\n"
content = content.replace("import { PWAInstallButton }", import_stmt + "import { PWAInstallButton }")

replacement = """      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg border border-[#FFC300] bg-white p-1 flex items-center justify-center shadow-xs">
            <img
              id="dash-logo"
              src={appData.settings.logo || '/icon.svg'}
              alt="Logo"
              className="w-full h-full object-contain rounded"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/icon.svg';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span id="dash-school-name" className="font-bold text-sm sm:text-base text-[#003366] leading-tight">
                {appData.settings.name}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-[#00A896]/10 text-[#00A896]">
                {appData.settings.academicYear}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 hidden sm:block">School Management System</p>
          </div>
        </div>
      </div>
      
      {/* Global Student Smart Search for Staff */}
      {currentUser.role !== 'student' && (
        <div className="hidden lg:flex flex-1 justify-center px-6">
          <StudentSmartSearch appData={appData} />
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-3">"""

content = re.sub(
    r'      <div className="flex items-center gap-3">.*?<div className="flex items-center gap-2 sm:gap-3">',
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
