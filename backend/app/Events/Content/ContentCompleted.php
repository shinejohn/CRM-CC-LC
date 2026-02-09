<?php

namespace App\Events\Content;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ContentCompleted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public int $viewId,
        public int $smbId,
        public string $contentSlug
    ) {
    }
}



