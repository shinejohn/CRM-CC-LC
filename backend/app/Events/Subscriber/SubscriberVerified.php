<?php

namespace App\Events\Subscriber;

use App\Models\Subscriber\Subscriber;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SubscriberVerified
{
    use Dispatchable, SerializesModels;

    public function __construct(public Subscriber $subscriber)
    {
    }
}



