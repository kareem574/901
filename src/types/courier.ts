export type FollowUpStatus =
  | 'not_contacted'    // لم يتم التواصل بعد
  | 'promised_shift'   // وعد بالنزول / حجز شيفت
  | 'no_answer'        // لم يرد / الهاتف مغلق
  | 'vehicle_issue'    // عطل في المركبة / الموتوسيكل
  | 'emergency_sick'   // ظرف شخصي / مرض
  | 'refused'          // رافض العمل / غير راغب
  | 'returned_to_work'; // تم نزول العمل بالفعل

export interface FollowUpNote {
  id: string;
  timestamp: string; // ISO string
  type: 'whatsapp' | 'call' | 'sms' | 'meeting' | 'note';
  status: FollowUpStatus;
  text: string;
  author: string;
}

export interface Courier {
  id: string;
  code: string;               // كود المندوب
  name: string;               // اسم المندوب
  phone: string;              // رقم التليفون
  supervisor: string;         // اسم المشرف
  area: string;               // المنطقة
  zone: string;               // الزون
  inactiveDays: number;       // عدد الايام بدون عمل
  lastShiftDate: string;      // تاريخ اخر شيفت عمل
  lastSelectionDate: string;  // تاريخ اخر اختيار شيفت
  lastAbsenceDate: string;    // تاريخ أخر شيفت غياب
  status: FollowUpStatus;
  lastContactedAt?: string | null;
  notes: FollowUpNote[];
  reminderTime?: string | null; // ISO string
  reminderNote?: string | null;
  reminderDone?: boolean;
}

export interface MessageTemplate {
  id: string;
  title: string;
  category: 'friendly' | 'shift_booking' | 'issue' | 'urgent' | 'custom';
  text: string;
}

export interface ReminderConfig {
  enabled: boolean;
  intervalMinutes: number; // e.g. 30, 60, 120
  soundEnabled: boolean;
  dailyTimes: string[]; // ["10:00", "14:00", "18:00"]
  lastTriggered?: string | null;
}

export const STATUS_CONFIG: Record<
  FollowUpStatus,
  { label: string; color: string; bg: string; border: string; icon: string; badgeColor: string }
> = {
  not_contacted: {
    label: 'لم يتم التواصل بعد',
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: 'Clock',
  },
  promised_shift: {
    label: 'وعد بالنزول / حجز شيفت',
    color: 'text-emerald-800',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: 'CheckCircle2',
  },
  no_answer: {
    label: 'لم يرد / الهاتف مغلق',
    color: 'text-orange-800',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: 'PhoneOff',
  },
  vehicle_issue: {
    label: 'عطل في الموتوسيكل / المركبة',
    color: 'text-blue-800',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: 'Wrench',
  },
  emergency_sick: {
    label: 'ظرف شخصي / عذر مرضي',
    color: 'text-purple-800',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: 'HeartPulse',
  },
  refused: {
    label: 'رافض العمل / متوقف تماماً',
    color: 'text-rose-800',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    icon: 'XCircle',
  },
  returned_to_work: {
    label: 'تم نزول العمل بالفعل ✅',
    color: 'text-teal-800',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    icon: 'Sparkles',
  },
};
