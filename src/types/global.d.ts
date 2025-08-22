interface Notification {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface NotificationSystem {
  addNotification: (notification: Notification) => void;
}

declare global {
  interface Window {
    notificationSystem?: NotificationSystem;
  }
}

export {};
