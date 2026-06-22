<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Coupon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CouponTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createAndAuthenticateUser();
    }

    public function test_admin_can_create_a_coupon(): void
    {
        $response = $this->postJson('/api/v1/coupons', [
            'code'   => 'save10',
            'type'   => 'percent',
            'amount' => 10,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('coupons', [
            'code'   => 'SAVE10',
            'type'   => 'percent',
            'amount' => 10,
        ]);
    }

    public function test_create_rejects_percent_over_100(): void
    {
        $response = $this->postJson('/api/v1/coupons', [
            'code'   => 'TOOBIG',
            'type'   => 'percent',
            'amount' => 150,
        ]);

        $response->assertStatus(422);
    }

    public function test_validate_returns_discount_for_valid_percent_coupon(): void
    {
        Coupon::create([
            'code'   => 'PERCENT20',
            'type'   => 'percent',
            'amount' => 20,
            'active' => true,
        ]);

        $response = $this->postJson('/api/v1/coupons/validate', [
            'code'   => 'percent20',
            'amount' => 10000, // $100.00 in cents
        ]);

        $response->assertOk()
            ->assertJson([
                'valid'          => true,
                'discount_cents' => 2000, // 20% of 10000
            ]);
    }

    public function test_validate_returns_discount_for_valid_fixed_coupon(): void
    {
        Coupon::create([
            'code'   => 'FIVEOFF',
            'type'   => 'fixed',
            'amount' => 500, // $5.00 in cents
            'active' => true,
        ]);

        $response = $this->postJson('/api/v1/coupons/validate', [
            'code'   => 'FIVEOFF',
            'amount' => 10000,
        ]);

        $response->assertOk()
            ->assertJson([
                'valid'          => true,
                'discount_cents' => 500,
            ]);
    }

    public function test_validate_rejects_expired_coupon(): void
    {
        Coupon::create([
            'code'       => 'EXPIRED',
            'type'       => 'percent',
            'amount'     => 10,
            'active'     => true,
            'expires_at' => now()->subDay(),
        ]);

        $response = $this->postJson('/api/v1/coupons/validate', [
            'code'   => 'EXPIRED',
            'amount' => 10000,
        ]);

        $response->assertOk()
            ->assertJson(['valid' => false]);
        $this->assertNull($response->json('discount_cents'));
    }

    public function test_validate_rejects_when_max_uses_exceeded(): void
    {
        Coupon::create([
            'code'       => 'MAXED',
            'type'       => 'fixed',
            'amount'     => 500,
            'active'     => true,
            'max_uses'   => 2,
            'uses_count' => 2,
        ]);

        $response = $this->postJson('/api/v1/coupons/validate', [
            'code'   => 'MAXED',
            'amount' => 10000,
        ]);

        $response->assertOk()
            ->assertJson(['valid' => false]);
    }

    public function test_validate_rejects_for_wrong_service(): void
    {
        Coupon::create([
            'code'                   => 'SCOPED',
            'type'                   => 'percent',
            'amount'                 => 10,
            'active'                 => true,
            'applicable_service_ids' => ['service-a', 'service-b'],
        ]);

        $response = $this->postJson('/api/v1/coupons/validate', [
            'code'       => 'SCOPED',
            'amount'     => 10000,
            'service_id' => 'service-z',
        ]);

        $response->assertOk()
            ->assertJson(['valid' => false]);
    }

    public function test_validate_accepts_for_applicable_service(): void
    {
        Coupon::create([
            'code'                   => 'SCOPEDOK',
            'type'                   => 'percent',
            'amount'                 => 10,
            'active'                 => true,
            'applicable_service_ids' => ['service-a', 'service-b'],
        ]);

        $response = $this->postJson('/api/v1/coupons/validate', [
            'code'       => 'SCOPEDOK',
            'amount'     => 10000,
            'service_id' => 'service-a',
        ]);

        $response->assertOk()
            ->assertJson([
                'valid'          => true,
                'discount_cents' => 1000,
            ]);
    }

    public function test_validate_reports_unknown_code(): void
    {
        $response = $this->postJson('/api/v1/coupons/validate', [
            'code'   => 'DOESNOTEXIST',
            'amount' => 10000,
        ]);

        $response->assertOk()
            ->assertJson(['valid' => false]);
    }
}
