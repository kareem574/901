import React from 'react';
import {
  Bell,
  BellRing,
  RefreshCw,
  Plus,
  Download,
  Settings,
  Volume2,
  VolumeX,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { NotificationPermissionStatus } from '../utils/notifications';

interface HeaderProps {
  sheetUrl: string;
  isSyncing: boolean;
  onSync: () => void;
  onOpenSyncModal: () => void;
  permission: NotificationPermissionStatus;
  onRequestPermission: () => void;
  onTriggerTestNotification: () => void;
  onOpenSettings: () => void;
  onOpenAddModal: () => void;
  onOpenInstallModal: () => void;
  onExportCSV: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  courierCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isSyncing,
  onSync,
  onOpenSyncModal,
  permission,
  onRequestPermission,
  onTriggerTestNotification,
  onOpenSettings,
  onOpenAddModal,
  onOpenInstallModal,
  onExportCSV,
  soundEnabled,
  onToggleSound,
  courierCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & App Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-1 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <img src="/icon.svg" alt="App Logo" className="w-full h-full rounded-xl object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  متابعة المناديب
                </h1>
                <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  {courierCount} مندوب
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span className="hidden sm:inline">نظام متابعة الأكتف غير العاملين والتذكير</span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <button
                  onClick={onOpenSyncModal}
                  className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>شيت العمل</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            {/* Install App on Mobile Button */}
            <button
              onClick={onOpenInstallModal}
              title="تثبيت التطبيق على الموبايل"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
            >
              <img src="/icon.svg" alt="icon" className="w-4 h-4 rounded-sm" />
              <span className="hidden sm:inline">تثبيت التطبيق</span>
              <span className="sm:hidden">تثبيت</span>
            </button>

            {/* Desktop Notification Button */}
            {permission === 'granted' ? (
              <button
                onClick={onTriggerTestNotification}
                title="إشعارات سطح المكتب مفعلة - انقر لاختبار إشعار تجريبي"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>الإشعارات (مفعلة)</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1 rounded">تجربة</span>
              </button>
            ) : permission === 'denied' ? (
              <button
                onClick={onOpenSettings}
                title="تم حظر الإشعارات من إعدادات المتصفح - انقر للمساعدة"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>الإشعارات محظورة</span>
              </button>
            ) : (
              <button
                onClick={onRequestPermission}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors animate-pulse cursor-pointer"
              >
                <BellRing className="w-4 h-4" />
                <span>تفعيل التنبيهات 🔔</span>
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'كتم التنبيهات الصوتية' : 'تشغيل التنبيهات الصوتية'}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-600" />}
            </button>

            {/* Reminder Settings */}
            <button
              onClick={onOpenSettings}
              title="إعدادات التذكير والتنبيهات"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Sync from Google Sheet Button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              title="تحديث البيانات من جوجل شيت"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'جاري...' : 'تحديث الشيت'}</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={onExportCSV}
              title="تصدير تقرير المتابعة كملف إكسيل CSV"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 text-white hover:bg-slate-900 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير تقرير</span>
            </button>

            {/* Add Courier Manually */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">إضافة مندوب</span>
              <span className="sm:hidden">إضافة</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

