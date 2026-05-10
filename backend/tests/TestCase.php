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

    protected function createAndAuthenticateUser(): \App\Models\User
    {
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user);
        $this->withHeader('X-Tenant-ID', $user->tenant_id ?? '00000000-0000-0000-0000-000000000000');
        return $user;
    }
}
