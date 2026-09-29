import React, { useState, useEffect } from 'react';
import { Courier, FollowUpStatus } from '../types/courier';
import { DEFAULT_TEMPLATES, compileMessage, getWhatsAppUrls, formatEgyptianPhone } from '../utils/whatsapp';
import {
  X,
  MessageSquare,
  Copy,
  Check,
  Send,
  ExternalLink,
  Laptop,
  Smartphone,
  Sparkles,
  Info,
} from 'lucide-react';

interface WhatsAppModalProps {
  courier: Courier | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordFollowUp: (courierId: string, status: FollowUpStatus, noteText: string) => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  courier,
  isOpen,
  onClose,
  onRecordFollowUp,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('friendly_reminder');
  const [messageText, setMessageText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [nextStatus, setNextStatus] = useState<FollowUpStatus>('promised_shift');
  const [autoLog, setAutoLog] = useState(true);

  useEffect(() => {
    if (courier) {
      const template = DEFAULT_TEMPLATES.find((t) => t.id === selectedTemplateId) || DEFAULT_TEMPLATES[0];
      setMessageText(compileMessage(template.text, courier));
    }
  }, [courier, selectedTemplateId]);

  if (!isOpen || !courier) return null;

  const phoneInfo = formatEgyptianPhone(courier.phone);
  const urls = getWhatsAppUrls(courier.phone, messageText);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendAndLog = (url: string) => {
    if (autoLog) {
      onRecordFollowUp(
        courier.id,
        nextStatus,
        `تم إرسال رسالة واتساب (${DEFAULT_TEMPLATES.find((t) => t.id === selectedTemplateId)?.title || 'رسالة'})`
      );
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">إرسال رسالة واتساب للمندوب</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                {courier.name} • {phoneInfo.formatted || courier.phone}
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
          {/* Courier Details Pill Bar */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
            <div>
              <span className="text-slate-400">الكود:</span>{' '}
              <span className="font-mono font-bold text-slate-800">#{courier.code}</span>
            </div>
            <div>
              <span className="text-slate-400">الزون:</span>{' '}
              <span className="font-medium text-slate-800">{courier.zone}</span>
            </div>
            <div>
              <span className="text-slate-400">مدة التوقف:</span>{' '}
              <span className="font-bold text-rose-600">{courier.inactiveDays} أيام</span>
            </div>
            <div>
              <span className="text-slate-400">المشرف:</span>{' '}
              <span className="font-medium text-slate-800">{courier.supervisor}</span>
            </div>
          </div>

          {/* Templates Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              اختر قالب الرسالة المناسب:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEFAULT_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`text-right p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tmpl.title}</span>
                    {isSelected && <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">نص الرسالة (قابل للتعديل المباشر):</label>
              <button
                onClick={handleCopy}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ بنجاح' : 'نسخ النص'}</span>
              </button>
            </div>
            <textarea
              rows={5}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white leading-relaxed resize-none font-sans"
            />
          </div>

          {/* Auto Log & Status Change */}
          <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <label className="flex items-center gap-2 text-emerald-950 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={autoLog}
                onChange={(e) => setAutoLog(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span>تسجيل المتابعة تلقائياً في السجل</span>
            </label>

            {autoLog && (
              <div className="flex items-center gap-2">
                <span className="text-emerald-900 font-medium">تحديث الحالة إلى:</span>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as FollowUpStatus)}
                  className="bg-white border border-emerald-300 text-xs rounded-xl px-2.5 py-1 text-emerald-900 font-semibold focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="promised_shift">وعد بالنزول / حجز شيفت</option>
                  <option value="not_contacted">إبقاء لم يتم التواصل</option>
                  <option value="no_answer">لم يرد / مغلق</option>
                  <option value="vehicle_issue">عطل بالمركبة</option>
                  <option value="emergency_sick">ظرف شخصي / مرضي</option>
                  <option value="refused">رافض العمل</option>
                </select>
              </div>
            )}
          </div>

          {/* Send Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={() => handleSendAndLog(urls.waMeUrl)}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>إرسال عبر تطبيق واتساب (wa.me)</span>
            </button>

            <button
              onClick={() => handleSendAndLog(urls.webWhatsAppUrl)}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-900 text-white transition-all cursor-pointer"
            >
              <Laptop className="w-4 h-4" />
              <span>فتح في واتساب ويب (WhatsApp Web)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
