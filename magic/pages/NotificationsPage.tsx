import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, Filter, Settings, Mail, MessageSquare, Calendar, DollarSign, Users, AlertCircle, Info, CheckCircle, XCircle, Clock, MoreVertical, Archive, Star } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'message';
type NotificationCategory = 'all' | 'unread' | 'important' | 'archived';
interface Notification {
  id: string;
  type: NotificationType;
  category: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  important: boolean;
  archived: boolean;
  icon: React.ElementType;
  actionLabel?: string;
  actionUrl?: string;
}
export function NotificationsPage() {
  const {
    isDarkMode
  } = useTheme();
  const [filter, setFilter] = useState<NotificationCategory>('all');
  const [notifications, setNotifications] = useState<Notification[]>([{
    id: '1',
    type: 'success',
    category: 'Payment',
    title: 'Payment Received',
    message: 'Payment of $3,200 received from Acme Corp for Invoice #INV-2024-001',
    timestamp: '2 minutes ago',
    read: false,
    important: true,
    archived: false,
    icon: DollarSign,
    actionLabel: 'View Invoice',
    actionUrl: '/invoices/1'
  }, {
    id: '2',
    type: 'message',
    category: 'Message',
    title: 'New Message from Sarah Johnson',
    message: "Can we reschedule tomorrow's meeting to 3 PM?",
    timestamp: '15 minutes ago',
    read: false,
    important: false,
    archived: false,
    icon: MessageSquare,
    actionLabel: 'Reply',
    actionUrl: '/messages/2'
  }, {
    id: '3',
    type: 'info',
    category: 'Calendar',
    title: 'Meeting Reminder',
    message: 'Team sync meeting starts in 1 hour',
    timestamp: '45 minutes ago',
    read: false,
    important: false,
    archived: false,
    icon: Calendar,
    actionLabel: 'View Calendar',
    actionUrl: '/schedule'
  }, {
    id: '4',
    type: 'warning',
    category: 'Invoice',
    title: 'Invoice Overdue',
    message: 'Invoice #INV-2024-045 is 5 days overdue. Total: $1,850',
    timestamp: '2 hours ago',
    read: true,
    important: true,
    archived: false,
    icon: AlertCircle,
    actionLabel: 'Send Reminder',
    actionUrl: '/invoices/45'
  }, {
    id: '5',
    type: 'info',
    category: 'Team',
    title: 'New Team Member Added',
    message: 'Mike Chen has been added to your team as Operations Manager',
    timestamp: '3 hours ago',
    read: true,
    important: false,
    archived: false,
    icon: Users,
    actionLabel: 'View Profile',
    actionUrl: '/team/mike'
  }, {
    id: '6',
    type: 'success',
    category: 'Task',
    title: 'Task Completed',
    message: 'Marketing campaign review has been completed by Emily Rodriguez',
    timestamp: '5 hours ago',
    read: true,
    important: false,
    archived: false,
    icon: CheckCircle
  }, {
    id: '7',
    type: 'message',
    category: 'Email',
    title: 'New Email from Client',
    message: 'TechStart Inc. has sent you a message regarding project timeline',
    timestamp: '1 day ago',
    read: true,
    important: false,
    archived: false,
    icon: Mail,
    actionLabel: 'Read Email',
    actionUrl: '/email/7'
  }, {
    id: '8',
    type: 'error',
    category: 'System',
    title: 'Integration Error',
    message: 'Failed to sync calendar events. Please check your integration settings.',
    timestamp: '2 days ago',
    read: true,
    important: true,
    archived: false,
    icon: XCircle,
    actionLabel: 'Fix Now',
    actionUrl: '/settings/integrations'
  }]);
  const getTypeStyles = (type: NotificationType) => {
    const styles = {
      info: {
        bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
        border: isDarkMode ? 'border-blue-500/20' : 'border-blue-200',
        icon: isDarkMode ? 'text-blue-400' : 'text-blue-600',
        iconBg: isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
      },
      success: {
        bg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50',
        border: isDarkMode ? 'border-emerald-500/20' : 'border-emerald-200',
        icon: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
        iconBg: isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
      },
      warning: {
        bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50',
        border: isDarkMode ? 'border-amber-500/20' : 'border-amber-200',
        icon: isDarkMode ? 'text-amber-400' : 'text-amber-600',
        iconBg: isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100'
      },
      error: {
        bg: isDarkMode ? 'bg-red-500/10' : 'bg-red-50',
        border: isDarkMode ? 'border-red-500/20' : 'border-red-200',
        icon: isDarkMode ? 'text-red-400' : 'text-red-600',
        iconBg: isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
      },
      message: {
        bg: isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-50',
        border: isDarkMode ? 'border-cyan-500/20' : 'border-cyan-200',
        icon: isDarkMode ? 'text-cyan-400' : 'text-cyan-600',
        iconBg: isDarkMode ? 'bg-cyan-500/20' : 'bg-cyan-100'
      }
    };
    return styles[type];
  };
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? {
      ...n,
      read: true
    } : n));
  };
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({
      ...n,
      read: true
    })));
  };
  const toggleImportant = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? {
      ...n,
      important: !n.important
    } : n));
  };
  const archiveNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? {
      ...n,
      archived: true
    } : n));
  };
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read && !n.archived;
    if (filter === 'important') return n.important && !n.archived;
    if (filter === 'archived') return n.archived;
    return !n.archived; // 'all' shows non-archived
  });
  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;
  return <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="mb-8">
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
                  {unreadCount} unread notification
                  {unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && <motion.button whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} onClick={markAllAsRead} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50'} border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} transition-colors text-sm font-medium`}>
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </motion.button>}
              <motion.button whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50'} border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} transition-colors`}>
                <Settings className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {(['all', 'unread', 'important', 'archived'] as NotificationCategory[]).map(f => <motion.button key={f} whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'unread' && unreadCount > 0 && <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                    {unreadCount}
                  </span>}
              </motion.button>)}
          </div>
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length === 0 ? <motion.div initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} exit={{
            opacity: 0,
            scale: 0.95
          }} className={`text-center py-16 rounded-2xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-2`}>
                <Bell className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  No notifications
                </h3>
                <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                  {filter === 'unread' ? "You're all caught up!" : filter === 'important' ? 'No important notifications' : filter === 'archived' ? 'No archived notifications' : 'No notifications to show'}
                </p>
              </motion.div> : filteredNotifications.map((notification, index) => {
            const Icon = notification.icon;
            const typeStyles = getTypeStyles(notification.type);
            return <motion.div key={notification.id} layout initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              x: -100
            }} transition={{
              delay: index * 0.05
            }} className={`relative rounded-xl border-2 overflow-hidden transition-all ${notification.read ? isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200' : `${typeStyles.bg} ${typeStyles.border}`} ${!notification.read ? 'shadow-lg' : ''}`}>
                    {/* Unread indicator */}
                    {!notification.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-cyan-600" />}

                    <div className="p-5 pl-6">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`p-3 rounded-lg ${typeStyles.iconBg} flex-shrink-0`}>
                          <Icon className={`h-5 w-5 ${typeStyles.icon}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                  {notification.title}
                                </h3>
                                {notification.important && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                              </div>
                              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-2`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                  <Clock className="h-3 w-3" />
                                  {notification.timestamp}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                                  {notification.category}
                                </span>
                              </div>
                            </div>

                            {/* Actions dropdown */}
                            <div className="relative group">
                              <button className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'} transition-colors`}>
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              {/* Dropdown menu */}
                              <div className={`absolute right-0 top-8 w-48 rounded-lg shadow-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10`}>
                                <div className="py-2">
                                  {!notification.read && <button onClick={() => markAsRead(notification.id)} className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'} transition-colors flex items-center gap-2`}>
                                      <Check className="h-4 w-4" />
                                      Mark as read
                                    </button>}
                                  <button onClick={() => toggleImportant(notification.id)} className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'} transition-colors flex items-center gap-2`}>
                                    <Star className="h-4 w-4" />
                                    {notification.important ? 'Remove from important' : 'Mark as important'}
                                  </button>
                                  <button onClick={() => archiveNotification(notification.id)} className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'} transition-colors flex items-center gap-2`}>
                                    <Archive className="h-4 w-4" />
                                    Archive
                                  </button>
                                  <div className={`my-1 h-px ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
                                  <button onClick={() => deleteNotification(notification.id)} className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'} transition-colors flex items-center gap-2`}>
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action button */}
                          {notification.actionLabel && <motion.button whileHover={{
                      scale: 1.02
                    }} whileTap={{
                      scale: 0.98
                    }} className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isDarkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                              {notification.actionLabel}
                            </motion.button>}
                        </div>
                      </div>
                    </div>
                  </motion.div>;
          })}
          </AnimatePresence>
        </div>
      </div>
    </div>;
}