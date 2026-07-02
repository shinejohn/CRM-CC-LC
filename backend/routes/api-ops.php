<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Ops\OpsFoaController;
use App\Http\Controllers\Api\V1\Ops\OpsIncidentController;
use App\Http\Controllers\Api\V1\Ops\OpsResourceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Ops (POD) Dashboard resource API
|--------------------------------------------------------------------------
|
| Backs the `/v1/ops/*` sub-resources consumed by
| src/services/operations/operations-api.ts. Guarded by the same stack as the
| existing ops block (auth:sanctum + MunicipalAdminMiddleware). These routes do
| NOT redefine the 9 pre-existing ops GETs (metrics, health, queues, costs,
| incidents[index], pipeline, actions, metric-definitions[index], system-status).
|
| Required from routes/api.php via `require __DIR__.'/api-ops.php';`
|
*/

Route::prefix('v1/ops')
    ->middleware(['auth:sanctum', \App\Http\Middleware\MunicipalAdminMiddleware::class])
    ->group(function () {
        // Metrics
        Route::get('/metric-definitions/{id}', [OpsResourceController::class, 'metricDefinition'])
            ->name('api.ops.metric-definitions.show');
        Route::get('/metric-snapshots', [OpsResourceController::class, 'metricSnapshots'])
            ->name('api.ops.metric-snapshots.index');
        Route::get('/metric-aggregates', [OpsResourceController::class, 'metricAggregates'])
            ->name('api.ops.metric-aggregates.index');

        // AI sessions / recommendations / context memory
        Route::get('/ai-sessions', [OpsResourceController::class, 'aiSessions'])
            ->name('api.ops.ai-sessions.index');
        Route::post('/ai-sessions', [OpsResourceController::class, 'storeAiSession'])
            ->name('api.ops.ai-sessions.store');
        Route::post('/ai-sessions/chat', [OpsFoaController::class, 'chat'])
            ->name('api.ops.ai-sessions.chat');
        Route::get('/ai-sessions/{id}', [OpsResourceController::class, 'aiSession'])
            ->name('api.ops.ai-sessions.show');

        Route::get('/ai-recommendations', [OpsResourceController::class, 'aiRecommendations'])
            ->name('api.ops.ai-recommendations.index');
        Route::get('/ai-recommendations/{id}', [OpsResourceController::class, 'aiRecommendation'])
            ->name('api.ops.ai-recommendations.show');
        Route::post('/ai-recommendations/{id}/approve', [OpsResourceController::class, 'approveRecommendation'])
            ->name('api.ops.ai-recommendations.approve');
        Route::post('/ai-recommendations/{id}/reject', [OpsResourceController::class, 'rejectRecommendation'])
            ->name('api.ops.ai-recommendations.reject');

        Route::get('/ai-context-memory', [OpsResourceController::class, 'aiContextMemory'])
            ->name('api.ops.ai-context-memory.index');

        // Infrastructure & health
        Route::get('/infrastructure-components', [OpsResourceController::class, 'infrastructureComponents'])
            ->name('api.ops.infrastructure-components.index');
        Route::get('/infrastructure-components/{id}', [OpsResourceController::class, 'infrastructureComponent'])
            ->name('api.ops.infrastructure-components.show');
        Route::get('/health-checks', [OpsResourceController::class, 'healthChecks'])
            ->name('api.ops.health-checks.index');
        Route::get('/email-ip-reputation', [OpsResourceController::class, 'emailIpReputation'])
            ->name('api.ops.email-ip-reputation.index');
        Route::get('/queue-metrics', [OpsResourceController::class, 'queueMetrics'])
            ->name('api.ops.queue-metrics.index');

        // Financial
        Route::get('/revenue-snapshots', [OpsResourceController::class, 'revenueSnapshots'])
            ->name('api.ops.revenue-snapshots.index');
        Route::get('/cost-tracking', [OpsResourceController::class, 'costTracking'])
            ->name('api.ops.cost-tracking.index');
        Route::get('/pipeline-metrics', [OpsResourceController::class, 'pipelineMetrics'])
            ->name('api.ops.pipeline-metrics.index');

        // Actions
        Route::get('/action-definitions', [OpsResourceController::class, 'actionDefinitions'])
            ->name('api.ops.action-definitions.index');
        Route::get('/action-executions', [OpsResourceController::class, 'actionExecutions'])
            ->name('api.ops.action-executions.index');

        // Alerts
        Route::get('/alert-rules', [OpsResourceController::class, 'alertRules'])
            ->name('api.ops.alert-rules.index');
        Route::get('/alerts', [OpsResourceController::class, 'alerts'])
            ->name('api.ops.alerts.index');
        Route::post('/alerts/{id}/acknowledge', [OpsResourceController::class, 'acknowledgeAlert'])
            ->name('api.ops.alerts.acknowledge');
        Route::post('/alerts/{id}/resolve', [OpsResourceController::class, 'resolveAlert'])
            ->name('api.ops.alerts.resolve');

        // Incidents (create + update only; GET index served by existing OpsController)
        Route::post('/incidents', [OpsIncidentController::class, 'store'])
            ->name('api.ops.incidents.store');
        Route::put('/incidents/{id}', [OpsIncidentController::class, 'update'])
            ->name('api.ops.incidents.update');

        // Progress
        Route::get('/development-milestones', [OpsResourceController::class, 'developmentMilestones'])
            ->name('api.ops.development-milestones.index');
        Route::get('/feature-flags', [OpsResourceController::class, 'featureFlags'])
            ->name('api.ops.feature-flags.index');

        // Dashboard aggregate
        Route::get('/dashboard/snapshot', [OpsResourceController::class, 'dashboardSnapshot'])
            ->name('api.ops.dashboard.snapshot');
    });
