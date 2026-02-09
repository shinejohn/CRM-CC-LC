<?php

namespace App\Jobs;

use App\Models\Subscriber\EmailVerification;
use App\Models\Subscriber\UnsubscribeToken;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CleanupExpiredTokens implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct()
    {
        $this->onQueue('default');
    }

    public function handle(): void
    {
        // Delete expired verification tokens
        EmailVerification::where('expires_at', '<', now())
            ->whereNull('verified_at')
            ->delete();
        
        // Delete old used unsubscribe tokens (older than 30 days)
        UnsubscribeToken::whereNotNull('used_at')
            ->where('used_at', '<', now()->subDays(30))
            ->delete();
    }
}



