<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AIActionController;
use App\Http\Controllers\Api\AIController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\PresentationController;
use App\Http\Controllers\Api\V1\ContactController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| CRM / AI / Presentation extra routes
|--------------------------------------------------------------------------
| Backs frontend service calls that were previously stubbed with
| "// TODO: no backend route". This file is required into routes/api.php by
| the orchestrator. All routes are v1 + auth:sanctum with unique names so
| they never collide with the existing route table.
*/

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function (): void {
    // Customer Kanban pipeline-stage transition — guarded via PipelineTransitionService.
    Route::put('/customers/{id}/pipeline-stage', [CustomerController::class, 'updatePipelineStage'])
        ->name('api.customers.pipeline-stage');

    // Nested CRM sub-resources for the customer detail page (tenant-scoped reads).
    Route::get('/customers/{id}/contacts', [CustomerController::class, 'contacts'])
        ->name('api.customers.contacts');
    Route::get('/customers/{id}/deals', [CustomerController::class, 'deals'])
        ->name('api.customers.deals');
    Route::get('/customers/{id}/activities', [CustomerController::class, 'activities'])
        ->name('api.customers.activities');

    // Nested activities for a CRM contact (contact detail page).
    Route::get('/crm-contacts/{id}/activities', [ContactController::class, 'activities'])
        ->name('api.crm-contacts.activities');

    // AI: FAQ generation/persistence + batch action execution.
    Route::post('/ai/generate-faq', [AIController::class, 'generateFaq'])
        ->name('api.ai.generate-faq');
    Route::post('/ai/process-actions', [AIActionController::class, 'processBatch'])
        ->name('api.ai.process-actions');

    // Presentations index — list generated presentations for the tenant.
    Route::get('/presentations', [PresentationController::class, 'index'])
        ->name('api.presentations.index');
});
