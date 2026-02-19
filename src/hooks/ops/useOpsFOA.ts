// ============================================
// HOOK: Ops FOA Chat
// FOA agent chat - send queries, get responses, approve/reject actions
// ============================================

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opsService } from '@/services/opsService';
import type { FOAMessage, FOAChatResponse } from '@/types/ops';

const OPS_ACTIONS_KEY = ['ops', 'action-executions'] as const;

export function useOpsFOA() {
  const [messages, setMessages] = useState<FOAMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const qc = useQueryClient();

  const chatMutation = useMutation({
    mutationFn: (message: string) =>
      opsService.foaChat({ message, sessionId }),
    onSuccess: (data: FOAChatResponse) => {
      setSessionId(data.sessionId);
      setMessages((prev) => {
        const lastUser = prev.filter((m) => m.role === 'user').pop();
        const newMsgs = [...prev];
        if (lastUser) {
          newMsgs.push({
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.content,
            timestamp: new Date(),
            actionSuggestions: data.actionSuggestions,
          });
        }
        return newMsgs;
      });
    },
  });

  const sendMessage = useCallback(
    (content: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: 'user',
          content,
          timestamp: new Date(),
        },
      ]);
      chatMutation.mutate(content);
    },
    [chatMutation]
  );

  const approveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      opsService.approveAction(id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OPS_ACTIONS_KEY });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      opsService.rejectAction(id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OPS_ACTIONS_KEY });
    },
  });

  const clearSession = useCallback(() => {
    setMessages([]);
    setSessionId(undefined);
  }, []);

  return {
    messages,
    sessionId,
    sendMessage,
    isLoading: chatMutation.isPending,
    error: chatMutation.error,
    approveAction: approveMutation.mutate,
    rejectAction: rejectMutation.mutate,
    clearSession,
  };
}

/** Hook for action execution history (OpsActionLog page) */
export function useOpsActionExecutions(params?: { status?: string; page?: number; perPage?: number }) {
  return useQuery({
    queryKey: [...OPS_ACTIONS_KEY, params],
    queryFn: () => opsService.getActionExecutions(params),
  });
}
