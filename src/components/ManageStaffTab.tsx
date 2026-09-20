import React from 'react';
import { AppData, UserProfile } from '../types';
import { SchoolOrgChartTab } from './SchoolOrgChartTab';

interface ManageStaffTabProps {
  appData: AppData;
  onUpdateUsers: (users: UserProfile[]) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export const ManageStaffTab: React.FC<ManageStaffTabProps> = ({ appData, onUpdateUsers, onAddAuditLog }) => {
  return (
    <div className="space-y-6">
      <SchoolOrgChartTab
        appData={appData}
        onUpdateUsers={onUpdateUsers}
        onAddAuditLog={onAddAuditLog}
      />
    </div>
  );
};
