// ============================================
// ACCOUNT MANAGER HOOK
// Provides AI chat + active task state for the Command Center AI overlay.
// Messages are backed by real streaming AI via aiService.chat().
// ============================================

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { aiService } from '../services/ai.service';
import { getModuleContext } from '../services/ai-context-provider';
import { parsePendingAction, executeAction, formatToolResult } from '../services/ai-action-executor';
import type { AIPersonality } from '../services/ai.types';
import type { PendingAction } from '../services/ai-action-executor';
import { useAuthStore } from '@/stores/authStore';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MessageToolCall {
  confirmationId: string;
  name: string;
  arguments: Record<string, unknown>;
  requiresConfirmation: boolean;
  status: 'pending' | 'approved' | 'cancelled' | 'executed';
  result?: unknown;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  toolCall?: MessageToolCall;
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  timestamp: Date;
}

interface AccountManagerContextType {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  messages: Message[];
  sendMessage: (content: string, zone?: string) => void;
  activeTasks: Task[];
  addTask: (title: string) => Task;
  updateTask: (id: string, status: Task['status']) => void;
  isTyping: boolean;
  approveAction: (confirmationId: string) => void;
  cancelAction: (confirmationId: string) => void;
}

const AccountManagerContext = createContext<AccountManagerContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

const MAX_MESSAGES = 100;

