# Command Center AI Copilot — Phase 1 Build Instructions

**Date:** 2026-05-23
**Codebase:** `/Users/johnshine/Dropbox/Fibonacco/Learning-Center`
**Stack:** Laravel 12 API + React 18 SPA + TypeScript + PostgreSQL + Railway

---

## Context & Goal

The Command Center has existing AI infrastructure — an AI Hub page with streaming chat, personality selection, business intelligence context injection, and an Account Manager AI overlay with task tracking. However, the Account Manager AI components (`ExpandableChat`, `AccountManagerAI`, `AccountManagerBar`) are UI prototypes with simulated responses (`useAccountManager` uses keyword matching and `setTimeout`). The AI Hub's real backend (`ai.service.ts` → `AIController.php` → `OpenRouterService`) is disconnected from the account manager components.

Phase 1 connects the existing UI to a real AI backend, adds structured actions the AI can execute, makes the AI context-aware per module, and implements confirmation workflows before action execution.

---

## Phase 1 Workstreams

### 1. Implement PrismAiService in Command Center Backend

**Why first:** Everything else depends on a unified AI abstraction. The current backend has three disconnected AI integration points: `OpenRouterService`, `OpenAIService` (embeddings only), and simulated frontend responses.

**What to do:**

1. Install the Prism package in the Learning Center backend if not already present:
   ```bash
   composer require echolabs/prism
   ```

2. Create `backend/app/Services/AI/PrismAiService.php` — modeled on the Day.News version at `/Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite/app/Services/News/PrismAiService.php` but adapted for Command Center use cases.

