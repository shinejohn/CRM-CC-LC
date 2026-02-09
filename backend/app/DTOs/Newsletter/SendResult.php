<?php

namespace App\DTOs\Newsletter;

class SendResult
{
    public function __construct(
        public bool $success,
        public int $queued,
        public int $suppressed = 0,
        public ?string $note = null,
    ) {}

    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'queued' => $this->queued,
            'suppressed' => $this->suppressed,
            'note' => $this->note,
        ];
    }
}



