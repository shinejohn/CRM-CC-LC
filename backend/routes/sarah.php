<?php

use App\Http\Controllers\Api\SarahChatController;
use App\Http\Controllers\Sarah\SarahCampaignController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Sarah Campaign Builder Routes
|--------------------------------------------------------------------------
|
| Endpoints for the Sarah AI Campaign Builder.
| Public routes handle session creation and intake from "Advertise" CTAs.
| Authenticated routes handle checkout, campaign management, and CC dashboard.
|
*/

Route::prefix('sarah')->name('api.sarah.')->group(function (): void {

    // ── AI Chat endpoint (public, rate-limited per IP) ──
    Route::post('/chat', [SarahChatController::class, 'chat'])
        ->middleware('throttle:10,1')
        ->name('chat');

    // ── Public endpoints (guest-accessible from Advertise CTAs) ──
    Route::post('/sessions', [SarahCampaignController::class, 'createSession'])->name('sessions.create');
    Route::get('/sessions/{id}', [SarahCampaignController::class, 'showSession'])->name('sessions.show');
    Route::post('/sessions/{id}/identify', [SarahCampaignController::class, 'identifyBusiness'])->name('sessions.identify');
    Route::post('/sessions/{id}/intake', [SarahCampaignController::class, 'recordIntake'])->name('sessions.intake');
    Route::post('/sessions/{id}/proposal', [SarahCampaignController::class, 'generateProposal'])->name('sessions.proposal');
    Route::post('/sessions/{id}/validate', [SarahCampaignController::class, 'validateSelection'])->name('sessions.validate');
    Route::get('/sessions/{id}/messages', [SarahCampaignController::class, 'messages'])->name('sessions.messages');
    Route::post('/sessions/{id}/message', [SarahCampaignController::class, 'sendMessage'])->name('sessions.message');
    Route::post('/sessions/{id}/create-campaign', [SarahCampaignController::class, 'createCampaign'])->name('sessions.create-campaign');

    // ── Authenticated endpoints ──
    Route::middleware('auth:sanctum')->group(function (): void {

        // Checkout
        Route::post('/campaigns/{id}/checkout', [SarahCampaignController::class, 'checkout'])->name('campaigns.checkout');
        Route::post('/campaigns/{id}/confirm-payment', [SarahCampaignController::class, 'confirmPayment'])->name('campaigns.confirm');

        // CC operator dashboard
        Route::get('/dashboard', [SarahCampaignController::class, 'dashboard'])->name('dashboard');
        Route::get('/sessions', [SarahCampaignController::class, 'listSessions'])->name('sessions.list');
        Route::get('/campaigns', [SarahCampaignController::class, 'listCampaigns'])->name('campaigns.list');
        Route::get('/campaigns/{id}', [SarahCampaignController::class, 'showCampaign'])->name('campaigns.show');

        // Message actions
        Route::post('/messages/{id}/action', [SarahCampaignController::class, 'actionMessage'])->name('messages.action');
    });
});
