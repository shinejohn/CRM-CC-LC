# MODULE 7: AI ACCOUNT MANAGER
## Sarah AI - Hands-Off Service

**Owner:** Agent 7
**Timeline:** Week 4-7
**Dependencies:** Module 0, Module 1 (SMB CRM)
**Blocks:** None

---

## OBJECTIVE

Build the AI Account Manager (Sarah) - an AI-powered service that proactively manages marketing tasks for SMBs, requiring only approval from the business owner.

---

## TABLES OWNED

- `ai_tasks`
- `ai_responses` (if separate from other tables)

---

## INTERFACE TO IMPLEMENT

```php
// Implement: App\Contracts\AIAccountManagerInterface
```

---

## SARAH PERSONA

```
SARAH - AI ACCOUNT MANAGER
─────────────────────────────────────────────────────────────────────────────────

NAME: Sarah
ROLE: Your AI Account Manager
TONE: Warm, professional, action-oriented

COMMUNICATION STYLE:
- Friendly but efficient
- Clear and direct
- Always provides value
- Never pushy
- Acknowledges busy schedules
- Uses contractions naturally

EMAIL SIGNATURE:
  Sarah
  Your AI Account Manager
  Fibonacco | [Community Name]

VOICEMAIL STYLE:
- 30-45 seconds max
- Personalized opening (business name)
- Specific value proposition
- Clear call to action
- References email follow-up
```

---

## FEATURES TO BUILD

### 1. Task Suggestion Engine

```php
// app/Services/AITaskSuggestionService.php

class AITaskSuggestionService
{
    public function __construct(
        protected AnthropicClient $claude
    ) {}
    
    /**
     * Analyze SMB and suggest next best task
     */
    public function suggestNextTask(SMB $smb): ?array
    {
        // 1. Get SMB context
        $context = $this->buildSMBContext($smb);
        
        // 2. Get available task types
        $availableTasks = $this->getAvailableTaskTypes($smb);
        
        if (empty($availableTasks)) {
            return null;
        }
        
        // 3. Use AI to prioritize
        $suggestion = $this->prioritizeWithAI($context, $availableTasks);
        
        // 4. Create task record
        if ($suggestion) {
            $task = AITask::create([
                'smb_id' => $smb->id,
                'task_type' => $suggestion['type'],
                'status' => 'suggested',
                'input_data' => $suggestion['input'],
                'suggested_at' => now(),
            ]);
            
            return [
                'task_id' => $task->id,
                'type' => $suggestion['type'],
                'title' => $suggestion['title'],
                'description' => $suggestion['description'],
                'estimated_impact' => $suggestion['impact'],
                'preview' => $suggestion['preview'] ?? null,
            ];
        }
        
        return null;
    }
    
    protected function buildSMBContext(SMB $smb): array
    {
        return [
            'business_name' => $smb->business_name,
            'category' => $smb->category,
            'community' => $smb->community->name,
            'engagement_tier' => $smb->getTierName(),
            'services_active' => $smb->services_activated ?? [],
            'last_approval' => $smb->last_approval?->diffForHumans(),
            'recent_activity' => $this->getRecentActivity($smb),
            'metrics' => $this->getKeyMetrics($smb),
        ];
    }
    
    protected function getAvailableTaskTypes(SMB $smb): array
    {
        $allTasks = [
            'social_post' => [
                'requires' => 'social_automation',
                'frequency' => 'weekly',
                'priority_base' => 5,
            ],
            'review_request' => [
                'requires' => 'review_automation',
                'frequency' => 'after_service',
                'priority_base' => 8,
            ],
            'email_campaign' => [
                'requires' => 'email_campaigns',
                'frequency' => 'monthly',
                'priority_base' => 6,
            ],
            'special_offer' => [
                'requires' => null,
                'frequency' => 'monthly',
                'priority_base' => 7,
            ],
            'profile_update' => [
                'requires' => null,
                'frequency' => 'quarterly',
                'priority_base' => 4,
            ],
            'event_post' => [
                'requires' => null,
                'frequency' => 'as_needed',
                'priority_base' => 9,
            ],
        ];
        
        $available = [];
        foreach ($allTasks as $type => $config) {
            // Check if required service is active
            if ($config['requires'] && !in_array($config['requires'], $smb->services_activated ?? [])) {
                continue;
            }
            
            // Check if not recently done
            if (!$this->wasRecentlyDone($smb, $type, $config['frequency'])) {
                $available[$type] = $config;
            }
        }
        
        return $available;
    }
    
    protected function prioritizeWithAI(array $context, array $tasks): ?array
    {
        $taskList = implode("\n", array_map(
            fn($type, $config) => "- {$type}: priority {$config['priority_base']}",
            array_keys($tasks),
            $tasks
        ));
        
        $response = $this->claude->messages()->create([
            'model' => config('fibonacco.ai.model'),
            'max_tokens' => 500,
            'system' => <<<PROMPT
You are Sarah, an AI Account Manager. Given a business context and available tasks, 
select the SINGLE most impactful task to suggest.

Return JSON only:
{
  "type": "task_type",
  "title": "Human-readable title",
  "description": "Why this task matters now",
  "impact": "Expected benefit",
  "input": {} // Any task-specific parameters
}
PROMPT,
            'messages' => [[
                'role' => 'user',
                'content' => "Business: " . json_encode($context) . "\n\nAvailable tasks:\n{$taskList}",
            ]],
        ]);
        
        return json_decode($response->content[0]->text, true);
    }
}
```

