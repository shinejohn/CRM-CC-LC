<?php

namespace Tests\Unit;

use App\Models\Customer;
use App\Services\ApprovalTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApprovalTokenServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_generate_and_validate_token(): void
    {
        $customer = Customer::factory()->create();
        $service = app(ApprovalTokenService::class);

        $token = $service->generateToken($customer->id, 'appointment_booking', 'LC-2001');
        $payload = $service->validateToken($token);

        $this->assertNotNull($payload);
        $this->assertSame($customer->id, $payload['customer_id']);
        $this->assertSame('appointment_booking', $payload['service_type']);
        $this->assertSame('LC-2001', $payload['source_id']);
    }
}

