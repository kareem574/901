import React from 'react';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Bell,
  Smartphone,
  Plus,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  criticalCount: number;
  onOpenAddModal: () => void;
  onOpenInstallModal: () => void;
  onOpenSettings: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  criticalCount,
  onOpenAddModal,
  onOpenInstallModal,
  onOpenSettings,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg pb-[max(0.375rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around">
        {/* Tab 1: All Couriers */}
        <button
          onClick={() => onTabChange('all')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors cursor-pointer ${
            currentTab === 'all' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">المناديب</span>
        </button>

        {/* Tab 2: Critical alerts */}
        <button
          onClick={() => onTabChange('critical')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors relative cursor-pointer ${
            currentTab === 'critical' ? 'text-rose-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <AlertTriangle className="w-5 h-5 mb-0.5" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                {criticalCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">الحالات الحرجة</span>
        </button>

        {/* Center Floating Action: Add Courier */}
        <button
          onClick={onOpenAddModal}
          className="w-11 h-11 -mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer border-2 border-white"
          title="إضافة مندوب"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Tab 3: Reminders / Settings */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">التنبيهات</span>
        </button>

        {/* Tab 4: Install PWA */}
        <button
          onClick={onOpenInstallModal}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-emerald-800 hover:text-emerald-900 transition-colors cursor-pointer"
        >
          <Smartphone className="w-5 h-5 mb-0.5 text-emerald-600" />
          <span className="text-[10px] font-semibold">تثبيت التطبيق</span>
        </button>
      </div>
    </nav>
  );
};
