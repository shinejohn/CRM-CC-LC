<?php

declare(strict_types=1);

use App\Http\Controllers\Api\TrainingDatasetController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| AI Training-Data Subsystem Routes
|--------------------------------------------------------------------------
|
| Real persistence + workflow layer consumed by
| src/services/learning/training-api.ts. Paths match that client EXACTLY.
|
| NOTE ON PREFIX: the client hits three different top-level segments —
| /v1/training/*, /v1/validation/* and /v1/agents/* — so these are grouped
| under a shared prefix('v1') rather than prefix('v1/training'). This does
| NOT collide with the existing knowledge TrainingController routes in
| routes/api.php (/v1/training, /v1/training/{id}, .../helpful, .../not-helpful):
| every literal below (datasets, validation, agents) is distinct from those,
| and literal segments are declared before any {id} route so nothing is
| shadowed.
|
*/

Route::prefix('v1')->middleware('auth:sanctum')->group(function (): void {
    // ---- Datasets ----------------------------------------------------
    Route::get('training/datasets', [TrainingDatasetController::class, 'index'])
        ->name('api.training.datasets.index');
    Route::post('training/datasets', [TrainingDatasetController::class, 'store'])
        ->name('api.training.datasets.store');

    // Validation queue — declared BEFORE datasets/{id} so the literal
    // "validation" segment can never be captured as an {id}.
    Route::get('training/validation/queue', [TrainingDatasetController::class, 'validationQueue'])
        ->name('api.training.validation.queue');

    Route::get('training/datasets/{id}', [TrainingDatasetController::class, 'show'])
        ->name('api.training.datasets.show');
    Route::put('training/datasets/{id}', [TrainingDatasetController::class, 'update'])
        ->name('api.training.datasets.update');
    Route::delete('training/datasets/{id}', [TrainingDatasetController::class, 'destroy'])
        ->name('api.training.datasets.destroy');
    Route::post('training/datasets/{id}/train', [TrainingDatasetController::class, 'train'])
        ->name('api.training.datasets.train');
    Route::post('training/datasets/{id}/examples', [TrainingDatasetController::class, 'addExample'])
        ->name('api.training.datasets.examples.store');

    // ---- Validation actions (client uses /v1/validation/{id}/*) -------
    Route::post('validation/{id}/approve', [TrainingDatasetController::class, 'approve'])
        ->name('api.training.validation.approve');
    Route::post('validation/{id}/reject', [TrainingDatasetController::class, 'reject'])
        ->name('api.training.validation.reject');
    Route::post('validation/{id}/merge', [TrainingDatasetController::class, 'merge'])
        ->name('api.training.validation.merge');

    // ---- Agent knowledge config + test query -------------------------
    Route::get('agents/{agentId}/knowledge-config', [TrainingDatasetController::class, 'agentKnowledgeConfig'])
        ->name('api.training.agents.knowledge-config.show');
    Route::put('agents/{agentId}/knowledge-config', [TrainingDatasetController::class, 'updateAgentKnowledgeConfig'])
        ->name('api.training.agents.knowledge-config.update');
    Route::post('agents/{agentId}/test-query', [TrainingDatasetController::class, 'testQuery'])
        ->name('api.training.agents.test-query');
});
