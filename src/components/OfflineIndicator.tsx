import React from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      id="offline-indicator-banner"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 text-white px-3.5 py-2 text-xs font-semibold shadow-lg backdrop-blur-sm border border-amber-400/30 animate-pulse"
      role="status"
    >
      <WifiOff className="w-4 h-4 text-amber-200" />
      <span>Offline Mode Active &mdash; Local storage & PWA cache engaged</span>
    </div>
  );
};
