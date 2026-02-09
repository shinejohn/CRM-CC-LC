<?php

namespace App\Events\Newsletter;

use App\Models\Newsletter\Newsletter;
use App\Models\Newsletter\NewsletterContentItem;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewsletterClicked
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Newsletter $newsletter,
        public NewsletterContentItem $item
    ) {}
}



