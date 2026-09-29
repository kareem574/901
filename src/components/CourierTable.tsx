import React, { useState } from 'react';
import { Courier, FollowUpStatus, STATUS_CONFIG } from '../types/courier';
import { formatEgyptianPhone } from '../utils/whatsapp';
import {
  MessageSquare,
  Phone,
  Clock,
  FileText,
  AlertTriangle,
  ChevronDown,
  Copy,
  Check,
  Calendar,
  User,
  MapPin,
  Bell,
} from 'lucide-react';

interface CourierTableProps {
  couriers: Courier[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onOpenWhatsApp: (courier: Courier) => void;
  onOpenNotes: (courier: Courier) => void;
  onOpenReminder: (courier: Courier) => void;
  onStatusChange: (courierId: string, status: FollowUpStatus) => void;
}

export const CourierTable: React.FC<CourierTableProps> = ({
  couriers,
  selectedIds,
  onToggleSelect,
  onOpenWhatsApp,
  onOpenNotes,
  onOpenReminder,
  onStatusChange,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPhone = (phone: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  if (couriers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">لا يوجد مناديب مطابقين للتصفية الحالية</h3>
        <p className="text-xs text-slate-500 mt-1">جرّب تغيير خيارات البحث أو التصفية بالأعلى</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs">
              <th className="py-3 px-4 w-10 text-center">
                <span className="sr-only">تحديد</span>
              </th>
              <th className="py-3.5 px-4">المندوب والكود</th>
              <th className="py-3.5 px-3">رقم الهاتف</th>
              <th className="py-3.5 px-3">المنطقة والزون</th>
              <th className="py-3.5 px-3 text-center">مدة التوقف</th>
              <th className="py-3.5 px-3">آخر شيفت</th>
              <th className="py-3.5 px-3">حالة المتابعة</th>
              <th className="py-3.5 px-3">التذكيرات والملاحظات</th>
              <th className="py-3.5 px-4 text-center">إجراءات المتابعة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {couriers.map((courier) => {
              const isSelected = selectedIds.includes(courier.id);
              const statusCfg = STATUS_CONFIG[courier.status] || STATUS_CONFIG.not_contacted;
              const phoneObj = formatEgyptianPhone(courier.phone);
              const isCritical = courier.inactiveDays >= 7;
              const isWarning = courier.inactiveDays >= 4 && courier.inactiveDays < 7;
              const hasActiveReminder = courier.reminderTime && !courier.reminderDone;

              return (
                <tr
                  key={courier.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isSelected ? 'bg-emerald-50/40' : ''
                  } ${isCritical && courier.status === 'not_contacted' ? 'bg-rose-50/20' : ''}`}
                >
                  {/* Select Checkbox */}
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(courier.id)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                    />
                  </td>

                  {/* Courier Name & Code */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                      <span>{courier.name}</span>
                      {isCritical && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-sm border border-rose-200">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>توقف حرج</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                        #{courier.code}
                      </span>
                      <span>المشرف: {courier.supervisor || 'غير مسجل'}</span>
                    </div>
                  </td>

                  {/* Phone with copy */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-slate-800">
                      <span dir="ltr">{phoneObj.formatted || courier.phone}</span>
                      <button
                        onClick={(e) => handleCopyPhone(courier.phone, courier.id, e)}
                        title="نسخ رقم الهاتف"
                        className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
                      >
                        {copiedId === courier.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Area & Zone */}
                  <td className="py-3.5 px-3">
                    <div className="text-xs font-medium text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{courier.zone || courier.area || '—'}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{courier.area}</div>
                  </td>

                  {/* Inactive Days */}
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center font-extrabold px-2.5 py-1 rounded-full text-xs border ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                          : isWarning
                          ? 'bg-orange-100 text-orange-800 border-orange-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {courier.inactiveDays} أيام
                    </span>
                  </td>

                  {/* Last Shift Date */}
                  <td className="py-3.5 px-3">
                    <div className="text-xs text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{courier.lastShiftDate || '—'}</span>
                    </div>
                    {courier.lastAbsenceDate && courier.lastAbsenceDate !== '-' && (
                      <div className="text-[10px] text-rose-600 mt-0.5">
                        آخر غياب: {courier.lastAbsenceDate}
                      </div>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-3">
                    <div className="relative inline-block text-right">
                      <select
                        value={courier.status}
                        onChange={(e) => onStatusChange(courier.id, e.target.value as FollowUpStatus)}
                        className={`text-xs font-semibold rounded-xl px-2.5 py-1.5 border appearance-none pr-2 pl-6 cursor-pointer transition-colors ${statusCfg.badgeColor}`}
                      >
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <option key={key} value={key}>
                            {cfg.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-500 absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </td>

                  {/* Reminder & Notes Summary */}
                  <td className="py-3.5 px-3">
                    <div className="space-y-1">
                      {hasActiveReminder && (
                        <div
                          onClick={() => onOpenReminder(courier)}
                          className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md cursor-pointer hover:bg-amber-100"
                        >
                          <Bell className="w-3 h-3 text-amber-600 animate-bounce" />
                          <span className="font-medium truncate max-w-[120px]">
                            {new Date(courier.reminderTime!).toLocaleTimeString('ar-EG', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}
                      {courier.notes && courier.notes.length > 0 ? (
                        <button
                          onClick={() => onOpenNotes(courier)}
                          className="text-[11px] text-slate-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>{courier.notes.length} ملاحظة مسجلة</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenNotes(courier)}
                          className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>+ إضافة ملاحظة</span>
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* WhatsApp Button */}
                      <button
                        onClick={() => onOpenWhatsApp(courier)}
                        title="إرسال رسالة واتساب مع قوالب جاهزة"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>واتساب</span>
                      </button>

                      {/* Phone Call Button */}
                      <a
                        href={`tel:${courier.phone}`}
                        title="اتصال هاتفي مباشر"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>

                      {/* Reminder Snooze Button */}
                      <button
                        onClick={() => onOpenReminder(courier)}
                        title="تعيين تذكير سطح المكتب لهذا المندوب"
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          hasActiveReminder
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'text-slate-600 hover:text-amber-600 hover:bg-amber-50 border-slate-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>

                      {/* Notes / Log Drawer */}
                      <button
                        onClick={() => onOpenNotes(courier)}
                        title="سجل المتابعات وتاريخ المكالمات"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 border border-slate-200 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
