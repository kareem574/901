import { Courier, FollowUpStatus } from '../types/courier';

export const DEFAULT_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1SRcZB7gAjEatJv19eFVsGgsW3j4uRb9pqJ4CqSRcOpk/edit?usp=drivesdk';

// Raw data directly parsed from the provided Google Sheet
export const INITIAL_COURIERS: Courier[] = [
  {
    id: '3508768',
    code: '3508768',
    name: 'Sayed Ramadan Abdulaal Ibrahim _EL EZZ_BC',
    phone: '01127932953',
    supervisor: 'كريم شعبان محمود احمد',
    area: 'Masre Elgdeda',
    zone: 'Hiliopolise',
    inactiveDays: 4,
    lastShiftDate: '9/23/2026',
    lastSelectionDate: '-',
    lastAbsenceDate: '-',
    status: 'not_contacted',
    notes: [],
  },
  {
    id: '2523607',
    code: '2523607',
    name: 'Salah Ahmed Salaheldien Saad _EL EZZ_BC',
    phone: '01122146314',
    supervisor: 'كريم شعبان محمود احمد',
    area: 'Masre Elgdeda',
    zone: 'Hiliopolise',
    inactiveDays: 4,
    lastShiftDate: '9/24/2026',
    lastSelectionDate: '-',
    lastAbsenceDate: '-',
    status: 'not_contacted',
    notes: [],
  },
  {
    id: '2420151',
    code: '2420151',
    name: 'Mohamed Mousa Abdelmalek Ahmed _EL EZZ_BC',
    phone: '01200435892',
    supervisor: 'كريم شعبان محمود احمد',
    area: 'Masre Elgdeda',
    zone: 'Hiliopolise',
    inactiveDays: 4,
    lastShiftDate: '9/24/2026',
    lastSelectionDate: '-',
    lastAbsenceDate: '-',
    status: 'not_contacted',
    notes: [],
  },
  {
    id: '2371538',
    code: '2371538',
    name: 'Mohamed Zakria Ahmed Jebril _EL EZZ_BC',
    phone: '01009043384',
    supervisor: 'كريم شعبان محمود احمد',
    area: 'Masre Elgdeda',
    zone: 'Hiliopolise',
    inactiveDays: 7,
    lastShiftDate: '9/20/2026',
    lastSelectionDate: '-',
    lastAbsenceDate: '8/18/2026',
    status: 'not_contacted',
    notes: [],
  },
  {
    id: '2218401',
    code: '2218401',
    name: 'Hedya Mahmoud Hedya Mohamed _EL EZZ',
    phone: '01093814813',
    supervisor: 'كريم شعبان محمود احمد',
    area: 'Masre Elgdeda',
    zone: 'Hiliopolise',
    inactiveDays: 7,
    lastShiftDate: '9/20/2026',
    lastSelectionDate: '-',
    lastAbsenceDate: '-',
    status: 'not_contacted',
    notes: [],
  },
  {
    id: '2112946-1',
    code: '2112946',
    name: 'Michael Jamal Habib Hanna _EL EZZ_BC',
    phone: '01220130526',
    supervisor: 'كريم شعبان محمود احمد',
    area: 'Masre Elgdeda',
    zone: 'Hiliopolise',
    inactiveDays: 5,
    lastShiftDate: '9/22/2026',
    lastSelectionDate: '2026-04-10',
    lastAbsenceDate: '-',
    status: 'not_contacted',
    notes: [],
  },
  {
    id: '2112946-2',
    code: '2112946',
    name: 'Michael Jamal Habib Hanna _EL EZZ_BC',
    phone: '01220130526',
    supervisor: 'كريم شعبان محمود احمد',
    area: 'Masre Elgdeda',
    zone: 'Hiliopolise',
    inactiveDays: 6,
    lastShiftDate: '9/22/2026',
    lastSelectionDate: '2026-04-10',
    lastAbsenceDate: '-',
    status: 'not_contacted',
    notes: [],
  },
];

export function extractSheetId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export function buildCsvUrl(sheetUrlOrId: string): string {
  const sheetId = extractSheetId(sheetUrlOrId) || sheetUrlOrId.trim();
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
}