### 2. Task Content Generation

```php
// app/Services/AITaskContentService.php

class AITaskContentService
{
    public function __construct(
        protected AnthropicClient $claude
    ) {}
    
    /**
     * Generate content for a specific task type
     */
    public function generateTaskContent(int $smbId, string $taskType): array
    {
        $smb = SMB::with('community')->findOrFail($smbId);
        
        return match($taskType) {
            'social_post' => $this->generateSocialPost($smb),
            'review_request' => $this->generateReviewRequest($smb),
            'email_campaign' => $this->generateEmailCampaign($smb),
            'special_offer' => $this->generateSpecialOffer($smb),
            'event_post' => $this->generateEventPost($smb),
            default => throw new \InvalidArgumentException("Unknown task type: {$taskType}"),
        };
    }
    
    protected function generateSocialPost(SMB $smb): array
    {
        $response = $this->claude->messages()->create([
            'model' => config('fibonacco.ai.model'),
            'max_tokens' => 300,
            'system' => $this->getSocialPostPrompt($smb),
            'messages' => [[
                'role' => 'user',
                'content' => 'Generate a social media post for this business.',
            ]],
        ]);
        
        return [
            'type' => 'social_post',
            'content' => $response->content[0]->text,
            'platforms' => ['facebook', 'instagram'],
            'suggested_time' => $this->getOptimalPostTime($smb),
            'hashtags' => $this->generateHashtags($smb),
        ];
    }
    
    protected function generateReviewRequest(SMB $smb): array
    {
        $response = $this->claude->messages()->create([
            'model' => config('fibonacco.ai.model'),
            'max_tokens' => 200,
            'system' => $this->getReviewRequestPrompt($smb),
            'messages' => [[
                'role' => 'user',
                'content' => 'Generate a review request email.',
            ]],
        ]);
        
        return [
            'type' => 'review_request',
            'subject' => "How was your experience with {$smb->business_name}?",
            'body' => $response->content[0]->text,
            'review_link' => $smb->metadata['google_review_link'] ?? null,
        ];
    }
    
    protected function generateSpecialOffer(SMB $smb): array
    {
        $response = $this->claude->messages()->create([
            'model' => config('fibonacco.ai.model'),
            'max_tokens' => 300,
            'system' => $this->getSpecialOfferPrompt($smb),
            'messages' => [[
                'role' => 'user',
                'content' => 'Generate a special offer/coupon idea.',
            ]],
        ]);
        
        $offer = json_decode($response->content[0]->text, true);
        
        return [
            'type' => 'special_offer',
            'title' => $offer['title'],
            'description' => $offer['description'],
            'discount_type' => $offer['discount_type'],
            'discount_value' => $offer['discount_value'],
            'valid_days' => $offer['valid_days'] ?? 14,
        ];
    }
    
    protected function getSocialPostPrompt(SMB $smb): string
    {
        return <<<PROMPT
You are creating a social media post for {$smb->business_name}, a {$smb->category} in {$smb->community->name}.

Guidelines:
- Keep it under 280 characters for Twitter compatibility
- Be engaging and authentic
- Include a subtle call to action
- Match the business's likely tone

Do NOT:
- Use excessive emojis
- Be overly salesy
- Make claims you can't verify
PROMPT;
    }
}
```

### 3. Proactive Outreach

