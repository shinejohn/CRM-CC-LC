<?php

namespace App\Events\Newsletter;

use App\Models\Newsletter\Newsletter;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewsletterCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Newsletter $newsletter
    ) {}
}



