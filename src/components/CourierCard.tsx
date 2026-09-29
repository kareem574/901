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
  MapPin,
  Bell,
  User,
} from 'lucide-react';

interface CourierCardProps {
  courier: Courier;
  isSelected: boolean;
  onToggleSelect: () => void;
  onOpenWhatsApp: () => void;
  onOpenNotes: () => void;
  onOpenReminder: () => void;
  onStatusChange: (status: FollowUpStatus) => void;
}

export const CourierCard: React.FC<CourierCardProps> = ({
  courier,
  isSelected,
  onToggleSelect,
  onOpenWhatsApp,
  onOpenNotes,
  onOpenReminder,
  onStatusChange,
}) => {
  const [copied, setCopied] = useState(false);
  const statusCfg = STATUS_CONFIG[courier.status] || STATUS_CONFIG.not_contacted;
  const phoneObj = formatEgyptianPhone(courier.phone);
  const isCritical = courier.inactiveDays >= 7;
  const isWarning = courier.inactiveDays >= 4 && courier.inactiveDays < 7;
  const hasActiveReminder = courier.reminderTime && !courier.reminderDone;

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(courier.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className={`bg-white rounded-2xl border p-4 transition-all relative flex flex-col justify-between shadow-xs ${
        isSelected ? 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/20' : 'border-slate-200 hover:shadow-md'
      } ${isCritical && courier.status === 'not_contacted' ? 'border-rose-300 bg-rose-50/20' : ''}`}
    >
      <div>
        {/* Top Header: Select checkbox + Inactive badge + Warning icon */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
            />
            <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
              #{courier.code}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isCritical && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                <AlertTriangle className="w-3 h-3" />
                <span>حرج</span>
              </span>
            )}
            <span
              className={`font-black text-xs px-2.5 py-0.5 rounded-full border ${
                isCritical
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : isWarning
                  ? 'bg-orange-100 text-orange-800 border-orange-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}
            >
              {courier.inactiveDays} أيام بدون عمل
            </span>
          </div>
        </div>

        {/* Courier Name & Supervisor */}
        <div className="mb-3">
          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
            {courier.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            <span>المشرف: {courier.supervisor || 'غير مسجل'}</span>
          </p>
        </div>

        {/* Info Grid */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1.5 mb-3">
          {/* Phone */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500">الهاتف:</span>
            <div className="flex items-center gap-1 font-mono font-medium text-slate-800">
              <span dir="ltr">{phoneObj.formatted || courier.phone}</span>
              <button
                onClick={handleCopyPhone}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                title="نسخ"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Area & Zone */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500">الزون / المنطقة:</span>
            <span className="font-medium text-slate-800 truncate max-w-[170px]">
              {courier.zone} ({courier.area})
            </span>
          </div>

          {/* Last Shift Date */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500">آخر شيفت عمل:</span>
            <span className="font-medium text-slate-800">{courier.lastShiftDate || '—'}</span>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="mb-3">
          <div className="relative">
            <select
              value={courier.status}
              onChange={(e) => onStatusChange(e.target.value as FollowUpStatus)}
              className={`w-full text-xs font-semibold rounded-xl p-2 border appearance-none pr-3 pl-8 cursor-pointer transition-colors ${statusCfg.badgeColor}`}
            >
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Reminder Badge if active */}
        {hasActiveReminder && (
          <div
            onClick={onOpenReminder}
            className="mb-3 bg-amber-50 border border-amber-200 rounded-xl p-2 text-xs text-amber-800 flex items-center justify-between cursor-pointer hover:bg-amber-100"
          >
            <div className="flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
              <span className="font-medium truncate max-w-[180px]">
                {courier.reminderNote || 'موعد التذكير'}:{' '}
                {new Date(courier.reminderTime!).toLocaleTimeString('ar-EG', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <span className="text-[10px] text-amber-700 underline">تعديل</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
        <button
          onClick={onOpenWhatsApp}
          className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>واتساب</span>
        </button>

        <a
          href={`tel:${courier.phone}`}
          className="p-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors cursor-pointer"
          title="اتصال مباشر"
        >
          <Phone className="w-3.5 h-3.5" />
        </a>

        <button
          onClick={onOpenReminder}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            hasActiveReminder
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'text-slate-700 hover:text-amber-600 hover:bg-amber-50 border-slate-200'
          }`}
          title="تعيين تذكير"
        >
          <Clock className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onOpenNotes}
          className="p-2 rounded-xl text-slate-700 hover:text-purple-600 hover:bg-purple-50 border border-slate-200 transition-colors cursor-pointer relative"
          title="الملاحظات والتاريخ"
        >
          <FileText className="w-3.5 h-3.5" />
          {courier.notes && courier.notes.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {courier.notes.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
