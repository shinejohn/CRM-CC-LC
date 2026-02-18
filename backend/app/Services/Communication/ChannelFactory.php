<?php

namespace App\Services\Communication;

use App\Contracts\Communication\ChannelInterface;
use App\Services\Communication\Channels\EmailChannel;
use App\Services\Communication\Channels\SmsChannel;
use App\Services\Communication\Channels\PushChannel;
use InvalidArgumentException;

class ChannelFactory
{
    public function __construct(
        private EmailChannel $emailChannel,
        private SmsChannel $smsChannel,
        private PushChannel $pushChannel,
    ) {}
    
    public function get(string $channel, ?string $gateway = null): ChannelInterface
    {
        return match ($channel) {
            'email' => $this->emailChannel->setGateway($gateway ?? 'postal'),
            'sms' => $this->smsChannel->setGateway($gateway ?? 'twilio'),
            'push' => $this->pushChannel->setGateway($gateway ?? 'firebase'),
            default => throw new InvalidArgumentException("Unknown channel: {$channel}"),
        };
    }
}
