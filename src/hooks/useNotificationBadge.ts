// ============================================
// HOOK: Unread notification count (polling)
// Updates automatically via polling when WebSocket not available
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../services/crm/notifications-api';
import { POLL_INTERVALS } from '../services/realtime';
import { isRealtimeConnected } from '../services/realtime';

const NOTIFICATIONS_QUERY_KEY = ['notifications', 'list'] as const;

function hasAuthToken(): boolean {
  return !!localStorage.getItem('auth_token') || !!localStorage.getItem('cc_auth_tokens');
}

export function useNotificationBadge() {
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  const { data } = useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, { unread_only: true, per_page: 1 }],
    queryFn: async () => {
      const res = await notificationsApi.list({ unread_only: true, per_page: 1, page: 1 });
      return res;
    },
    enabled: hasAuthToken(),
    refetchInterval: isRealtimeConnected() ? false : POLL_INTERVALS.notifications,
    staleTime: POLL_INTERVALS.notifications,
  });

  useEffect(() => {
    const res = data as { meta?: { unread_count?: number } } | undefined;
    setUnreadCount(res?.meta?.unread_count ?? 0);
  }, [data]);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
  }, [queryClient]);

  return { unreadCount, invalidate };
}
