<?php

namespace App\Providers;

use App\Contracts\ApprovalServiceInterface;
use App\Services\ApprovalService;
use App\Contracts\LearningCenterServiceInterface;
use App\Services\LearningCenterService;
use App\Contracts\Subscriber\SubscriberServiceInterface;
use App\Contracts\Subscriber\ListServiceInterface;
use App\Services\Subscriber\SubscriberService;
use App\Services\Subscriber\ListService;
use App\Contracts\Newsletter\NewsletterServiceInterface;
use App\Contracts\Newsletter\SponsorServiceInterface;
use App\Services\Newsletter\NewsletterService;
use App\Services\Newsletter\SponsorService;
use App\Services\Newsletter\ContentAggregator;
use App\Services\Newsletter\NewsletterBuilder;
use App\Services\Newsletter\MessageServiceAdapter;
use App\Services\EmailService;
use App\Contracts\Emergency\EmergencyBroadcastServiceInterface;
use App\Services\Emergency\EmergencyBroadcastService;
use App\Contracts\CampaignOrchestratorInterface;
use App\Services\CampaignOrchestratorService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ApprovalServiceInterface::class, ApprovalService::class);
        $this->app->bind(LearningCenterServiceInterface::class, LearningCenterService::class);
        $this->app->bind(\App\Contracts\SMBServiceInterface::class, \App\Services\SMBService::class);
        $this->app->bind(SubscriberServiceInterface::class, SubscriberService::class);
        $this->app->bind(ListServiceInterface::class, ListService::class);
        $this->app->bind(\App\Contracts\Alert\AlertServiceInterface::class, \App\Services\Alert\AlertService::class);
        $this->app->bind(EmergencyBroadcastServiceInterface::class, EmergencyBroadcastService::class);
        
        // Campaign Orchestrator service
        $this->app->bind(CampaignOrchestratorInterface::class, CampaignOrchestratorService::class);
        
        // Newsletter services
        $this->app->bind(SponsorServiceInterface::class, SponsorService::class);
        $this->app->singleton(MessageServiceAdapter::class, function ($app) {
            return new MessageServiceAdapter($app->make(EmailService::class));
        });
        $this->app->bind(NewsletterServiceInterface::class, function ($app) {
            return new NewsletterService(
                $app->make(ContentAggregator::class),
                $app->make(SponsorServiceInterface::class),
                $app->make(NewsletterBuilder::class),
                $app->make(MessageServiceAdapter::class)
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
        $this->registerPolicies();
    }

    /**
     * Configure rate limiting for the application.
     */
    protected function configureRateLimiting(): void
    {
        // General API rate limit: 60 requests per minute
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Authentication endpoints: 10 requests per minute (stricter for brute force protection)
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        // AI endpoints: 30 requests per minute (resource intensive)
        RateLimiter::for('ai', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        });
    }

    /**
     * Register authorization policies.
     */
    protected function registerPolicies(): void
    {
        \Illuminate\Support\Facades\Gate::policy(\App\Models\Customer::class, \App\Policies\CustomerPolicy::class);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\Conversation::class, \App\Policies\ConversationPolicy::class);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\Interaction::class, \App\Policies\InteractionPolicy::class);
    }
}

