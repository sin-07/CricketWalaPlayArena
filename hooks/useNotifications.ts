'use client';

import { useState } from 'react';
import { Notification, NotificationType } from '@/types';

// Custom hook to manage notifications
const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: NotificationType = 'info'): Notification => {
    const notification: Notification = {
      id: Date.now(),
      message,
      type,
    };
    setNotifications((prev) => [...prev, notification]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);

    return notification;
  };

  const removeNotification = (id: number): void => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  return { notifications, addNotification, removeNotification };
};

export default useNotifications;
