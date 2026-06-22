<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * Coupon / discount code.
 *
 * `type` is either 'percent' or 'fixed'.
 *   - For type 'fixed', `amount` is the discount in CENTS (e.g. 500 = $5.00 off).
 *   - For type 'percent', `amount` is the whole-number percentage (e.g. 10 = 10% off).
 */
final class Coupon extends Model
{
    use HasUuids;

    public const TYPE_PERCENT = 'percent';

    public const TYPE_FIXED = 'fixed';

    protected $fillable = [
        'code',
        'type',
        'amount',
        'max_uses',
        'uses_count',
        'expires_at',
        'applicable_service_ids',
        'active',
    ];

    protected $casts = [
        'amount'                 => 'integer',
        'max_uses'               => 'integer',
        'uses_count'             => 'integer',
        'expires_at'             => 'datetime',
        'applicable_service_ids' => 'array',
        'active'                 => 'boolean',
    ];

    /**
     * A coupon is redeemable when it is active, not expired, and under its
     * max-use cap (if any).
     */
    public function isRedeemable(): bool
    {
        if (! $this->active) {
            return false;
        }

        if ($this->expires_at !== null && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->max_uses !== null && $this->uses_count >= $this->max_uses) {
            return false;
        }

        return true;
    }

    /**
     * Whether this coupon applies to the given service id. A coupon with no
     * `applicable_service_ids` applies to every service.
     */
    public function appliesToService(?string $serviceId): bool
    {
        $scope = $this->applicable_service_ids;

        if (empty($scope)) {
            return true;
        }

        if ($serviceId === null) {
            return false;
        }

        return in_array($serviceId, $scope, true);
    }

    /**
     * Compute the discount in cents for a given pre-discount amount (also in
     * cents). The result is clamped to [0, $amountCents] so it never exceeds
     * the order total.
     */
    public function discountFor(int $amountCents): int
    {
        if ($amountCents <= 0) {
            return 0;
        }

        $discount = $this->type === self::TYPE_PERCENT
            ? (int) floor($amountCents * $this->amount / 100)
            : $this->amount;

        return max(0, min($discount, $amountCents));
    }
}
