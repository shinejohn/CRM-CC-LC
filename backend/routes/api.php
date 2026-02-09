<?php

use App\Http\Controllers\Api\ApprovalController;
use App\Http\Controllers\Api\KnowledgeController;
use App\Http\Controllers\Api\SurveyController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\PresentationController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\TrainingController;
use App\Http\Controllers\Api\TTSController;
use App\Http\Controllers\Api\AIController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ServiceCategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProvisioningTaskController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\SubscriberController;
use App\Http\Controllers\Api\AdminSubscriberController;
use App\Http\Controllers\Api\V1\ContentController;
use App\Http\Controllers\Api\V1\ContentTrackingController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\SponsorController;
use App\Http\Controllers\Api\NewsletterTemplateController;
use App\Http\Controllers\Api\NewsletterScheduleController;
use App\Http\Controllers\Api\NewsletterTrackingController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\AlertCategoryController;
use App\Http\Controllers\Api\SubscriberAlertController;
use App\Http\Controllers\Api\AlertTrackingController;
use App\Http\Controllers\Api\EmergencyBroadcastController;
use App\Http\Controllers\Api\MunicipalAdminController;
use App\Http\Controllers\Api\InteractionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::prefix('v1')->group(function () {

    // Public subscription endpoints
    Route::prefix('subscribe')->group(function () {
        Route::post('/', [SubscriptionController::class, 'register']);
        Route::get('/verify/{token}', [SubscriptionController::class, 'verify'])->name('subscriber.verify');
        Route::get('/unsubscribe/{token}', [SubscriptionController::class, 'unsubscribe']);
    });

    // Knowledge/FAQ API
    Route::prefix('knowledge')->group(function () {
        Route::get('/', [KnowledgeController::class, 'index']);
        Route::post('/', [KnowledgeController::class, 'store']);
        Route::get('/{id}', [KnowledgeController::class, 'show']);
        Route::put('/{id}', [KnowledgeController::class, 'update']);
        Route::delete('/{id}', [KnowledgeController::class, 'destroy']);
        Route::post('/{id}/generate-embedding', [KnowledgeController::class, 'generateEmbedding']);
        Route::post('/{id}/vote', [KnowledgeController::class, 'vote']);
    });

    Route::prefix('faq-categories')->group(function () {
        Route::get('/', [KnowledgeController::class, 'categories']);
        Route::post('/', [KnowledgeController::class, 'storeCategory']);
        Route::get('/{id}', [KnowledgeController::class, 'showCategory']);
        Route::put('/{id}', [KnowledgeController::class, 'updateCategory']);
        Route::delete('/{id}', [KnowledgeController::class, 'destroyCategory']);
    });

    // Survey API
    Route::prefix('survey')->group(function () {
        Route::get('/sections', [SurveyController::class, 'sections']);
        Route::post('/sections', [SurveyController::class, 'storeSection']);
        Route::get('/sections/{id}', [SurveyController::class, 'showSection']);
        Route::put('/sections/{id}', [SurveyController::class, 'updateSection']);
        Route::delete('/sections/{id}', [SurveyController::class, 'destroySection']);
        Route::get('/sections/{id}/questions', [SurveyController::class, 'questions']);
        Route::post('/questions', [SurveyController::class, 'storeQuestion']);
        Route::put('/questions/{id}', [SurveyController::class, 'updateQuestion']);
        Route::delete('/questions/{id}', [SurveyController::class, 'destroyQuestion']);
    });

    // Articles API
    Route::prefix('articles')->group(function () {
        Route::get('/', [ArticleController::class, 'index']);
        Route::post('/', [ArticleController::class, 'store']);
        Route::get('/{id}', [ArticleController::class, 'show']);
        Route::put('/{id}', [ArticleController::class, 'update']);
        Route::delete('/{id}', [ArticleController::class, 'destroy']);
    });

    // Learning Center - Content API
    Route::prefix('content')->group(function () {
        Route::get('/', [ContentController::class, 'index']);
        Route::get('/{slug}', [ContentController::class, 'show']);
        Route::get('/{slug}/personalized/{smbId}', [ContentController::class, 'personalized']);
        Route::get('/{slug}/stats', [ContentController::class, 'stats']);
        Route::get('/{slug}/article', [ContentController::class, 'article']);
        Route::get('/{slug}/article/pdf', [ContentController::class, 'downloadPdf']);

        // Content tracking endpoints
        Route::prefix('{slug}/track')->group(function () {
            Route::post('/start', [ContentTrackingController::class, 'trackStart']);
            Route::post('/slide', [ContentTrackingController::class, 'trackSlide']);
            Route::post('/complete', [ContentTrackingController::class, 'trackComplete']);
            Route::post('/approval-click', [ContentTrackingController::class, 'trackApprovalClick']);
            Route::post('/download', [ContentTrackingController::class, 'trackDownload']);
        });
    });

    // Search API
    Route::prefix('search')->group(function () {
        Route::post('/', [SearchController::class, 'search']); // Semantic/vector search
        Route::post('/fulltext', [SearchController::class, 'fullTextSearch']); // Full-text search
        Route::post('/hybrid', [SearchController::class, 'hybridSearch']); // Hybrid search
        Route::get('/status', [SearchController::class, 'embeddingStatus']);
    });

    // Presentation API
    Route::prefix('presentations')->group(function () {
        Route::get('/templates', [PresentationController::class, 'templates']);
        Route::get('/templates/{id}', [PresentationController::class, 'showTemplate']);
        Route::get('/{id}', [PresentationController::class, 'show']);
        Route::post('/generate', [PresentationController::class, 'generate']);
        Route::post('/{id}/audio', [PresentationController::class, 'generateAudio']);
    });

    // Campaign API
    Route::prefix('campaigns')->group(function () {
        Route::get('/', [CampaignController::class, 'index']);
        Route::get('/{slug}', [CampaignController::class, 'show']);
    });

    // Learning Center Contact Sales API
    Route::prefix('learning')->group(function () {
        Route::post('/contact/sales', [CampaignController::class, 'contactSales']);
    });

    // Learning Center Campaign API
    Route::prefix('learning/campaigns')->group(function () {
        Route::get('/{id}/guide', [CampaignController::class, 'guide']);
    });

    Route::middleware(['auth:sanctum'])->group(function () {
        // Campaign Generation API
        Route::prefix('campaigns')->group(function () {
            Route::post('/generate', [\App\Http\Controllers\Api\CampaignGenerationController::class, 'generate']);
            Route::get('/templates', [\App\Http\Controllers\Api\CampaignGenerationController::class, 'templates']);
            Route::post('/suggestions', [\App\Http\Controllers\Api\CampaignGenerationController::class, 'suggestions']);
        });

        // CRM API - Dashboard
        Route::prefix('crm')->group(function () {
            Route::get('/dashboard/analytics', [\App\Http\Controllers\Api\CrmDashboardController::class, 'analytics']);
            Route::get('/analytics/interest', [\App\Http\Controllers\Api\CrmAnalyticsController::class, 'interest']);
            Route::get('/analytics/purchases', [\App\Http\Controllers\Api\CrmAnalyticsController::class, 'purchases']);
            Route::get('/analytics/learning', [\App\Http\Controllers\Api\CrmAnalyticsController::class, 'learning']);
            Route::get('/analytics/campaign-performance', [\App\Http\Controllers\Api\CrmAnalyticsController::class, 'campaignPerformance']);

            // Advanced Analytics
            Route::get('/customers/{customerId}/engagement-score', [\App\Http\Controllers\Api\CrmAdvancedAnalyticsController::class, 'engagementScore']);
            Route::get('/campaigns/{campaignId}/roi', [\App\Http\Controllers\Api\CrmAdvancedAnalyticsController::class, 'campaignROI']);
            Route::get('/customers/{customerId}/predictive-score', [\App\Http\Controllers\Api\CrmAdvancedAnalyticsController::class, 'predictiveScore']);
        });

        // CRM API - Customers
        Route::prefix('customers')->group(function () {
            Route::get('/', [CustomerController::class, 'index']);
            Route::post('/', [CustomerController::class, 'store']);
            Route::get('/slug/{slug}', [CustomerController::class, 'showBySlug']);
            Route::get('/{id}', [CustomerController::class, 'show']);
            Route::put('/{id}', [CustomerController::class, 'update']);
            Route::delete('/{id}', [CustomerController::class, 'destroy']);
            Route::put('/{id}/business-context', [CustomerController::class, 'updateBusinessContext']);
            Route::get('/{id}/ai-context', [CustomerController::class, 'getAiContext']);

            // Engagement routes
            Route::get('/{id}/engagement', [CustomerController::class, 'engagementHistory']);
            Route::get('/{id}/engagement/score-history', [CustomerController::class, 'scoreHistory']);

            // Campaign management
            Route::post('/{id}/campaign/start', [CustomerController::class, 'startCampaign']);
            Route::post('/{id}/campaign/pause', [CustomerController::class, 'pauseCampaign']);
            Route::post('/{id}/campaign/resume', [CustomerController::class, 'resumeCampaign']);
        });

        // Communities API
        Route::prefix('communities')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\CommunityController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\Api\CommunityController::class, 'store']);
            Route::get('/{id}', [\App\Http\Controllers\Api\CommunityController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\Api\CommunityController::class, 'update']);
            Route::get('/{id}/smbs', [\App\Http\Controllers\Api\CommunityController::class, 'smbs']);
            Route::get('/{id}/stats', [\App\Http\Controllers\Api\CommunityController::class, 'stats']);
        });

        // Bulk operations
        Route::prefix('smbs')->group(function () {
            Route::post('/import', [\App\Http\Controllers\Api\SMBBulkController::class, 'import']);
            Route::get('/import/{jobId}/status', [\App\Http\Controllers\Api\SMBBulkController::class, 'importStatus']);
            Route::post('/bulk-update', [\App\Http\Controllers\Api\SMBBulkController::class, 'bulkUpdate']);
        });

        // CRM API - Conversations
        Route::prefix('conversations')->group(function () {
            Route::get('/', [ConversationController::class, 'index']);
            Route::post('/', [ConversationController::class, 'store']);
            Route::get('/{id}', [ConversationController::class, 'show']);
            Route::put('/{id}', [ConversationController::class, 'update']);
            Route::post('/{id}/end', [ConversationController::class, 'end']);
            Route::post('/{id}/messages', [ConversationController::class, 'addMessage']);
            Route::get('/{id}/messages', [ConversationController::class, 'messages']);
        });

        // CRM API - Interactions (Action Items/Tasks)
        Route::prefix('interactions')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\InteractionController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\Api\InteractionController::class, 'store']);
            Route::get('/{id}', [\App\Http\Controllers\Api\InteractionController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\Api\InteractionController::class, 'update']);
            Route::post('/{id}/complete', [\App\Http\Controllers\Api\InteractionController::class, 'complete']);
            Route::post('/{id}/cancel', [\App\Http\Controllers\Api\InteractionController::class, 'cancel']);
            Route::post('/workflow/start', [\App\Http\Controllers\Api\InteractionController::class, 'startWorkflow']);

            // Customer-specific endpoints
            Route::get('/customers/{customerId}/next', [\App\Http\Controllers\Api\InteractionController::class, 'getNextPending']);
            Route::get('/customers/{customerId}/pending', [\App\Http\Controllers\Api\InteractionController::class, 'getPending']);
            Route::get('/customers/{customerId}/overdue', [\App\Http\Controllers\Api\InteractionController::class, 'getOverdue']);

            // Templates
            Route::get('/templates', [\App\Http\Controllers\Api\InteractionController::class, 'templates']);
            Route::post('/templates', [\App\Http\Controllers\Api\InteractionController::class, 'createTemplate']);
        });
    });

    // Training API
    Route::prefix('training')->group(function () {
        Route::get('/', [TrainingController::class, 'index']);
        Route::get('/{id}', [TrainingController::class, 'show']);
        Route::post('/{id}/helpful', [TrainingController::class, 'markHelpful']);
        Route::post('/{id}/not-helpful', [TrainingController::class, 'markNotHelpful']);
    });

    // AI Account Manager Routes
    Route::prefix('account-manager')->group(function () {
        // Assignment
        Route::post('customers/{customer}/assign', [\App\Http\Controllers\Api\AccountManagerController::class, 'assign']);
        Route::get('customers/{customer}', [\App\Http\Controllers\Api\AccountManagerController::class, 'getForCustomer']);

        // Proactive outreach
        Route::post('customers/{customer}/outreach', [\App\Http\Controllers\Api\AccountManagerController::class, 'initiateOutreach']);

        // Dialog
        Route::post('customers/{customer}/dialog/start', [\App\Http\Controllers\Api\AccountManagerController::class, 'startDialog']);
        Route::post('dialog/{execution}/respond', [\App\Http\Controllers\Api\AccountManagerController::class, 'processResponse']);

        // Generate response
        Route::post('customers/{customer}/respond', [\App\Http\Controllers\Api\AccountManagerController::class, 'generateResponse']);

        // Personalities management
        Route::get('personalities', [\App\Http\Controllers\Api\AccountManagerController::class, 'listPersonalities']);
        Route::get('personalities/{personality}', [\App\Http\Controllers\Api\AccountManagerController::class, 'showPersonality']);
    });

    // TTS API
    Route::prefix('tts')->group(function () {
        Route::post('/generate', [TTSController::class, 'generate']);
        Route::post('/batch', [TTSController::class, 'batchGenerate']);
        Route::get('/voices', [TTSController::class, 'voices']);
    });

    // AI/OpenRouter API
    Route::prefix('ai')->group(function () {
        Route::post('/chat', [AIController::class, 'chat']);
        Route::post('/context', [AIController::class, 'getContext']);
        Route::get('/models', [AIController::class, 'models']);
    });

    // Services API
    Route::prefix('services')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\ServiceController::class, 'index']);
        Route::get('/type/{type}', [\App\Http\Controllers\Api\ServiceController::class, 'byType']);
        Route::get('/{id}', [\App\Http\Controllers\Api\ServiceController::class, 'show']);
    });

    Route::prefix('service-categories')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\ServiceCategoryController::class, 'index']);
        Route::get('/{id}', [\App\Http\Controllers\Api\ServiceCategoryController::class, 'show']);
    });

    // Orders API
    Route::prefix('orders')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\OrderController::class, 'index']);
        Route::post('/checkout', [\App\Http\Controllers\Api\OrderController::class, 'checkout']);
        Route::get('/{id}', [\App\Http\Controllers\Api\OrderController::class, 'show']);
    });

    Route::middleware(['auth:sanctum'])->group(function () {
        // Approvals API
        Route::prefix('approvals')->group(function () {
            Route::get('/', [ApprovalController::class, 'index']);
            Route::get('/{approval}', [ApprovalController::class, 'show']);
            Route::post('/{approval}/provision', [ApprovalController::class, 'provision']);
            Route::delete('/{approval}', [ApprovalController::class, 'cancel']);
        });

        // Provisioning Tasks API
        Route::prefix('provisioning-tasks')->group(function () {
            Route::get('/', [ProvisioningTaskController::class, 'index']);
            Route::get('/{provisioningTask}', [ProvisioningTaskController::class, 'show']);
            Route::post('/{provisioningTask}/retry', [ProvisioningTaskController::class, 'retry']);
        });

        // AI Personalities API
        Route::prefix('personalities')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\PersonalityController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\Api\PersonalityController::class, 'store']);
            Route::get('/assignments', [\App\Http\Controllers\Api\PersonalityController::class, 'assignments']);
            Route::post('/assign', [\App\Http\Controllers\Api\PersonalityController::class, 'assignToCustomer']);
            Route::get('/{id}', [\App\Http\Controllers\Api\PersonalityController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\Api\PersonalityController::class, 'update']);
            Route::delete('/{id}', [\App\Http\Controllers\Api\PersonalityController::class, 'destroy']);
            Route::post('/{id}/generate-response', [\App\Http\Controllers\Api\PersonalityController::class, 'generateResponse']);
            Route::get('/customers/{customerId}/personality', [\App\Http\Controllers\Api\PersonalityController::class, 'getCustomerPersonality']);
        });

        // Personality Contact API
        Route::prefix('personality-contacts')->group(function () {
            Route::post('/contact', [\App\Http\Controllers\Api\ContactController::class, 'contactCustomer']);
            Route::post('/schedule', [\App\Http\Controllers\Api\ContactController::class, 'scheduleContact']);
            Route::get('/customers/{customerId}/preferences', [\App\Http\Controllers\Api\ContactController::class, 'getPreferences']);
            Route::put('/customers/{customerId}/preferences', [\App\Http\Controllers\Api\ContactController::class, 'updatePreferences']);
        });

        // Command Center - Content Generation API
        Route::prefix('content')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\ContentGenerationController::class, 'index']);
            Route::post('/generate', [\App\Http\Controllers\Api\ContentGenerationController::class, 'generate']);
            Route::post('/generate-from-campaign', [\App\Http\Controllers\Api\ContentGenerationController::class, 'generateFromCampaign']);
            Route::get('/templates', [\App\Http\Controllers\Api\ContentGenerationController::class, 'templates']);
            Route::post('/templates', [\App\Http\Controllers\Api\ContentGenerationController::class, 'createTemplate']);
            Route::get('/{id}', [\App\Http\Controllers\Api\ContentGenerationController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\Api\ContentGenerationController::class, 'update']);
            Route::post('/{id}/status', [\App\Http\Controllers\Api\ContentGenerationController::class, 'updateStatus']);
        });

        // Command Center - Ad Generation API
        Route::prefix('ads')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\AdController::class, 'index']);
            Route::post('/generate-from-campaign', [\App\Http\Controllers\Api\AdController::class, 'generateFromCampaign']);
            Route::post('/generate-from-content', [\App\Http\Controllers\Api\AdController::class, 'generateFromContent']);
            Route::get('/templates', [\App\Http\Controllers\Api\AdController::class, 'templates']);
            Route::post('/templates', [\App\Http\Controllers\Api\AdController::class, 'createTemplate']);
            Route::get('/{id}', [\App\Http\Controllers\Api\AdController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\Api\AdController::class, 'update']);
        });

        // Command Center - Publishing API
        Route::prefix('publishing')->group(function () {
            Route::get('/dashboard', [\App\Http\Controllers\Api\PublishingController::class, 'dashboard']);
            Route::get('/calendar', [\App\Http\Controllers\Api\PublishingController::class, 'calendar']);
            Route::get('/analytics', [\App\Http\Controllers\Api\PublishingController::class, 'analytics']);
            Route::post('/content/{id}/publish', [\App\Http\Controllers\Api\PublishingController::class, 'publishContent']);
        });

        // Outbound Campaigns API
        Route::prefix('outbound')->group(function () {
            Route::prefix('campaigns')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\OutboundCampaignController::class, 'index']);
                Route::post('/', [\App\Http\Controllers\Api\OutboundCampaignController::class, 'store']);
                Route::get('/{id}', [\App\Http\Controllers\Api\OutboundCampaignController::class, 'show']);
                Route::put('/{id}', [\App\Http\Controllers\Api\OutboundCampaignController::class, 'update']);
                Route::delete('/{id}', [\App\Http\Controllers\Api\OutboundCampaignController::class, 'destroy']);
                Route::get('/{id}/recipients', [\App\Http\Controllers\Api\OutboundCampaignController::class, 'getRecipients']);
                Route::post('/{id}/start', [\App\Http\Controllers\Api\OutboundCampaignController::class, 'start']);
                Route::get('/{id}/analytics', [\App\Http\Controllers\Api\OutboundCampaignController::class, 'analytics']);
            });

            // Email Campaigns
            Route::prefix('email')->group(function () {
                Route::get('/campaigns', [\App\Http\Controllers\Api\EmailCampaignController::class, 'index']);
                Route::post('/campaigns', [\App\Http\Controllers\Api\EmailCampaignController::class, 'store']);
                Route::get('/templates', [\App\Http\Controllers\Api\EmailCampaignController::class, 'templates']);
                Route::post('/templates', [\App\Http\Controllers\Api\EmailCampaignController::class, 'createTemplate']);
            });

            // Phone Campaigns
            Route::prefix('phone')->group(function () {
                Route::get('/campaigns', [\App\Http\Controllers\Api\PhoneCampaignController::class, 'index']);
                Route::post('/campaigns', [\App\Http\Controllers\Api\PhoneCampaignController::class, 'store']);
                Route::get('/scripts', [\App\Http\Controllers\Api\PhoneCampaignController::class, 'scripts']);
                Route::post('/scripts', [\App\Http\Controllers\Api\PhoneCampaignController::class, 'createScript']);
                Route::post('/campaigns/{id}/call-status', [\App\Http\Controllers\Api\PhoneCampaignController::class, 'callStatus']);
            });

            // SMS Campaigns
            Route::prefix('sms')->group(function () {
                Route::get('/campaigns', [\App\Http\Controllers\Api\SMSCampaignController::class, 'index']);
                Route::post('/campaigns', [\App\Http\Controllers\Api\SMSCampaignController::class, 'store']);
                Route::get('/templates', [\App\Http\Controllers\Api\SMSCampaignController::class, 'templates']);
                Route::post('/templates', [\App\Http\Controllers\Api\SMSCampaignController::class, 'createTemplate']);
                Route::post('/campaigns/{id}/sms-status', [\App\Http\Controllers\Api\SMSCampaignController::class, 'smsStatus']);
            });
        });
    });

    // Authenticated subscriber endpoints
    Route::prefix('subscriber')->middleware('auth:sanctum')->group(function () {
        // Profile
        Route::get('/profile', [SubscriberController::class, 'profile']);
        Route::put('/profile', [SubscriberController::class, 'updateProfile']);

        // Preferences
        Route::get('/preferences', [SubscriberController::class, 'getPreferences'])->name('subscriber.preferences');
        Route::put('/preferences', [SubscriberController::class, 'updatePreferences']);

        // Communities
        Route::get('/communities', [SubscriberController::class, 'getCommunities']);
        Route::post('/communities/{id}', [SubscriberController::class, 'subscribeToCommunity']);
        Route::delete('/communities/{id}', [SubscriberController::class, 'unsubscribeFromCommunity']);

        // Alert preferences
        Route::get('/alerts/preferences', [SubscriberController::class, 'getAlertPreferences']);
        Route::put('/alerts/preferences', [SubscriberController::class, 'updateAlertPreferences']);

        // Device tokens (for push)
        Route::post('/devices', [SubscriberController::class, 'registerDevice']);
        Route::delete('/devices/{token}', [SubscriberController::class, 'unregisterDevice']);
    });

    // Admin endpoints
    Route::prefix('admin/subscribers')->middleware(['auth:sanctum'])->group(function () {
        Route::get('/', [AdminSubscriberController::class, 'index']);
        Route::get('/stats', [AdminSubscriberController::class, 'stats']);
        Route::get('/export', [AdminSubscriberController::class, 'export']);
        Route::get('/{id}', [AdminSubscriberController::class, 'show']);
        Route::put('/{id}/status', [AdminSubscriberController::class, 'updateStatus']);
    });

    // Newsletter API
    Route::prefix('newsletters')->middleware('auth:sanctum')->group(function () {
        // Newsletter CRUD
        Route::get('/', [NewsletterController::class, 'index']);
        Route::post('/', [NewsletterController::class, 'create']);
        Route::get('/{id}', [NewsletterController::class, 'show']);
        Route::put('/{id}', [NewsletterController::class, 'update']);
        Route::delete('/{id}', [NewsletterController::class, 'destroy']);

        // Newsletter actions
        Route::post('/{id}/build', [NewsletterController::class, 'build']);
        Route::post('/{id}/schedule', [NewsletterController::class, 'schedule']);
        Route::post('/{id}/send', [NewsletterController::class, 'send']);
        Route::post('/{id}/cancel', [NewsletterController::class, 'cancel']);

        // Preview
        Route::get('/{id}/preview', [NewsletterController::class, 'preview']);
        Route::post('/{id}/test-send', [NewsletterController::class, 'testSend']);

        // Stats
        Route::get('/{id}/stats', [NewsletterController::class, 'stats']);

        // Templates
        Route::get('/templates', [NewsletterTemplateController::class, 'index']);
        Route::get('/templates/{id}', [NewsletterTemplateController::class, 'show']);

        // Schedules
        Route::get('/schedules', [NewsletterScheduleController::class, 'index']);
        Route::put('/schedules/{communityId}', [NewsletterScheduleController::class, 'update']);
    });

    // Sponsor API
    Route::prefix('sponsors')->middleware('auth:sanctum')->group(function () {
        // Sponsor management
        Route::get('/', [SponsorController::class, 'index']);
        Route::post('/', [SponsorController::class, 'create']);
        Route::get('/{id}', [SponsorController::class, 'show']);
        Route::put('/{id}', [SponsorController::class, 'update']);

        // Sponsorships (campaigns)
        Route::get('/{id}/sponsorships', [SponsorController::class, 'sponsorships']);
        Route::post('/{id}/sponsorships', [SponsorController::class, 'createSponsorship']);

        // Performance
        Route::get('/{id}/performance', [SponsorController::class, 'performance']);
    });

    // Alert API
    Route::prefix('alerts')->middleware('auth:sanctum')->group(function () {
        // Alert CRUD
        Route::get('/', [AlertController::class, 'index']);
        Route::post('/', [AlertController::class, 'create']);
        Route::get('/{id}', [AlertController::class, 'show']);
        Route::put('/{id}', [AlertController::class, 'update']);
        Route::delete('/{id}', [AlertController::class, 'destroy']);

        // Alert workflow
        Route::post('/{id}/submit', [AlertController::class, 'submitForApproval']);
        Route::post('/{id}/approve', [AlertController::class, 'approve']);
        Route::post('/{id}/send', [AlertController::class, 'send']);
        Route::post('/{id}/cancel', [AlertController::class, 'cancel']);

        // Targeting
        Route::get('/{id}/estimate', [AlertController::class, 'estimateRecipients']);

        // Stats
        Route::get('/{id}/stats', [AlertController::class, 'stats']);

        // Categories
        Route::get('/categories', [AlertCategoryController::class, 'index']);
    });

    // Subscriber alert preferences (for subscribers to manage)
    Route::prefix('subscriber/alerts')->middleware('auth:sanctum')->group(function () {
        Route::get('/preferences', [SubscriberAlertController::class, 'getPreferences']);
        Route::put('/preferences', [SubscriberAlertController::class, 'updatePreferences']);
    });

    // Emergency Broadcast API (municipal admins only)
    Route::prefix('emergency')->middleware(['auth:sanctum', \App\Http\Middleware\MunicipalAdminMiddleware::class])->group(function () {
        // Broadcast management
        Route::get('/', [EmergencyBroadcastController::class, 'index']);
        Route::post('/', [EmergencyBroadcastController::class, 'create']);
        Route::get('/{id}', [EmergencyBroadcastController::class, 'show']);

        // Actions
        Route::post('/{id}/send', [EmergencyBroadcastController::class, 'send']);
        Route::post('/{id}/cancel', [EmergencyBroadcastController::class, 'cancel']);
        Route::post('/{id}/test', [EmergencyBroadcastController::class, 'sendTest']);

        // Real-time status
        Route::get('/{id}/status', [EmergencyBroadcastController::class, 'status']);

        // Categories
        Route::get('/categories', [EmergencyBroadcastController::class, 'categories']);

        // Audit log
        Route::get('/{id}/audit', [EmergencyBroadcastController::class, 'auditLog']);
    });

    // Municipal Admin management (super admin only)
    Route::prefix('municipal-admins')->middleware(['auth:sanctum'])->group(function () {
        Route::get('/', [MunicipalAdminController::class, 'index']);
        Route::post('/', [MunicipalAdminController::class, 'create']);
        Route::put('/{id}', [MunicipalAdminController::class, 'update']);
        Route::delete('/{id}', [MunicipalAdminController::class, 'destroy']);
        Route::post('/{id}/verify', [MunicipalAdminController::class, 'verify']);
    });
});

