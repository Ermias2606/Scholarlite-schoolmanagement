import React, { useState } from 'react';
import { History, ShieldCheck, Search, Clock, FileText } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogSectionProps {
  logs: AuditLog[];
}

export const AuditLogSection: React.FC<AuditLogSectionProps> = ({ logs = [] }) => {
  const [filter, setFilter] = useState('');

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.user.toLowerCase().includes(filter.toLowerCase()) ||
      log.details.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-bold text-[#003366] flex items-center gap-2">
            <History className="w-5 h-5 text-[#00A896]" />
            Institutional Audit Trail
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Tamper-evident record of mark revisions, class changes, and administrative actions
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search activity log..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A896]"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
              <th className="py-3 px-4 w-40">Timestamp</th>
              <th className="py-3 px-4 w-48">Operator</th>
              <th className="py-3 px-4 w-48">Action</th>
              <th className="py-3 px-4">Event Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
                  No activity events found matching your search.
                </td>
              </tr>
            ) : (
              filteredLogs.slice(0, 30).map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition">
                  <td className="py-3 px-4 text-xs text-gray-500 font-mono whitespace-nowrap flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900 text-xs">{log.user}</div>
                    <span className="text-[10px] uppercase font-bold text-gray-400">
                      {log.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold bg-[#003366]/5 text-[#003366] border border-[#003366]/10">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600 leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
