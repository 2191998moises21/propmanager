import React, { useState, useEffect, useRef } from 'react';
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Notification } from '@/types';
import { notificationsAPI } from '@/services/api';

interface NotificationBellProps {
  userId: string;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId, className = '' }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const result = await notificationsAPI.getNotifications(50);
      if (result.success && result.data) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const result = await notificationsAPI.getUnreadCount();
      if (result.success && result.data !== undefined) {
        setUnreadCount(result.data);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark single notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const result = await notificationsAPI.markAsRead(notificationId);
      if (result.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, leido: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      const result = await notificationsAPI.markAllAsRead();
      if (result.success) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, leido: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete notification
  const handleDelete = async (notificationId: string) => {
    try {
      const result = await notificationsAPI.deleteNotification(notificationId);
      if (result.success) {
        const deletedNotif = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
        if (deletedNotif && !deletedNotif.leido) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already
    if (!notification.leido) {
      handleMarkAsRead(notification.id);
    }
    // Navigate to URL if provided
    if (notification.url) {
      window.location.href = notification.url;
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen((prev) => !prev);
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Polling for new notifications
  useEffect(() => {
    // Only fetch if userId exists
    if (!userId) return;

    fetchUnreadCount();

    // Poll every 60 seconds (increased from 30 to reduce load)
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 60000);

    return () => clearInterval(interval);
  }, []); // Empty dependencies - only run once on mount

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'hace unos segundos';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `hace ${days} día${days > 1 ? 's' : ''}`;
    const months = Math.floor(days / 30);
    return `hace ${months} mes${months > 1 ? 'es' : ''}`;
  };

  // Get notification icon color based on type
  const getNotificationColor = (tipo: string): string => {
    switch (tipo) {
      case 'payment':
        return 'text-green-500';
      case 'ticket':
        return 'text-orange-500';
      case 'contract':
        return 'text-blue-500';
      case 'maintenance':
        return 'text-yellow-500';
      case 'system':
        return 'text-gray-500';
      default:
        return 'text-primary';
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        aria-label="Notificaciones"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-800">Notificaciones</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="text-xs text-primary hover:text-primary-dark font-medium disabled:opacity-50"
                  title="Marcar todas como leídas"
                >
                  <CheckIcon className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <BellIcon className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative flex items-start px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.leido ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Unread indicator */}
                  {!notification.leido && (
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}

                  {/* Icon */}
                  <BellIcon
                    className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${getNotificationColor(
                      notification.tipo
                    )}`}
                  />

                  {/* Content */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {notification.titulo}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">{notification.mensaje}</p>
                    <p className="text-xs text-gray-400">{formatTimeAgo(notification.created_at)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 ml-2">
                    {!notification.leido && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Marcar como leída"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer - only show if there are notifications */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  // Could navigate to a full notifications page
                  setIsOpen(false);
                }}
                className="block w-full text-center text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
