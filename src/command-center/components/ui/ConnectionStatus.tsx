import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';

export function ConnectionStatus() {
  const { connectionState, isConnected } = useWebSocket();

  const getStatusConfig = () => {
    switch (connectionState) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-500',
          bg: 'bg-green-100 dark:bg-green-900/30',
          label: 'Connected',
        };
      case 'connecting':
      case 'reconnecting':
        return {
          icon: Loader2,
          color: 'text-yellow-500',
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          label: connectionState === 'reconnecting' ? 'Reconnecting...' : 'Connecting...',
          animate: true,
        };
      case 'disconnected':
      case 'error':
        return {
          icon: WifiOff,
          color: 'text-red-500',
          bg: 'bg-red-100 dark:bg-red-900/30',
          label: 'Disconnected',
        };
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-500',
          bg: 'bg-gray-100',
          label: 'Unknown',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg}`}
          role="status"
          aria-live="polite"
        >
          <Icon className={`w-4 h-4 ${config.color} ${config.animate ? 'animate-spin' : ''}`} />
          <span className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

