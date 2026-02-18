<?php

namespace App\DTOs\Communication;

class MessageResult
{
    public function __construct(
        public bool $success,
        public ?string $uuid = null,
        public ?string $error = null,
        public ?string $reason = null, // suppressed, invalid, queued, etc.
    ) {}
    
    public static function queued(string $uuid): self
    {
        return new self(success: true, uuid: $uuid, reason: 'queued');
    }
    
    public static function suppressed(string $reason = 'Address is on suppression list'): self
    {
        return new self(success: false, reason: 'suppressed', error: $reason);
    }
    
    public static function invalid(string $reason): self
    {
        return new self(success: false, reason: 'invalid', error: $reason);
    }
    
    public static function failed(string $error): self
    {
        return new self(success: false, error: $error);
    }
}
