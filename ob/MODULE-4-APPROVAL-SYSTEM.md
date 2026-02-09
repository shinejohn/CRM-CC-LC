# MODULE 4: APPROVAL SYSTEM
## Micro-Commitment & Service Provisioning

**Owner:** Agent 4
**Timeline:** Week 3-6
**Dependencies:** Module 0 (Core Infrastructure)
**Blocks:** None (parallel)

---

## OBJECTIVE

Build the approval workflow system that captures user intent through approval buttons, confirms identity, offers upsells, and triggers service provisioning.

---

## TABLES OWNED

- `approvals`
- `approval_upsells`
- `provisioning_tasks`

---

## INTERFACE TO IMPLEMENT

```php
// Implement: App\Contracts\ApprovalServiceInterface
```

---

## FEATURES TO BUILD

### 1. Approval Token Management

```php
// app/Services/ApprovalTokenService.php

class ApprovalTokenService
{
    /**
     * Generate secure approval token
     */
    public function generateToken(int $smbId, string $serviceType, string $sourceId): string
    {
        $payload = [
            'smb_id' => $smbId,
            'service_type' => $serviceType,
            'source_id' => $sourceId,
            'expires_at' => now()->addDays(7)->timestamp,
        ];
        
        // Encrypt payload
        return encrypt(json_encode($payload));
    }
    
    /**
     * Validate and decode token
     */
    public function validateToken(string $token): ?array
    {
        try {
            $payload = json_decode(decrypt($token), true);
            
            // Check expiration
            if ($payload['expires_at'] < now()->timestamp) {
                return null;
            }
            
            // Verify SMB exists
            if (!SMB::find($payload['smb_id'])) {
                return null;
            }
            
            return $payload;
            
        } catch (\Exception $e) {
            return null;
        }
    }
}
```

### 2. Approval Flow Controller

```php
// app/Http/Controllers/ApprovalController.php

class ApprovalController extends Controller
{
    // GET /approve
    public function showConfirmation(Request $request)
    {
        $request->validate([
            'task' => 'required|string',
            'smb' => 'required|integer',
            'source' => 'required|string',
            'token' => 'required|string',
        ]);
        
        // Validate token
        $tokenService = app(ApprovalTokenService::class);
        $payload = $tokenService->validateToken($request->token);
        
        if (!$payload) {
            return view('approvals.invalid-token');
        }
        
        // Verify token matches request
        if ($payload['smb_id'] != $request->smb || $payload['service_type'] != $request->task) {
            return view('approvals.invalid-token');
        }
        
        // Get SMB data
        $smb = SMB::with('community')->findOrFail($request->smb);
        
        // Get service config
        $serviceConfig = config("fibonacco.services.{$request->task}");
        
        return view('approvals.confirm', [
            'smb' => $smb,
            'serviceType' => $request->task,
            'serviceName' => $serviceConfig['name'] ?? $request->task,
            'serviceDescription' => $serviceConfig['description'] ?? '',
            'source' => $request->source,
            'token' => $request->token,
        ]);
    }
    
    // POST /approve
    public function submitApproval(Request $request)
    {
        $request->validate([
            'smb_id' => 'required|exists:smbs,id',
            'service_type' => 'required|string',
            'source' => 'required|string',
            'token' => 'required|string',
            'approver_name' => 'required|string|max:255',
            'approver_email' => 'required|email',
            'approver_phone' => 'nullable|string|max:50',
            'contact_consent' => 'required|accepted',
        ]);
        
        // Re-validate token
        $tokenService = app(ApprovalTokenService::class);
        $payload = $tokenService->validateToken($request->token);
        
        if (!$payload || $payload['smb_id'] != $request->smb_id) {
            return response()->json(['error' => 'Invalid token'], 403);
        }
        
        // Check for duplicate approval
        $existingApproval = Approval::where('smb_id', $request->smb_id)
            ->where('service_type', $request->service_type)
            ->whereIn('status', ['pending', 'provisioning', 'provisioned'])
            ->first();
        
        if ($existingApproval) {
            return redirect()->route('approval.success', ['id' => $existingApproval->uuid]);
        }
        
        // Create approval
        $approval = Approval::create([
            'smb_id' => $request->smb_id,
            'service_type' => $request->service_type,
            'approver_name' => $request->approver_name,
            'approver_email' => $request->approver_email,
            'approver_phone' => $request->approver_phone,
            'source_type' => $this->determineSourceType($request->source),
            'source_id' => $request->source,
            'source_url' => $request->header('Referer'),
            'contact_consent' => true,
            'status' => 'pending',
            'approved_at' => now(),
        ]);
        
        // Update SMB contact info if changed
        $smb = SMB::find($request->smb_id);
        if ($smb->primary_email !== $request->approver_email || 
            $smb->primary_contact_name !== $request->approver_name) {
            $smb->update([
                'primary_contact_name' => $request->approver_name,
                'primary_email' => $request->approver_email,
                'primary_phone' => $request->approver_phone ?? $smb->primary_phone,
            ]);
        }
        
        // Dispatch processing
        event(new ApprovalSubmitted($approval->id, $smb->id, $request->service_type));
        dispatch(new ProcessApproval($approval->id));
        
        return redirect()->route('approval.success', ['id' => $approval->uuid]);
    }
    
    // GET /approve/success/{uuid}
    public function showSuccess(string $uuid)
    {
        $approval = Approval::where('uuid', $uuid)->with('smb')->firstOrFail();
        
        // Get upsell offers
        $upsells = $this->getUpsellOffers($approval->service_type);
        
        // Get meeting topics
        $meetingTopic = config("fibonacco.services.{$approval->service_type}.meeting_topic");
        
        return view('approvals.success', [
            'approval' => $approval,
            'upsells' => $upsells,
            'meetingTopic' => $meetingTopic,
        ]);
    }
    
    protected function determineSourceType(string $source): string
    {
        if (str_starts_with($source, 'HOOK-') || 
            str_starts_with($source, 'EDU-') || 
            str_starts_with($source, 'HOWTO-')) {
            return 'email';
        }
        
        if (str_contains($source, '-')) {
            return 'learning_center';
        }
        
        return 'direct';
    }
    
    protected function getUpsellOffers(string $serviceType): array
    {
        $upsellMap = config('fibonacco.upsell_map', []);
        $upsellTypes = $upsellMap[$serviceType] ?? [];
        
        return collect($upsellTypes)
            ->take(3)
            ->map(function ($type) {
                $config = config("fibonacco.services.{$type}");
                return [
                    'type' => $type,
                    'name' => $config['name'] ?? $type,
                    'description' => $config['short_description'] ?? '',
                    'benefit' => $config['benefit'] ?? '',
                ];
            })
            ->toArray();
    }
}
```