```php
// app/Services/AIProactiveOutreachService.php

class AIProactiveOutreachService
{
    /**
     * Generate proactive outreach content
     */
    public function generateOutreach(int $smbId, string $outreachType): array
    {
        $smb = SMB::with('community')->findOrFail($smbId);
        
        return match($outreachType) {
            'weekly_checkin' => $this->generateWeeklyCheckin($smb),
            'performance_summary' => $this->generatePerformanceSummary($smb),
            'opportunity_alert' => $this->generateOpportunityAlert($smb),
            'seasonal_suggestion' => $this->generateSeasonalSuggestion($smb),
            default => throw new \InvalidArgumentException("Unknown outreach type"),
        };
    }
    
    protected function generateWeeklyCheckin(SMB $smb): array
    {
        $metrics = $this->getWeeklyMetrics($smb);
        
        return [
            'type' => 'email',
            'subject' => "Your weekly update from Sarah",
            'body' => view('emails.ai.weekly-checkin', [
                'smb' => $smb,
                'metrics' => $metrics,
                'suggestions' => $this->getWeeklySuggestions($smb),
            ])->render(),
        ];
    }
    
    protected function generateOpportunityAlert(SMB $smb): array
    {
        // Detect opportunities based on data
        $opportunities = $this->detectOpportunities($smb);
        
        if (empty($opportunities)) {
            return [];
        }
        
        $topOpportunity = $opportunities[0];
        
        return [
            'type' => 'email',
            'subject' => "Quick opportunity for {$smb->business_name}",
            'body' => $this->formatOpportunityEmail($smb, $topOpportunity),
            'priority' => $topOpportunity['priority'],
        ];
    }
    
    /**
     * Personalize RVM script with AI
     */
    public function personalizeRVMScript(int $smbId, string $baseScript): string
    {
        $smb = SMB::with('community')->findOrFail($smbId);
        
        // Basic personalization
        $script = str_replace(
            ['{business_name}', '{community}', '{first_name}'],
            [$smb->business_name, $smb->community->name, explode(' ', $smb->primary_contact_name)[0]],
            $baseScript
        );
        
        // AI enhancement for natural delivery
        $response = $this->claude->messages()->create([
            'model' => config('fibonacco.ai.model'),
            'max_tokens' => 150,
            'system' => 'Rewrite this voicemail script to sound more natural and conversational while keeping the same message. Keep it under 45 seconds when spoken.',
            'messages' => [['role' => 'user', 'content' => $script]],
        ]);
        
        return $response->content[0]->text;
    }
}
```

### 4. Task Execution

```php
// app/Jobs/ExecuteAITask.php

class ExecuteAITask implements ShouldQueue
{
    public function __construct(
        public int $taskId
    ) {}
    
    public function handle(): void
    {
        $task = AITask::with('smb')->findOrFail($this->taskId);
        
        if ($task->status !== 'approved') {
            return;
        }
        
        $task->update(['status' => 'executing', 'executed_at' => now()]);
        
        try {
            $result = match($task->task_type) {
                'social_post' => $this->executeSocialPost($task),
                'review_request' => $this->executeReviewRequest($task),
                'email_campaign' => $this->executeEmailCampaign($task),
                'special_offer' => $this->executeSpecialOffer($task),
                'profile_update' => $this->executeProfileUpdate($task),
                default => throw new \InvalidArgumentException("Unknown task type"),
            };
            
            $task->update([
                'status' => 'completed',
                'completed_at' => now(),
                'output_data' => $result,
            ]);
            
            event(new AITaskCompleted($task->id, $task->smb_id, $task->task_type));
            
        } catch (\Exception $e) {
            $task->update([
                'status' => 'failed',
                'output_data' => ['error' => $e->getMessage()],
            ]);
            
            Log::error('AI task execution failed', [
                'task_id' => $task->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
    
    protected function executeSocialPost(AITask $task): array
    {
        $content = $task->input_data;
        
        // Post to social platforms
        // (Would integrate with actual social APIs)
        
        return [
            'posted_to' => $content['platforms'],
            'post_ids' => ['facebook' => 'xxx', 'instagram' => 'yyy'],
            'posted_at' => now()->toISOString(),
        ];
    }
    
    protected function executeReviewRequest(AITask $task): array
    {
        $content = $task->input_data;
        
        // Send review request emails
        dispatch(new SendReviewRequestBatch(
            $task->smb_id,
            $content['recipients'] ?? [],
            $content['subject'],
            $content['body']
        ));
        
        return [
            'emails_queued' => count($content['recipients'] ?? []),
        ];
    }
}
```

### 5. AI Task API

