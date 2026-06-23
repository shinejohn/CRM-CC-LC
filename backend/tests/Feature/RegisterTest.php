<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

final class RegisterTest extends TestCase
{
    public function test_register_creates_user_and_returns_token_in_expected_shape(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
            'password' => 'super-secret-1',
            'password_confirmation' => 'super-secret-1',
        ]);

        $response->assertCreated();
        $response->assertJsonStructure([
            'token',
            'user' => ['id', 'name', 'email'],
        ]);

        $this->assertNotEmpty($response->json('token'));
        $this->assertSame('ada@example.com', $response->json('user.email'));
        $this->assertSame('Ada Lovelace', $response->json('user.name'));

        // Password must never be returned.
        $this->assertNull($response->json('user.password'));

        $this->assertDatabaseHas('users', ['email' => 'ada@example.com']);

        // Issued token is usable against an authenticated endpoint.
        $token = $response->json('token');
        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'ada@example.com');
    }

    public function test_register_rejects_duplicate_email_with_422(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Someone Else',
            'email' => 'taken@example.com',
            'password' => 'super-secret-1',
            'password_confirmation' => 'super-secret-1',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('email');
    }

    public function test_register_rejects_password_mismatch_with_422(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Mismatch',
            'email' => 'mismatch@example.com',
            'password' => 'super-secret-1',
            'password_confirmation' => 'different-password',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('password');
    }

    public function test_register_rejects_short_password_with_422(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Shorty',
            'email' => 'shorty@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('password');
    }

    public function test_register_persists_campaign_context_when_provided(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Lead Capture',
            'email' => 'lead@example.com',
            'password' => 'super-secret-1',
            'password_confirmation' => 'super-secret-1',
            'campaign' => 'manifest-destiny',
            'lead_source' => 'landing-page',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('users', [
            'email' => 'lead@example.com',
            'signup_campaign' => 'manifest-destiny',
            'lead_source' => 'landing-page',
        ]);
    }
}
