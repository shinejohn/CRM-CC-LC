// ============================================
// AI ACTION EXECUTOR
// Handles action dispatch, confirmation gating, and result processing
// CC-SVC-AI-EXECUTOR: Action execution layer
// ============================================

import { AI_ACTIONS } from './ai-actions';
import type { AIAction } from './ai-actions';
import type { ToolCall } from './ai.types';

export interface PendingAction {
  confirmationId: string;
  toolCall: ToolCall;
  action: AIAction;
  resolvedParams: Record<string, unknown>;
}

/**
 * Parse a tool_call chunk from the AI stream into a PendingAction.
 * Returns null if the action name is not registered.
 */
export function parsePendingAction(toolCall: Partial<ToolCall>): PendingAction | null {
  const name = toolCall.name ?? (toolCall as { function?: { name?: string } }).function?.name;
  if (!name) return null;

  const action = AI_ACTIONS[name];
  if (!action) return null;

  // Arguments can come as parsed object or JSON string
  let args: Record<string, unknown> = {};
  const rawArgs = toolCall.arguments ?? (toolCall as { function?: { arguments?: unknown } }).function?.arguments;
  if (typeof rawArgs === 'string') {
    try { args = JSON.parse(rawArgs); } catch { /* ignore */ }
  } else if (rawArgs && typeof rawArgs === 'object') {
    args = rawArgs as Record<string, unknown>;
  }

  const confirmationId = toolCall.id ?? crypto.randomUUID();

  return {
    confirmationId,
    toolCall: {
      id: confirmationId,
      name,
      arguments: args,
      status: 'pending',
    },
    action,
    resolvedParams: args,
  };
}

/**
 * Execute an action directly (no confirmation needed).
 * Returns the action result.
 */
export async function executeAction(pending: PendingAction): Promise<unknown> {
  return pending.action.execute(pending.resolvedParams);
}

/**
 * Format a tool call result as a user-readable assistant message
 * to feed back into the AI conversation.
 */
export function formatToolResult(
  actionName: string,
  result: unknown,
  success: boolean
): string {
  if (!success) {
    return `[Action failed: ${actionName}]`;
  }

  // Format specific actions with human-readable output
  if (typeof result === 'object' && result !== null) {
    const r = result as Record<string, unknown>;

    if (actionName === 'lookup_customer' && r.found) {
      return `Customer found: ${r.business_name} (${r.owner_name}), Industry: ${r.industry}, Lead score: ${r.lead_score}`;
    }
    if (actionName === 'create_followup_task' && r.created) {
      return `Follow-up task created: "${r.title}" — due ${r.due_date}`;
    }
    if (actionName === 'draft_email' && r.drafted) {
      return `Email drafted:\n\n${r.body}`;
    }
    if (actionName === 'update_deal_stage' && r.updated) {
      return `Deal "${r.deal_name}" moved to stage: ${r.new_stage}`;
    }
    if (actionName === 'generate_pitch') {
      return `Pitch for ${r.customer}:\n\n${r.pitch}`;
    }
    if (actionName === 'get_pipeline_summary') {
      const stages = (r.by_stage as Array<{ stage: string; count: number; value: number }> ?? [])
        .map(s => `  ${s.stage}: ${s.count} deals ($${(s.value ?? 0).toLocaleString()})`)
        .join('\n');
      return `Pipeline summary — ${r.total_deals} total deals:\n${stages}`;
    }
    if (actionName === 'lookup_product_pricing') {
      if (r.name) {
        return `${r.name}: $${r.monthly_price}/month\nFeatures: ${(r.features as string[]).join(', ')}`;
      }
      const tiers = Object.values(r.tiers ?? {}) as Array<{ name: string; monthly_price: number }>;
      return tiers.map(t => `${t.name}: $${t.monthly_price}/month`).join('\n');
    }
    if (actionName === 'schedule_callback' && r.scheduled) {
      return `Callback scheduled for ${r.scheduled_at}`;
    }
    if (actionName === 'generate_social_post') {
      return `Social post for ${r.business} (${r.platform}):\n\n${r.post}`;
    }
    if (actionName === 'run_diagnostic') {
      return `Marketing diagnostic for ${r.customer}:\n\n${r.diagnostic}`;
    }
  }

  return `[Action completed: ${actionName}]`;
}
