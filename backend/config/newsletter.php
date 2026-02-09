<?php

return [
    'defaults' => [
        'daily_send_time' => '06:00:00',
        'weekly_send_day' => 0,  // Sunday
        'weekly_send_time' => '08:00:00',
        'timezone' => 'America/New_York',
    ],
    
    'ab_testing' => [
        'enabled' => true,
        'default_percentage' => 10,
        'minimum_test_size' => 100,
        'decision_delay_hours' => 2,
        'winner_metric' => 'open_rate',  // open_rate, click_rate
    ],
    
    'content' => [
        'max_top_stories' => 5,
        'max_local_news' => 8,
        'max_events' => 5,
        'story_age_hours' => 48,
    ],
    
    'sponsors' => [
        'header_enabled' => true,
        'mid_content_enabled' => true,
        'footer_enabled' => true,
    ],
];



