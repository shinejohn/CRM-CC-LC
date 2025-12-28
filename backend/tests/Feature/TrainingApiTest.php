<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TrainingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_training_courses(): void
    {
        $response = $this->getJson('/api/v1/training/courses');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'description', 'duration']
                ]
            ]);
    }

    public function test_can_show_training_course(): void
    {
        // Assuming course ID exists or can be created
        $courseId = '00000000-0000-0000-0000-000000000000';

        $response = $this->getJson("/api/v1/training/courses/{$courseId}");

        // Adjust assertion based on actual implementation
        $response->assertStatus(200);
    }

    public function test_can_enroll_in_training_course(): void
    {
        $courseId = '00000000-0000-0000-0000-000000000000';

        $data = [
            'course_id' => $courseId,
            'user_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/training/enrollments', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'course_id', 'user_id', 'status']]);
    }

    public function test_can_get_user_enrollments(): void
    {
        $userId = '00000000-0000-0000-0000-000000000000';

        $response = $this->getJson("/api/v1/training/users/{$userId}/enrollments");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'course_id', 'status', 'progress']
                ]
            ]);
    }
}