### 3. Approval Processing

```php
// app/Jobs/ProcessApproval.php

class ProcessApproval implements ShouldQueue
{
    public function __construct(
        public int $approvalId
    ) {}
    
    public function handle(): void
    {
        $approval = Approval::with('smb')->findOrFail($this->approvalId);
        
        // 1. Send confirmation email
        dispatch(new SendApprovalConfirmationEmail($approval->id));
        
        // 2. Update SMB engagement
        $smb = $approval->smb;
        $smb->update([
            'last_approval' => now(),
            'total_approvals' => $smb->total_approvals + 1,
        ]);
        
        // Add to approved pending services
        $pending = $smb->services_approved_pending ?? [];
        if (!in_array($approval->service_type, $pending)) {
            $pending[] = $approval->service_type;
            $smb->update(['services_approved_pending' => $pending]);
        }
        
        // 3. Record upsell offers
        $upsells = config("fibonacco.upsell_map.{$approval->service_type}", []);
        foreach ($upsells as $upsellType) {
            ApprovalUpsell::create([
                'approval_id' => $approval->id,
                'upsell_service_type' => $upsellType,
                'offered_at' => now(),
            ]);
        }
        
        // 4. Trigger engagement score update
        event(new SMBEngagementChanged($smb->id, 'approval', [
            'service_type' => $approval->service_type,
        ]));
        
        // 5. Start provisioning if auto-provision enabled
        if (config("fibonacco.services.{$approval->service_type}.auto_provision", false)) {
            dispatch(new StartProvisioning($approval->id));
        }
    }
}
```

### 4. Upsell Handling

```php
// app/Http/Controllers/UpsellController.php

class UpsellController extends Controller
{
    // POST /approve/upsell
    public function acceptUpsell(Request $request)
    {
        $request->validate([
            'approval_id' => 'required|exists:approvals,id',
            'upsell_type' => 'required|string',
        ]);
        
        $originalApproval = Approval::with('smb')->findOrFail($request->approval_id);
        
        // Find the upsell record
        $upsell = ApprovalUpsell::where('approval_id', $request->approval_id)
            ->where('upsell_service_type', $request->upsell_type)
            ->whereNull('accepted_at')
            ->whereNull('declined_at')
            ->firstOrFail();
        
        // Create new approval for upsell
        $newApproval = Approval::create([
            'smb_id' => $originalApproval->smb_id,
            'service_type' => $request->upsell_type,
            'approver_name' => $originalApproval->approver_name,
            'approver_email' => $originalApproval->approver_email,
            'approver_phone' => $originalApproval->approver_phone,
            'source_type' => 'upsell',
            'source_id' => $originalApproval->uuid,
            'contact_consent' => true,
            'status' => 'pending',
            'approved_at' => now(),
        ]);
        
        // Update upsell record
        $upsell->update([
            'accepted' => true,
            'accepted_at' => now(),
            'resulting_approval_id' => $newApproval->id,
        ]);
        
        // Process the new approval
        event(new UpsellAccepted($newApproval->id, $originalApproval->id, $request->upsell_type));
        dispatch(new ProcessApproval($newApproval->id));
        
        return response()->json([
            'success' => true,
            'approval_id' => $newApproval->uuid,
        ]);
    }
    
    // POST /approve/upsell/decline
    public function declineUpsell(Request $request)
    {
        $request->validate([
            'approval_id' => 'required|exists:approvals,id',
            'upsell_type' => 'required|string',
        ]);
        
        ApprovalUpsell::where('approval_id', $request->approval_id)
            ->where('upsell_service_type', $request->upsell_type)
            ->update([
                'accepted' => false,
                'declined_at' => now(),
            ]);
        
        return response()->json(['success' => true]);
    }
}
```

