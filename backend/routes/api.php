<?php

use App\Http\Controllers\Api\KnowledgeController;
use App\Http\Controllers\Api\SurveyController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\PresentationController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ConversationController;
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
        Route::get('/sections/{id}', [SurveyController::class, 'showSection']);
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
        Route::post('/', [SearchController::class, 'search']);
        Route::get('/status', [SearchController::class, 'embeddingStatus']);
    });
    
    // Presentation API
    Route::prefix('presentations')->group(function () {
        Route::get('/templates', [PresentationController::class, 'templates']);
        Route::get('/{id}', [PresentationController::class, 'show']);
        Route::post('/generate', [PresentationController::class, 'generate']);
    });
    
    // Campaign API
    Route::prefix('campaigns')->group(function () {
        Route::get('/', [CampaignController::class, 'index']);
        Route::get('/{slug}', [CampaignController::class, 'show']);
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
});






