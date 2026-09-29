import { Courier, MessageTemplate } from '../types/courier';

export function formatEgyptianPhone(rawPhone: string): { international: string; formatted: string; raw: string } {
  if (!rawPhone) return { international: '', formatted: '', raw: '' };

  const cleaned = rawPhone.replace(/\D/g, '');

  let intl = cleaned;
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    intl = '2' + cleaned;
  } else if (cleaned.startsWith('20') && cleaned.length === 12) {
    intl = cleaned;
  } else if (cleaned.startsWith('1') && cleaned.length === 10) {
    intl = '20' + cleaned;
  }

  // Display format like: 011 2793 2953
  let formatted = cleaned;
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    formatted = `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }

  return {
    international: intl,
    formatted: formatted,
    raw: rawPhone,
  };
}

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'friendly_reminder',
    title: '👋 تذكير ودود وسؤال عن الحال',
    category: 'friendly',
    text: `السلام عليكم يا كابتن {name}، لعلك بألف خير يا رب 🌹
لاحظنا إنك متوقف عن العمل بقالك {days} أيام في زون {zone}، وبنحب نطمئن عليك.
الشيفتات متاحة ومحتاجينك تنزل معانا. طمنا لو فيه أي عائق أو مشكلة نقدر نساعدك في حلها؟
أخوك/ {supervisor}`,
  },
  {
    id: 'shift_available',
    title: '⚡ تنبيه بحجز شيفت اليوم',
    category: 'shift_booking',
    text: `يا مرحب كابتن {name} (كود {code}) 🛵
الشيفتات مفتوحة دلوقتي في منطقة {area} - زون {zone}.
حابين نشوفك منور الشارع معانا النهاردة. ادخل احجز شيفتك وبلغنا على طول علشان نأكد جاهزيتك.
بالتوفيق ورزق واسع يا رب!`,
  },
  {
    id: 'breakdown_issue',
    title: '🔧 استفسار عن عطل أو مشكلة بالمركبة',
    category: 'issue',
    text: `مساء الخير يا كابتن {name} 🛠️
تاريخ آخر شيفت لك كان {last_shift} (متوقف منذ {days} أيام).
هل فيه عطل في الموتوسيكل أو المكنة، أو مشكلة في الأبلكيشن نقدر نحلها لك مع الإدارة أو الدعم؟
برجاء الرد لمساعدتك في أسرع وقت.`,
  },
  {
    id: 'urgent_warning',
    title: '⚠️ تنبيه هام: توقف متكرر وتجنب الإيقاف',
    category: 'urgent',
    text: `تنبيه عاجل كابتن {name} (كود: {code}) ⚠️
نظراً لمرور {days} أيام متتالية دون تسجيل أو نزول شيفتات عمل وبدون عذر مسبق، يرجى التواصل فوراً مع المشرف {supervisor} خلال اليوم لتجنب اتخاذ إجراء بتعليق الحساب مؤقتاً.
نتمنى رجوعك والتواصل معنا في أقرب فرصة.`,
  },
  {
    id: 'short_quick',
    title: '💬 رسالة تذكير سريعة ومختصرة',
    category: 'friendly',
    text: `كابتن {name} إزيك، مفتقدينك في الشغل بقالك {days} أيام. هتنزل معانا إمتى إن شاء الله؟ طمنا عليك.`,
  },
];

export function compileMessage(templateText: string, courier: Courier): string {
  return templateText
    .replace(/\{name\}/g, courier.name || 'الكابتن')
    .replace(/\{code\}/g, courier.code || '')
    .replace(/\{days\}/g, courier.inactiveDays?.toString() || '0')
    .replace(/\{zone\}/g, courier.zone || 'الزون')
    .replace(/\{area\}/g, courier.area || 'المنطقة')
    .replace(/\{supervisor\}/g, courier.supervisor || 'المشرف المسؤول')
    .replace(/\{last_shift\}/g, courier.lastShiftDate || 'غير محدد')
    .replace(/\{phone\}/g, courier.phone || '');
}

export function getWhatsAppUrls(phone: string, message: string) {
  const { international } = formatEgyptianPhone(phone);
  const encoded = encodeURIComponent(message);

  return {
    waMeUrl: `https://wa.me/${international}?text=${encoded}`,
    webWhatsAppUrl: `https://web.whatsapp.com/send?phone=${international}&text=${encoded}`,
    mobileWhatsAppUrl: `whatsapp://send?phone=${international}&text=${encoded}`,
  };
}