### 5. Service Provisioning

```php
// app/Jobs/StartProvisioning.php

class StartProvisioning implements ShouldQueue
{
    public function __construct(
        public int $approvalId
    ) {}
    
    public function handle(): void
    {
        $approval = Approval::with('smb')->findOrFail($this->approvalId);
        
        // Update approval status
        $approval->update([
            'status' => 'provisioning',
            'provisioning_started_at' => now(),
        ]);
        
        // Create provisioning task
        $task = ProvisioningTask::create([
            'approval_id' => $approval->id,
            'smb_id' => $approval->smb_id,
            'service_type' => $approval->service_type,
            'status' => 'queued',
            'priority' => $this->calculatePriority($approval),
        ]);
        
        // Dispatch actual provisioning based on service type
        $provisionerClass = $this->getProvisionerClass($approval->service_type);
        dispatch(new $provisionerClass($task->id));
    }
    
    protected function calculatePriority(Approval $approval): int
    {
        // Premium tier gets higher priority (lower number)
        return $approval->smb->engagement_tier;
    }
    
    protected function getProvisionerClass(string $serviceType): string
    {
        $provisioners = [
            'appointment_booking' => ProvisionAppointmentBooking::class,
            'review_automation' => ProvisionReviewAutomation::class,
            'invoice_automation' => ProvisionInvoiceAutomation::class,
            'social_automation' => ProvisionSocialAutomation::class,
            'email_campaigns' => ProvisionEmailCampaigns::class,
            'loyalty_program' => ProvisionLoyaltyProgram::class,
            'sms_marketing' => ProvisionSMSMarketing::class,
            // ... more provisioners
        ];
        
        return $provisioners[$serviceType] ?? ProvisionGenericService::class;
    }
}

// app/Jobs/Provisioners/ProvisionAppointmentBooking.php

class ProvisionAppointmentBooking implements ShouldQueue
{
    public function __construct(
        public int $taskId
    ) {}
    
    public function handle(): void
    {
        $task = ProvisioningTask::with(['approval', 'smb'])->findOrFail($this->taskId);
        
        try {
            $task->update(['status' => 'processing', 'started_at' => now()]);
            
            $smb = $task->smb;
            
            // 1. Create calendar settings
            $calendarSettings = $this->createCalendarSettings($smb);
            
            // 2. Generate booking widget code
            $widgetCode = $this->generateBookingWidget($smb);
            
            // 3. Create default availability
            $availability = $this->createDefaultAvailability($smb);
            
            // 4. Store results
            $task->update([
                'status' => 'completed',
                'completed_at' => now(),
                'result_data' => [
                    'calendar_settings_id' => $calendarSettings->id,
                    'widget_code' => $widgetCode,
                    'availability_id' => $availability->id,
                ],
            ]);
            
            // 5. Update approval
            $task->approval->update([
                'status' => 'provisioned',
                'provisioned_at' => now(),
            ]);
            
            // 6. Update SMB services
            $activated = $smb->services_activated ?? [];
            $activated[] = 'appointment_booking';
            $pending = array_diff($smb->services_approved_pending ?? [], ['appointment_booking']);
            $smb->update([
                'services_activated' => array_unique($activated),
                'services_approved_pending' => array_values($pending),
            ]);
            
            // 7. Send completion email
            dispatch(new SendProvisioningCompleteEmail($task->id));
            
            event(new ApprovalProvisioned($task->approval_id, $smb->id, 'appointment_booking'));
            
        } catch (\Exception $e) {
            $task->update([
                'status' => 'failed',
                'failed_at' => now(),
                'failure_reason' => $e->getMessage(),
            ]);
            
            Log::error('Provisioning failed', [
                'task_id' => $task->id,
                'service_type' => $task->service_type,
                'error' => $e->getMessage(),
            ]);
        }
    }
    
    protected function createCalendarSettings(SMB $smb): object
    {
        // Create calendar settings for the SMB
        // Return the created settings object
    }
    
    protected function generateBookingWidget(SMB $smb): string
    {
        // Generate embed code for booking widget
        return "<script src='...'>...</script>";
    }
    
    protected function createDefaultAvailability(SMB $smb): object
    {
        // Create default availability (9am-5pm weekdays)
        // Return the created availability object
    }
}
```

