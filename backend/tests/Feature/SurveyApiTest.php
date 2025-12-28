<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\SurveySection;
use App\Models\SurveyQuestion;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SurveyApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_survey_sections(): void
    {
        SurveySection::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/survey/sections');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'description', 'order']
                ]
            ]);
    }

    public function test_can_create_survey_section(): void
    {
        $data = [
            'title' => 'Test Section',
            'description' => 'Test description',
            'order' => 1,
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/survey/sections', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'title', 'description']]);

        $this->assertDatabaseHas('survey_sections', [
            'title' => 'Test Section',
        ]);
    }

    public function test_can_update_survey_section(): void
    {
        $section = SurveySection::factory()->create();

        $data = [
            'title' => 'Updated Section',
            'description' => 'Updated description',
        ];

        $response = $this->putJson("/api/v1/survey/sections/{$section->id}", $data);

        $response->assertStatus(200);

        $this->assertDatabaseHas('survey_sections', [
            'id' => $section->id,
            'title' => 'Updated Section',
        ]);
    }

    public function test_can_delete_survey_section(): void
    {
        $section = SurveySection::factory()->create();

        $response = $this->deleteJson("/api/v1/survey/sections/{$section->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('survey_sections', [
            'id' => $section->id,
        ]);
    }

    public function test_can_list_questions_for_section(): void
    {
        $section = SurveySection::factory()->create();
        SurveyQuestion::factory()->count(3)->create(['section_id' => $section->id]);

        $response = $this->getJson("/api/v1/survey/sections/{$section->id}/questions");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'question_text', 'question_type', 'section_id']
                ]
            ]);
    }

    public function test_can_create_survey_question(): void
    {
        $section = SurveySection::factory()->create();

        $data = [
            'section_id' => $section->id,
            'question_text' => 'Test Question?',
            'question_type' => 'text',
            'is_required' => true,
            'order' => 1,
        ];

        $response = $this->postJson('/api/v1/survey/questions', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'question_text', 'question_type']]);

        $this->assertDatabaseHas('survey_questions', [
            'question_text' => 'Test Question?',
            'section_id' => $section->id,
        ]);
    }

    public function test_can_update_survey_question(): void
    {
        $question = SurveyQuestion::factory()->create();

        $data = [
            'question_text' => 'Updated Question?',
        ];

        $response = $this->putJson("/api/v1/survey/questions/{$question->id}", $data);

        $response->assertStatus(200);

        $this->assertDatabaseHas('survey_questions', [
            'id' => $question->id,
            'question_text' => 'Updated Question?',
        ]);
    }

    public function test_can_delete_survey_question(): void
    {
        $question = SurveyQuestion::factory()->create();

        $response = $this->deleteJson("/api/v1/survey/questions/{$question->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('survey_questions', [
            'id' => $question->id,
        ]);
    }
}
