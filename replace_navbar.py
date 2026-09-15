import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

props_old = """interface NavbarProps {
  appData: AppData;
  currentUser: UserProfile;
  onLogout: () => void;
  onOpenRoleSwitcher?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}"""

props_new = """import { formatDistanceToNow } from 'date-fns';\n\ninterface NavbarProps {
  appData: AppData;
  currentUser: UserProfile;
  lastSyncTime?: Date | null;
  onLogout: () => void;
  onOpenRoleSwitcher?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}"""

content = content.replace(props_old, props_new)

fc_old = """export const Navbar: React.FC<NavbarProps> = ({
  appData,
  currentUser,
  onLogout,
  onOpenRoleSwitcher,
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {"""

fc_new = """export const Navbar: React.FC<NavbarProps> = ({
  appData,
  currentUser,
  lastSyncTime,
  onLogout,
  onOpenRoleSwitcher,
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {"""

content = content.replace(fc_old, fc_new)

import_stmt = "import { CheckCircle2 } from 'lucide-react';\n"
content = content.replace("import { LogOut, Wifi, WifiOff,", import_stmt + "import { LogOut, Wifi, WifiOff,")

badge_old = """        {/* Offline / Online Badge */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-300'
          }`}
          title={isOnline ? 'Connected (Offline cache active)' : 'Offline mode active'}
        >
          {isOnline ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3 text-amber-600 animate-pulse" />}
          <span className="hidden md:inline">{isOnline ? 'Online' : 'Offline'}</span>
        </div>"""

badge_new = """        {/* Offline / Online Badge & Sync Status */}
        <div className="flex flex-col items-end mr-2">
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
            title={isOnline ? 'Connected (Offline cache active)' : 'Offline mode active'}
          >
            {isOnline ? <Wifi className="w-2.5 h-2.5 text-emerald-600" /> : <WifiOff className="w-2.5 h-2.5 text-amber-600 animate-pulse" />}
            <span className="hidden md:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          {lastSyncTime && isOnline && (
            <div className="hidden lg:flex items-center gap-1 mt-0.5 text-[9px] font-medium text-gray-400">
              <CheckCircle2 className="w-2.5 h-2.5 text-[#00A896]" />
              Synced {formatDistanceToNow(lastSyncTime, { addSuffix: true })}
            </div>
          )}
        </div>"""

content = content.replace(badge_old, badge_new)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
