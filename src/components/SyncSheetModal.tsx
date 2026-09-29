import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  RefreshCw,
  Upload,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Link2,
} from 'lucide-react';

interface SyncSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSheetUrl: string;
  onUpdateSheetUrl: (url: string) => void;
  onSync: () => Promise<void>;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  onFileUpload: (csvContent: string) => void;
}

export const SyncSheetModal: React.FC<SyncSheetModalProps> = ({
  isOpen,
  onClose,
  currentSheetUrl,
  onUpdateSheetUrl,
  onSync,
  isSyncing,
  lastSyncedAt,
  onFileUpload,
}) => {
  const [inputUrl, setInputUrl] = useState(currentSheetUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveUrl = () => {
    if (!inputUrl.trim()) return;
    onUpdateSheetUrl(inputUrl.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onFileUpload(content);
        onClose();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">ربط ومزامنة شيت جوجل (Google Sheets)</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                تحديث قائمة المناديب المتوقفين وتواريخ الشيفتات
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

        <div className="p-5 space-y-5">
          {/* Active URL & Instant Sync */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">رابط الشيت الحالي:</span>
              </div>
              <a
                href={currentSheetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-700 hover:text-emerald-800 underline inline-flex items-center gap-1"
              >
                <span>فتح في نافذة جديدة</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                dir="ltr"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="flex-1 bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSaveUrl}
                className="px-3.5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-colors cursor-pointer shrink-0"
              >
                حفظ
              </button>
            </div>

            {saveSuccess && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تم حفظ الرابط بنجاح!</span>
              </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
              <div className="text-[11px] text-slate-500">
                {lastSyncedAt ? (
                  <span>آخر مزامنة ناجحة: {new Date(lastSyncedAt).toLocaleString('ar-EG')}</span>
                ) : (
                  <span>تم تحميل البيانات المرفقة في الرابط</span>
                )}
              </div>

              <button
                onClick={onSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'جاري المزامنة...' : 'تحديث البيانات الآن'}</span>
              </button>
            </div>
          </div>

          {/* Upload CSV Option */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-slate-600" />
              <span>أو استيراد ملف CSV يدوياً:</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              إذا قمت بتنزيل الشيت كملف CSV أو إكسيل، يمكنك رفعه هنا مباشرة لتحديث القائمة فورياً.
            </p>
            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-emerald-50/20">
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs font-bold text-slate-700">اضغط لاختيار ملف CSV من جهازك</span>
              <span className="text-[10px] text-slate-400 mt-0.5">يدعم جميع صيغ CSV الصادرة من شيتات جوجل</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>

          {/* Sharing Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>تعليمات مهمة لضمان مزامنة الشيت:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              تأكد من فتح صلاحية الشيت في جوجل درايف (مشاركة Share → أي شخص لديه الرابط قارئ "Anyone with the link can view") حتى يتمكن النظام من قراءة التحديثات التلقائية بدون الحاجة لحساب.
            </p>
          </div>
        </div>

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
