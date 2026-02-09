<?php

return [
    'verification' => [
        'required' => true,
        'expires_hours' => 24,
    ],
    
    'defaults' => [
        'newsletter_frequency' => 'daily',
        'alerts_enabled' => true,
        'email_opted_in' => true,
        'sms_opted_in' => false,
    ],
    
    'engagement' => [
        'score_refresh_days' => 7,
        'disengaged_threshold' => 20,
        'disengaged_days' => 90,
    ],
    
    'lists' => [
        'compile_frequency' => 'daily',
        'cache_hours' => 1,
    ],
    
    'cleanup' => [
        'unverified_days' => 7,      // Delete unverified after 7 days
        'bounced_reactivate_days' => 30,  // Allow bounce reactivation after 30 days
    ],
];



