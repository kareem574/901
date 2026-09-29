import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-slate-900/90 text-white backdrop-blur-md px-4 py-1.5 text-xs font-medium shadow-xl border border-slate-700 animate-bounce">
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>وضع عدم الاتصال — يمكنك الاستمرار ومراجعة البيانات المحفوظة محلياً</span>
    </div>
  );
};
