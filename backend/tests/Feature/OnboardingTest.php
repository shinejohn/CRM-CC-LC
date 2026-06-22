<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\OnboardingProgress;
use App\Models\User;
use App\Services\OnboardingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class OnboardingTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Customer $customer;

    private string $tenantId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenantId = (string) Str::uuid();

        $this->customer = Customer::factory()->create([
            'tenant_id' => $this->tenantId,
        ]);

        $this->user = User::factory()->create([
            'tenant_id' => $this->tenantId,
        ]);
    }

    private function headers(): array
    {
        return ['X-Tenant-ID' => $this->tenantId];
    }

    public function test_index_returns_steps_for_current_customer(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/onboarding', $this->headers());

        $expectedCount = count((new OnboardingService)->defaultSteps());

        $response->assertOk()
            ->assertJsonCount($expectedCount, 'steps')
            ->assertJsonPath('complete', false)
            ->assertJsonPath('percent', 0)
            ->assertJsonStructure([
                'steps' => [
                    ['key', 'label', 'cta_route', 'completed', 'completed_at'],
                ],
                'complete',
                'percent',
            ]);

        // Steps are seeded into the database.
        $this->assertSame(
            $expectedCount,
            OnboardingProgress::where('customer_id', $this->customer->id)->count(),
        );
    }

    public function test_complete_flips_a_step_and_updates_percent(): void
    {
        // Seed steps first.
        $this->actingAs($this->user)->getJson('/api/v1/onboarding', $this->headers());

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/onboarding/complete_profile/complete', [], $this->headers());

        $total = count((new OnboardingService)->defaultSteps());
        $expectedPercent = (int) round((1 / $total) * 100);

        $response->assertOk()
            ->assertJsonPath('percent', $expectedPercent)
            ->assertJsonPath('complete', false);

        // The targeted step is now completed.
        $steps = collect($response->json('steps'));
        $profileStep = $steps->firstWhere('key', 'complete_profile');
        $this->assertTrue($profileStep['completed']);
        $this->assertNotNull($profileStep['completed_at']);

        $this->assertNotNull(
            OnboardingProgress::where('customer_id', $this->customer->id)
                ->where('step', 'complete_profile')
                ->value('completed_at'),
        );
    }

    public function test_completing_all_steps_marks_onboarding_complete(): void
    {
        $steps = array_keys((new OnboardingService)->defaultSteps());

        $last = null;
        foreach ($steps as $step) {
            $last = $this->actingAs($this->user)
                ->postJson("/api/v1/onboarding/{$step}/complete", [], $this->headers());
        }

        $last->assertOk()
            ->assertJsonPath('complete', true)
            ->assertJsonPath('percent', 100);
    }

    public function test_unknown_step_returns_422(): void
    {
        $this->actingAs($this->user)->getJson('/api/v1/onboarding', $this->headers());

        $this->actingAs($this->user)
            ->postJson('/api/v1/onboarding/not_a_real_step/complete', [], $this->headers())
            ->assertStatus(422);
    }

    public function test_seeding_is_idempotent(): void
    {
        $service = new OnboardingService;
        $service->seedFor($this->customer);
        $service->seedFor($this->customer);

        $this->assertSame(
            count($service->defaultSteps()),
            OnboardingProgress::where('customer_id', $this->customer->id)->count(),
        );
    }
}
