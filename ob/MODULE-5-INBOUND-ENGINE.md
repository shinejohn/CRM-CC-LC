# MODULE 5: INBOUND ENGINE
## Email, Callback & Chat Handling

**Owner:** Agent 5
**Timeline:** Week 4-6
**Dependencies:** Module 0 (Core Infrastructure)
**Blocks:** None (parallel)

---

## OBJECTIVE

Build the inbound handling system for email replies, phone callbacks from RVM, and chat interactions - all powered by AI with zero human staff.

---

## TABLES OWNED

- `callbacks`
- `email_conversations`
- `chat_messages`

---

## INTERFACE TO IMPLEMENT

```php
// Implement: App\Contracts\InboundServiceInterface
```

---

## EXTERNAL INTEGRATIONS

### Anthropic Claude API
- Email intent classification
- Response generation
- Chat handling

### Twilio / VoiceDrop.ai
- Inbound call handling
- AI voice conversation
- Call transcription

### OpenAI Whisper
- Call transcription (if not using provider's)

---

## FEATURES TO BUILD

### 1. Inbound Email Processing

```php
// app/Jobs/ProcessInboundEmail.php

class ProcessInboundEmail implements ShouldQueue
{
    public function __construct(
        public array $rawEmail
    ) {}
    
    public function handle(InboundServiceInterface $inboundService): void
    {
        // 1. Parse email
        $parsed = $inboundService->parseInboundEmail($this->rawEmail);
        
        // 2. Identify SMB
        $smb = SMB::where('primary_email', $parsed['from'])->first();
        
        // 3. Find related campaign send (if reply)
        $campaignSend = null;
        if ($parsed['in_reply_to']) {
            $campaignSend = CampaignSend::where('message_id', $parsed['in_reply_to'])->first();
        }
        
        // 4. Store conversation
        $conversation = EmailConversation::create([
            'smb_id' => $smb?->id,
            'direction' => 'inbound',
            'from_email' => $parsed['from'],
            'to_email' => $parsed['to'],
            'subject' => $parsed['subject'],
            'body' => $parsed['body'],
            'body_html' => $parsed['body_html'],
            'in_reply_to' => $parsed['in_reply_to'],
            'campaign_send_id' => $campaignSend?->id,
        ]);
        
        // 5. Classify intent
        $intent = $inboundService->classifyEmailIntent($parsed['body']);
        $conversation->update(['intent' => $intent]);
        
        // 6. Generate and send response
        if ($smb && $this->shouldRespond($intent)) {
            $response = $inboundService->generateEmailResponse(
                $smb->id,
                $intent,
                $parsed['body']
            );
            
            $inboundService->sendEmailResponse(
                $smb->id,
                $response,
                $parsed['message_id']
            );
            
            $conversation->update([
                'ai_responded' => true,
                'ai_response' => $response,
            ]);
        }
        
        // 7. Emit event
        event(new InboundEmailReceived($conversation->id, $smb?->id, $intent));
    }
    
    protected function shouldRespond(string $intent): bool
    {
        // Don't auto-respond to unsubscribes, out-of-office, etc.
        $noResponseIntents = ['unsubscribe', 'out_of_office', 'auto_reply', 'spam'];
        return !in_array($intent, $noResponseIntents);
    }
}

// app/Services/InboundEmailService.php

class InboundEmailService
{
    public function __construct(
        protected AnthropicClient $claude
    ) {}
    
    public function parseInboundEmail(array $rawEmail): array
    {
        // Parse S3 stored email or SNS notification
        return [
            'from' => $this->extractEmail($rawEmail['from'] ?? ''),
            'to' => $this->extractEmail($rawEmail['to'] ?? ''),
            'subject' => $rawEmail['subject'] ?? '',
            'body' => $this->extractPlainText($rawEmail),
            'body_html' => $rawEmail['html'] ?? null,
            'in_reply_to' => $rawEmail['headers']['In-Reply-To'] ?? null,
            'message_id' => $rawEmail['headers']['Message-ID'] ?? null,
        ];
    }
    
    public function classifyEmailIntent(string $body): string
    {
        $response = $this->claude->messages()->create([
            'model' => config('fibonacco.ai.model'),
            'max_tokens' => 50,
            'system' => 'Classify the intent of this email reply. Respond with ONLY one of: question, approval, unsubscribe, complaint, positive, schedule_meeting, update_info, out_of_office, auto_reply, spam, other',
            'messages' => [
                ['role' => 'user', 'content' => $body],
            ],
        ]);
        
        return strtolower(trim($response->content[0]->text));
    }
    
    public function generateEmailResponse(int $smbId, string $intent, string $body): string
    {
        $smb = SMB::with('community')->find($smbId);
        
        $systemPrompt = $this->buildSystemPrompt($smb, $intent);
        
        $response = $this->claude->messages()->create([
            'model' => config('fibonacco.ai.model'),
            'max_tokens' => 500,
            'system' => $systemPrompt,
            'messages' => [
                ['role' => 'user', 'content' => $body],
            ],
        ]);
        
        return $response->content[0]->text;
    }
    
    protected function buildSystemPrompt(SMB $smb, string $intent): string
    {
        return <<<PROMPT
You are Sarah, an AI Account Manager at Fibonacco for {$smb->community->name}.
You're responding to an email from {$smb->business_name}.

PERSONA:
- Warm, professional, action-oriented
- Efficient but friendly
- Always provide value

BUSINESS CONTEXT:
- Business: {$smb->business_name}
- Category: {$smb->category}
- Engagement Tier: {$smb->getTierName()}
- Services Active: {implode(', ', $smb->services_activated ?? ['none yet'])}

EMAIL INTENT: {$intent}

GUIDELINES:
- Keep response concise (2-4 paragraphs max)
- Address their specific question/concern
- If they asked a question, answer it directly
- Include one relevant CTA when appropriate
- Sign as "Sarah, Your AI Account Manager"

Do NOT:
- Be overly formal or corporate
- Make promises you can't keep
- Include phone numbers (use email for everything)
PROMPT;
    }
    
    public function sendEmailResponse(int $smbId, string $response, string $inReplyTo): void
    {
        $smb = SMB::find($smbId);
        
        Mail::to($smb->primary_email)
            ->send(new AIEmailResponse($smb, $response, $inReplyTo));
        
        // Log outbound
        EmailConversation::create([
            'smb_id' => $smbId,
            'direction' => 'outbound',
            'from_email' => config('fibonacco.email.from_email'),
            'to_email' => $smb->primary_email,
            'subject' => 'Re: ' . $this->getOriginalSubject($inReplyTo),
            'body' => $response,
            'in_reply_to' => $inReplyTo,
        ]);
    }
}
```

### 2. Callback Handling (AI Voice)

```php
// app/Services/CallbackHandlerService.php

class CallbackHandlerService
{
    public function __construct(
        protected AnthropicClient $claude,
        protected TranscriptionService $transcriber
    ) {}
    
    /**
     * Handle incoming callback webhook from Twilio/VoiceDrop
     */
    public function handleIncomingCall(array $callData): array
    {
        // 1. Identify caller
        $callerPhone = $callData['from'];
        $smb = SMB::where('primary_phone', $callerPhone)->first();
        
        // 2. Find related RVM drop
        $rvmDrop = RvmDrop::where('phone', $callerPhone)
            ->where('callback_received', false)
            ->latest()
            ->first();
        
        // 3. Create callback record
        $callback = Callback::create([
            'smb_id' => $smb?->id,
            'rvm_drop_id' => $rvmDrop?->id,
            'caller_phone' => $callerPhone,
            'called_number' => $callData['to'],
            'started_at' => now(),
        ]);
        
        // 4. Update RVM drop
        if ($rvmDrop) {
            $rvmDrop->update([
                'callback_received' => true,
                'callback_at' => now(),
                'callback_id' => $callback->id,
            ]);
        }
        
        // 5. Return initial greeting for AI agent
        $greeting = $this->generateGreeting($smb);
        
        return [
            'callback_id' => $callback->id,
            'greeting' => $greeting,
            'context' => $this->buildCallContext($smb, $rvmDrop),
        ];
    }
    
    /**
     * Process conversation turn during call
     */
    public function processCallTurn(int $callbackId, string $userSpeech): array
    {
        $callback = Callback::with('smb')->find($callbackId);
        $context = $this->getCallContext($callback);
        
        // Generate AI response
        $response = $this->claude->messages()->create([
            'model' => config('fibonacco.ai.model'),
            'max_tokens' => 200,
            'system' => $this->buildVoiceSystemPrompt($callback->smb),
            'messages' => array_merge($context, [
                ['role' => 'user', 'content' => $userSpeech],
            ]),
        ]);
        
        $aiResponse = $response->content[0]->text;
        
        // Detect intents
        $intent = $this->detectCallIntent($userSpeech, $aiResponse);
        
        // Execute actions based on intent
        $actions = $this->executeCallActions($callback, $intent);
        
        return [
            'response' => $aiResponse,
            'intent' => $intent,
            'actions' => $actions,
            'should_end' => $this->shouldEndCall($intent),
        ];
    }
    
    /**
     * Handle call end
     */
    public function handleCallEnd(int $callbackId, string $audioUrl = null): void
    {
        $callback = Callback::with('smb')->find($callbackId);
        
        $callback->update([
            'ended_at' => now(),
            'duration_seconds' => now()->diffInSeconds($callback->started_at),
        ]);
        
        // Transcribe if audio provided
        if ($audioUrl) {
            $transcript = $this->transcriber->transcribe($audioUrl);
            $summary = $this->generateCallSummary($transcript);
            
            $callback->update([
                'transcript' => $transcript,
                'summary' => $summary,
            ]);
        }
        
        // Send follow-up email
        if ($callback->smb) {
            dispatch(new SendCallbackFollowupEmail($callback->id));
        }
        
        event(new CallbackReceived($callback->id, $callback->smb_id, $callback->rvm_drop_id));
    }
    
    protected function generateGreeting(?SMB $smb): string
    {
        if ($smb) {
            $firstName = explode(' ', $smb->primary_contact_name)[0] ?? '';
            return "Hi {$firstName}! This is Sarah from Fibonacco. Thanks for calling back! How can I help you with {$smb->business_name} today?";
        }
        
        return "Hi! This is Sarah from Fibonacco. Thanks for calling! May I ask which business you're calling about?";
    }
    
    protected function buildVoiceSystemPrompt(?SMB $smb): string
    {
        $context = $smb ? "for {$smb->business_name} in {$smb->community->name}" : "";
        
        return <<<PROMPT
You are Sarah, an AI Account Manager at Fibonacco {$context}.
You're on a PHONE CALL - keep responses SHORT and conversational.

CAPABILITIES:
- Answer questions about Fibonacco services
- Process verbal approvals ("Yes, set that up for me")
- Schedule meetings ("Can we set up a call?")
- Update contact information

VOICE GUIDELINES:
- Keep responses under 3 sentences
- Be warm and natural
- Use contractions (I'm, you're, we'll)
- Pause for confirmation on important actions
- If asked something you can't do, offer to email details

NEVER:
- Give pricing without context
- Make commitments you can't keep
- Transfer to a human (there are none)
- Sound robotic
PROMPT;
    }
    
    protected function detectCallIntent(string $userSpeech, string $aiResponse): string
    {
        $lowerSpeech = strtolower($userSpeech);
        
        if (str_contains($lowerSpeech, 'yes') && str_contains($lowerSpeech, 'set')) {
            return 'approval';
        }
        if (str_contains($lowerSpeech, 'schedule') || str_contains($lowerSpeech, 'call') || str_contains($lowerSpeech, 'meeting')) {
            return 'schedule_meeting';
        }
        if (str_contains($lowerSpeech, 'question') || str_contains($lowerSpeech, 'how')) {
            return 'question';
        }
        if (str_contains($lowerSpeech, 'bye') || str_contains($lowerSpeech, 'thank')) {
            return 'end_call';
        }
        
        return 'conversation';
    }
    
    protected function executeCallActions(Callback $callback, string $intent): array
    {
        $actions = [];
        
        switch ($intent) {
            case 'approval':
                // Create approval from verbal consent
                // Would need service type context from conversation
                $actions[] = 'verbal_approval_noted';
                break;
                
            case 'schedule_meeting':
                // Send meeting scheduling link via email
                dispatch(new SendMeetingSchedulingEmail($callback->smb_id));
                $actions[] = 'meeting_link_sent';
                break;
        }
        
        $callback->update(['actions_taken' => $actions]);
        
        return $actions;
    }
}
```

### 3. Chat Bot

```php
// app/Http/Controllers/Api/V1/ChatController.php

class ChatController extends Controller
{
    // POST /api/v1/chat/message
    public function message(Request $request, InboundServiceInterface $inbound)
    {
        $request->validate([
            'session_id' => 'required|uuid',
            'message' => 'required|string|max:1000',
            'smb_id' => 'nullable|exists:smbs,id',
        ]);
        
        // Get conversation history
        $history = ChatMessage::where('session_id', $request->session_id)
            ->orderBy('created_at')
            ->get()
            ->map(fn($m) => ['role' => $m->role, 'content' => $m->content])
            ->toArray();
        
        // Store user message
        ChatMessage::create([
            'session_id' => $request->session_id,
            'smb_id' => $request->smb_id,
            'role' => 'user',
            'content' => $request->message,
        ]);
        
        // Generate response
        $response = $inbound->handleChatMessage(
            $request->session_id,
            $request->smb_id,
            $request->message
        );
        
        // Detect intent
        $intent = $this->detectChatIntent($request->message, $response);
        
        // Store assistant message
        $assistantMessage = ChatMessage::create([
            'session_id' => $request->session_id,
            'smb_id' => $request->smb_id,
            'role' => 'assistant',
            'content' => $response,
            'intent' => $intent,
        ]);
        
        event(new ChatMessageReceived($assistantMessage->id, $request->smb_id, $intent));
        
        return response()->json([
            'message' => $response,
            'intent' => $intent,
        ]);
    }
    
    // GET /api/v1/chat/history/{sessionId}
    public function history(string $sessionId)
    {
        return ChatMessage::where('session_id', $sessionId)
            ->orderBy('created_at')
            ->get(['role', 'content', 'created_at']);
    }
}

// app/Services/ChatService.php

class ChatService
{
    public function handleChatMessage(string $sessionId, ?int $smbId, string $message): string
    {
        $smb = $smbId ? SMB::with('community')->find($smbId) : null;
        $history = $this->getHistory($sessionId);
        
        $systemPrompt = $this->buildChatSystemPrompt($smb);
        
        $response = $this->claude->messages()->create([
            'model' => config('fibonacco.ai.model'),
            'max_tokens' => 500,
            'system' => $systemPrompt,
            'messages' => array_merge($history, [
                ['role' => 'user', 'content' => $message],
            ]),
        ]);
        
        return $response->content[0]->text;
    }
    
    protected function buildChatSystemPrompt(?SMB $smb): string
    {
        $context = $smb 
            ? "You're chatting with {$smb->primary_contact_name} from {$smb->business_name}."
            : "You're chatting with a visitor.";
        
        return <<<PROMPT
You are Sarah, an AI Account Manager at Fibonacco.
{$context}

CAPABILITIES:
- Answer questions about Fibonacco services
- Help navigate the Command Center
- Explain features and pricing
- Process approvals (if authenticated)
- Schedule meetings
- Troubleshoot issues

CHAT GUIDELINES:
- Keep responses concise
- Use markdown for formatting when helpful
- Offer specific next steps
- If you can't help, offer to email more info

AVAILABLE SERVICES:
- Appointment Booking
- Review Generation
- Invoice Automation
- Social Media Posting
- Email Marketing
- AI Receptionist
- Analytics Dashboard
PROMPT;
    }
}
```

### 4. Inbound Email Webhook

```php
// app/Http/Controllers/WebhookController.php

class WebhookController extends Controller
{
    // POST /webhooks/ses/inbound
    public function sesInbound(Request $request)
    {
        $payload = json_decode($request->getContent(), true);
        
        // Handle SNS subscription confirmation
        if ($payload['Type'] === 'SubscriptionConfirmation') {
            Http::get($payload['SubscribeURL']);
            return response('OK');
        }
        
        // Parse notification
        $message = json_decode($payload['Message'], true);
        
        // Get email from S3
        $s3Email = $this->fetchEmailFromS3($message['receipt']['action']['bucketName'], $message['receipt']['action']['objectKey']);
        
        // Queue processing
        dispatch(new ProcessInboundEmail($s3Email));
        
        return response('OK');
    }
    
    protected function fetchEmailFromS3(string $bucket, string $key): array
    {
        $content = Storage::disk('s3')->get($key);
        return $this->parseEmailContent($content);
    }
}
```

---

## API ENDPOINTS

```
# Chat
POST   /api/v1/chat/message                  # Send chat message
GET    /api/v1/chat/history/{sessionId}      # Get chat history

# Callbacks (for AI voice integration)
POST   /api/v1/callbacks/start               # Start callback
POST   /api/v1/callbacks/{id}/turn           # Process conversation turn  
POST   /api/v1/callbacks/{id}/end            # End callback

# Internal/Admin
GET    /api/v1/email-conversations           # List conversations
GET    /api/v1/email-conversations/{id}      # Get conversation
GET    /api/v1/callbacks                     # List callbacks
GET    /api/v1/callbacks/{id}                # Get callback with transcript

# Webhooks
POST   /webhooks/ses/inbound                 # SES inbound email
POST   /webhooks/twilio/voice                # Twilio voice webhook
```

---

## EVENTS TO EMIT

```php
InboundEmailReceived::class   // When email processed
CallbackReceived::class       // When call ends
ChatMessageReceived::class    // When chat message processed
```

---

## ACCEPTANCE CRITERIA

- [ ] Inbound email parsing from SES/S3
- [ ] Intent classification working
- [ ] AI response generation working
- [ ] Response emails sending correctly
- [ ] Callback start/turn/end flow working
- [ ] Call transcription working
- [ ] Follow-up emails after calls
- [ ] Chat bot responding correctly
- [ ] Chat history persisting
- [ ] All events emitting
- [ ] Unit tests: 80% coverage
