<?php

declare(strict_types=1);

namespace App\Contracts;

interface TTSProvider
{
    /**
     * Generate audio from text.
     *
     * @return string|null Raw audio bytes (MP3), or null on failure
     */
    public function generateAudio(string $text, ?string $voiceId = null): ?string;
}
