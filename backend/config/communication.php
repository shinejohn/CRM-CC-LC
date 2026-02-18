<?php

return [
    'channels' => [
        'email' => [
            'enabled' => env('EMAIL_ENABLED', true),
            'default_gateway' => env('EMAIL_DEFAULT_GATEWAY', 'postal'),
            'failover_gateway' => env('EMAIL_FAILOVER_GATEWAY', 'ses'),
        ],
        'sms' => [
            'enabled' => env('SMS_ENABLED', true),
            'default_gateway' => env('SMS_DEFAULT_GATEWAY', 'twilio'),
        ],
        'push' => [
            'enabled' => env('PUSH_ENABLED', true),
            'default_gateway' => 'firebase',
        ],
    ],
    
    'priorities' => [
        'P0' => [
            'name' => 'Emergency',
            'max_age_seconds' => 300,      // Must send within 5 minutes
            'retry_attempts' => 5,
            'queue' => 'messages-p0',
        ],
        'P1' => [
            'name' => 'Alerts',
            'max_age_seconds' => 900,      // 15 minutes
            'retry_attempts' => 3,
            'queue' => 'messages-p1',
        ],
        'P2' => [
            'name' => 'Newsletters',
            'max_age_seconds' => 3600,     // 1 hour
            'retry_attempts' => 3,
            'queue' => 'messages-p2',
        ],
        'P3' => [
            'name' => 'Campaigns',
            'max_age_seconds' => 86400,    // 24 hours
            'retry_attempts' => 3,
            'queue' => 'messages-p3',
        ],
        'P4' => [
            'name' => 'Transactional',
            'max_age_seconds' => 3600,
            'retry_attempts' => 5,
            'queue' => 'messages-p4',
        ],
    ],
    
    'rate_limiting' => [
        'enabled' => env('RATE_LIMITING_ENABLED', true),
        'redis_prefix' => 'comm:rate:',
    ],
    
    'suppression' => [
        'hard_bounce_permanent' => true,
        'soft_bounce_threshold' => 3,      // Suppress after 3 soft bounces
        'complaint_permanent' => true,
    ],
];
