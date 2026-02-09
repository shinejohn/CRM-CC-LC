<?php

namespace Tests\Feature;

use App\Models\ProvisioningTask;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProvisioningTaskApiTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_can_retry_failed_task(): void
    {
        $task = ProvisioningTask::factory()->create([
            'status' => 'failed',
            'failed_at' => now(),
            'failure_reason' => 'Initial failure',
        ]);

        $response = $this->postJson("/api/v1/provisioning-tasks/{$task->id}/retry");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Provisioning retry started']);

        $this->assertDatabaseHas('provisioning_tasks', [
            'id' => $task->id,
            'status' => 'queued',
            'failure_reason' => null,
        ]);
    }

    public function test_can_show_task(): void
    {
        $task = ProvisioningTask::factory()->create();

        $response = $this->getJson("/api/v1/provisioning-tasks/{$task->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['id', 'approval_id', 'customer_id', 'service_type', 'status'],
            ]);
    }
}

