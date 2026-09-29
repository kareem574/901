import { useState, useEffect, useRef, useCallback } from 'react';
import { Courier, ReminderConfig } from '../types/courier';
import { showDesktopNotification, getNotificationPermission, requestNotificationPermission, NotificationPermissionStatus } from '../utils/notifications';
import { audioManager } from '../utils/audio';

const STORAGE_KEY_CONFIG = 'courier_tracker_reminder_config';

export const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  enabled: true,
  intervalMinutes: 60, // Every 60 minutes reminder
  soundEnabled: true,
  dailyTimes: ['10:00', '13:00', '17:00'],
  lastTriggered: null,
};

export function useReminderEngine(
  couriers: Courier[],
  onUpdateCourierReminder: (courierId: string, reminderDone: boolean) => void,
  onSelectCourier?: (courier: Courier) => void
) {
  const [permission, setPermission] = useState<NotificationPermissionStatus>('default');
  const [config, setConfig] = useState<ReminderConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_REMINDER_CONFIG;
    } catch {
      return DEFAULT_REMINDER_CONFIG;
    }
  });

  const [activeAlerts, setActiveAlerts] = useState<Array<{ id: string; title: string; body: string; time: string; courierId?: string }>>([]);

  const couriersRef = useRef(couriers);
  couriersRef.current = couriers;

  const configRef = useRef(config);
  configRef.current = config;

  // Sync permission state
  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  // Persist config
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  // Request browser permission
  const requestPermission = useCallback(async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      showDesktopNotification('تم تفعيل إشعارات سطح المكتب بنجاح 🎉', {
        body: 'ستصلك تنبيهات بالمواعيد ومتابعة المناديب المتوقفين عن العمل.',
        playSound: configRef.current.soundEnabled,
      });
    }
    return res;
  }, []);

  // Send a test notification immediately
  const triggerTestNotification = useCallback(() => {
    if (configRef.current.soundEnabled) {
      audioManager.playNotificationChime();
    }

    const shown = showDesktopNotification('تجربة إشعار سطح المكتب 🚀', {
      body: 'نظام متابعة المناديب يعمل بنجاح وجاهز لتنبيهك دورياً!',
      playSound: configRef.current.soundEnabled,
    });

    // Also add to in-app alerts banner
    setActiveAlerts((prev) => [
      {
        id: `alert-test-${Date.now()}`,
        title: 'تجربة إشعار سطح المكتب',
        body: 'تم اختبار الإشعارات بنجاح.',
        time: new Date().toLocaleTimeString('ar-EG'),
      },
      ...prev.slice(0, 4),
    ]);

    return shown;
  }, []);

  // Main monitoring interval
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTimestamp = now.getTime();
      const currentHourMinute = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentCouriers = couriersRef.current;
      const currentCfg = configRef.current;

      // 1. Check individual courier due reminders
      currentCouriers.forEach((courier) => {
        if (courier.reminderTime && !courier.reminderDone) {
          const dueTime = new Date(courier.reminderTime).getTime();
          if (dueTime <= currentTimestamp) {
            // Due!
            const title = `🔔 موعد متابعة: ${courier.name}`;
            const body = courier.reminderNote
              ? `${courier.reminderNote} (متوقف ${courier.inactiveDays} أيام)`
              : `الكابتن متوقف منذ ${courier.inactiveDays} أيام - يرجى التواصل معه الآن`;

            showDesktopNotification(title, {
              body,
              playSound: currentCfg.soundEnabled,
              onClick: () => {
                if (onSelectCourier) {
                  onSelectCourier(courier);
                }
              },
            });

            setActiveAlerts((prev) => [
              {
                id: `due-${courier.id}-${Date.now()}`,
                title,
                body,
                time: new Date().toLocaleTimeString('ar-EG'),
                courierId: courier.id,
              },
              ...prev.slice(0, 4),
            ]);

            onUpdateCourierReminder(courier.id, true);
          }
        }
      });

      // 2. Check periodic reminder if enabled
      if (currentCfg.enabled) {
        let shouldTriggerPeriodic = false;

        // Check elapsed interval
        if (currentCfg.intervalMinutes > 0) {
          const last = currentCfg.lastTriggered ? new Date(currentCfg.lastTriggered).getTime() : 0;
          const elapsedMin = (currentTimestamp - last) / (1000 * 60);
          if (elapsedMin >= currentCfg.intervalMinutes) {
            shouldTriggerPeriodic = true;
          }
        }

        // Check scheduled daily fixed times (e.g. 10:00, 14:00, 18:00)
        if (currentCfg.dailyTimes.includes(currentHourMinute)) {
          const last = currentCfg.lastTriggered ? new Date(currentCfg.lastTriggered) : null;
          const sameMinute = last && last.getHours() === now.getHours() && last.getMinutes() === now.getMinutes();
          if (!sameMinute) {
            shouldTriggerPeriodic = true;
          }
        }

        if (shouldTriggerPeriodic) {
          const uncontactedCount = currentCouriers.filter(
            (c) => c.status === 'not_contacted' || c.status === 'no_answer'
          ).length;
          const criticalCount = currentCouriers.filter((c) => c.inactiveDays >= 5 && c.status !== 'returned_to_work').length;

          if (uncontactedCount > 0 || criticalCount > 0) {
            const title = `⏰ تذكير متابعة المناديب المتوقفين (${uncontactedCount})`;
            const body = `يوجد لديك ${uncontactedCount} مندوب لم يتم استكمال متابعتهم اليوم، منهم ${criticalCount} متوقفون أكثر من 5 أيام!`;

            showDesktopNotification(title, {
              body,
              playSound: currentCfg.soundEnabled,
            });

            setActiveAlerts((prev) => [
              {
                id: `periodic-${Date.now()}`,
                title,
                body,
                time: new Date().toLocaleTimeString('ar-EG'),
              },
              ...prev.slice(0, 4),
            ]);

            setConfig((prev) => ({
              ...prev,
              lastTriggered: new Date().toISOString(),
            }));
          }
        }
      }
    }, 12000); // Check every 12 seconds

    return () => clearInterval(interval);
  }, [onUpdateCourierReminder, onSelectCourier]);

  const dismissAlert = useCallback((id: string) => {
    setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return {
    permission,
    config,
    setConfig,
    requestPermission,
    triggerTestNotification,
    activeAlerts,
    dismissAlert,
  };
}
