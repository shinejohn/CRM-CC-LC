<?php

namespace App\DTOs\Emergency;

class CreateEmergencyRequest
{
    public function __construct(
        public string $title,
        public string $message,
        public ?string $instructions,
        public string $category,
        public string $severity,
        public array $communityIds,
        public bool $sendEmail = true,
        public bool $sendSms = true,
        public bool $sendPush = true,
        public bool $sendVoice = false,
    ) {}
}