### 6. Approval API

```php
// app/Http/Controllers/Api/V1/ApprovalController.php

class ApprovalController extends Controller
{
    // GET /api/v1/approvals
    public function index(Request $request)
    {
        return Approval::query()
            ->when($request->smb_id, fn($q, $id) => $q->where('smb_id', $id))
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->service_type, fn($q, $type) => $q->where('service_type', $type))
            ->with('smb:id,business_name')
            ->latest('approved_at')
            ->paginate();
    }
    
    // GET /api/v1/approvals/{id}
    public function show(Approval $approval)
    {
        return $approval->load(['smb', 'upsells', 'provisioningTask']);
    }
    
    // POST /api/v1/approvals/{id}/provision
    public function provision(Approval $approval)
    {
        if ($approval->status !== 'pending') {
            return response()->json(['error' => 'Approval not in pending status'], 400);
        }
        
        dispatch(new StartProvisioning($approval->id));
        
        return response()->json(['message' => 'Provisioning started']);
    }
    
    // DELETE /api/v1/approvals/{id}
    public function cancel(Approval $approval)
    {
        if ($approval->status === 'provisioned') {
            return response()->json(['error' => 'Cannot cancel provisioned approval'], 400);
        }
        
        $approval->update(['status' => 'cancelled']);
        
        return response()->json(['message' => 'Approval cancelled']);
    }
}
```

---

## API ENDPOINTS

```
# Public (no auth)
GET    /approve                              # Confirmation page
POST   /approve                              # Submit approval
GET    /approve/success/{uuid}               # Success page
POST   /approve/upsell                       # Accept upsell
POST   /approve/upsell/decline               # Decline upsell

# API (authenticated)
GET    /api/v1/approvals                     # List approvals
GET    /api/v1/approvals/{id}                # Get approval
POST   /api/v1/approvals/{id}/provision      # Trigger provisioning
DELETE /api/v1/approvals/{id}                # Cancel approval

GET    /api/v1/provisioning-tasks            # List tasks
GET    /api/v1/provisioning-tasks/{id}       # Get task
POST   /api/v1/provisioning-tasks/{id}/retry # Retry failed task
```

---

## EVENTS TO EMIT

```php
ApprovalSubmitted::class    // When approval created
ApprovalProvisioned::class  // When provisioning complete
UpsellAccepted::class       // When upsell accepted
```

---

## VIEWS TO CREATE

```
resources/views/approvals/
├── confirm.blade.php        # Confirmation form
├── success.blade.php        # Success page with upsells
├── invalid-token.blade.php  # Token error page
└── partials/
    ├── upsell-card.blade.php
    └── meeting-scheduler.blade.php
```

---

## CONFIG

```php
// config/fibonacco.php (add to services section)

'services' => [
    'appointment_booking' => [
        'name' => 'Online Appointment Booking',
        'description' => 'Let customers book appointments 24/7',
        'short_description' => 'Never miss a booking',
        'benefit' => 'Increase appointments by 30%',
        'auto_provision' => true,
        'meeting_topic' => 'Optimize your booking flow',
    ],
    'review_automation' => [
        'name' => 'Automated Review Requests',
        'description' => 'Automatically ask for reviews after service',
        'short_description' => 'Get 3x more reviews',
        'benefit' => 'Boost your online reputation',
        'auto_provision' => true,
        'meeting_topic' => 'Launch your review campaign',
    ],
    // ... more services
],

'upsell_map' => [
    'appointment_booking' => ['sms_reminders', 'calendar_sync', 'buffer_time'],
    'review_automation' => ['review_widget', 'response_templates', 'reputation_alerts'],
    'invoice_automation' => ['payment_reminders', 'late_fees', 'payment_plans'],
    // ... more mappings
],
```

---

## ACCEPTANCE CRITERIA

- [ ] Token generation and validation working
- [ ] Confirmation page rendering correctly
- [ ] Approval submission creating records
- [ ] Confirmation email sending
- [ ] Upsell offers displaying on success page
- [ ] Upsell accept/decline working
- [ ] Provisioning queue processing
- [ ] At least 3 service provisioners implemented
- [ ] Provisioning completion updating SMB services
- [ ] API endpoints working
- [ ] Unit tests: 80% coverage
- [ ] Integration tests for full approval flow
