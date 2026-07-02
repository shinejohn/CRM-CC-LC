<?php

declare(strict_types=1);

use App\Http\Controllers\Api\DashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Command Center dashboard routes
|--------------------------------------------------------------------------
| Backs the frontend `useDashboard` hook: persisted per-user widget layout
| and a real cross-system recent-activity feed. Metrics stay on the existing
| /v1/crm/dashboard/analytics endpoint (untouched).
|
| This file is required into routes/api.php by the orchestrator. All routes
| are tenant/user scoped from $request->user() and carry unique
| `api.dashboard.*` names so they never collide with the existing table.
*/

Route::prefix('v1/dashboard')->middleware(['auth:sanctum'])->group(function (): void {
    // List the authenticated user's widgets (seeds defaults on first load).
    Route::get('/widgets', [DashboardController::class, 'widgets'])
        ->name('api.dashboard.widgets');

    // Bulk upsert the full widget layout for the authenticated user.
    Route::put('/widgets', [DashboardController::class, 'saveWidgets'])
        ->name('api.dashboard.widgets.save');

    // Persist position / config / visibility for a single widget.
    Route::put('/widgets/{id}', [DashboardController::class, 'updateWidget'])
        ->name('api.dashboard.widgets.update');

    // Real recent-activity feed (CRM interactions + activities, tenant-scoped).
    Route::get('/recent-activity', [DashboardController::class, 'recentActivity'])
        ->name('api.dashboard.recent-activity');
});
