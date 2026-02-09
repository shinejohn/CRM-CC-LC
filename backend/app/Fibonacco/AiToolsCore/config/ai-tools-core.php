<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Platform Identifier
    |--------------------------------------------------------------------------
    */
    'platform' => env('AI_TOOLS_PLATFORM', 'fibonacco'),

    /*
    |--------------------------------------------------------------------------
    | Default AI Model
    |--------------------------------------------------------------------------
    */
    'default_model' => [
        env('AI_TOOLS_PROVIDER', 'openrouter'),
        // 'model' => env('AI_TOOLS_MODEL', 'anthropic/claude-3-sonnet'), // Optional param for custom SDKs
    ],

    /*
    |--------------------------------------------------------------------------
    | Database Tables Configuration
    |--------------------------------------------------------------------------
    */
    'tables' => [
        'allowed' => [],
        'writable' => [],
        'excluded_columns' => [
            'password',
            'remember_token',
            'api_token',
            'stripe_id',
            'two_factor_secret',
        ],
        'searchable' => [],
    ],

    'logging' => [
        'enabled' => env('AI_TOOLS_LOGGING', true),
        'channel' => env('AI_TOOLS_LOG_CHANNEL', 'stack'),
    ],
];
