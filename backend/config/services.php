<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
    ],

    'elevenlabs' => [
        'api_key' => env('ELEVENLABS_API_KEY'),
        'default_voice_id' => env('ELEVENLABS_DEFAULT_VOICE_ID', '21m00Tcm4TlvDq8ikWAM'),
    ],

    'anthropic' => [
        'api_key' => env('ANTHROPIC_API_KEY'),
    ],

    'openrouter' => [
        'api_key' => env('OPENROUTER_API_KEY'),
    ],

    'ai_gateway' => [
        'url' => env('AI_GATEWAY_URL', 'https://ai-gateway.fibonacco.com'),
        'token' => env('AI_GATEWAY_TOKEN'),
        'timeout' => (int) env('AI_GATEWAY_TIMEOUT', 120),
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'prices' => [
            'community-influencer' => env('STRIPE_PRICE_COMMUNITY_INFLUENCER'),
            'community-expert' => env('STRIPE_PRICE_COMMUNITY_EXPERT'),
            'community-sponsor' => env('STRIPE_PRICE_COMMUNITY_SPONSOR'),
            'community-reporter' => env('STRIPE_PRICE_COMMUNITY_REPORTER'),
        ],
    ],

    'sendgrid' => [
        'api_key' => env('SENDGRID_API_KEY'),
    ],

    'postal' => [
        'api_url' => env('POSTAL_API_URL'),
        'server_key' => env('POSTAL_SERVER_KEY'),
        'webhook_secret' => env('POSTAL_WEBHOOK_SECRET'),
        'webhook_signing_key' => env('POSTAL_WEBHOOK_SIGNING_KEY'),
        'default_ip_pool' => env('POSTAL_DEFAULT_IP_POOL'),
    ],

    'email_gateway' => [
        'provider' => env('EMAIL_PROVIDER', 'postal'),
        'fallback_provider' => env('EMAIL_FALLBACK_PROVIDER', 'ses'),
    ],

    'zerobounce' => [
        'api_key' => env('ZEROBOUNCE_API_KEY'),
        'base_url' => env('ZEROBOUNCE_BASE_URL', 'https://api.zerobounce.net/v2'),
    ],

    'twilio' => [
        'account_sid' => env('TWILIO_ACCOUNT_SID'),
        'auth_token' => env('TWILIO_AUTH_TOKEN'),
        'from_phone' => env('TWILIO_FROM_PHONE'),
    ],

    'publishing_bridge' => [
        'api_key' => env('PUBLISHING_BRIDGE_API_KEY'),
        'base_url' => rtrim((string) env('PUBLISHING_BRIDGE_BASE_URL', ''), '/'),
    ],

    'publishing_platform' => [
        'url' => rtrim((string) env('PUBLISHING_PLATFORM_URL', ''), '/'),
        'secret' => env('PUBLISHING_PLATFORM_SECRET', ''),
    ],

];
