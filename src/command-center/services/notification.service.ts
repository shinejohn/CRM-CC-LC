// Command Center Notification Service
// CC-SVC-05: Notification Service

import { eventBus, Events } from './events.service';

export interface Notification {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: Date;
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  /**
   * Show a notification
   */
  show(notification: Omit<Notification, 'id' | 'timestamp'>): string {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? 5000,
    };

    this.notifications.push(fullNotification);
    this.notifyListeners();

    // Emit event for toast system
    eventBus.emit(Events.TOAST, {
      title: fullNotification.title,
      description: fullNotification.description,
      type: fullNotification.type,
      duration: fullNotification.duration,
    });

    // Auto-dismiss if duration is set
    if (fullNotification.duration && fullNotification.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, fullNotification.duration);
    }

    return id;
  }

  /**
   * Show success notification
   */
  success(title: string, description?: string, duration?: number): string {
    return this.show({ title, description, type: 'success', duration });
  }

  /**
   * Show error notification
   */
  error(title: string, description?: string, duration?: number): string {
    return this.show({ title, description, type: 'error', duration });
  }

  /**
   * Show warning notification
   */
  warning(title: string, description?: string, duration?: number): string {
    return this.show({ title, description, type: 'warning', duration });
  }

  /**
   * Show info notification
   */
  info(title: string, description?: string, duration?: number): string {
    return this.show({ title, description, type: 'info', duration });
  }

  /**
   * Dismiss a notification
   */
  dismiss(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.notifications.length;
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current notifications
    listener(this.getAll());
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const notifications = this.getAll();
    this.listeners.forEach(listener => {
      try {
        listener(notifications);
      } catch (error) {
        console.error('Notification listener error:', error);
      }
    });
  }
}

// Singleton export
export const notificationService = new NotificationService();