3. The Command Center PrismAiService needs these methods:
   - `chat(string $prompt, string $model, ?string $systemPrompt = null): string` — freeform conversation (already exists in Day.News version)
   - `generateStructured(string $prompt, array $schema, ?string $systemPrompt = null): array` — structured JSON output for actions and analysis (adapt from Day.News `generateJson()`)
   - `streamChat(string $prompt, ?string $systemPrompt = null): Generator` — SSE streaming for the chat interface (new — Day.News doesn't stream, but the Command Center frontend expects it)

4. Create `backend/config/command-center-ai.php`:
   ```php
   return [
       'ai_models' => [
           'chat' => ['openrouter', 'anthropic/claude-sonnet-4.5'],
           'actions' => ['openrouter', 'anthropic/claude-sonnet-4.5'],
           'analysis' => ['openrouter', 'google/gemini-2.0-flash-001'],
           'embeddings' => 'text-embedding-3-small', // stays with OpenAIService
       ],
       'client_timeout' => 240,
   ];
   ```

5. Refactor `AIController.php` to inject `PrismAiService` instead of `OpenRouterService`. Keep the same route signatures so the existing frontend `ai.service.ts` doesn't break.

6. Delete `OpenRouterService.php` after migration is verified. Keep `OpenAIService.php` for embeddings only.

**Files to create:**
- `backend/app/Services/AI/PrismAiService.php`
- `backend/config/command-center-ai.php`

**Files to modify:**
- `backend/app/Http/Controllers/Api/AIController.php` — swap OpenRouterService → PrismAiService
- `backend/app/Providers/AppServiceProvider.php` — register PrismAiService singleton if needed

**Files to delete (after verification):**
- `backend/app/Services/OpenRouterService.php`

---

### 2. Wire Account Manager AI to Real Backend

**Why:** The `ExpandableChat`, `AccountManagerAI`, and `AccountManagerBar` components exist and are polished. But `useAccountManager` is entirely simulated — hardcoded keyword matching, `setTimeout` fake responses, no backend communication.

**What to do:**

1. Rewrite `src/command-center/hooks/useAccountManager.tsx` to call `ai.service.ts` instead of simulating responses:
   - Replace the `sendMessage` function's `setTimeout` block with a call to `aiService.chat()` (streaming)
   - Keep the `activeTasks` state management but make it driven by real AI responses (see Workstream 3 — actions)
   - Maintain the `zone` parameter — it feeds into context scoping (Workstream 4)
   - Preserve the existing interface (`isOpen`, `toggle`, `open`, `close`, `messages`, `sendMessage`, `activeTasks`) so `AccountManagerAI`, `AccountManagerBar`, and `ExpandableChat` don't need changes

2. Wire conversation context:
   - `useAccountManager` should consume `useBusinessIntelligenceContext` to auto-inject the current SMB profile
   - Pass `zone` as part of `ChatContext.currentPage` so the backend knows what module the user is in

3. Wire personality:
   - Default personality for account manager AI is "Sarah" — set `personalityId` in the hook to the Sarah personality UUID
   - Pull from `aiService.getPersonalities()` on mount, find Sarah, use her ID

4. Ensure `AccountManagerBar` is mounted in the Command Center layout so it's accessible from every page. Check `src/command-center/layouts/` — if it's not in the main layout, add it.

5. Ensure `ExpandableChat` is available as a floating widget on all Command Center pages. It should be in the layout root, not inside individual page components.

**Files to modify:**
- `src/command-center/hooks/useAccountManager.tsx` — full rewrite of message handling
- `src/command-center/layouts/` — verify AccountManagerBar and ExpandableChat are mounted globally

**Files that should NOT change (UI is already built):**
- `src/command-center/components/ai/AccountManagerAI.tsx`
- `src/command-center/components/ai/AccountManagerBar.tsx`
- `src/command-center/components/ai/ExpandableChat.tsx`
- `src/command-center/components/ai/ServiceUpsellPrompt.tsx`

---

### 3. Frontend Actions — AI Can Execute Operations

**Why:** The AI currently can only talk. Account managers need the AI to do things: create a follow-up task, draft an email, update a deal stage, look up a customer, generate a pitch.

**What to do:**

#### 3a. Define the action registry (frontend)

Create `src/command-center/services/ai-actions.ts`:

```typescript
export interface AIAction {
  name: string;
  description: string; // sent to AI so it knows when to use it
  parameters: Record<string, { type: string; description: string; required: boolean }>;
  requiresConfirmation: boolean; // if true, triggers human-in-the-loop (Workstream 5)
  execute: (params: Record<string, unknown>) => Promise<unknown>;
}
```

Register these initial actions:

| Action Name | Description | Confirmation Required |
|---|---|---|
| `lookup_customer` | Search for a customer by name or ID and return their profile | No |
| `create_followup_task` | Create a follow-up task for a customer | Yes |
| `draft_email` | Draft an outbound email to a customer | Yes |
| `update_deal_stage` | Move a deal to a new pipeline stage | Yes |
| `generate_pitch` | Generate a sales pitch for a specific product/customer combination | No |
| `get_pipeline_summary` | Return current pipeline stats and deals | No |
| `lookup_product_pricing` | Return pricing details for a Fibonacco product tier | No |
| `schedule_callback` | Schedule a callback/reminder for a customer | Yes |
| `generate_social_post` | Draft a social media post for a customer's business | Yes |
| `run_diagnostic` | Run a marketing diagnostic on a customer's current services | No |

Each action's `execute` function calls the corresponding Laravel API endpoint via `apiService`.

#### 3b. Backend action endpoints

Create `backend/app/Http/Controllers/Api/AIActionController.php`:

- `POST /api/v1/ai/actions/execute` — receives action name + parameters, validates, executes, returns result
- Actions map to existing service methods where possible:
  - `create_followup_task` → existing task/activity system
  - `draft_email` → `EmailService` or `OutboundCampaignController`
  - `update_deal_stage` → `DealService`
  - `generate_pitch` → PrismAiService structured generation with customer context
  - `lookup_customer` → `CustomerController` search
  - `lookup_product_pricing` → `ProductCatalogController`

#### 3c. AI-side tool calling

Update the `AIController.php` chat endpoint to include available actions in the system prompt. When the AI decides to use an action, it returns a structured tool call in the response. The frontend detects `tool_call` chunks in the stream (already handled by `ai.service.ts` `parseStreamChunk`) and:

1. If `requiresConfirmation` is false → execute immediately, send result back to AI
2. If `requiresConfirmation` is true → trigger confirmation UI (Workstream 5)

The tool call / tool result pattern already exists in the frontend types (`ToolCall` interface in `ai.types.ts`) and the `ToolCallIndicator` component renders them. This is wiring, not new UI.

**Files to create:**
- `src/command-center/services/ai-actions.ts` — action registry
- `src/command-center/services/ai-action-executor.ts` — execution logic
- `backend/app/Http/Controllers/Api/AIActionController.php`

**Files to modify:**
- `backend/app/Http/Controllers/Api/AIController.php` — inject available actions into system prompt
- `src/command-center/hooks/useAccountManager.tsx` — handle tool call chunks from stream
- `backend/routes/api.php` — add action execution route

---

### 4. Context Scoping by Module

**Why:** The AI currently receives the same global business profile regardless of where the account manager is working. When viewing a specific customer, the AI should know which customer. When in the pipeline, it should see deal data. When in marketing kit, it should see campaign context.

**What to do:**

1. Create `src/command-center/services/ai-context-provider.ts`:

```typescript
export function getModuleContext(zone: string, moduleData?: Record<string, unknown>): Partial<ChatContext> {
  switch (zone) {
    case 'crm':
    case 'customers':
      return {
        currentPage: 'customer_management',
        businessContext: {
          activeCustomerId: moduleData?.customerId,
          customerName: moduleData?.customerName,
          // pulled from CustomerIntelligenceService on backend
        },
      };
    case 'sell':
    case 'pipeline':
      return {
        currentPage: 'pipeline',
        businessContext: {
          dealStage: moduleData?.currentStage,
          dealValue: moduleData?.dealValue,
          pipelineStats: moduleData?.stats,
        },
      };
    case 'marketing-kit':
      return {
        currentPage: 'marketing',
        businessContext: {
          activeCampaignId: moduleData?.campaignId,
          campaignType: moduleData?.campaignType,
        },
      };
    case 'content':
      return {
        currentPage: 'content_management',
        selectedContent: moduleData?.selectedContentId as string,
      };
    // ... add cases for each Command Center module
    default:
      return { currentPage: zone };
  }
}
```

2. Each Command Center module page sets its zone context when it mounts. Use a React context or Zustand store to broadcast the current module + relevant data.

3. `useAccountManager` reads the current zone context and merges it with the Intelligence Hub context via `useBusinessIntelligenceContext().mergeContext()` — which already exists but isn't used per-module.

4. The `ExpandableChat` component already accepts a `zone` prop. Ensure each module page passes its zone when rendering the chat widget.

5. Backend: update the `AIController.php` system prompt to incorporate `currentPage` and `businessContext` from the request. Different pages get different system prompt sections — e.g., on the pipeline page, the AI's system prompt includes instructions about deal management; on the CRM page, it includes customer relationship guidance.

**Files to create:**
- `src/command-center/services/ai-context-provider.ts`

**Files to modify:**
- `src/command-center/hooks/useAccountManager.tsx` — consume module context
- `src/command-center/modules/*/` — each module page sets its zone context on mount
- `backend/app/Http/Controllers/Api/AIController.php` — system prompt adapts to currentPage

---

### 5. Human-in-the-Loop Confirmation

**Why:** Actions that modify data (create task, send email, update deal) must show the user what's about to happen and let them approve, edit, or cancel.

**What to do:**

1. Create `src/command-center/components/ai/ActionConfirmation.tsx`:
   - Renders when a tool call with `requiresConfirmation: true` is returned by the AI
   - Shows: action name, parameters in readable format, preview of what will happen
   - Three buttons: **Approve**, **Edit** (opens editable form of parameters), **Cancel**
   - On Approve: calls `ai-action-executor.ts` to execute, sends result back to the AI conversation
   - On Cancel: sends cancellation message to the AI conversation ("User declined this action")
   - On Edit: user modifies parameters, then approves the modified version

2. Wire into `AccountManagerAI.tsx` message rendering:
   - When a message contains a `toolCall` with `requiresConfirmation: true` and status `pending`, render `ActionConfirmation` instead of the `ToolCallIndicator`
   - After user approves/cancels, update the tool call status and append the result to the conversation

3. The `ServiceUpsellPrompt.tsx` is already a form of this pattern — it renders an interactive card inline in the chat with approve/decline buttons. Follow the same approach for action confirmations.

4. Backend: the action execution endpoint (`AIActionController.php`) should validate that the action was explicitly approved — include a `confirmed: true` flag in the request to prevent replay or injection.

**Files to create:**
- `src/command-center/components/ai/ActionConfirmation.tsx`

**Files to modify:**
- `src/command-center/components/ai/AccountManagerAI.tsx` — render ActionConfirmation for pending confirmed actions
- `src/command-center/hooks/useAccountManager.tsx` — handle confirmation flow state
- `src/command-center/modules/ai-hub/AIChat.tsx` — same confirmation rendering in the AI Hub chat

---

### 6. Wire Intelligence Hub Frontend to Existing Backend APIs

**Why:** The backend endpoints exist and work (`/api/v1/smb/{id}/full-profile`, `/api/v1/smb/{id}/ai-context`, `/api/v1/smb/{id}/intelligence-summary`, `PATCH .../profile/{section}`, `POST .../enrich`). The frontend service methods exist (`smbService.getFullProfile()`, etc.). But the UI components that display this data are not implemented.

**Reference:** See `CC-INTELLIGENCE-HUB-GAP-ANALYSIS.md` in the repo root for the full gap analysis from 2026-02-19.

**What to do:**

1. Implement `MyBusinessProfilePage.tsx` — currently exists as a file but is not implemented (per the gap analysis: 0% complete). This page should:
   - Fetch and display the full SMB profile using `smbService.getFullProfile()`
   - Show `ProfileStrengthIndicator` based on `profile_completeness` data
   - Allow inline editing of profile sections via `smbService.updateSection()`
   - Show AI context summary from `smbService.getIntelligenceSummary()`

2. Implement `ProfileStrengthIndicator.tsx` — exists as a file but not implemented. Visual indicator (progress ring or bar) showing profile completeness percentage with section-by-section breakdown.

3. Wire `useBusinessIntelligenceContext` into all AI-consuming components — it already exists and fetches the right data, but verify that it's actually being consumed by:
   - `AIChat.tsx` ✅ (already imports and uses it)
   - `AccountManagerAI.tsx` / `useAccountManager` ❌ (needs wiring — this is Workstream 2)
   - `ExpandableChat.tsx` ❌ (needs wiring — this is Workstream 2)

4. The enrichment endpoint (`POST /api/v1/smb/{id}/enrich`) is a placeholder that just stamps `last_enriched_at`. For Phase 1, leave it as-is — real enrichment (Google Places, SerpAPI, website scraping) is Phase 2. But make sure the button/trigger exists in the UI so the pattern is established.

**Files to modify:**
- `src/command-center/modules/intelligence-hub/MyBusinessProfilePage.tsx` — implement
- `src/command-center/modules/intelligence-hub/ProfileStrengthIndicator.tsx` — implement

---

### 7. Real-Time Push via WebSocket

**Why:** When the AI kicks off an action (draft email, generate report, run diagnostic), the account manager needs live feedback in the Active Tasks sidebar without polling.

**What to do:**

1. `websocket.service.ts` and `websocket.types.ts` already exist in `src/command-center/services/`. Verify WebSocket connection is established on Command Center mount.

2. Define AI task event channels. Backend should broadcast on a private channel per user:
   ```
   private-cc.user.{userId}.ai-tasks
   ```

3. Backend: when an AI action is executed via `AIActionController`, dispatch a Laravel event that broadcasts task status updates:
   - `AiTaskStarted` — task created, status = pending
   - `AiTaskProgress` — status = in-progress, optional progress message
   - `AiTaskCompleted` — status = completed, includes result data
   - `AiTaskFailed` — status = error, includes error message

4. Create `backend/app/Events/AiTask*.php` events implementing `ShouldBroadcast`. Use Redis/Valkey as the broadcast driver (already configured for Horizon).

5. Frontend: `useAccountManager` listens on the WebSocket channel for task events and updates `activeTasks` state in real-time. The `AccountManagerAI` component already renders task status with pending/in-progress/completed indicators — no UI changes needed.

6. Ensure Laravel Echo is configured in the frontend. If not already installed:
   ```bash
   npm install laravel-echo pusher-js
   ```
   Configure in `src/command-center/services/websocket.service.ts` or create a dedicated Echo provider.

**Files to create:**
- `backend/app/Events/AiTaskStarted.php`
- `backend/app/Events/AiTaskProgress.php`
- `backend/app/Events/AiTaskCompleted.php`
- `backend/app/Events/AiTaskFailed.php`

**Files to modify:**
- `backend/app/Http/Controllers/Api/AIActionController.php` — dispatch broadcast events
- `src/command-center/hooks/useAccountManager.tsx` — listen for WebSocket task events
- `src/command-center/services/websocket.service.ts` — add AI task channel subscription
- `backend/routes/channels.php` — authorize the private AI task channel

---

## Build Order

The workstreams have dependencies. Execute in this order:

```
1. PrismAiService (backend foundation — no frontend changes)
   ↓
2. Wire Account Manager AI to real backend (connects UI to PrismAiService)
   ↓
3. Context Scoping (enriches what the AI knows per screen)
   ↓
4. Frontend Actions + Human-in-the-Loop (3 and 5 together — actions need confirmation)
   ↓
5. Intelligence Hub Frontend Wiring (improves data quality for context)
   ↓
6. Real-Time Push (enhances action feedback — works without it but degrades gracefully)
```

Workstreams 3 (context scoping) and 6 (Intelligence Hub wiring) can run in parallel once Workstream 2 is complete.

---

## What Phase 1 Does NOT Include

These are explicitly Phase 2:

- Automatic agent routing to personalities based on query type
- Knowledge base quality improvements and playbook ingestion
- Server-side conversation persistence (Conversation/ConversationMessage model wiring)
- Evaluation framework (Promptfoo/RAGAS)
- SMB onboarding training mode
- Real enrichment job (Google Places, SerpAPI, website scraping)
- Additional generative UI components beyond ServiceUpsellPrompt and ActionConfirmation
- Generative UI rendering (AI responses as interactive React components — charts, cards, forms)

---

## Validation Criteria

Phase 1 is complete when:

1. Account manager opens any Command Center page → ExpandableChat is visible as floating widget
2. Account manager clicks the AI button → AccountManagerAI overlay opens with Sarah personality
3. Account manager asks "what should I pitch to [customer name]?" → AI responds with a contextual recommendation based on the customer's actual profile, subscriptions, and gaps
4. Account manager asks "draft a follow-up email to [customer]" → AI generates a draft and shows it in a confirmation card → user approves → email is created in the outbound system → Active Tasks sidebar shows real-time progress
5. Account manager navigates from pipeline to CRM → AI context updates to reflect the new module without manual intervention
6. AI responses come from PrismAiService via Claude/OpenRouter, not simulated keyword matching
7. Intelligence Hub profile page displays real data from backend APIs with profile completeness indicator
