<?php

declare(strict_types=1);

use App\Http\Controllers\Api\ContactHealthController;
use App\Http\Controllers\Api\EmailHealthController;
use App\Http\Controllers\Api\InboundInboxController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Email Health / Contact Health / Inbound Inbox API
|--------------------------------------------------------------------------
|
| Backs the CC Email Health, Contact Health, and Inbound Inbox pages.
| These live under /v1/email/{health,contacts,inbound} and are Sanctum-auth
| CC admin endpoints — deliberately distinct from the existing /v1/email
| service group (send/batch/metrics/suppressions/senders/webhook) which uses
| the AuthenticateEmailClient middleware.
|
| Wire-up: require this file at the TOP LEVEL of routes/api.php (NOT inside the
| existing `Route::prefix('v1')` group — this file already prefixes `v1/email`).
|
|     require __DIR__.'/api-email-health.php';
|
*/

Route::prefix('v1/email')->middleware('auth:sanctum')->group(function () {
    // ── Email Health Dashboard ──
    Route::get('/health/stats', [EmailHealthController::class, 'stats'])
        ->name('api.email.health.stats');
    Route::get('/health/events', [EmailHealthController::class, 'events'])
        ->name('api.email.health.events');

    // ── Contact Health (ZeroBounce list hygiene) ──
    Route::get('/contacts/health', [ContactHealthController::class, 'health'])
        ->name('api.email.contacts.health');
    Route::post('/contacts/revalidate', [ContactHealthController::class, 'revalidate'])
        ->name('api.email.contacts.revalidate');

    // ── Inbound Inbox (AI triage) ──
    Route::get('/inbound', [InboundInboxController::class, 'index'])
        ->name('api.email.inbound.index');
    Route::get('/inbound/{id}', [InboundInboxController::class, 'show'])
        ->name('api.email.inbound.show');
    Route::post('/inbound/{id}/status', [InboundInboxController::class, 'updateStatus'])
        ->name('api.email.inbound.status');
    Route::post('/inbound/{id}/override', [InboundInboxController::class, 'override'])
        ->name('api.email.inbound.override');
    Route::post('/inbound/{id}/escalate', [InboundInboxController::class, 'escalate'])
        ->name('api.email.inbound.escalate');
});
