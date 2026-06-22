<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

final class CouponController extends Controller
{
    /**
     * POST /api/v1/coupons
     *
     * Admin: create a coupon.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'                     => ['required', 'string', 'max:64', 'unique:coupons,code'],
            'type'                     => ['required', 'string', Rule::in([Coupon::TYPE_PERCENT, Coupon::TYPE_FIXED])],
            'amount'                   => ['required', 'integer', 'min:1'],
            'max_uses'                 => ['nullable', 'integer', 'min:1'],
            'expires_at'               => ['nullable', 'date'],
            'applicable_service_ids'   => ['nullable', 'array'],
            'applicable_service_ids.*' => ['string'],
            'active'                   => ['sometimes', 'boolean'],
        ]);

        // Percent coupons must be a sane 1–100 value.
        if ($data['type'] === Coupon::TYPE_PERCENT && $data['amount'] > 100) {
            return response()->json([
                'message' => 'Percent coupons must be between 1 and 100.',
                'errors'  => ['amount' => ['Percent coupons must be between 1 and 100.']],
            ], 422);
        }

        $coupon = Coupon::create([
            'code'                   => strtoupper($data['code']),
            'type'                   => $data['type'],
            'amount'                 => $data['amount'],
            'max_uses'               => $data['max_uses'] ?? null,
            'uses_count'             => 0,
            'expires_at'             => $data['expires_at'] ?? null,
            'applicable_service_ids' => $data['applicable_service_ids'] ?? null,
            'active'                 => $data['active'] ?? true,
        ]);

        return response()->json(['data' => $coupon], 201);
    }

    /**
     * POST /api/v1/coupons/validate
     *
     * Body: { code, amount?, service_id? } — `amount` is the pre-discount
     * cart total in CENTS.
     *
     * Returns: { valid: bool, discount_cents?: int, message?: string, coupon?: object }
     */
    public function validateCoupon(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'       => ['required', 'string', 'max:64'],
            'amount'     => ['nullable', 'integer', 'min:0'],
            'service_id' => ['nullable', 'string'],
        ]);

        $coupon = Coupon::query()
            ->whereRaw('UPPER(code) = ?', [strtoupper($data['code'])])
            ->first();

        if ($coupon === null) {
            return response()->json([
                'valid'   => false,
                'message' => 'That coupon code was not found.',
            ]);
        }

        if (! $coupon->isRedeemable()) {
            return response()->json([
                'valid'   => false,
                'message' => 'This coupon is no longer valid.',
            ]);
        }

        if (! $coupon->appliesToService($data['service_id'] ?? null)) {
            return response()->json([
                'valid'   => false,
                'message' => 'This coupon does not apply to the selected service.',
            ]);
        }

        $amountCents = $data['amount'] ?? 0;
        $discountCents = $coupon->discountFor($amountCents);

        return response()->json([
            'valid'          => true,
            'discount_cents' => $discountCents,
            'coupon'         => $coupon,
        ]);
    }
}
