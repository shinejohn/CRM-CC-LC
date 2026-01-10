<?php

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
    
    // Training API
    Route::prefix('training')->group(function () {
        Route::get('/', [TrainingController::class, 'index']);
        Route::get('/{id}', [TrainingController::class, 'show']);
        Route::post('/{id}/helpful', [TrainingController::class, 'markHelpful']);
        Route::post('/{id}/not-helpful', [TrainingController::class, 'markNotHelpful']);
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

// Stripe Webhook (outside v1 prefix, no auth required)
Route::post('/stripe/webhook', [\App\Http\Controllers\Api\StripeWebhookController::class, 'handle']);

// Outbound webhooks (outside v1 prefix, no auth required for Twilio)
Route::post('/outbound/phone/campaigns/{id}/call-status', [\App\Http\Controllers\Api\PhoneCampaignController::class, 'callStatus']);
Route::post('/outbound/sms/campaigns/{id}/sms-status', [\App\Http\Controllers\Api\SMSCampaignController::class, 'smsStatus']);






