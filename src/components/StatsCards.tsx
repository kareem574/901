import React from 'react';
import { Courier, FollowUpStatus } from '../types/courier';
import { Users, AlertOctagon, CheckCircle2, PhoneCall, Wrench, Sparkles } from 'lucide-react';

interface StatsCardsProps {
  couriers: Courier[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  couriers,
  activeFilter,
  onSelectFilter,
}) => {
  const total = couriers.length;
  const critical = couriers.filter((c) => c.inactiveDays >= 5 && c.status !== 'returned_to_work').length;
  const contacted = couriers.filter((c) => c.status !== 'not_contacted').length;
  const promised = couriers.filter((c) => c.status === 'promised_shift').length;
  const returned = couriers.filter((c) => c.status === 'returned_to_work').length;
  const issues = couriers.filter((c) => c.status === 'vehicle_issue' || c.status === 'emergency_sick').length;
  const pendingContact = couriers.filter((c) => c.status === 'not_contacted').length;

  const progressPercent = total > 0 ? Math.round((contacted / total) * 100) : 0;

  const cards = [
    {
      id: 'all',
      title: 'إجمالي المناديب المتوقفين',
      count: total,
      subtext: 'من واقع شيت العمل الحالي',
      icon: Users,
      bgColor: 'bg-white',
      borderColor: 'border-slate-200',
      textColor: 'text-slate-900',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      id: 'critical',
      title: 'حالات حرجة (≥ 5 أيام)',
      count: critical,
      subtext: 'مهددين بالإيقاف وتوقف طويل',
      icon: AlertOctagon,
      bgColor: 'bg-rose-50/50',
      borderColor: 'border-rose-200',
      textColor: 'text-rose-900',
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-100',
    },
    {
      id: 'status_not_contacted',
      title: 'بانتظار المتابعة اليوم',
      count: pendingContact,
      subtext: 'لم يتم إرسال رسائل لهم بعد',
      icon: PhoneCall,
      bgColor: 'bg-amber-50/50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-900',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
    },
    {
      id: 'status_promised_shift',
      title: 'وعدوا بالنزول والعمل',
      count: promised,
      subtext: 'أكدوا حجز الشيفت أو النزول',
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50/50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-900',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
    },
    {
      id: 'status_issues',
      title: 'أعطال وظروف شخصية',
      count: issues,
      subtext: 'صيانة موتوسيكل أو مرض',
      icon: Wrench,
      bgColor: 'bg-purple-50/50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-900',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
    },
    {
      id: 'status_returned_to_work',
      title: 'عادوا للعمل بالفعل',
      count: returned,
      subtext: 'تم فتح ونزول الشيفت بنجاح',
      icon: Sparkles,
      bgColor: 'bg-teal-50/50',
      borderColor: 'border-teal-200',
      textColor: 'text-teal-900',
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-100',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Follow-up Progress Bar Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 sm:p-5 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold">نسبة إنجاز المتابعة اليومية</h2>
            <p className="text-xs text-emerald-100">
              تم التواصل مع {contacted} من إجمالي {total} مندوب متوقف ({progressPercent}%)
            </p>
          </div>
        </div>
        <div className="w-full md:w-72 flex items-center gap-3">
          <div className="flex-1 bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-sm font-extrabold">{progressPercent}%</span>
        </div>
      </div>

      {/* Grid of KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const isSelected = activeFilter === card.id;

          return (
            <button
              key={card.id}
              onClick={() => onSelectFilter(card.id)}
              className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                card.bgColor
              } ${card.borderColor} ${
                isSelected
                  ? 'ring-2 ring-emerald-500 shadow-md transform -translate-y-0.5'
                  : 'hover:shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 truncate">{card.title}</span>
                <div className={`w-7 h-7 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
              <div>
                <div className={`text-2xl font-black ${card.textColor}`}>{card.count}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{card.subtext}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
