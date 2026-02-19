// ============================================
// CONNECTION STATUS
// Shows online/offline/reconnecting state
// ============================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { subscribeToConnectionState } from '../services/websocket';
import type { ConnectionState } from '../services/websocket';

interface ConnectionStatusProps {
  className?: string;
  showLabel?: boolean;
}

export function ConnectionStatus({ className = '', showLabel = true }: ConnectionStatusProps) {
  const [state, setState] = useState<ConnectionState>('disconnected');
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const unsub = subscribeToConnectionState(setState);
    return unsub;
  }, []);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const effectiveState: 'online' | 'offline' | 'reconnecting' =
    !online ? 'offline' : state === 'reconnecting' || state === 'connecting' ? 'reconnecting' : 'online';

  const config = {
    online: {
      icon: Wifi,
      label: 'Connected',
      className: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    offline: {
      icon: WifiOff,
      label: 'Offline',
      className: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
    },
    reconnecting: {
      icon: Loader2,
      label: 'Reconnecting...',
      className: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
  };

  const { icon: Icon, label, className: iconClass, bg } = config[effectiveState];

  return (
    <div
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium ${bg} ${iconClass} ${className}`}
      role="status"
      aria-live="polite"
    >
      {effectiveState === 'reconnecting' ? (
        <Icon className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Icon className="w-3.5 h-3.5" />
      )}
      {showLabel && <span>{label}</span>}
    </div>
  );
}
