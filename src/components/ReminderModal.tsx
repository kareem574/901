import React, { useState, useEffect } from 'react';
import { Courier } from '../types/courier';
import { NotificationPermissionStatus } from '../utils/notifications';
import {
  X,
  Bell,
  Clock,
  Calendar,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface ReminderModalProps {
  courier: Courier | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveReminder: (courierId: string, reminderTime: string | null, reminderNote: string | null) => void;
  permission: NotificationPermissionStatus;
  onRequestPermission: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  courier,
  isOpen,
  onClose,
  onSaveReminder,
  permission,
  onRequestPermission,
}) => {
  const [customDateTime, setCustomDateTime] = useState('');
  const [reminderNote, setReminderNote] = useState('');

  useEffect(() => {
    if (courier) {
      if (courier.reminderTime) {
        // Format ISO to local datetime-local string
        const date = new Date(courier.reminderTime);
        const pad = (n: number) => String(n).padStart(2, '0');
        const localStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
          date.getHours()
        )}:${pad(date.getMinutes())}`;
        setCustomDateTime(localStr);
      } else {
        // Default to 1 hour from now
        const now = new Date(Date.now() + 60 * 60 * 1000);
        const pad = (n: number) => String(n).padStart(2, '0');
        const localStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
          now.getHours()
        )}:${pad(now.getMinutes())}`;
        setCustomDateTime(localStr);
      }
      setReminderNote(courier.reminderNote || 'متابعة بخصوص نزول الشيفت');
    }
  }, [courier]);

  if (!isOpen || !courier) return null;

  const handleApplyPreset = (minutesToAdd: number, defaultNote?: string) => {
    const target = new Date(Date.now() + minutesToAdd * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const localStr = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(
      target.getHours()
    )}:${pad(target.getMinutes())}`;
    setCustomDateTime(localStr);
    if (defaultNote) {
      setReminderNote(defaultNote);
    }
  };

  const handleSave = () => {
    if (!customDateTime) return;
    const isoString = new Date(customDateTime).toISOString();
    onSaveReminder(courier.id, isoString, reminderNote.trim() || 'تذكير متابعة المندوب');
    onClose();
  };

  const handleClear = () => {
    onSaveReminder(courier.id, null, null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">تعيين تذكير سطح المكتب لمتابعة المندوب</h2>
              <p className="text-xs text-amber-100 mt-0.5">
                {courier.name} (#{courier.code})
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

        <div className="p-5 space-y-4">
          {/* Permission warning banner if not granted */}
          {permission !== 'granted' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>إشعارات سطح المكتب غير مفعلة في المتصفح حالياً.</span>
              </div>
              <button
                onClick={onRequestPermission}
                className="bg-amber-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-amber-700 transition-colors shrink-0 cursor-pointer"
              >
                تفعيل الآن
              </button>
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              تحديد سريع لموعد التذكير:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset(30, 'طلب الاتصال به بعد نصف ساعة')}
                className="p-2 rounded-xl border border-slate-200 text-xs text-slate-700 hover:border-amber-500 hover:bg-amber-50/50 text-center transition-all cursor-pointer"
              >
                بعد 30 دقيقة
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(60, 'متابعة بعد ساعة')}
                className="p-2 rounded-xl border border-slate-200 text-xs text-slate-700 hover:border-amber-500 hover:bg-amber-50/50 text-center transition-all cursor-pointer"
              >
                بعد 1 ساعة
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(120, 'متابعة بعد ساعتين')}
                className="p-2 rounded-xl border border-slate-200 text-xs text-slate-700 hover:border-amber-500 hover:bg-amber-50/50 text-center transition-all cursor-pointer"
              >
                بعد ساعتين
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(240, 'تذكير متابعة العصر')}
                className="p-2 rounded-xl border border-slate-200 text-xs text-slate-700 hover:border-amber-500 hover:bg-amber-50/50 text-center transition-all cursor-pointer"
              >
                بعد 4 ساعات
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(1440, 'تذكير صباح الغد الساعة 10')}
                className="p-2 rounded-xl border border-slate-200 text-xs text-slate-700 hover:border-amber-500 hover:bg-amber-50/50 text-center transition-all cursor-pointer"
              >
                غداً صباحاً
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(2880, 'متابعة بعد يومين')}
                className="p-2 rounded-xl border border-slate-200 text-xs text-slate-700 hover:border-amber-500 hover:bg-amber-50/50 text-center transition-all cursor-pointer"
              >
                بعد يومين
              </button>
            </div>
          </div>

          {/* Date & Time Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>تاريخ ووقت التنبيه المحدد:</span>
            </label>
            <input
              type="datetime-local"
              value={customDateTime}
              onChange={(e) => setCustomDateTime(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white cursor-pointer"
            />
          </div>

          {/* Reminder Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>نص التذكير / سبب المتابعة (سيظهر داخل الإشعار):</span>
            </label>
            <input
              type="text"
              value={reminderNote}
              onChange={(e) => setReminderNote(e.target.value)}
              placeholder="مثال: وعد بالنزول شيفت مسائي، أو متابعة انتهاء صيانة المكنة"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {courier.reminderTime ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>إلغاء التذكير الحالي</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!customDateTime}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ التذكير</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
