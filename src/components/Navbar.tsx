import React from 'react';
import { LogOut, Wifi, WifiOff, Menu, X, ShieldCheck, GraduationCap, BookOpen, UserCheck, RefreshCw } from 'lucide-react';
import { AppData, UserProfile } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface NavbarProps {
  appData: AppData;
  currentUser: UserProfile;
  onLogout: () => void;
  onOpenRoleSwitcher?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  appData,
  currentUser,
  onLogout,
  onOpenRoleSwitcher,
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  const isOnline = useOnlineStatus();

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'class_teacher':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'subject_teacher':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'student':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'class_teacher':
        return 'Class Teacher';
      case 'subject_teacher':
        return 'Subject Teacher';
      case 'student':
        return 'Student / Parent';
      default:
        return role;
    }
  };

  return (
    <nav className="h-16 bg-white border-b border-gray-200 px-3 sm:px-6 flex items-center justify-between shadow-xs sticky top-0 z-30 no-print">
      <div className="flex items-center gap-3">
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

      <div className="flex items-center gap-2 sm:gap-3">
        {/* User Role Badge & Switcher */}
        {onOpenRoleSwitcher && (
          <button
            onClick={onOpenRoleSwitcher}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 transition cursor-pointer text-left"
            title="Click to switch role or staff profile"
          >
            <div className="w-6 h-6 rounded-full bg-[#003366] text-white flex items-center justify-center text-xs font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden lg:block leading-tight">
              <div className="text-xs font-bold text-gray-800 truncate max-w-[120px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-gray-500 capitalize">
                {getRoleLabel(currentUser.role)}
              </div>
            </div>
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(
                currentUser.role
              )}`}
            >
              {getRoleLabel(currentUser.role)}
            </span>
            <RefreshCw className="w-3 h-3 text-gray-400 hidden sm:block" />
          </button>
        )}

        {/* Offline / Online Badge */}
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
        </div>

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Exit / Return to Landing */}
        <button
          id="btn-logout"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-medium transition cursor-pointer"
          title="Return to Welcome Screen"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    </nav>
  );
};
