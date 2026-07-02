<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ReScrubStaleContactsJob;
use App\Models\Customer;
use App\Services\ZeroBounceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

/**
 * Contact list hygiene dashboard (ZeroBounce) for the CC Contact Health page.
 *
 * Aggregates the ZeroBounce validation state stored on the `customers` table
 * (zb_status / zb_checked_at / email_suppressed) into validation buckets and
 * exposes a manual re-validation trigger that dispatches the real scrub job.
 */
final class ContactHealthController extends Controller
{
    /**
     * GET /v1/email/contacts/health
     *
     * Single-scan conditional aggregate over `customers` → validation buckets.
     * Uses portable CASE-WHEN sums (works on PostgreSQL / MySQL / SQLite).
     */
    public function health(ZeroBounceService $zeroBounce): JsonResponse
    {
        /** @var object $row */
        $row = Customer::query()
            ->selectRaw(<<<'SQL'
                count(*) as total_contacts,
                sum(case when email is not null and email <> '' then 1 else 0 end) as with_email,
                sum(case when zb_checked_at is not null then 1 else 0 end) as validated_count,
                sum(case when zb_status = 'valid' then 1 else 0 end) as valid_count,
                sum(case when zb_status = 'invalid' then 1 else 0 end) as invalid_count,
                sum(case when zb_status in ('catch-all', 'catch_all') then 1 else 0 end) as catch_all_count,
                sum(case when zb_status = 'unknown' then 1 else 0 end) as unknown_count,
                sum(case when email_suppressed = true then 1 else 0 end) as suppressed_count,
                max(zb_checked_at) as last_scrub_at
            SQL)
            ->first();

        $withEmail = (int) ($row->with_email ?? 0);
        $suppressed = (int) ($row->suppressed_count ?? 0);
        // Contactable universe = rows that carry an email address.
        $base = max($withEmail, 1);

        // ZeroBounce credits require a live API call; never let it fail the page.
        $credits = 0;
        try {
            $credits = $zeroBounce->getCredits();
        } catch (\Throwable $e) {
            $credits = 0;
        }

        $lastScrub = $row->last_scrub_at ?? null;

        $stats = [
            'total_contacts' => $withEmail,
            'validated_count' => (int) ($row->validated_count ?? 0),
            'valid_count' => (int) ($row->valid_count ?? 0),
            'invalid_count' => (int) ($row->invalid_count ?? 0),
            'catch_all_count' => (int) ($row->catch_all_count ?? 0),
            'unknown_count' => (int) ($row->unknown_count ?? 0),
            'suppressed_count' => $suppressed,
            'suppression_rate' => $base > 0 ? round(($suppressed / $base) * 100, 1) : 0.0,
            'last_scrub_at' => $lastScrub
                ? \Illuminate\Support\Carbon::parse($lastScrub)->toISOString()
                : null,
            'zerobounce_credits' => $credits,
        ];

        return response()->json(['data' => $stats]);
    }

    /**
     * POST /v1/email/contacts/revalidate
     *
     * Dispatches the real {@see ReScrubStaleContactsJob} onto the `emails`
     * queue. The job re-validates stale/unchecked contacts through ZeroBounce
     * in bounded slices and updates their zb_* columns / suppression flags.
     */
    public function revalidate(): JsonResponse
    {
        $jobId = (string) Str::uuid();

        ReScrubStaleContactsJob::dispatch();

        return response()->json([
            'data' => [
                'message' => 'List re-validation started. Stale contacts will be re-checked through ZeroBounce in the background.',
                'job_id' => $jobId,
            ],
        ]);
    }
}