```php
// app/Http/Controllers/Api/V1/AIController.php

class AIController extends Controller
{
    // GET /api/v1/ai/suggestions
    public function getSuggestions(Request $request)
    {
        $smb = $request->user()->smb;
        $service = app(AITaskSuggestionService::class);
        
        $suggestion = $service->suggestNextTask($smb);
        
        if (!$suggestion) {
            return response()->json(['message' => 'No suggestions at this time']);
        }
        
        return $suggestion;
    }
    
    // GET /api/v1/ai/tasks
    public function getTasks(Request $request)
    {
        $smb = $request->user()->smb;
        
        return AITask::where('smb_id', $smb->id)
            ->orderBy('created_at', 'desc')
            ->paginate();
    }
    
    // GET /api/v1/ai/tasks/{id}
    public function getTask(AITask $task)
    {
        $this->authorize('view', $task);
        return $task;
    }
    
    // POST /api/v1/ai/tasks/{id}/approve
    public function approveTask(AITask $task)
    {
        $this->authorize('approve', $task);
        
        if ($task->status !== 'suggested') {
            return response()->json(['error' => 'Task not in suggested status'], 400);
        }
        
        $task->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);
        
        dispatch(new ExecuteAITask($task->id));
        
        return response()->json(['message' => 'Task approved and queued for execution']);
    }
    
    // POST /api/v1/ai/tasks/{id}/reject
    public function rejectTask(Request $request, AITask $task)
    {
        $this->authorize('reject', $task);
        
        $task->update([
            'status' => 'rejected',
            'output_data' => ['rejection_reason' => $request->reason],
        ]);
        
        return response()->json(['message' => 'Task rejected']);
    }
    
    // POST /api/v1/ai/tasks/{id}/modify
    public function modifyTask(Request $request, AITask $task)
    {
        $this->authorize('modify', $task);
        
        $request->validate([
            'input_data' => 'required|array',
        ]);
        
        $task->update([
            'input_data' => array_merge($task->input_data, $request->input_data),
        ]);
        
        return $task;
    }
    
    // GET /api/v1/ai/tasks/{id}/preview
    public function previewTask(AITask $task)
    {
        $this->authorize('view', $task);
        
        $service = app(AITaskContentService::class);
        $preview = $service->generateTaskContent($task->smb_id, $task->task_type);
        
        return $preview;
    }
    
    // POST /api/v1/ai/generate
    public function generate(Request $request)
    {
        $request->validate([
            'type' => 'required|in:social_post,review_request,email,offer',
            'context' => 'nullable|array',
        ]);
        
        $smb = $request->user()->smb;
        $service = app(AITaskContentService::class);
        
        $content = $service->generateTaskContent($smb->id, $request->type);
        
        return $content;
    }
}
```

### 6. Proactive Outreach Scheduling

```php
// app/Jobs/GenerateWeeklyAIOutreach.php

class GenerateWeeklyAIOutreach implements ShouldQueue
{
    public function handle(): void
    {
        // Get all SMBs with AI Account Manager service
        $smbs = SMB::where('service_model', 'ai_account_manager')
            ->where('subscription_tier', '!=', 'free')
            ->chunk(100, function ($chunk) {
                foreach ($chunk as $smb) {
                    $this->generateOutreachForSMB($smb);
                }
            });
    }
    
    protected function generateOutreachForSMB(SMB $smb): void
    {
        $service = app(AIProactiveOutreachService::class);
        
        // Weekly check-in email
        $checkin = $service->generateOutreach($smb->id, 'weekly_checkin');
        dispatch(new SendAIOutreachEmail($smb->id, $checkin));
        
        // Task suggestion
        $suggestionService = app(AITaskSuggestionService::class);
        $suggestion = $suggestionService->suggestNextTask($smb);
        
        if ($suggestion) {
            // Email about the suggestion
            dispatch(new SendTaskSuggestionEmail($smb->id, $suggestion));
        }
    }
}
```

---

## API ENDPOINTS

```
# Suggestions & Tasks
GET    /api/v1/ai/suggestions              # Get next suggested task
GET    /api/v1/ai/tasks                    # List all tasks
GET    /api/v1/ai/tasks/{id}               # Get task details
POST   /api/v1/ai/tasks/{id}/approve       # Approve task
POST   /api/v1/ai/tasks/{id}/reject        # Reject task
POST   /api/v1/ai/tasks/{id}/modify        # Modify task content
GET    /api/v1/ai/tasks/{id}/preview       # Preview task execution

# Generation
POST   /api/v1/ai/generate                 # Generate content on demand

# Analytics
GET    /api/v1/ai/analytics                # AI task performance
GET    /api/v1/ai/recommendations          # AI recommendations
```

---

## SCHEDULED JOBS

```php
// Weekly: Generate AI outreach for all AI Account Manager customers
$schedule->job(new GenerateWeeklyAIOutreach)->weeklyOn(1, '09:00');

// Daily: Check for opportunity alerts
$schedule->job(new CheckOpportunityAlerts)->dailyAt('08:00');

// Hourly: Execute approved tasks
$schedule->job(new ProcessApprovedAITasks)->hourly();
```

---

## EVENTS TO EMIT

```php
AITaskSuggested::class    // When task is suggested
AITaskApproved::class     // When task is approved
AITaskCompleted::class    // When task is executed
AIResponseGenerated::class // When AI generates content
```

---

## ACCEPTANCE CRITERIA

- [ ] Task suggestion engine working
- [ ] Content generation for all task types
- [ ] Task approval/reject/modify flow
- [ ] Task execution for all types
- [ ] Proactive outreach generation
- [ ] RVM script personalization
- [ ] Weekly check-in emails
- [ ] API endpoints functional
- [ ] Unit tests: 80% coverage
