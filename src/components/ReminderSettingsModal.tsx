import React, { useState } from 'react';
import { ReminderConfig, Courier } from '../types/courier';
import { NotificationPermissionStatus } from '../utils/notifications';
import { audioManager } from '../utils/audio';
import {
  X,
  Bell,
  Volume2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Play,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface ReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ReminderConfig;
  onUpdateConfig: (cfg: ReminderConfig) => void;
  permission: NotificationPermissionStatus;
  onRequestPermission: () => void;
  onTestNotification: () => void;
  couriers: Courier[];
  onClearCourierReminder: (courierId: string) => void;
}

export const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  permission,
  onRequestPermission,
  onTestNotification,
  couriers,
  onClearCourierReminder,
}) => {
  const [newTimeInput, setNewTimeInput] = useState('');

  if (!isOpen) return null;

  const scheduledCouriers = couriers.filter((c) => c.reminderTime && !c.reminderDone);

  const handleToggleEnabled = () => {
    onUpdateConfig({
      ...config,
      enabled: !config.enabled,
    });
  };

  const handleIntervalChange = (mins: number) => {
    onUpdateConfig({
      ...config,
      intervalMinutes: mins,
    });
  };

  const handleToggleSound = () => {
    onUpdateConfig({
      ...config,
      soundEnabled: !config.soundEnabled,
    });
  };

  const handleAddDailyTime = () => {
    if (!newTimeInput || config.dailyTimes.includes(newTimeInput)) return;
    onUpdateConfig({
      ...config,
      dailyTimes: [...config.dailyTimes, newTimeInput].sort(),
    });
    setNewTimeInput('');
  };

  const handleRemoveDailyTime = (time: string) => {
    onUpdateConfig({
      ...config,
      dailyTimes: config.dailyTimes.filter((t) => t !== time),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold">إعدادات إشعارات وتنبيهات سطح المكتب</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                تخصيص التذكيرات الدورية ومواعيد تنبيه المناديب المتوقفين
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Permission Status Box */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">حالة إذن المتصفح:</span>
                {permission === 'granted' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>مُفعّلة وجاهزة</span>
                  </span>
                ) : permission === 'denied' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>محظورة في إعدادات المتصفح</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>بانتظار الموافقة</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                تظهر الإشعارات على شاشة الكمبيوتر حتى عند تصغير المتصفح للتذكير بمتابعة المناديب.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {permission !== 'granted' && (
                <button
                  onClick={onRequestPermission}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer"
                >
                  طلب الإذن
                </button>
              )}
              <button
                onClick={onTestNotification}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <Play className="w-3 h-3 text-emerald-400" />
                <span>تجربة الإشعار</span>
              </button>
            </div>
          </div>

          {/* Periodic Reminder Toggle & Interval */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">التذكير التلقائي الدوري</h4>
                <p className="text-[11px] text-slate-500">
                  إرسال إشعار تذكيري عند وجود مناديب غير نشطين لم يتم التواصل معهم
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={handleToggleEnabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {config.enabled && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                  فترة التكرار التلقائي:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 60, 120].map((mins) => {
                    const isSelected = config.intervalMinutes === mins;
                    const label = mins === 60 ? 'كل ساعة' : mins === 120 ? 'كل ساعتين' : `كل ${mins} دقيقة`;
                    return (
                      <button
                        key={mins}
                        onClick={() => handleIntervalChange(mins)}
                        className={`p-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Daily Fixed Times */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800">مواعيد التنبيه اليومية الثابتة</h4>
              <p className="text-[11px] text-slate-500">
                أوقات محددة يومياً لمراجعة قائمة الغياب والشيفتات (مثل بداية اليوم، العصر، المساء)
              </p>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {config.dailyTimes.map((time) => (
                <div
                  key={time}
                  className="bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span dir="ltr">{time}</span>
                  <button
                    onClick={() => handleRemoveDailyTime(time)}
                    className="text-emerald-700 hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add time */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="time"
                value={newTimeInput}
                onChange={(e) => setNewTimeInput(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-1.5 text-slate-800 cursor-pointer"
              />
              <button
                onClick={handleAddDailyTime}
                disabled={!newTimeInput}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50 transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة موعد</span>
              </button>
            </div>
          </div>

          {/* Sound Setting */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">التنبيهات الصوتية (Chime)</h4>
                <p className="text-[11px] text-slate-500">تشغيل نغمة رنين لطيفة عند وصول الإشعار</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => audioManager.playNotificationChime()}
                title="سماع النغمة"
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer text-xs flex items-center gap-1"
              >
                <Play className="w-3 h-3 text-purple-600" />
                <span>سماع</span>
              </button>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.soundEnabled}
                  onChange={handleToggleSound}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {/* Scheduled Couriers List */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>تذكيرات المناديب الفردية المجدولة حالياً</span>
              <span className="text-[11px] font-normal text-slate-500">
                ({scheduledCouriers.length}) مناديب
              </span>
            </h4>

            {scheduledCouriers.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {scheduledCouriers.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200 text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-amber-800">
                        {c.reminderNote || 'موعد المتابعة'}:{' '}
                        {new Date(c.reminderTime!).toLocaleString('ar-EG', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => onClearCourierReminder(c.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="إلغاء التذكير"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2">لا توجد تذكيرات فردية مجدولة حالياً.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