// Public tracking endpoints (no auth)
Route::get('/newsletter/track/open/{uuid}', [NewsletterTrackingController::class, 'open'])->name('newsletter.track.open');
Route::get('/newsletter/track/click/{uuid}/{itemId}', [NewsletterTrackingController::class, 'click'])->name('newsletter.track.click');
Route::get('/newsletter/view/{uuid}', [NewsletterController::class, 'webView'])->name('newsletter.view');
Route::get('/newsletter/unsubscribe/{community}/{token}', [NewsletterController::class, 'unsubscribe'])->name('newsletter.unsubscribe');

// Alert tracking endpoints (no auth)
Route::get('/alert/track/open/{uuid}', [AlertTrackingController::class, 'open'])->name('alert.track.open');
Route::get('/alert/track/click/{uuid}', [AlertTrackingController::class, 'click'])->name('alert.track.click');

// Webhooks (outside versioned API)
Route::prefix('webhooks')->group(function () {
    Route::post('ses', [WebhookController::class, 'ses']);
    Route::post('rvm', [WebhookController::class, 'rvm']);
    Route::post('twilio', [WebhookController::class, 'twilio']);

    // Twilio SMS webhooks
    Route::post('twilio/sms', [\App\Http\Controllers\Api\TwilioSMSWebhookController::class, 'handleIncomingSMS']);
    Route::post('twilio/sms/status', [\App\Http\Controllers\Api\TwilioSMSWebhookController::class, 'handleStatusCallback']);

    // Twilio Voicemail webhooks
    Route::post('twilio/voicemail', [\App\Http\Controllers\Api\TwilioVoicemailWebhookController::class, 'handleVoicemail']);
    Route::post('twilio/voicemail/status', [\App\Http\Controllers\Api\TwilioVoicemailWebhookController::class, 'handleStatusCallback']);

    // Postal inbound email webhook
    Route::post('postal/inbound', [WebhookController::class, 'inboundEmail']);
});

// Stripe Webhook (outside v1 prefix, no auth required)
Route::post('/stripe/webhook', [\App\Http\Controllers\Api\StripeWebhookController::class, 'handle']);

// Outbound webhooks (outside v1 prefix, no auth required for Twilio)
Route::post('/outbound/phone/campaigns/{id}/call-status', [\App\Http\Controllers\Api\PhoneCampaignController::class, 'callStatus']);
Route::post('/outbound/sms/campaigns/{id}/sms-status', [\App\Http\Controllers\Api\SMSCampaignController::class, 'smsStatus']);
Route::post('/outbound/email/postal/webhook', [\App\Http\Controllers\Api\PostalWebhookController::class, 'handle']);






