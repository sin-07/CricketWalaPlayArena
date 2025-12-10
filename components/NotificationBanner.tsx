'use client';

import React from 'react';
import { Notification } from '@/types';

interface NotificationBannerProps {
  notifications: Notification[];
  onRemove: (id: number) => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null;

  const getNotificationStyles = (type: string): string => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-500 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-500 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-500 text-blue-800';
    }
  };

  const getIcon = (type: string): string => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getNotificationStyles(
            notification.type
          )} border-l-4 p-4 rounded-lg shadow-lg flex items-start justify-between animate-slide-in`}
        >
          <div className="flex items-start">
            <span className="text-xl mr-3 font-bold">
              {getIcon(notification.type)}
            </span>
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <button
            onClick={() => onRemove(notification.id)}
            className="ml-4 text-gray-500 hover:text-gray-700 font-bold"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationBanner;
