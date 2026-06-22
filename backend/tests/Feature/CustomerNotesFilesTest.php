<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class CustomerNotesFilesTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private string $tenantId;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = $this->createAndAuthenticateUser();
        $this->tenantId = $this->user->tenant_id ?? '00000000-0000-0000-0000-000000000000';
    }

    private function getHeaders(): array
    {
        return [
            'X-Tenant-ID' => $this->tenantId,
            'Accept' => 'application/json',
        ];
    }

    private function createCustomer(): Customer
    {
        return Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'lead_score' => 0,
        ]);
    }

    public function test_note_create_list_delete(): void
    {
        $customer = $this->createCustomer();

        // Create
        $create = $this->postJson(
            "/api/v1/customers/{$customer->id}/notes",
            ['body' => 'First note'],
            $this->getHeaders()
        );
        $create->assertStatus(201)
            ->assertJsonPath('data.body', 'First note');

        $noteId = $create->json('data.id');

        // List (newest first)
        $list = $this->getJson("/api/v1/customers/{$customer->id}/notes", $this->getHeaders());
        $list->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.body', 'First note');

        // Delete
        $delete = $this->deleteJson("/api/v1/customers/{$customer->id}/notes/{$noteId}", [], $this->getHeaders());
        $delete->assertStatus(200);

        $this->getJson("/api/v1/customers/{$customer->id}/notes", $this->getHeaders())
            ->assertJsonCount(0, 'data');
    }

    public function test_note_body_is_required(): void
    {
        $customer = $this->createCustomer();

        $this->postJson("/api/v1/customers/{$customer->id}/notes", [], $this->getHeaders())
            ->assertStatus(422);
    }

    public function test_file_upload_list_download_delete(): void
    {
        Storage::fake('local');

        $customer = $this->createCustomer();

        $file = UploadedFile::fake()->create('contract.pdf', 120, 'application/pdf');

        // Upload
        $upload = $this->post(
            "/api/v1/customers/{$customer->id}/files",
            ['file' => $file],
            $this->getHeaders()
        );
        $upload->assertStatus(201)
            ->assertJsonPath('data.original_name', 'contract.pdf');

        $fileId = $upload->json('data.id');

        // The stored blob exists on the private disk
        $storedPath = \App\Models\CustomerFile::find($fileId)->path;
        Storage::disk('local')->assertExists($storedPath);

        // List
        $this->getJson("/api/v1/customers/{$customer->id}/files", $this->getHeaders())
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.original_name', 'contract.pdf');

        // Download
        $download = $this->get(
            "/api/v1/customers/{$customer->id}/files/{$fileId}/download",
            $this->getHeaders()
        );
        $download->assertStatus(200);

        // Delete (removes row + blob)
        $this->deleteJson("/api/v1/customers/{$customer->id}/files/{$fileId}", [], $this->getHeaders())
            ->assertStatus(200);

        Storage::disk('local')->assertMissing($storedPath);

        $this->getJson("/api/v1/customers/{$customer->id}/files", $this->getHeaders())
            ->assertJsonCount(0, 'data');
    }
}
