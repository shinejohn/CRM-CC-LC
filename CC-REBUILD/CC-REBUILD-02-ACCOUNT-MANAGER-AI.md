# CC-REBUILD-02: Account Manager AI Component
## Agent B — Foundation (No Dependencies)

---

## Mission
Build the Account Manager AI — the persistent, slide-down AI chat interface accessible from every page via the header. This is THE differentiating UX feature.

## Magic Patterns Reference Files
- `AccountManagerAI.tsx` → Full implementation: chat, voice, TTS, active tasks sidebar, command center toggle
- `AccountManagerBar.tsx` → Wrapper component that slides down from header
- `AIModeHub.tsx` → Sarah persona with avatar, team introductions, quick responses
- `ChatPanel.tsx` → Reusable chat panel
- `ExpandableChat.tsx` → Collapsible chat variant
- `ServiceUpsellPrompt.tsx` → AI-driven contextual upsell
- `ServiceUpsellChatMessage.tsx` → In-chat upsell with benefits

## What to Build

### 1. `resources/js/components/command-center/AccountManagerAI.tsx`

**The full AI chat interface.** Follow `AccountManagerAI.tsx` from Magic Patterns:

```typescript
interface AccountManagerAIProps {
  onClose: () => void;
  business: Business;
  subscription: Subscription | null;
  activeZone?: ZoneName;
}
```

**Features:**
- Chat interface with message bubbles (user = gradient blue/purple, AI = glass card)
- Active Tasks sidebar (264px right panel inside the component)
- View toggle: Chat ↔ Command Center
- Voice input button with listening indicator
- TTS toggle for AI responses
- Account manager avatar + name + status indicator
- Message processing that simulates context-aware responses based on `activeZone`
- Task creation from user requests (article → "Creating article" task)
- Tasks progress: pending → in-progress → completed with animations

**From `AccountManagerAI.tsx` processUserRequest logic:**
- "article"/"content" → content generation response
- "event" → event creation response
- "analytics"/"report" → analytics response
- "profile"/"business" → profile update response
- "social"/"post" → social media response
- Default → general assistance response

### 2. `resources/js/components/command-center/AccountManagerBar.tsx`

**The header trigger and slide-down wrapper.** Follow `AccountManagerBar.tsx`:

```typescript
interface AccountManagerBarProps {
  isExpanded: boolean;
  onClose: () => void;
  business: Business;
  subscription: Subscription | null;
  activeZone?: ZoneName;
}
```

- Renders as full-width bar below the header
- Slides down with animation when triggered
- Contains `AccountManagerAI` component
- Closes on X button or clicking outside
- Height: ~450-500px when expanded
- Background: themed to current zone color subtly

### 3. `resources/js/components/command-center/ServiceUpsellPrompt.tsx`

Follow `ServiceUpsellPrompt.tsx` — contextual AI-driven upsell card:
- Gradient background (emerald/blue/purple)
- "Upsell Opportunity" badge with trending icon
- Monthly value display (+$X/mo)
- Orchestrator message from Account Manager AI
- Service details card with pricing (current vs bundle)
- Benefits list with checkmarks
- Customer fit score indicator
- Success metrics cards
- Action buttons: Accept / Learn More / Not Now

### 4. `resources/js/components/command-center/ExpandableChat.tsx`

Follow `ExpandableChat.tsx` — lightweight inline chat for embedding in zone pages:
- Collapsible header bar with toggle
- 264px height when expanded
- Message list with AI/user bubbles
- Text input + send button
- Used for zone-specific AI assistance (not the main AM-AI)

### 5. State Management Hook

```typescript
// resources/js/hooks/useAccountManager.ts
export function useAccountManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  
  const toggle = () => setIsOpen(prev => !prev);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  
  const sendMessage = (content: string) => { /* ... */ };
  const addTask = (description: string) => { /* ... */ };
  
  return { isOpen, toggle, open, close, messages, sendMessage, activeTasks, addTask };
}
```

## Visual Specification

From `AccountManagerAI.tsx`:
- Header: Account manager avatar (circular, 48px, border-2 border-[#00D4FF]) + name "Account Manager AI" + green status dot
- Chat/Command Center toggle: pill buttons with gradient active state
- Messages: max-width 80%, user messages right-aligned gradient, AI messages left-aligned glass-card
- AI messages include SparklesIcon + "AI ASSISTANT" label
- Input bar: glass-card input + mic button (toggles red when listening) + TTS button + send button (gradient)
- Tasks sidebar: "Active Tasks" header with terminal icon, task cards with status indicators (pending=yellow, in-progress=blue pulse, completed=green check)

## Acceptance Criteria
- [ ] AI chat opens/closes from header button with smooth animation
- [ ] Messages render correctly for user and AI
- [ ] Active tasks sidebar shows task progress
- [ ] Voice input toggle works (visual state, actual recording is future)
- [ ] TTS toggle works (visual state)
- [ ] Context-aware responses based on activeZone
- [ ] Upsell prompts can be injected into chat
- [ ] ExpandableChat works as standalone inline component
- [ ] Close button and click-outside both dismiss
- [ ] Dark mode support

## Files to Create
1. `resources/js/components/command-center/AccountManagerAI.tsx`
2. `resources/js/components/command-center/AccountManagerBar.tsx`
3. `resources/js/components/command-center/ServiceUpsellPrompt.tsx`
4. `resources/js/components/command-center/ExpandableChat.tsx`
5. `resources/js/hooks/useAccountManager.ts`
