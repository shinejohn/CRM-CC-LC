<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        // SMB Events
        \App\Events\SMB\SMBCreated::class => [],
        \App\Events\SMB\SMBUpdated::class => [],
        \App\Events\SMB\SMBEngagementChanged::class => [],
        \App\Events\SMB\SMBTierChanged::class => [],

        // Engagement tracking (from other modules)
        \App\Events\EmailOpened::class => [
            \App\Listeners\UpdateEngagementOnEmailOpen::class,
        ],
        \App\Events\EmailClicked::class => [
            \App\Listeners\UpdateEngagementOnEmailClick::class,
        ],
        \App\Events\RVMDelivered::class => [
            \App\Listeners\UpdateEngagementOnRVM::class,
        ],
        \App\Events\ContentViewed::class => [
            \App\Listeners\UpdateEngagementOnContentView::class,
        ],
        \App\Events\ContentCompleted::class => [
            \App\Listeners\UpdateEngagementOnContentComplete::class,
        ],
        \App\Events\ApprovalSubmitted::class => [
            \App\Listeners\UpdateEngagementOnApproval::class,
        ],
        \App\Events\CallbackReceived::class => [
            \App\Listeners\UpdateEngagementOnCallback::class,
        ],
        
        // Alert events
        \App\Events\EmailOpened::class => [
            \App\Listeners\UpdateEngagementOnEmailOpen::class,
            \App\Listeners\Alert\UpdateAlertOnMessageOpened::class,
        ],
        \App\Events\EmailClicked::class => [
            \App\Listeners\UpdateEngagementOnEmailClick::class,
            \App\Listeners\Alert\UpdateAlertOnMessageClicked::class,
        ],
        
        // Campaign automation events
        \App\Events\EmailNotOpened::class => [
            \App\Listeners\HandleEmailNotOpened::class,
        ],
        
        \App\Events\SMSReceived::class => [
            \App\Listeners\HandleSMSReceived::class,
        ],
        
        \App\Events\FormSubmitted::class => [
            // HandleFormSubmitted listener will be created in Stage 2
        ],
        
        \App\Events\EngagementThresholdReached::class => [
            \App\Listeners\AdvanceStageOnEngagementThreshold::class,
        ],
        
        \App\Events\PipelineStageChanged::class => [
            \App\Listeners\HandlePipelineStageChange::class,
        ],
        
        \App\Events\TrialAccepted::class => [
            \App\Listeners\AdvanceStageOnTrialAcceptance::class,
        ],
        
        \App\Events\VoicemailReceived::class => [
            \App\Listeners\HandleVoicemailReceived::class,
        ],
        
        \App\Events\InboundEmailReceived::class => [
            \App\Listeners\HandleInboundEmailReceived::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
