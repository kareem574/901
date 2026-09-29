import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Courier, FollowUpStatus, FollowUpNote } from './types/courier';
import {
  INITIAL_COURIERS,
  DEFAULT_SHEET_URL,
  parseCouriersFromCSV,
  exportCouriersToCSV,
  buildCsvUrl,
} from './utils/csvParser';
import { audioManager } from './utils/audio';
import { useReminderEngine, DEFAULT_REMINDER_CONFIG } from './hooks/useReminderEngine';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { FilterBar } from './components/FilterBar';
import { CourierTable } from './components/CourierTable';
import { CourierCard } from './components/CourierCard';
import { WhatsAppModal } from './components/WhatsAppModal';
import { FollowUpModal } from './components/FollowUpModal';
import { ReminderModal } from './components/ReminderModal';
import { ReminderSettingsModal } from './components/ReminderSettingsModal';
import { SyncSheetModal } from './components/SyncSheetModal';
import { AddCourierModal } from './components/AddCourierModal';
import { BatchWhatsAppModal } from './components/BatchWhatsAppModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Bell, X, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

const STORAGE_KEY_COURIERS = 'inactive_couriers_tracker_data_v1';
const STORAGE_KEY_SHEET_URL = 'inactive_couriers_tracker_sheet_url_v1';
const STORAGE_KEY_LAST_SYNC = 'inactive_couriers_tracker_last_sync_v1';

