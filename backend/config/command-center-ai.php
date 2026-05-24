<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | AI Model Configuration
    |--------------------------------------------------------------------------
    |
    | Model identifiers for each use case. Embeddings stay with OpenAIService.
    | All other AI calls go through PrismAiService via the Anthropic SDK.
    |
    */
    'ai_models' => [
        'chat'       => 'claude-sonnet-4-5-20251001',
        'actions'    => 'claude-sonnet-4-5-20251001',
        'analysis'   => 'claude-haiku-4-5-20251001',
        'embeddings' => 'text-embedding-3-small', // stays with OpenAIService
    ],

    /*
    |--------------------------------------------------------------------------
    | Client Timeout
    |--------------------------------------------------------------------------
    */
    'client_timeout' => 240, // 4 minutes
];
