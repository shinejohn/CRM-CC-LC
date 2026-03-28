<?php

namespace Database\Seeders;

use App\Enums\PoolType;
use App\Models\EmailClient;
use App\Models\EmailPool;
use Illuminate\Database\Seeder;

class EmailPlatformSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        EmailPool::firstOrCreate(['pool_type' => PoolType::Transactional], [
            'provider' => 'postal',
            'host' => env('POSTAL_TRANSACTIONAL_SMTP_HOST', 'postal.fibonacco.com'),
            'port' => env('POSTAL_TRANSACTIONAL_SMTP_PORT', 587),
            'api_url' => env('POSTAL_TRANSACTIONAL_API_URL', 'https://postal.fibonacco.com'),
            'api_key' => env('POSTAL_TRANSACTIONAL_API_KEY'),
            'username' => env('POSTAL_TRANSACTIONAL_SMTP_USER'),
            'password' => env('POSTAL_TRANSACTIONAL_SMTP_PASS'),
        ]);

        EmailPool::firstOrCreate(['pool_type' => PoolType::Broadcast], [
            'provider' => 'postal',
            'host' => env('POSTAL_BROADCAST_SMTP_HOST', 'postal.fibonacco.com'),
            'port' => env('POSTAL_BROADCAST_SMTP_PORT', 587),
            'api_url' => env('POSTAL_BROADCAST_API_URL', 'https://postal.fibonacco.com'),
            'api_key' => env('POSTAL_BROADCAST_API_KEY'),
            'username' => env('POSTAL_BROADCAST_SMTP_USER'),
            'password' => env('POSTAL_BROADCAST_SMTP_PASS'),
        ]);

        EmailPool::firstOrCreate(['pool_type' => PoolType::SmbCampaign], [
            'provider' => 'postal',
            'api_url' => env('POSTAL_SMB_CAMPAIGN_API_URL', 'https://postal.fibonacco.com'),
            'api_key' => env('POSTAL_SMB_CAMPAIGN_API_KEY'),
        ]);

        EmailClient::firstOrCreate(['name' => 'multisite'], [
            'api_token_hash' => hash('sha256', 'multisite-secret-token'),
            'rate_limits' => [],
        ]);

        EmailClient::firstOrCreate(['name' => 'command-center'], [
            'api_token_hash' => hash('sha256', 'command-center-secret-token'),
            'rate_limits' => [],
        ]);
    }
}
