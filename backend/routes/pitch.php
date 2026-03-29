<?php

use App\Http\Controllers\Pitch\BusinessSearchController;
use App\Http\Controllers\Pitch\CheckoutController;
use App\Http\Controllers\Pitch\CommunityController as PitchCommunityController;
use App\Http\Controllers\Pitch\PitchSessionController;
use App\Http\Controllers\Pitch\SlotInventoryController;
use Illuminate\Support\Facades\Route;

Route::prefix('pitch')->name('api.pitch.')->group(function (): void {
    Route::post('/sessions', [PitchSessionController::class, 'store'])->name('sessions.store');
    Route::get('/sessions/{id}', [PitchSessionController::class, 'show'])->name('sessions.show');
    Route::patch('/sessions/{id}', [PitchSessionController::class, 'update'])->name('sessions.update');
    Route::post('/sessions/{id}/event', [PitchSessionController::class, 'event'])->name('sessions.event');
    Route::get('/sessions/{id}/resume', [PitchSessionController::class, 'resume'])->name('sessions.resume');

    Route::get('/businesses/search', [BusinessSearchController::class, 'search'])->name('businesses.search');
    Route::post('/businesses', [BusinessSearchController::class, 'store'])->name('businesses.store');
    Route::post('/businesses/{id}/claim', [BusinessSearchController::class, 'claim'])->name('businesses.claim');

    Route::get('/communities/{slug}', [PitchCommunityController::class, 'showBySlug'])->name('communities.show');
    Route::get('/communities/nearby', [PitchCommunityController::class, 'nearby'])->name('communities.nearby');

    Route::get('/slots/{communityId}/{slotType}/{category}', [SlotInventoryController::class, 'show'])->name('slots.show');
    Route::post('/slots/batch', [SlotInventoryController::class, 'batch'])->name('slots.batch');

    /** Public proposal build for anonymous /advertise flow */
    Route::post('/sessions/{id}/proposal', [PitchSessionController::class, 'proposal'])->name('sessions.proposal');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/slots/{id}/claim', [SlotInventoryController::class, 'claim'])->name('slots.claim');
        Route::post('/sessions/{id}/checkout', [CheckoutController::class, 'createPaymentIntent'])->name('sessions.checkout');
        Route::post('/sessions/{id}/confirm-payment', [CheckoutController::class, 'confirmPayment'])->name('sessions.confirm');
    });
});
