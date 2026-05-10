<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Services\ApprovalService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class StartProvisioning implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $approvalId
    ) {
    }

    public function handle(ApprovalService $approvalService): void
    {
        $approvalService->startProvisioning($this->approvalId);
    }
}



