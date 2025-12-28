<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\PresentationTemplate;
use App\Models\GeneratedPresentation;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PresentationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_presentation_templates(): void
    {
        PresentationTemplate::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/presentations/templates');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'description', 'purpose', 'slide_count']
                ]
            ]);
    }

    public function test_can_show_presentation_template(): void
    {
        $template = PresentationTemplate::factory()->create();

        $response = $this->getJson("/api/v1/presentations/templates/{$template->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $template->id,
                    'name' => $template->name,
                ]
            ]);
    }

    public function test_can_create_presentation_from_template(): void
    {
        $template = PresentationTemplate::factory()->create();

        $data = [
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'template_id' => $template->id,
            'custom_data' => [
                'name' => 'John Doe',
                'company' => 'Test Company',
            ],
        ];

        $response = $this->postJson('/api/v1/presentations/generate', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'template_id']]);

        $this->assertDatabaseHas('generated_presentations', [
            'template_id' => $template->id,
        ]);
    }

    public function test_can_show_generated_presentation(): void
    {
        $presentation = GeneratedPresentation::factory()->create();

        $response = $this->getJson("/api/v1/presentations/{$presentation->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $presentation->id,
                ]
            ]);
    }

    public function test_can_generate_audio_for_presentation(): void
    {
        $presentation = GeneratedPresentation::factory()->create();

        $response = $this->postJson("/api/v1/presentations/{$presentation->id}/audio", []);

        // May return 200 or 202 (accepted) depending on implementation
        $this->assertContains($response->status(), [200, 202, 201]);
    }
}
