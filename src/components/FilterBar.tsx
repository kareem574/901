import React from 'react';
import {
  Search,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  Send,
  CheckCheck,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { FollowUpStatus, STATUS_CONFIG } from '../types/courier';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  daysFilter: string;
  onDaysFilterChange: (days: string) => void;
  zoneFilter: string;
  onZoneFilterChange: (zone: string) => void;
  supervisorFilter: string;
  onSupervisorFilterChange: (supervisor: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
  zones: string[];
  supervisors: string[];
  selectedCount: number;
  onBatchWhatsApp: () => void;
  onBatchMarkContacted: () => void;
  onBatchExport: () => void;
  onClearSelection: () => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  daysFilter,
  onDaysFilterChange,
  zoneFilter,
  onZoneFilterChange,
  supervisorFilter,
  onSupervisorFilterChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  zones,
  supervisors,
  selectedCount,
  onBatchWhatsApp,
  onBatchMarkContacted,
  onBatchExport,
  onClearSelection,
  onSelectAll,
  isAllSelected,
}) => {
  return (
    <div className="space-y-3">
      {/* Top Filter & Search Row */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-2.5 items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="بحث باسم المندوب، الكود، رقم الهاتف، أو المشرف..."
            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Inactive Days Filter */}
          <select
            value={daysFilter}
            onChange={(e) => onDaysFilterChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-700 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">كل مدد التوقف</option>
            <option value="7plus">متوقف 7 أيام فأكثر (حرج)</option>
            <option value="4to6">متوقف 4 إلى 6 أيام</option>
            <option value="1to3">متوقف 1 إلى 3 أيام</option>
          </select>

          {/* Zone Filter */}
          {zones.length > 0 && (
            <select
              value={zoneFilter}
              onChange={(e) => onZoneFilterChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-700 focus:ring-2 focus:ring-emerald-500 cursor-pointer max-w-[140px] truncate"
            >
              <option value="all">كل الزونات ({zones.length})</option>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          )}

          {/* Supervisor Filter */}
          {supervisors.length > 0 && (
            <select
              value={supervisorFilter}
              onChange={(e) => onSupervisorFilterChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-700 focus:ring-2 focus:ring-emerald-500 cursor-pointer max-w-[160px] truncate"
            >
              <option value="all">كل المشرفين ({supervisors.length})</option>
              {supervisors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-700 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="days_desc">الأكثر توقفاً أولاً</option>
            <option value="days_asc">الأقل توقفاً أولاً</option>
            <option value="name_asc">الاسم (أ - ي)</option>
            <option value="status">بحسب الحالة</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => onViewModeChange('table')}
              title="عرض كجدول"
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('cards')}
              title="عرض كبطاقات"
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <button
          onClick={() => onStatusFilterChange('all')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          الكل
        </button>

        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const isSelected = statusFilter === key;
          return (
            <button
              key={key}
              onClick={() => onStatusFilterChange(key)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-600/30'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Batch Actions Bar (visible when items selected) */}
      {selectedCount > 0 && (
        <div className="bg-emerald-950 text-white p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              تم تحديد {selectedCount} مندوب
            </span>
            <button
              onClick={onSelectAll}
              className="text-xs text-emerald-200 hover:text-white underline cursor-pointer"
            >
              {isAllSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل في الصفحة'}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onBatchWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>طابور مراسلة واتساب</span>
            </button>

            <button
              onClick={onBatchMarkContacted}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>تحديد كـ "تم التواصل"</span>
            </button>

            <button
              onClick={onBatchExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>تصدير المحددين</span>
            </button>

            <button
              onClick={onClearSelection}
              className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-200 hover:text-white cursor-pointer"
              title="إلغاء التحديد"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
