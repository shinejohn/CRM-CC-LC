<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;
    protected function setUp(): void
    {
        parent::setUp();

        if (\Illuminate\Support\Facades\DB::getDriverName() === 'sqlite') {
            \Illuminate\Support\Facades\DB::statement('PRAGMA foreign_keys = OFF');
        }
    }

    protected function createAndAuthenticateUser(?string $tenantId = null): \App\Models\User
    {
        // Controllers now derive the tenant strictly from the authenticated
        // user (never a header/body). Make the test user carry a tenant that
        // matches the records the test creates: explicit arg > the test's
        // $this->tenantId property > the system default tenant.
        // Default tenant matches the value the vast majority of factories and
        // test query params use (all-zeros), so an authenticated user shares
        // the tenant of the records the test creates.
        $tenantId = $tenantId
            ?? (isset($this->tenantId) ? (string) $this->tenantId : null)
            ?? '00000000-0000-0000-0000-000000000000';

        $user = \App\Models\User::factory()->create();

        // tenant_id is not in User::$fillable — set the attribute and persist.
        $user->tenant_id = $tenantId;
        $user->save();

        $this->actingAs($user);
        $this->withHeader('X-Tenant-ID', $tenantId);
        return $user;
    }
}
