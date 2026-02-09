<?php

use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\UpsellController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Health check endpoint for ALB
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Root endpoint
Route::get('/', function () {
    return response()->json([
        'message' => 'Fibonacco Learning Center API',
        'version' => '1.0.0',
        'status' => 'operational',
    ]);
});

Route::get('/approve', [ApprovalController::class, 'showConfirmation'])->name('approval.confirm');
Route::post('/approve', [ApprovalController::class, 'submitApproval'])->name('approval.submit');
Route::get('/approve/success/{uuid}', [ApprovalController::class, 'showSuccess'])->name('approval.success');
Route::post('/approve/upsell', [UpsellController::class, 'acceptUpsell'])->name('approval.upsell.accept');
Route::post('/approve/upsell/decline', [UpsellController::class, 'declineUpsell'])->name('approval.upsell.decline');

// Subscriber verification route (web route for email links)
Route::get('/subscriber/verify/{token}', [\App\Http\Controllers\Api\SubscriptionController::class, 'verify'])->name('subscriber.verify');
