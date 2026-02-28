import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Mail,
  MessageSquare,
  Calendar,
  DollarSign,
  Users,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Archive,
  Star,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { notificationsApi, type Notification, type NotificationType } from '../../src/services/crm/notifications-api';

type NotificationCategory = 'all' | 'unread' | 'important' | 'archived';

const TYPE_ICONS: Record<NotificationType, React.ElementType> = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
  message: MessageSquare,
};

const FALLBACK_ICONS: Record<string, React.ElementType> = {
  Payment: DollarSign,
  Message: MessageSquare,
  Calendar: Calendar,
  Invoice: AlertCircle,
  Team: Users,
  Task: CheckCircle,
  Email: Mail,
  System: XCircle,
};

function getIconForNotification(n: Notification): React.ElementType {
  return TYPE_ICONS[n.type] || FALLBACK_ICONS[n.category || ''] || Bell;
}

function formatTimestamp(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export function NotificationsPage() {
  const { isDarkMode } = useTheme();
  const [filter, setFilter] = useState<NotificationCategory>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const params: { unread_only?: boolean; important_only?: boolean; archived_only?: boolean } = {};
      if (filter === 'unread') params.unread_only = true;
      if (filter === 'important') params.important_only = true;
      if (filter === 'archived') params.archived_only = true;

      const res = await notificationsApi.list({ ...params, per_page: 100 });
      setNotifications(res.data ?? []);
      setUnreadCount(res.meta?.unread_count ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Optimistic update reverted on error
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  const toggleImportant = async (id: string) => {
    try {
      const updated = await notificationsApi.toggleImportant(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? updated : n))
      );
    } catch {
      // Ignore
    }
  };

  const archiveNotification = async (id: string) => {
    try {
      await notificationsApi.archive(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((c) => {
        const n = notifications.find((x) => x.id === id);
        return n && !n.read ? Math.max(0, c - 1) : c;
      });
    } catch {
      // Ignore
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // Ignore
    }
  };

  const getTypeStyles = (type: NotificationType) => {
    const styles = {
      info: {
        bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
        border: isDarkMode ? 'border-blue-500/20' : 'border-blue-200',
        icon: isDarkMode ? 'text-blue-400' : 'text-blue-600',
        iconBg: isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100',
      },
      success: {
        bg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50',
        border: isDarkMode ? 'border-emerald-500/20' : 'border-emerald-200',
        icon: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
        iconBg: isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100',
      },
      warning: {
        bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50',
        border: isDarkMode ? 'border-amber-500/20' : 'border-amber-200',
        icon: isDarkMode ? 'text-amber-400' : 'text-amber-600',
        iconBg: isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100',
      },
      error: {
        bg: isDarkMode ? 'bg-red-500/10' : 'bg-red-50',
        border: isDarkMode ? 'border-red-500/20' : 'border-red-200',
        icon: isDarkMode ? 'text-red-400' : 'text-red-600',
        iconBg: isDarkMode ? 'bg-red-500/20' : 'bg-red-100',
      },
      message: {
        bg: isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-50',
        border: isDarkMode ? 'border-cyan-500/20' : 'border-cyan-200',
        icon: isDarkMode ? 'text-cyan-400' : 'text-cyan-600',
        iconBg: isDarkMode ? 'bg-cyan-500/20' : 'bg-cyan-100',
      },
    };
    return styles[type] || styles.info;
  };

  if (loading && notifications.length === 0) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} py-8 px-4 flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading notifications...</span>
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} py-8 px-4 flex flex-col items-center justify-center`}>
        <p className="text-red-600 mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Notifications
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={markAllAsRead}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50'
                  } border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} transition-colors text-sm font-medium`}
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50'
                } border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} transition-colors`}
              >
                <Settings className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 flex-wrap">
            {(['all', 'unread', 'important', 'archived'] as NotificationCategory[]).map((f) => (
              <motion.button
                key={f}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                    : isDarkMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                    {unreadCount}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`text-center py-16 rounded-2xl ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                } border-2`}
              >
                <Bell className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  No notifications
                </h3>
                <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                  {filter === 'unread'
                    ? "You're all caught up!"
                    : filter === 'important'
                      ? 'No important notifications'
                      : filter === 'archived'
                        ? 'No archived notifications'
                        : 'No notifications to show'}
                </p>
              </motion.div>
            ) : (
              notifications.map((notification, index) => {
                const Icon = getIconForNotification(notification);
                const typeStyles = getTypeStyles(notification.type);
                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative rounded-xl border-2 overflow-hidden transition-all ${
                      notification.read
                        ? isDarkMode
                          ? 'bg-slate-800/50 border-slate-700'
                          : 'bg-white border-slate-200'
                        : `${typeStyles.bg} ${typeStyles.border}`
                    } ${!notification.read ? 'shadow-lg' : ''}`}
                  >
                    {!notification.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-cyan-600" />
                    )}

                    <div className="p-5 pl-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${typeStyles.iconBg} flex-shrink-0`}>
                          <Icon className={`h-5 w-5 ${typeStyles.icon}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                  {notification.title}
                                </h3>
                                {notification.important && (
                                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                )}
                              </div>
                              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-2`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                  <Clock className="h-3 w-3" />
                                  {formatTimestamp(notification.created_at)}
                                </span>
                                {notification.category && (
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {notification.category}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="relative group">
                              <button
                                className={`p-1 rounded-lg ${
                                  isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                                } transition-colors`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              <div
                                className={`absolute right-0 top-8 w-48 rounded-lg shadow-xl border ${
                                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                                } opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10`}
                              >
                                <div className="py-2">
                                  {!notification.read && (
                                    <button
                                      onClick={() => markAsRead(notification.id)}
                                      className={`w-full text-left px-4 py-2 text-sm ${
                                        isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                                      } transition-colors flex items-center gap-2`}
                                    >
                                      <Check className="h-4 w-4" />
                                      Mark as read
                                    </button>
                                  )}
                                  <button
                                    onClick={() => toggleImportant(notification.id)}
                                    className={`w-full text-left px-4 py-2 text-sm ${
                                      isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                                    } transition-colors flex items-center gap-2`}
                                  >
                                    <Star className="h-4 w-4" />
                                    {notification.important ? 'Remove from important' : 'Mark as important'}
                                  </button>
                                  <button
                                    onClick={() => archiveNotification(notification.id)}
                                    className={`w-full text-left px-4 py-2 text-sm ${
                                      isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                                    } transition-colors flex items-center gap-2`}
                                  >
                                    <Archive className="h-4 w-4" />
                                    Archive
                                  </button>
                                  <div className={`my-1 h-px ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
                                  <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className={`w-full text-left px-4 py-2 text-sm ${
                                      isDarkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                                    } transition-colors flex items-center gap-2`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {notification.action_label && notification.action_url && (
                            <motion.a
                              href={notification.action_url}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`mt-3 inline-block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                isDarkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {notification.action_label}
                            </motion.a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