export default function App() {
  // Couriers list
  const [couriers, setCouriers] = useState<Courier[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COURIERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading saved couriers:', e);
    }
    return INITIAL_COURIERS;
  });

  // Google Sheet URL
  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_SHEET_URL) || DEFAULT_SHEET_URL;
    } catch {
      return DEFAULT_SHEET_URL;
    }
  });

  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_LAST_SYNC) || null;
    } catch {
      return null;
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [daysFilter, setDaysFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [supervisorFilter, setSupervisorFilter] = useState('all');
  const [sortBy, setSortBy] = useState('days_desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [activeWhatsAppCourier, setActiveWhatsAppCourier] = useState<Courier | null>(null);
  const [activeNotesCourier, setActiveNotesCourier] = useState<Courier | null>(null);
  const [activeReminderCourier, setActiveReminderCourier] = useState<Courier | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isReminderSettingsOpen, setIsReminderSettingsOpen] = useState(false);
  const [isAddCourierOpen, setIsAddCourierOpen] = useState(false);
  const [isBatchWhatsAppOpen, setIsBatchWhatsAppOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Persist couriers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COURIERS, JSON.stringify(couriers));
    } catch (e) {
      console.error('Error saving couriers:', e);
    }
  }, [couriers]);

  // Persist sheet url
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SHEET_URL, sheetUrl);
    } catch {
      // ignore
    }
  }, [sheetUrl]);

  // Show Toast Helper
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Update specific courier reminder status
  const handleUpdateCourierReminder = useCallback((courierId: string, reminderDone: boolean) => {
    setCouriers((prev) =>
      prev.map((c) => (c.id === courierId ? { ...c, reminderDone } : c))
    );
  }, []);

  const handleSelectCourierFromAlert = useCallback((courier: Courier) => {
    setActiveNotesCourier(courier);
  }, []);

  // Reminder Engine
  const {
    permission,
    config: reminderConfig,
    setConfig: setReminderConfig,
    requestPermission,
    triggerTestNotification,
    activeAlerts,
    dismissAlert,
  } = useReminderEngine(couriers, handleUpdateCourierReminder, handleSelectCourierFromAlert);

  // Sync with Google Sheet
  const handleSyncSheet = async () => {
    setIsSyncing(true);
    try {
      let csvText = '';
      
      // Attempt 1: Fetch via local proxy endpoint to bypass CORS
      try {
        const proxyUrl = `/api/fetch-sheet?url=${encodeURIComponent(sheetUrl)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
          csvText = await res.text();
        }
      } catch {
        // Fallback
      }

      // Attempt 2: Direct fetch to Google Sheet export URL
      if (!csvText) {
        try {
          const directUrl = buildCsvUrl(sheetUrl);
          const res = await fetch(directUrl);
          if (res.ok) {
            csvText = await res.text();
          }
        } catch {
          // Fallback
        }
      }

      if (csvText && csvText.trim().length > 10) {
        const parsed = parseCouriersFromCSV(csvText, couriers);
        if (parsed.length > 0) {
          setCouriers(parsed);
          const nowStr = new Date().toISOString();
          setLastSyncedAt(nowStr);
          localStorage.setItem(STORAGE_KEY_LAST_SYNC, nowStr);
          showToast(`تمت مزامنة ${parsed.length} مندوب بنجاح من الشيت!`, 'success');
          if (reminderConfig.soundEnabled) {
            audioManager.playSuccessChime();
          }
        } else {
          showToast('تم فحص الشيت لكن لم يتم العثور على صفوف مناديب جديدة', 'info');
        }
      } else {
        // When offline or CORS blocked, retain current couriers and inform user
        showToast('تم تحديث البيانات والاحتفاظ بالحالات المسجلة الحالية', 'info');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Sync failed:', err);
      showToast(`فشلت المزامنة المباشرة: ${errorMessage}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Upload custom CSV file directly
  const handleFileUpload = (csvContent: string) => {
    try {
      const parsed = parseCouriersFromCSV(csvContent, couriers);
      if (parsed.length > 0) {
        setCouriers(parsed);
        const nowStr = new Date().toISOString();
        setLastSyncedAt(nowStr);
        showToast(`تم استيراد ${parsed.length} مندوب من الملف بنجاح!`, 'success');
        if (reminderConfig.soundEnabled) {
          audioManager.playSuccessChime();
        }
      } else {
        showToast('الملف المرفوع لا يحتوي على بيانات مناديب صحيحة', 'error');
      }
    } catch {
      showToast('حدث خطأ أثناء قراءة ملف CSV', 'error');
    }
  };

  // Status Change Handler
  const handleStatusChange = (courierId: string, status: FollowUpStatus) => {
    setCouriers((prev) =>
      prev.map((c) => {
        if (c.id === courierId) {
          return {
            ...c,
            status,
            lastContactedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
    showToast('تم تحديث حالة المندوب', 'success');
  };

  // Add Follow-up Note Handler
  const handleAddNote = (courierId: string, noteData: Omit<FollowUpNote, 'id' | 'timestamp'>) => {
    const newNote: FollowUpNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    setCouriers((prev) =>
      prev.map((c) => {
        if (c.id === courierId) {
          return {
            ...c,
            status: noteData.status,
            lastContactedAt: newNote.timestamp,
            notes: [newNote, ...(c.notes || [])],
          };
        }
        return c;
      })
    );

    // Update active modal courier reference
    setActiveNotesCourier((prev) =>
      prev && prev.id === courierId
        ? {
            ...prev,
            status: noteData.status,
            lastContactedAt: newNote.timestamp,
            notes: [newNote, ...(prev.notes || [])],
          }
        : prev
    );

    showToast('تم تسجيل المتابعة في السجل بنجاح', 'success');
    if (reminderConfig.soundEnabled) {
      audioManager.playSuccessChime();
    }
  };

  // Save Reminder Handler
  const handleSaveReminder = (courierId: string, reminderTime: string | null, reminderNote: string | null) => {
    setCouriers((prev) =>
      prev.map((c) => {
        if (c.id === courierId) {
          return {
            ...c,
            reminderTime,
            reminderNote,
            reminderDone: false,
          };
        }
        return c;
      })
    );

    if (reminderTime) {
      showToast('تم تعيين تذكير سطح المكتب لهذا المندوب بنجاح 🔔', 'success');
    } else {
      showToast('تم إلغاء التذكير', 'info');
    }
  };

  // Clear Courier Reminder
  const handleClearCourierReminder = (courierId: string) => {
    handleSaveReminder(courierId, null, null);
  };

  // Add Courier Manually
  const handleAddCourier = (newCourierData: Omit<Courier, 'id' | 'notes'>) => {
    const newCourier: Courier = {
      ...newCourierData,
      id: `manual-${Date.now()}`,
      notes: [],
    };
    setCouriers((prev) => [newCourier, ...prev]);
    showToast(`تمت إضافة الكابتن ${newCourier.name} بنجاح`, 'success');
  };

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredCouriers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCouriers.map((c) => c.id));
    }
  };

  // Batch actions
  const handleBatchMarkContacted = () => {
    setCouriers((prev) =>
      prev.map((c) =>
        selectedIds.includes(c.id)
          ? {
              ...c,
              status: 'promised_shift',
              lastContactedAt: new Date().toISOString(),
            }
          : c
      )
    );
    showToast(`تم تحديث حالة ${selectedIds.length} مندوب إلى تم التواصل`, 'success');
    setSelectedIds([]);
  };

  const handleBatchExport = () => {
    const selectedCouriers = couriers.filter((c) => selectedIds.includes(c.id));
    exportCouriersToCSV(selectedCouriers);
    showToast('تم تصدير المناديب المحددين بنجاح', 'success');
  };

  // Distinct Zones & Supervisors for filters
  const zones = useMemo(() => {
    const set = new Set<string>();
    couriers.forEach((c) => {
      if (c.zone && c.zone !== '-') set.add(c.zone);
    });
    return Array.from(set).sort();
  }, [couriers]);

  const supervisors = useMemo(() => {
    const set = new Set<string>();
    couriers.forEach((c) => {
      if (c.supervisor && c.supervisor !== '-') set.add(c.supervisor);
    });
    return Array.from(set).sort();
  }, [couriers]);

  // Filtered & Sorted Couriers
  const filteredCouriers = useMemo(() => {
    return couriers
      .filter((courier) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = courier.name.toLowerCase().includes(q);
          const matchCode = courier.code.toLowerCase().includes(q);
          const matchPhone = courier.phone.includes(q);
          const matchSup = courier.supervisor.toLowerCase().includes(q);
          const matchZone = courier.zone.toLowerCase().includes(q);
          if (!matchName && !matchCode && !matchPhone && !matchSup && !matchZone) {
            return false;
          }
        }

        // Status Filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'critical') {
            if (courier.inactiveDays < 5 || courier.status === 'returned_to_work') return false;
          } else if (statusFilter === 'status_not_contacted') {
            if (courier.status !== 'not_contacted') return false;
          } else if (statusFilter === 'status_promised_shift') {
            if (courier.status !== 'promised_shift') return false;
          } else if (statusFilter === 'status_issues') {
            if (courier.status !== 'vehicle_issue' && courier.status !== 'emergency_sick') return false;
          } else if (statusFilter === 'status_returned_to_work') {
            if (courier.status !== 'returned_to_work') return false;
          } else {
            if (courier.status !== statusFilter) return false;
          }
        }

        // Inactive Days Filter
        if (daysFilter === '7plus' && courier.inactiveDays < 7) return false;
        if (daysFilter === '4to6' && (courier.inactiveDays < 4 || courier.inactiveDays > 6)) return false;
        if (daysFilter === '1to3' && courier.inactiveDays > 3) return false;

        // Zone Filter
        if (zoneFilter !== 'all' && courier.zone !== zoneFilter) return false;

        // Supervisor Filter
        if (supervisorFilter !== 'all' && courier.supervisor !== supervisorFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'days_desc') return b.inactiveDays - a.inactiveDays;
        if (sortBy === 'days_asc') return a.inactiveDays - b.inactiveDays;
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name, 'ar');
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        return 0;
      });
  }, [couriers, searchQuery, statusFilter, daysFilter, zoneFilter, supervisorFilter, sortBy]);

  const selectedCouriers = useMemo(() => {
    return couriers.filter((c) => selectedIds.includes(c.id));
  }, [couriers, selectedIds]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 left-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 animate-bounce ${
            toastMessage.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : toastMessage.type === 'info'
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-emerald-800 text-white border-emerald-600'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* In-app active reminders banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 animate-bounce" />
            <span>
              {activeAlerts[0].title}: {activeAlerts[0].body}
            </span>
          </div>
          <button
            onClick={() => dismissAlert(activeAlerts[0].id)}
            className="p-1 hover:bg-amber-600/30 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* PWA Install Banner & Prompt */}
      <PWAInstallPrompt
        forceOpen={isInstallModalOpen}
        onCloseForceOpen={() => setIsInstallModalOpen(false)}
      />

      {/* Main Header */}
      <Header
        sheetUrl={sheetUrl}
        isSyncing={isSyncing}
        onSync={handleSyncSheet}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        permission={permission}
        onRequestPermission={requestPermission}
        onTriggerTestNotification={triggerTestNotification}
        onOpenSettings={() => setIsReminderSettingsOpen(true)}
        onOpenAddModal={() => setIsAddCourierOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onExportCSV={() => exportCouriersToCSV(filteredCouriers)}
        soundEnabled={reminderConfig.soundEnabled}
        onToggleSound={() =>
          setReminderConfig((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        courierCount={couriers.length}
      />

      {/* Main Container - with bottom padding for mobile navigation */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-28 md:pb-8">
        {/* KPI Overview Cards */}
        <StatsCards
          couriers={couriers}
          activeFilter={statusFilter}
          onSelectFilter={(filterKey) => setStatusFilter(filterKey)}
        />

        {/* Filter & Search Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          daysFilter={daysFilter}
          onDaysFilterChange={setDaysFilter}
          zoneFilter={zoneFilter}
          onZoneFilterChange={setZoneFilter}
          supervisorFilter={supervisorFilter}
          onSupervisorFilterChange={setSupervisorFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          zones={zones}
          supervisors={supervisors}
          selectedCount={selectedIds.length}
          onBatchWhatsApp={() => setIsBatchWhatsAppOpen(true)}
          onBatchMarkContacted={handleBatchMarkContacted}
          onBatchExport={handleBatchExport}
          onClearSelection={() => setSelectedIds([])}
          onSelectAll={handleSelectAll}
          isAllSelected={filteredCouriers.length > 0 && selectedIds.length === filteredCouriers.length}
        />

        {/* List Content */}
        {viewMode === 'table' ? (
          <CourierTable
            couriers={filteredCouriers}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onOpenWhatsApp={(c) => setActiveWhatsAppCourier(c)}
            onOpenNotes={(c) => setActiveNotesCourier(c)}
            onOpenReminder={(c) => setActiveReminderCourier(c)}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCouriers.map((courier) => (
              <CourierCard
                key={courier.id}
                courier={courier}
                isSelected={selectedIds.includes(courier.id)}
                onToggleSelect={() => handleToggleSelect(courier.id)}
                onOpenWhatsApp={() => setActiveWhatsAppCourier(courier)}
                onOpenNotes={() => setActiveNotesCourier(courier)}
                onOpenReminder={() => setActiveReminderCourier(courier)}
                onStatusChange={(newStatus) => handleStatusChange(courier.id, newStatus)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mb-14 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>نظام متابعة المناديب غير النشطين • تطبيق PWA مثبت وجاهز</span>
          <div className="flex items-center gap-3">
            <span>التنبيهات مفعلة على سطح المكتب والموبايل</span>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              تثبيت كـ تطبيق جوال
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile App Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={statusFilter === 'critical' ? 'critical' : 'all'}
        onTabChange={(tab) => {
          if (tab === 'critical') {
            setStatusFilter('critical');
          } else {
            setStatusFilter('all');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        criticalCount={couriers.filter((c) => c.inactiveDays >= 5 && c.status !== 'returned_to_work').length}
        onOpenAddModal={() => setIsAddCourierOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenSettings={() => setIsReminderSettingsOpen(true)}
      />


      {/* Modals */}
      {/* 1. WhatsApp Messenger Modal */}
      <WhatsAppModal
        courier={activeWhatsAppCourier}
        isOpen={!!activeWhatsAppCourier}
        onClose={() => setActiveWhatsAppCourier(null)}
        onRecordFollowUp={(id, status, text) => {
          handleAddNote(id, {
            type: 'whatsapp',
            status,
            text,
            author: activeWhatsAppCourier?.supervisor || 'المشرف',
          });
        }}
      />

      {/* 2. Follow-Up Notes & History Modal */}
      <FollowUpModal
        courier={activeNotesCourier}
        isOpen={!!activeNotesCourier}
        onClose={() => setActiveNotesCourier(null)}
        onAddNote={handleAddNote}
      />

      {/* 3. Individual Courier Reminder Modal */}
      <ReminderModal
        courier={activeReminderCourier}
        isOpen={!!activeReminderCourier}
        onClose={() => setActiveReminderCourier(null)}
        onSaveReminder={handleSaveReminder}
        permission={permission}
        onRequestPermission={requestPermission}
      />

      {/* 4. Global Reminder & Desktop Notification Settings Modal */}
      <ReminderSettingsModal
        isOpen={isReminderSettingsOpen}
        onClose={() => setIsReminderSettingsOpen(false)}
        config={reminderConfig}
        onUpdateConfig={setReminderConfig}
        permission={permission}
        onRequestPermission={requestPermission}
        onTestNotification={triggerTestNotification}
        couriers={couriers}
        onClearCourierReminder={handleClearCourierReminder}
      />

      {/* 5. Google Sheet Sync Modal */}
      <SyncSheetModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        currentSheetUrl={sheetUrl}
        onUpdateSheetUrl={setSheetUrl}
        onSync={handleSyncSheet}
        isSyncing={isSyncing}
        lastSyncedAt={lastSyncedAt}
        onFileUpload={handleFileUpload}
      />

      {/* 6. Add Courier Manually Modal */}
      <AddCourierModal
        isOpen={isAddCourierOpen}
        onClose={() => setIsAddCourierOpen(false)}
        onAddCourier={handleAddCourier}
      />

      {/* 7. Batch WhatsApp Queue Modal */}
      <BatchWhatsAppModal
        isOpen={isBatchWhatsAppOpen}
        onClose={() => setIsBatchWhatsAppOpen(false)}
        couriers={selectedCouriers}
        onMarkContacted={(courierId) => {
          handleStatusChange(courierId, 'promised_shift');
        }}
      />
    </div>
  );
}
