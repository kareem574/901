import { audioManager } from './audio';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export function getNotificationPermission(): NotificationPermissionStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionStatus;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const res = await Notification.requestPermission();
    return res as NotificationPermissionStatus;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return getNotificationPermission();
  }
}

export function showDesktopNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    playSound?: boolean;
    onClick?: () => void;
  }
): boolean {
  if (options?.playSound !== false) {
    audioManager.playNotificationChime();
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body: options?.body || 'تذكير بمتابعة مناديب الشيفتات غير النشطين',
        icon: options?.icon || 'https://cdn-icons-png.flaticon.com/512/2838/2838694.png',
        tag: options?.tag || `reminder-${Date.now()}`,
        requireInteraction: true,
      });

      notif.onclick = () => {
        window.focus();
        if (options?.onClick) {
          options.onClick();
        }
        notif.close();
      };
      return true;
    } catch (e) {
      console.warn('Native notification failed, falling back:', e);
      return false;
    }
  }

  return false;
}
