import { eventBus, Events } from '../services/events.service';
import { websocketService } from '../services/websocket.service';

// Simple notification service placeholder
const notificationService = {
  show: (notification: { title: string; message: string; type?: string }) => {
    eventBus.emit(Events.TOAST, {
      title: notification.title,
      description: notification.message,
      type: notification.type || 'info',
    });
  },
};

// Connect WebSocket events to EventBus
export function initializeEventBridge() {
  // Activity events
  websocketService.subscribe('activity.*', (payload, message) => {
    const eventType = message.channel.replace('activity.', 'activity:');
    eventBus.emit(eventType, payload);
    
    // Show notification for new activities
    if (message.channel === 'activity.created') {
      notificationService.show({
        title: 'New Activity',
        message: payload.description || 'A new activity was created',
        type: 'info',
      });
    }
  });

  // Customer events
  websocketService.subscribe('customer.*', (payload, message) => {
    const eventType = message.channel.replace('customer.', 'customer:');
    eventBus.emit(eventType, payload);
  });

  // Notification events
  websocketService.subscribe('notification.*', (payload, message) => {
    const eventType = message.channel.replace('notification.', 'notification:');
    eventBus.emit(eventType, payload);
    
    if (message.channel === 'notification.new') {
      notificationService.show(payload);
    }
  });

  // AI events
  websocketService.subscribe('ai.*', (payload, message) => {
    const eventType = message.channel.replace('ai.', 'ai:');
    eventBus.emit(eventType, payload);
  });

  // Campaign events
  websocketService.subscribe('campaign.*', (payload, message) => {
    const eventType = message.channel.replace('campaign.', 'campaign:');
    eventBus.emit(eventType, payload);
  });
}

