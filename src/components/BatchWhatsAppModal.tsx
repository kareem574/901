import React, { useState } from 'react';
import { Courier, FollowUpStatus } from '../types/courier';
import { DEFAULT_TEMPLATES, compileMessage, getWhatsAppUrls, formatEgyptianPhone } from '../utils/whatsapp';
import {
  X,
  Send,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Laptop,
  Check,
  User,
  Clock,
} from 'lucide-react';

interface BatchWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  couriers: Courier[];
  onMarkContacted: (courierId: string) => void;
}

export const BatchWhatsAppModal: React.FC<BatchWhatsAppModalProps> = ({
  isOpen,
  onClose,
  couriers,
  onMarkContacted,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState('friendly_reminder');
  const [contactedIds, setContactedIds] = useState<string[]>([]);

  if (!isOpen || couriers.length === 0) return null;

  const currentCourier = couriers[currentIndex] || couriers[0];
  const template = DEFAULT_TEMPLATES.find((t) => t.id === selectedTemplateId) || DEFAULT_TEMPLATES[0];
  const messageText = compileMessage(template.text, currentCourier);
  const urls = getWhatsAppUrls(currentCourier.phone, messageText);
  const phoneInfo = formatEgyptianPhone(currentCourier.phone);

  const handleOpenAndAdvance = (url: string) => {
    onMarkContacted(currentCourier.id);
    if (!contactedIds.includes(currentCourier.id)) {
      setContactedIds((prev) => [...prev, currentCourier.id]);
    }
    window.open(url, '_blank', 'noopener,noreferrer');

    // Auto advance if not last
    if (currentIndex < couriers.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const isCurrentContacted = contactedIds.includes(currentCourier.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">طابور المراسلة السريعة عبر واتساب</h2>
              <p className="text-xs text-emerald-200 mt-0.5">
                مندوب {currentIndex + 1} من إجمالي {couriers.length} تم تحديدهم
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
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>نسبة تقدم الطابور</span>
              <span className="font-bold text-emerald-700">
                {Math.round(((currentIndex + 1) / couriers.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / couriers.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Courier Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{currentCourier.name}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                    #{currentCourier.code}
                  </span>
                  <span>الزون: {currentCourier.zone}</span>
                  <span className="text-rose-600 font-bold">({currentCourier.inactiveDays} أيام بدون عمل)</span>
                </div>
              </div>
              <div className="text-left font-mono text-xs text-slate-700" dir="ltr">
                {phoneInfo.formatted || currentCourier.phone}
              </div>
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">قالب الرسالة المعتمد:</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5 text-slate-800 font-medium cursor-pointer"
            >
              {DEFAULT_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.title}
                </option>
              ))}
            </select>
          </div>

          {/* Message Preview */}
          <div className="bg-emerald-50/40 p-3 rounded-2xl border border-emerald-100 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
            {messageText}
          </div>

          {/* Send Buttons for current */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleOpenAndAdvance(urls.waMeUrl)}
              className="inline-flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>إرسال والانتقال للتالي</span>
            </button>

            <button
              onClick={() => handleOpenAndAdvance(urls.webWhatsAppUrl)}
              className="inline-flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer"
            >
              <Laptop className="w-4 h-4" />
              <span>واتساب ويب + التالي</span>
            </button>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>المندوب السابق</span>
            </button>

            <span className="text-xs text-slate-400">
              {currentIndex + 1} / {couriers.length}
            </span>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(couriers.length - 1, prev + 1))}
              disabled={currentIndex === couriers.length - 1}
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
            >
              <span>المندوب التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