// Robust CSV parser supporting quotes and commas inside text
export function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        // ignore carriage return
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export function parseCouriersFromCSV(csvText: string, existingCouriers: Courier[] = []): Courier[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  // Map header columns
  const header = rows[0].map((h) => h.trim().toLowerCase());
  
  const getIndex = (keywords: string[]) => {
    return header.findIndex((col) => keywords.some((kw) => col.includes(kw.toLowerCase())));
  };

  const codeIdx = getIndex(['كود', 'code', 'id']);
  const nameIdx = getIndex(['اسم', 'name']);
  const phoneIdx = getIndex(['تليفون', 'هاتف', 'phone', 'موبايل']);
  const supervisorIdx = getIndex(['مشرف', 'supervisor']);
  const areaIdx = getIndex(['منطقه', 'منطقة', 'area', 'region']);
  const zoneIdx = getIndex(['زون', 'zone']);
  const daysIdx = getIndex(['ايام', 'أيام', 'بدون عمل', 'inactive', 'days']);
  const lastShiftIdx = getIndex(['اخر شيفت', 'آخر شيفت', 'shift', 'عمل']);
  const lastSelectIdx = getIndex(['اختيار', 'selection']);
  const lastAbsenceIdx = getIndex(['غياب', 'absence']);

  const parsed: Courier[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 3) continue;

    const code = codeIdx >= 0 ? row[codeIdx] : row[0] || '';
    const name = nameIdx >= 0 ? row[nameIdx] : row[1] || '';
    const phone = phoneIdx >= 0 ? row[phoneIdx] : row[2] || '';
    const supervisor = supervisorIdx >= 0 ? row[supervisorIdx] : row[3] || '';
    const area = areaIdx >= 0 ? row[areaIdx] : row[4] || '';
    const zone = zoneIdx >= 0 ? row[zoneIdx] : row[5] || '';
    const rawDays = daysIdx >= 0 ? row[daysIdx] : row[6] || '0';
    const inactiveDays = parseInt(rawDays.replace(/\D/g, ''), 10) || 0;
    const lastShiftDate = lastShiftIdx >= 0 ? row[lastShiftIdx] : row[7] || '-';
    const lastSelectionDate = lastSelectIdx >= 0 ? row[lastSelectIdx] : row[8] || '-';
    const lastAbsenceDate = lastAbsenceIdx >= 0 ? row[lastAbsenceIdx] : row[9] || '-';

    const uniqueId = `${code}-${i}`;
    
    // Check if we have existing status or notes for this courier
    const existing = existingCouriers.find((c) => c.code === code && c.name === name) || existingCouriers.find((c) => c.code === code);

    parsed.push({
      id: uniqueId,
      code,
      name,
      phone,
      supervisor,
      area,
      zone,
      inactiveDays,
      lastShiftDate,
      lastSelectionDate,
      lastAbsenceDate,
      status: (existing?.status as FollowUpStatus) || 'not_contacted',
      lastContactedAt: existing?.lastContactedAt || null,
      notes: existing?.notes || [],
      reminderTime: existing?.reminderTime || null,
      reminderNote: existing?.reminderNote || null,
      reminderDone: existing?.reminderDone || false,
    });
  }

  return parsed;
}

export function exportCouriersToCSV(couriers: Courier[]): void {
  const headers = [
    'كود المندوب',
    'اسم المندوب',
    'رقم التليفون',
    'اسم المشرف',
    'المنطقة',
    'الزون',
    'عدد الأيام بدون عمل',
    'تاريخ آخر شيفت عمل',
    'حالة المتابعة',
    'تاريخ آخر تواصل',
    'عدد الملاحظات',
    'آخر ملاحظة مسجلة',
  ];

  const escapeField = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const statusArabicNames: Record<string, string> = {
    not_contacted: 'لم يتم التواصل',
    promised_shift: 'وعد بالنزول / حجز شيفت',
    no_answer: 'لم يرد / الهاتف مغلق',
    vehicle_issue: 'عطل في المركبة',
    emergency_sick: 'ظرف شخصي / مرضي',
    refused: 'رافض العمل',
    returned_to_work: 'تم نزول العمل بالفعل',
  };

  const lines = [headers.map(escapeField).join(',')];

  couriers.forEach((c) => {
    const lastNote = c.notes && c.notes.length > 0 ? c.notes[c.notes.length - 1].text : '';
    const lastContact = c.lastContactedAt ? new Date(c.lastContactedAt).toLocaleString('ar-EG') : 'لم يتواصل بعد';
    const statusText = statusArabicNames[c.status] || c.status;

    const row = [
      c.code,
      c.name,
      c.phone,
      c.supervisor,
      c.area,
      c.zone,
      c.inactiveDays,
      c.lastShiftDate,
      statusText,
      lastContact,
      c.notes?.length || 0,
      lastNote,
    ];
    lines.push(row.map(escapeField).join(','));
  });

  // UTF-8 BOM (\uFEFF) ensures Excel displays Arabic text properly
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  link.setAttribute('download', `تقرير_متابعة_المناديب_غير_النشطين_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