export function AccountManagerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi${user?.name ? ` ${user.name.split(' ')[0]}` : ''}! I'm Sarah, your Account Manager AI. I can look up customers, draft emails, track your pipeline, and execute tasks — just ask. What would you like to do today?`,
      timestamp: new Date(),
    },
  ]);

  // Sarah personality ID, resolved from the API on mount
  const personalityIdRef = useRef<string | undefined>(undefined);

  // Pending confirmation map: confirmationId → PendingAction
  const pendingActionsRef = useRef<Map<string, PendingAction>>(new Map());

  // Load Sarah personality on mount
  useEffect(() => {
    aiService.getPersonalities().then((personalities: AIPersonality[]) => {
      const sarah = personalities.find((p: AIPersonality) =>
        p.name.toLowerCase().includes('sarah')
      );
      if (sarah) {
        personalityIdRef.current = sarah.id;
      }
    }).catch(() => {
      // Personality fetch is non-critical — continue without it
    });
  }, []);

  // ── Core Actions ────────────────────────────────────────────────────────────

  const toggle = () => setIsOpen(prev => !prev);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const addTask = (title: string): Task => {
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      status: 'pending',
      timestamp: new Date(),
    };
    setActiveTasks(prev => [task, ...prev]);
    return task;
  };

  const updateTask = (id: string, status: Task['status']) => {
    setActiveTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  // ── Message Sending ─────────────────────────────────────────────────────────

  const streamResponse = useCallback((currentMessages: Message[], zone?: string) => {
    const streamId = crypto.randomUUID();
    let unmounted = false;

    // Add placeholder streaming message
    const placeholder: Message = {
      id: streamId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => {
      const next = [...prev, placeholder];
      return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
    });
    setIsTyping(true);

    // Build the AI messages from history (exclude streaming placeholder)
    const aiMessages = currentMessages
      .filter(m => m.role !== 'system' && m.content)
      .map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      }));

    // Module context
    const moduleContext = getModuleContext(zone ?? 'dashboard');

    // Business intelligence context from auth store
    const biContext = user?.business_id
      ? { businessContext: { ...moduleContext.businessContext, businessId: user.business_id } }
      : {};

    const context = {
      ...moduleContext,
      ...biContext,
      intelligence_summary: undefined as string | undefined,
    };

    const processStream = async () => {
      let fullContent = '';
      // Guard all state updates: if the component unmounted, skip them
      const safeSetMessages: typeof setMessages = (updater) => {
        if (!unmounted) setMessages(updater);
      };
      const safeSetIsTyping = (v: boolean) => {
        if (!unmounted) setIsTyping(v);
      };
      let pendingToolCallData: Record<string, unknown> | null = null;

      try {
        for await (const chunk of aiService.chat(aiMessages, context, personalityIdRef.current)) {
          if (unmounted) break;
          if (chunk.type === 'text' && chunk.content) {
            fullContent += chunk.content;
            safeSetMessages(prev =>
              prev.map(m => m.id === streamId ? { ...m, content: fullContent } : m)
            );
          } else if (chunk.type === 'tool_call' && chunk.toolCall) {
            pendingToolCallData = chunk.toolCall as Record<string, unknown>;
          } else if (chunk.type === 'error') {
            fullContent = 'I encountered an issue connecting to the AI service. Please try again.';
            safeSetMessages(prev =>
              prev.map(m => m.id === streamId ? { ...m, content: fullContent, isStreaming: false } : m)
            );
            return;
          }
        }

        // Handle any tool call detected during stream
        if (pendingToolCallData) {
          const pending = parsePendingAction(pendingToolCallData);
          if (pending) {
            const toolCallMsg: MessageToolCall = {
              confirmationId: pending.confirmationId,
              name: pending.action.name,
              arguments: pending.resolvedParams,
              requiresConfirmation: pending.action.requiresConfirmation,
              status: pending.action.requiresConfirmation ? 'pending' : 'executed',
            };

            if (pending.action.requiresConfirmation) {
              // Store for later confirmation
              pendingActionsRef.current.set(pending.confirmationId, pending);

              // Append task to active ops
              const task = addTask(pending.action.label);
              updateTask(task.id, 'pending');

              safeSetMessages(prev =>
                prev.map(m =>
                  m.id === streamId
                    ? {
                        ...m,
                        content: fullContent || `I'll ${pending.action.label.toLowerCase()}. Please review and confirm below.`,
                        isStreaming: false,
                        toolCall: toolCallMsg,
                      }
                    : m
                )
              );
            } else {
              // Execute immediately, no confirmation needed
              const task = addTask(pending.action.label);
              updateTask(task.id, 'in-progress');

              try {
                const result = await executeAction(pending);
                updateTask(task.id, 'completed');
                const resultText = formatToolResult(pending.action.name, result, true);

                safeSetMessages(prev =>
                  prev.map(m =>
                    m.id === streamId
                      ? {
                          ...m,
                          content: fullContent + (fullContent ? '\n\n' : '') + resultText,
                          isStreaming: false,
                          toolCall: { ...toolCallMsg, status: 'executed', result },
                        }
                      : m
                  )
                );
              } catch {
                updateTask(task.id, 'error');
                safeSetMessages(prev =>
                  prev.map(m =>
                    m.id === streamId
                      ? { ...m, content: `${fullContent}\n\n[Action failed — please try again]`, isStreaming: false }
                      : m
                  )
                );
              }
            }
          } else {
            // Unknown action — just finalize with text
            safeSetMessages(prev =>
              prev.map(m => m.id === streamId ? { ...m, content: fullContent, isStreaming: false } : m)
            );
          }
        } else {
          // No tool call — finalize normally
          safeSetMessages(prev =>
            prev.map(m => m.id === streamId ? { ...m, content: fullContent, isStreaming: false } : m)
          );
        }
      } catch {
        safeSetMessages(prev =>
          prev.map(m =>
            m.id === streamId
              ? { ...m, content: 'Something went wrong. Please try again.', isStreaming: false }
              : m
          )
        );
      } finally {
        safeSetIsTyping(false);
      }
    };

    processStream();

    // Return cleanup so callers can set unmounted = true if needed
    return () => { unmounted = true; };
  }, [addTask, updateTask]);

  const sendMessage = useCallback((content: string, zone?: string) => {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Capture current messages before adding the new one
    setMessages(prev => {
      const next = [...prev, userMsg];
      const capped = next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
      // Kick off the async stream with the updated message list
      streamResponse(capped, zone);
      return capped;
    });
  }, [streamResponse]);

  // ── Confirmation Handlers ───────────────────────────────────────────────────

  const approveAction = (confirmationId: string) => {
    const pending = pendingActionsRef.current.get(confirmationId);
    if (!pending) return;

    pendingActionsRef.current.delete(confirmationId);

    // Update message to show executing
    setMessages(prev =>
      prev.map(m =>
        m.toolCall?.confirmationId === confirmationId
          ? { ...m, toolCall: { ...m.toolCall!, status: 'approved' } }
          : m
      )
    );

    const task = addTask(pending.action.label);
    updateTask(task.id, 'in-progress');

    executeAction(pending)
      .then(result => {
        updateTask(task.id, 'completed');
        const resultText = formatToolResult(pending.action.name, result, true);

        // Update the message with execution status
        setMessages(prev =>
          prev.map(m =>
            m.toolCall?.confirmationId === confirmationId
              ? { ...m, toolCall: { ...m.toolCall!, status: 'executed', result } }
              : m
          )
        );

        // Append a result message from Sarah
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: resultText,
            timestamp: new Date(),
          },
        ]);
      })
      .catch(() => {
        updateTask(task.id, 'error');
        setMessages(prev =>
          prev.map(m =>
            m.toolCall?.confirmationId === confirmationId
              ? { ...m, toolCall: { ...m.toolCall!, status: 'cancelled' } }
              : m
          )
        );
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Sorry, I wasn't able to complete that. Please try again or let me know how you'd like to proceed.`,
            timestamp: new Date(),
          },
        ]);
      });
  };

  const cancelAction = (confirmationId: string) => {
    pendingActionsRef.current.delete(confirmationId);

    setMessages(prev =>
      prev.map(m =>
        m.toolCall?.confirmationId === confirmationId
          ? { ...m, toolCall: { ...m.toolCall!, status: 'cancelled' } }
          : m
      )
    );

    // Inform the AI that the user declined
    setMessages(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "No problem — action cancelled. Is there anything else I can help with?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <AccountManagerContext.Provider
      value={{
        isOpen,
        toggle,
        open,
        close,
        messages,
        sendMessage,
        activeTasks,
        addTask,
        updateTask,
        isTyping,
        approveAction,
        cancelAction,
      }}
    >
      {children}
    </AccountManagerContext.Provider>
  );
}

export function useAccountManager(): AccountManagerContextType {
  const context = useContext(AccountManagerContext);
  if (context === undefined) {
    throw new Error('useAccountManager must be used within an AccountManagerProvider');
  }
  return context;
}
