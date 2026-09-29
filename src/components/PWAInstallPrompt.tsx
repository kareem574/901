import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  Share2,
  PlusSquare,
  CheckCircle2,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
  Bell,
  WifiOff,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

interface PWAInstallPromptProps {
  forceOpen?: boolean;
  onCloseForceOpen?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  forceOpen = false,
  onCloseForceOpen,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    try {
      setIsIframe(window.self !== window.top);
    } catch {
      setIsIframe(true);
    }
  }, []);

  // If running in standalone mode and not forced open, hide
  if (isInstalled && !forceOpen) {
    return null;
  }

  const isModalOpen = showModal || forceOpen;

  const handleCloseModal = () => {
    setShowModal(false);
    if (onCloseForceOpen) {
      onCloseForceOpen();
    }
  };

  const handleOpenDirect = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  const handleInstallClick = async () => {
    if (isIframe) {
      // In an iframe, browser blocks native installation prompt! Show guided modal with direct link
      setShowModal(true);
      return;
    }

    if (isInstallable) {
      try {
        const installed = await install();
        if (installed) {
          handleCloseModal();
        } else {
          setShowModal(true);
        }
      } catch {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {/* 1. Header or Mobile Floating Action Prompt if not dismissed */}
      {!dismissedBanner && !isInstalled && (
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs transition-all border-b border-emerald-800/40">
          <div className="flex items-center gap-2.5 max-w-[85%]">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xs shrink-0 flex items-center justify-center">
              <img src="/icon.svg" alt="App Icon" className="w-7 h-7 rounded-lg" />
            </div>
            <div className="truncate">
              <div className="font-bold flex items-center gap-1.5">
                <span>تثبيت تطبيق "متابعة المناديب" على هاتفك</span>
                <span className="hidden sm:inline bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                  تطبيق أصلي
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                يعمل بدون إنترنت وبشاشة كاملة مع إشعارات سريعة وتجربة أسرع
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تثبيت الآن</span>
            </button>
            <button
              onClick={() => setDismissedBanner(true)}
              className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              title="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Comprehensive Installation Guide Modal (For iOS, Android, or manual install) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
            {/* Header with App Icon */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-6 text-white text-center relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-20 h-20 rounded-3xl bg-white p-1.5 shadow-xl mx-auto mb-3 transform -rotate-2">
                <img src="/pwa-192x192.png" alt="App Icon" className="w-full h-full rounded-2xl object-cover" />
              </div>

              <h3 className="text-lg font-bold">تطبيق متابعة المناديب على الموبايل</h3>
              <p className="text-xs text-emerald-100 mt-1">
                تثبيت سريع بدون الحاجة لمتجر Google Play أو App Store
              </p>
            </div>

            <div className="p-5 space-y-4">
              {/* Iframe Notice */}
              {isIframe && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>ملاحظة هامة للتثبيت:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    متصفحات الهاتف (Chrome / Safari) تمنع التثبيت المباشر من داخل إطار المعاينة. يرجى فتح الرابط المباشر في المتصفح ثم الضغط على تثبيت:
                  </p>
                  <button
                    onClick={handleOpenDirect}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-2 cursor-pointer text-xs shadow-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>فتح في صفحة مستقلة للمتصفح ↗️</span>
                  </button>
                </div>
              )}

              {/* Features List */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-950 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">فتح فوري بلمسة واحدة</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-950 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-semibold">تنبيهات وإشعارات دورية</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-950 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold">واجهة تطبيق جوال كاملة</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-950 flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="font-semibold">تصفح البيانات بدون نت</span>
                </div>
              </div>

              {/* Instructions per platform */}
              {isIOS ? (
                /* iOS Safari instructions */
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="font-bold text-xs text-slate-800 flex items-center gap-2">
                    <span className="text-base">🍎</span>
                    <span>خطوات التثبيت على آيفون / آيباد (Safari):</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                        1
                      </div>
                      <div className="leading-snug">
                        اضغط على زر <strong className="text-slate-900 font-bold">المشاركة (Share)</strong>{' '}
                        <Share2 className="w-3.5 h-3.5 inline text-blue-600 mx-0.5" /> أسفل شاشة المتصفح في Safari.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                        2
                      </div>
                      <div className="leading-snug">
                        مرر القائمة للأسفل واختر <strong className="text-slate-900 font-bold">"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>{' '}
                        <PlusSquare className="w-3.5 h-3.5 inline text-slate-700 mx-0.5" />.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                        3
                      </div>
                      <div className="leading-snug">
                        اضغط على <strong className="text-emerald-700 font-bold">"إضافة" (Add)</strong> في أعلى الزاوية، وسيظهر التطبيق فوراً على شاشتك بأيقونته الرسمية.
                      </div>
                    </div>
                  </div>
                </div>
              ) : isInstallable ? (
                /* Android / Chrome native flow */
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center space-y-3">
                  <div className="text-xs text-emerald-900 leading-relaxed font-medium">
                    متصفحك يدعم التثبيت المباشر بنقرة واحدة! اضغط على الزر أدناه لتثبيت التطبيق على جهازك.
                  </div>

                  <button
                    onClick={async () => {
                      const installed = await install();
                      if (installed) handleCloseModal();
                    }}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>تثبيت التطبيق على الهاتف الآن</span>
                  </button>
                </div>
              ) : (
                /* Android Chrome generic instructions if prompt not fired yet */
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="font-bold text-xs text-slate-800 flex items-center gap-2">
                    <span className="text-base">🤖</span>
                    <span>خطوات التثبيت على أندرويد (Chrome):</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                        1
                      </div>
                      <div className="leading-snug">
                        اضغط على قائمة الثلاث نقاط <strong className="font-bold">⋮</strong> في أعلى يمين متصفح Chrome.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                        2
                      </div>
                      <div className="leading-snug">
                        اختر <strong className="text-slate-900 font-bold">"تثبيت التطبيق" (Install App)</strong> أو <strong className="text-slate-900 font-bold">"إضافة إلى الشاشة الرئيسية"</strong>.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                        3
                      </div>
                      <div className="leading-snug">
                        تأكيد التثبيت وسينزل التطبيق فوراً كبرنامج مستقل على شاشة هاتفك مع سائر التطبيقات.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dismiss / Close button */}
              <button
                onClick={handleCloseModal}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                فهمت، حسناً
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
