<?php

declare(strict_types=1);

namespace App\Services\Email;

use App\Models\EmailClient;
use App\Models\EmailSuppression;

final class SuppressionService
{
    /**
     * Check if an email is suppressed globally or for a specific client.
     */
    public function isSuppressed(string $email, ?EmailClient $client = null): bool
    {
        // Check global suppressions
        if (EmailSuppression::where('email_address', $email)->whereNull('email_client_id')->exists()) {
            return true;
        }

        // Check client-specific suppressions
        if ($client) {
            return EmailSuppression::where('email_address', $email)
                ->where('email_client_id', $client->id)
                ->exists();
        }

        return false;
    }

    /**
     * Add an address to the suppression list.
     */
    public function addSuppression(string $email, string $reason, string $source, ?EmailClient $client = null): EmailSuppression
    {
        return EmailSuppression::updateOrCreate(
            [
                'email_address' => $email,
                'email_client_id' => $client?->id,
            ],
            [
                'reason' => $reason,
                'source' => $source,
            ]
        );
    }

    /**
     * Remove an address from the suppression list.
     */
    public function removeSuppression(string $email, ?EmailClient $client = null): void
    {
        EmailSuppression::where('email_address', $email)
            ->where('email_client_id', $client?->id)
            ->delete();
    }
}
