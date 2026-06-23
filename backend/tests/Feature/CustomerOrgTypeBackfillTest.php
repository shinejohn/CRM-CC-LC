<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class CustomerOrgTypeBackfillTest extends TestCase
{
    use RefreshDatabase;

    private string $tenantId = '00000000-0000-0000-0000-000000000000';

    private function makeCustomer(array $attrs): Customer
    {
        return Customer::create(array_merge([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'business_name' => 'Test Org',
            'slug' => 'test-org-' . Str::random(8),
            'lead_score' => 0,
        ], $attrs));
    }

    public function test_backfill_sets_org_type_by_bucket(): void
    {
        $np = $this->makeCustomer([
            'external_id' => 'np:1',
            'metadata' => ['pp_ntee_code' => 'B25'],
        ]);

        $civic = $this->makeCustomer([
            'external_id' => 'civic:1',
            'metadata' => ['pp_entity_type' => 'government', 'pp_entity_subtype' => 'municipal'],
        ]);

        $biz = $this->makeCustomer([
            'external_id' => 'pp-biz-123',
            'metadata' => [],
        ]);

        $this->artisan('customers:backfill-org-type')->assertSuccessful();

        $this->assertSame('nonprofit', $np->fresh()->org_type);
        $this->assertSame('B25', $np->fresh()->org_subtype);

        $this->assertSame('government', $civic->fresh()->org_type);
        $this->assertSame('municipal', $civic->fresh()->org_subtype);

        $this->assertSame('smb', $biz->fresh()->org_type);
    }

    public function test_backfill_is_idempotent_and_preserves_existing(): void
    {
        // Already-set row must not be overwritten on re-run.
        $preset = $this->makeCustomer([
            'external_id' => 'np:99',
            'org_type' => 'education',
            'org_subtype' => 'preset',
            'metadata' => ['pp_ntee_code' => 'B25'],
        ]);

        $this->artisan('customers:backfill-org-type')->assertSuccessful();
        $this->artisan('customers:backfill-org-type')->assertSuccessful();

        $this->assertSame('education', $preset->fresh()->org_type);
        $this->assertSame('preset', $preset->fresh()->org_subtype);
    }

    public function test_dry_run_writes_nothing(): void
    {
        $np = $this->makeCustomer([
            'external_id' => 'np:7',
            'metadata' => ['pp_ntee_code' => 'A10'],
        ]);

        $this->artisan('customers:backfill-org-type', ['--dry-run' => true])->assertSuccessful();

        $this->assertNull($np->fresh()->org_type);
    }
}
