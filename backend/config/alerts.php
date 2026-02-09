<?php

return [
    'approval_required' => env('ALERTS_APPROVAL_REQUIRED', true),
    
    'defaults' => [
        'send_email' => true,
        'send_sms' => false,
        'send_push' => true,
    ],
    
    'sms' => [
        'enabled' => env('ALERTS_SMS_ENABLED', true),
        'max_length' => 160,
        'require_severity' => 'critical', // Only send SMS for critical+ by default
    ],
    
    'rate_limits' => [
        'max_per_hour' => 10,      // Max alerts per hour per community
        'max_per_day' => 50,       // Max alerts per day per community
        'subscriber_cooldown' => 300,  // Min seconds between alerts to same subscriber
    ],
];



