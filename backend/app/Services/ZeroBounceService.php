<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZeroBounceService
{
    /**
     * Statuses that are safe to send to.
     */
    private const SENDABLE_STATUSES = [
        'valid',
        'catch-all',
        'unknown',
    ];

    /**
     * Statuses that should be suppressed from all sending.
     */
    private const SUPPRESS_STATUSES = [
        'invalid',
        'spamtrap',
        'abuse',
        'do_not_mail',
    ];

    private string $apiKey;

    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.zerobounce.api_key');
        $this->baseUrl = config('services.zerobounce.base_url');
    }

    /**
     * Validate a single email address.
     *
     * @param  string  $email  The email address to validate.
     * @param  string|null  $ip  Optional IP address of the email owner.
     * @return array The validation result from ZeroBounce.
     */
    public function validate(string $email, ?string $ip = null): array
    {
        try {
            $params = [
                'api_key' => $this->apiKey,
                'email' => $email,
            ];

            if ($ip !== null) {
                $params['ip_address'] = $ip;
            }

            $response = Http::get("{$this->baseUrl}/validate", $params);

            return $response->json();
        } catch (\Throwable $e) {
            Log::error('ZeroBounce single validation failed', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Submit a bulk validation request via file upload.
     *
     * @param  array  $emails  List of email addresses to validate.
     * @return string The file_id for retrieving results later.
     */
    public function bulkValidate(array $emails): string
    {
        try {
            $csvContent = "email\n".implode("\n", $emails);
            $tempFile = tmpfile();
            $tempPath = stream_get_meta_data($tempFile)['uri'];
            fwrite($tempFile, $csvContent);
            rewind($tempFile);

            $response = Http::attach(
                'file',
                file_get_contents($tempPath),
                'emails.csv'
            )->post("{$this->baseUrl}/sendfile", [
                'api_key' => $this->apiKey,
                'email_address_column' => 1,
            ]);

            fclose($tempFile);

            $data = $response->json();

            return $data['file_id'];
        } catch (\Throwable $e) {
            Log::error('ZeroBounce bulk validation failed', [
                'email_count' => count($emails),
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Retrieve results for a previously submitted bulk validation.
     *
     * @param  string  $fileId  The file_id returned from bulkValidate().
     * @return array The bulk validation results.
     */
    public function getBulkResults(string $fileId): array
    {
        try {
            $response = Http::get("{$this->baseUrl}/getfile", [
                'api_key' => $this->apiKey,
                'file_id' => $fileId,
            ]);

            return $response->json();
        } catch (\Throwable $e) {
            Log::error('ZeroBounce bulk results retrieval failed', [
                'file_id' => $fileId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Check remaining API credits.
     *
     * @return int Number of credits remaining.
     */
    public function getCredits(): int
    {
        try {
            $response = Http::get("{$this->baseUrl}/getcredits", [
                'api_key' => $this->apiKey,
            ]);

            $data = $response->json();

            return (int) ($data['Credits'] ?? 0);
        } catch (\Throwable $e) {
            Log::error('ZeroBounce credits check failed', [
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Determine if an email with the given status is sendable.
     *
     * Returns true for 'valid', 'catch-all', and 'unknown'.
     * Returns false for 'invalid', 'spamtrap', 'abuse', 'do_not_mail'.
     *
     * @param  string  $status  The ZeroBounce validation status.
     * @return bool Whether the email is safe to send to.
     */
    public function isSendable(string $status): bool
    {
        $normalized = strtolower(trim($status));

        if (in_array($normalized, self::SUPPRESS_STATUSES, true)) {
            return false;
        }

        return in_array($normalized, self::SENDABLE_STATUSES, true);
    }

    /**
     * Determine if an email with the given status should be suppressed.
     *
     * Returns true for 'invalid', 'spamtrap', 'abuse', 'do_not_mail'.
     *
     * @param  string  $status  The ZeroBounce validation status.
     * @return bool Whether the email should be suppressed.
     */
    public function shouldSuppress(string $status): bool
    {
        $normalized = strtolower(trim($status));

        return in_array($normalized, self::SUPPRESS_STATUSES, true);
    }
}
