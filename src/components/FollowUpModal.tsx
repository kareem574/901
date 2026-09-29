import React, { useState } from 'react';
import { Courier, FollowUpStatus, FollowUpNote, STATUS_CONFIG } from '../types/courier';
import {
  X,
  FileText,
  Phone,
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface FollowUpModalProps {
  courier: Courier | null;
  isOpen: boolean;
  onClose: () => void;
  onAddNote: (courierId: string, note: Omit<FollowUpNote, 'id' | 'timestamp'>) => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  courier,
  isOpen,
  onClose,
  onAddNote,
}) => {
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<FollowUpNote['type']>('call');
  const [status, setStatus] = useState<FollowUpStatus>('promised_shift');
  const [author, setAuthor] = useState('');

  if (!isOpen || !courier) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    onAddNote(courier.id, {
      text: noteText.trim(),
      type: noteType,
      status,
      author: author.trim() || courier.supervisor || 'المشرف',
    });

    setNoteText('');
  };

  const getTypeIcon = (type: FollowUpNote['type']) => {
    switch (type) {
      case 'call':
        return <Phone className="w-3.5 h-3.5 text-blue-600" />;
      case 'whatsapp':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'sms':
        return <Send className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">سجل متابعة المندوب وتاريخ التواصل</h2>
              <p className="text-xs text-purple-100 mt-0.5">
                {courier.name} (#{courier.code}) • متوقف منذ {courier.inactiveDays} أيام
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

        <div className="p-5 space-y-6">
          {/* New Note Form */}
          <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>تسجيل متابعة / مكالمة جديدة</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Type */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">نوع التواصل:</label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as FollowUpNote['type'])}
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2 text-slate-800 cursor-pointer"
                >
                  <option value="call">📞 مكالمة هاتفية</option>
                  <option value="whatsapp">💬 رسالة واتساب</option>
                  <option value="sms">✉️ رسالة SMS</option>
                  <option value="meeting">🤝 لقاء شخصي / زيارة</option>
                  <option value="note">📝 ملاحظة إدارية</option>
                </select>
              </div>

              {/* Status Outcome */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">نتيجة التواصل:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FollowUpStatus)}
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2 text-slate-800 cursor-pointer"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">اسم المسؤول / المشرف:</label>
                <input
                  type="text"
                  placeholder={courier.supervisor || 'اسم المشرف'}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2 text-slate-800"
                />
              </div>
            </div>

            {/* Note text */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">تفاصيل المتابعة ورد المندوب:</label>
              <textarea
                rows={2}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="مثال: تحدثت معه ووعد بنزول شيفت غداً الساعة 4 عصراً، كان لديه عطل خفيف في الفرامل وتم تصليحه..."
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!noteText.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white disabled:opacity-50 transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>حفظ المتابعة في السجل</span>
              </button>
            </div>
          </form>

          {/* History Timeline */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-between">
              <span>السجل السابق ({courier.notes ? courier.notes.length : 0})</span>
              {courier.lastContactedAt && (
                <span className="text-[11px] font-normal text-slate-500">
                  آخر تواصل: {new Date(courier.lastContactedAt).toLocaleString('ar-EG')}
                </span>
              )}
            </h3>

            {courier.notes && courier.notes.length > 0 ? (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {courier.notes.map((note) => {
                  const statusCfg = STATUS_CONFIG[note.status] || STATUS_CONFIG.not_contacted;
                  const dateStr = new Date(note.timestamp).toLocaleString('ar-EG', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });

                  return (
                    <div
                      key={note.id}
                      className="bg-white p-3 rounded-2xl border border-slate-200 text-xs space-y-1.5 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-md bg-slate-100">{getTypeIcon(note.type)}</span>
                          <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] border ${statusCfg.badgeColor}`}>
                            {statusCfg.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                          {dateStr}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
                        {note.text}
                      </p>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>المشرف المسجل: {note.author}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs text-slate-500">لا توجد ملاحظات مسجلة بعد لهذا المندوب.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">يمكنك إضافة أول متابعة باستخدام النموذج أعلاه.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
