<?php

namespace App\Jobs;

use App\Services\Subscriber\ListService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RecompileSubscriberLists implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public ?int $subscriberId = null
    ) {
        $this->onQueue('default');
    }

    public function handle(ListService $listService): void
    {
        if ($this->subscriberId) {
            // Recompile lists for all communities this subscriber belongs to
            $subscriber = \App\Models\Subscriber\Subscriber::find($this->subscriberId);
            if ($subscriber) {
                foreach ($subscriber->communities as $community) {
                    $listService->compileLists($community->id);
                }
            }
        } else {
            $listService->compileAllLists();
        }
    }
}



