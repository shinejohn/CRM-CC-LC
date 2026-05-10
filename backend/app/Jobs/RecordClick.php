<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\ClickTracking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class RecordClick implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 10;

    public function __construct(
        private array $data
    ) {}

    public function handle(): void
    {
        ClickTracking::create([
            'content_card_id' => $this->data['content_card_id'] ?? null,
            'asset_id' => $this->data['asset_id'] ?? null,
            'partner_id' => $this->data['partner_id'] ?? null,
            'smb_id' => $this->data['smb_id'] ?? null,
            'community_id' => $this->data['community_id'] ?? null,
            'source' => $this->data['source'] ?? 'unknown',
            'utm_params' => $this->data['utm_params'] ?? [],
            'ip_address' => $this->data['ip_address'] ?? null,
            'user_agent' => $this->data['user_agent'] ?? null,
            'clicked_at' => now(),
        ]);
    }
}
