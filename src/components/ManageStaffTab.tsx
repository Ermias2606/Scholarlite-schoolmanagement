import React from 'react';
import { AppData, UserProfile } from '../types';
import { StaffManagementSection } from './StaffManagementSection';

interface ManageStaffTabProps {
  appData: AppData;
  onUpdateUsers: (users: UserProfile[]) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export const ManageStaffTab: React.FC<ManageStaffTabProps> = ({ appData, onUpdateUsers, onAddAuditLog }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <StaffManagementSection
        users={appData.users || []}
        classes={appData.classes}
        onUpdateUsers={onUpdateUsers}
        onAddAuditLog={onAddAuditLog}
      />
    </div>
  );
};
