<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\EmailTemplate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmailTemplateApiTest extends TestCase
{
    use RefreshDatabase;

    protected \App\Models\User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = $this->createAndAuthenticateUser();
    }

    private function makeTemplate(array $attrs = []): EmailTemplate
    {
        return EmailTemplate::create(array_merge([
            'tenant_id' => $this->user->tenant_id ?? '00000000-0000-0000-0000-000000000000',
            'name' => 'Welcome Email',
            'slug' => 'welcome-email-'.uniqid(),
            'subject' => 'Welcome to {{business_name}}',
            'html_content' => '<p>Hi {{customer_name}}, welcome from {{business_name}}.</p>',
            'text_content' => 'Hi {{customer_name}}, welcome from {{business_name}}.',
            'variables' => ['business_name', 'customer_name'],
            'is_active' => true,
        ], $attrs));
    }

    public function test_can_list_templates(): void
    {
        $this->makeTemplate();
        $this->makeTemplate(['name' => 'Second']);

        $response = $this->getJson('/api/v1/outbound/email-templates');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'subject', 'html_content', 'variables', 'is_active'],
                ],
                'current_page',
                'total',
            ]);
        $this->assertSame(2, $response->json('total'));
    }

    public function test_can_create_template(): void
    {
        $data = [
            'name' => 'New Template',
            'subject' => 'Hello {{customer_name}}',
            'html_content' => '<p>Hello {{customer_name}}</p>',
            'text_content' => 'Hello {{customer_name}}',
            'variables' => ['customer_name'],
        ];

        $response = $this->postJson('/api/v1/outbound/email-templates', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'New Template')
            ->assertJsonStructure(['data' => ['id', 'slug']]);

        $this->assertDatabaseHas('email_templates', ['name' => 'New Template']);
    }

    public function test_create_validation_fails_without_required_fields(): void
    {
        $response = $this->postJson('/api/v1/outbound/email-templates', ['name' => 'X']);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['subject', 'html_content']);
    }

    public function test_can_show_template(): void
    {
        $template = $this->makeTemplate();

        $response = $this->getJson("/api/v1/outbound/email-templates/{$template->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $template->id);
    }

    public function test_can_update_template(): void
    {
        $template = $this->makeTemplate();

        $response = $this->putJson("/api/v1/outbound/email-templates/{$template->id}", [
            'subject' => 'Updated subject',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.subject', 'Updated subject');

        $this->assertDatabaseHas('email_templates', [
            'id' => $template->id,
            'subject' => 'Updated subject',
        ]);
    }

    public function test_can_delete_template(): void
    {
        $template = $this->makeTemplate();

        $response = $this->deleteJson("/api/v1/outbound/email-templates/{$template->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('email_templates', ['id' => $template->id]);
    }

    public function test_preview_renders_variables(): void
    {
        $template = $this->makeTemplate();

        $response = $this->postJson("/api/v1/outbound/email-templates/{$template->id}/preview", [
            'variables' => [
                'business_name' => 'Acme',
                'customer_name' => 'Jane',
            ],
        ]);

        $response->assertStatus(200);
        $this->assertSame('Welcome to Acme', $response->json('data.subject'));
        $this->assertStringContainsString('welcome from Acme', $response->json('data.html'));
        $this->assertStringContainsString('Hi Jane', $response->json('data.html'));
        $this->assertStringNotContainsString('{{business_name}}', $response->json('data.html'));
    }

    public function test_preview_raw_renders_unsaved_content(): void
    {
        $response = $this->postJson('/api/v1/outbound/email-templates/preview', [
            'subject' => 'Hi {{customer_name}}',
            'html_content' => '<p>From {{business_name}}</p>',
            'variables' => [
                'customer_name' => 'Sam',
                'business_name' => 'Acme',
            ],
        ]);

        $response->assertStatus(200);
        $this->assertSame('Hi Sam', $response->json('data.subject'));
        $this->assertStringContainsString('From Acme', $response->json('data.html'));
    }
}
