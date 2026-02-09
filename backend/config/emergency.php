<?php

return [
    'authorization' => [
        'pin_required' => true,
        'pin_length' => 6,
        'max_failed_attempts' => 3,
        'lockout_minutes' => 30,
    ],
    
    'channels' => [
        'email' => [
            'enabled' => true,
            'ip_pool' => 'emergency',
        ],
        'sms' => [
            'enabled' => true,
            'max_length' => 160,
        ],
        'push' => [
            'enabled' => true,
            'sound' => 'emergency.wav',
            'priority' => 'high',
        ],
        'voice' => [
            'enabled' => env('EMERGENCY_VOICE_ENABLED', false),
            'message_max_seconds' => 30,
        ],
    ],
    
    'rate_limits' => [
        'max_per_hour' => 5, // Prevent accidental spam
        'cooldown_minutes' => 5, // Between broadcasts
    ],
    
    'ipaws' => [
        'enabled' => env('IPAWS_ENABLED', false),
        'cog_id' => env('IPAWS_COG_ID'),
        'endpoint' => env('IPAWS_ENDPOINT'),
    ],
];



