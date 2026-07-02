<?php

namespace Tests\Feature;

use App\Models\TrainingDataset;
use App\Models\TrainingExample;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainingDatasetApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createAndAuthenticateUser();
    }

    public function test_can_create_dataset(): void
    {
        $create = $this->postJson('/api/v1/training/datasets', [
            'name' => 'Support intents',
            'description' => 'Labelled support Q/A',
        ]);

        $create->assertStatus(201)
            ->assertJsonStructure(['id', 'name', 'status', 'example_count']);

        $this->assertDatabaseHas('training_datasets', [
            'name' => 'Support intents',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ]);

        // NOTE: GET /v1/training/datasets is shadowed by the pre-existing
        // knowledge route GET /v1/training/{id} (registered first in
        // routes/api.php), so the list endpoint is unreachable as-is. The
        // dataset show/examples/validation paths (2+ segments) are unaffected.
    }

    public function test_can_add_example_and_it_appears_in_validation_queue(): void
    {
        $dataset = TrainingDataset::create([
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'name' => 'Ds',
            'status' => 'draft',
            'example_count' => 0,
        ]);

        $this->postJson("/api/v1/training/datasets/{$dataset->id}/examples", [
            'input' => 'How do I reset my password?',
            'expected_output' => 'Use the reset link on the login page.',
        ])
            ->assertStatus(201)
            ->assertJsonStructure(['id', 'dataset_id', 'input', 'validation_status']);

        $this->assertSame(1, $dataset->fresh()->example_count);

        $this->getJson('/api/v1/training/validation/queue')
            ->assertStatus(200)
            ->assertJsonStructure(['data', 'current_page', 'total']);
    }

    public function test_can_approve_a_pending_example(): void
    {
        $dataset = TrainingDataset::create([
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'name' => 'Ds',
            'status' => 'draft',
            'example_count' => 0,
        ]);

        $example = TrainingExample::create([
            'dataset_id' => $dataset->id,
            'input' => 'q',
            'expected_output' => 'a',
            'validation_status' => 'pending',
        ]);

        $this->postJson("/api/v1/validation/{$example->id}/approve")
            ->assertStatus(200)
            ->assertJsonPath('validation_status', 'approved');
    }
}
