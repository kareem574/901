import React, { useState } from 'react';
import { Courier, FollowUpStatus } from '../types/courier';
import { X, Plus, UserPlus, CheckCircle2 } from 'lucide-react';

interface AddCourierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourier: (courier: Omit<Courier, 'id' | 'notes'>) => void;
}

export const AddCourierModal: React.FC<AddCourierModalProps> = ({
  isOpen,
  onClose,
  onAddCourier,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [supervisor, setSupervisor] = useState('كريم شعبان محمود احمد');
  const [area, setArea] = useState('Masre Elgdeda');
  const [zone, setZone] = useState('Hiliopolise');
  const [inactiveDays, setInactiveDays] = useState(4);
  const [lastShiftDate, setLastShiftDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !code.trim()) return;

    onAddCourier({
      code: code.trim(),
      name: name.trim(),
      phone: phone.trim(),
      supervisor: supervisor.trim() || 'المشرف',
      area: area.trim() || 'المنطقة',
      zone: zone.trim() || 'الزون',
      inactiveDays: Number(inactiveDays) || 1,
      lastShiftDate: lastShiftDate || '-',
      lastSelectionDate: '-',
      lastAbsenceDate: '-',
      status: 'not_contacted',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">إضافة مندوب جديد للمتابعة</h2>
              <p className="text-xs text-emerald-100 mt-0.5">تسجيل مندوب نشط متوقف عن العمل يدوياً</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كود المندوب *</label>
              <input
                type="text"
                required
                placeholder="مثال: 3508768"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف (موبايل) *</label>
              <input
                type="text"
                required
                placeholder="011XXXXXXXX"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم المندوب الثلاثي/الرباعي *</label>
            <input
              type="text"
              required
              placeholder="اسم الكابتن كما هو مسجل في التطبيق"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المنطقة</label>
              <input
                type="text"
                placeholder="Masre Elgdeda / مصر الجديدة"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الزون (Zone)</label>
              <input
                type="text"
                placeholder="Hiliopolise / روكسي / الميرغني"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عدد أيام التوقف</label>
              <input
                type="number"
                min={1}
                max={90}
                value={inactiveDays}
                onChange={(e) => setInactiveDays(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ آخر شيفت عمل</label>
              <input
                type="text"
                placeholder="9/24/2026 أو 2026-09-24"
                value={lastShiftDate}
                onChange={(e) => setLastShiftDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم المشرف المسؤول</label>
            <input
              type="text"
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة للقائمة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
