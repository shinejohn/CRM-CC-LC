<?php

namespace App\Enums;

enum EmailStatus: string
{
    case Pending = 'pending';
    case Sent = 'sent';
    case Delivered = 'delivered';
    case Bounced = 'bounced';
    case Complained = 'complained';
    case Failed = 'failed';
    case Suppressed = 'suppressed';
    case Held = 'held';
}
