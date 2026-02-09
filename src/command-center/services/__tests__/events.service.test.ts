// Event Bus Service Tests
// CC-SVC-04: Event Bus

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { eventBus, Events } from '../events.service';

describe('EventBus', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  test('should subscribe and emit events', () => {
    const handler = vi.fn();
    const payload = { test: 'data' };

    eventBus.on('test:event', handler);
    eventBus.emit('test:event', payload);

    expect(handler).toHaveBeenCalledWith(payload);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('should unsubscribe from events', () => {
    const handler = vi.fn();
    const subscription = eventBus.on('test:event', handler);

    subscription.unsubscribe();
    eventBus.emit('test:event', {});

    expect(handler).not.toHaveBeenCalled();
  });

  test('should handle once subscription', () => {
    const handler = vi.fn();

    eventBus.once('test:event', handler);
    eventBus.emit('test:event', {});
    eventBus.emit('test:event', {});

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('should handle wildcard subscriptions', () => {
    const handler = vi.fn();

    eventBus.on('*', handler);
    eventBus.emit('test:event', { data: 'test' });

    expect(handler).toHaveBeenCalledWith({
      event: 'test:event',
      payload: { data: 'test' },
    });
  });

  test('should maintain event history', () => {
    eventBus.emit('test:event', { data: 'test1' });
    eventBus.emit('test:event', { data: 'test2' });

    const history = eventBus.getHistory('test:event');
    expect(history).toHaveLength(2);
    expect(history[0].payload.data).toBe('test1');
    expect(history[1].payload.data).toBe('test2');
  });

  test('should limit history size', () => {
    // Emit more events than the limit
    for (let i = 0; i < 150; i++) {
      eventBus.emit('test:event', { index: i });
    }

    const history = eventBus.getHistory();
    expect(history.length).toBeLessThanOrEqual(100);
  });

  test('should handle multiple handlers for same event', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    eventBus.on('test:event', handler1);
    eventBus.on('test:event', handler2);
    eventBus.emit('test:event', {});

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  test('should handle errors in handlers gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    const handler = vi.fn(() => {
      throw new Error('Handler error');
    });

    eventBus.on('test:event', handler);
    eventBus.emit('test:event', {});

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test('should have predefined Events constants', () => {
    expect(Events.ACTIVITY_CREATED).toBe('activity:created');
    expect(Events.CUSTOMER_UPDATED).toBe('customer:updated');
    expect(Events.AI_RESPONSE).toBe('ai:response');
  });
});
