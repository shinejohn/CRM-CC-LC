<?php

declare(strict_types=1);

namespace App\Services\Sarah;

use App\Models\SarahCommonResponse;
use Illuminate\Support\Facades\Log;

final class SarahCommonResponseService
{
    /**
     * Try to match a user message to a pre-recorded common response.
     *
     * @return array{response: string, audio_url: string|null, intent_key: string}|null
     */
    public function match(string $message): ?array
    {
        try {
            $responses = SarahCommonResponse::where('is_active', true)
                ->where('always_ai', false)
                ->orderBy('priority')
                ->get();
        } catch (\Throwable) {
            return null;
        }

        $normalized = mb_strtolower(trim($message));

        foreach ($responses as $response) {
            $triggers = $response->trigger_phrases ?? [];

            foreach ($triggers as $phrase) {
                if (str_contains($normalized, mb_strtolower($phrase))) {
                    $response->increment('match_count');

                    return [
                        'response' => $response->response_text,
                        'audio_url' => $response->audio_url,
                        'intent_key' => $response->intent_key,
                    ];
                }
            }
        }

        return null;
    }
}
