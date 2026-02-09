// Command Center Event Bus Service
// CC-SVC-04: Event Bus

type EventHandler<T = any> = (payload: T) => void;

interface EventSubscription {
  unsubscribe: () => void;
}

class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private history: Array<{ event: string; payload: any; timestamp: Date }> = [];
  private historyLimit = 100;

  /**
   * Subscribe to an event
   */
  on<T>(event: string, handler: EventHandler<T>): EventSubscription {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    return {
      unsubscribe: () => this.off(event, handler),
    };
  }

  /**
   * Subscribe to an event once
   */
  once<T>(event: string, handler: EventHandler<T>): EventSubscription {
    const wrappedHandler: EventHandler<T> = (payload) => {
      this.off(event, wrappedHandler);
      handler(payload);
    };
    return this.on(event, wrappedHandler);
  }

  /**
   * Unsubscribe from an event
   */
  off<T>(event: string, handler: EventHandler<T>): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.delete(handler);
      if (eventHandlers.size === 0) {
        this.handlers.delete(event);
      }
    }
  }

  /**
   * Emit an event
   */
  emit<T>(event: string, payload: T): void {
    // Add to history
    this.history.push({ event, payload, timestamp: new Date() });
    if (this.history.length > this.historyLimit) {
      this.history.shift();
    }

    // Notify handlers
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Event handler error for ${event}:`, error);
        }
      });
    }

    // Notify wildcard handlers
    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler({ event, payload });
        } catch (error) {
          console.error(`Wildcard handler error:`, error);
        }
      });
    }
  }

  /**
   * Get event history
   */
  getHistory(event?: string): typeof this.history {
    if (event) {
      return this.history.filter(h => h.event === event);
    }
    return [...this.history];
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers.clear();
    this.history = [];
  }
}

export const eventBus = new EventBus();

// Pre-defined event types
export const Events = {
  // Activity events
  ACTIVITY_CREATED: 'activity:created',
  ACTIVITY_UPDATED: 'activity:updated',
  ACTIVITY_COMPLETED: 'activity:completed',
  
  // Customer events
  CUSTOMER_CREATED: 'customer:created',
  CUSTOMER_UPDATED: 'customer:updated',
  CUSTOMER_SELECTED: 'customer:selected',
  
  // Content events
  CONTENT_CREATED: 'content:created',
  CONTENT_PUBLISHED: 'content:published',
  
  // Navigation events
  NAVIGATE: 'nav:navigate',
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close',
  
  // AI events
  AI_RESPONSE: 'ai:response',
  AI_SUGGESTION: 'ai:suggestion',
  
  // System events
  TOAST: 'system:toast',
  ERROR: 'system:error',
  REFRESH: 'system:refresh',
} as const;

