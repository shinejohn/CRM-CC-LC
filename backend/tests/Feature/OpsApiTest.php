<?php

namespace Tests\Feature;

use App\Models\Community;
use App\Models\Operations\AISession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class OpsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_ops_endpoints_require_auth()
    {
        $this->getJson('/api/v1/ops/system-status')->assertStatus(401);
    }

    /**
     * Authenticate a user that satisfies MunicipalAdminMiddleware (an active
     * `municipal_admins` record) and return it.
     */
    private function actingAsMunicipalAdmin(): User
    {
        $admin = User::factory()->create();
        $community = Community::factory()->create();

        DB::table('municipal_admins')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $admin->id,
            'community_id' => $community->id,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($admin, 'sanctum');

        return $admin;
    }

    /**
     * The `ops.*` schema tables are only created by their migrations on
     * PostgreSQL. Under the sqlite test DB we attach an in-memory `ops`
     * schema and create the minimal tables the new Ops endpoints touch so the
     * happy path can be smoke-tested (status + envelope shape).
     */
    private function createOpsSchema(): void
    {
        try {
            DB::statement("ATTACH DATABASE ':memory:' AS ops");
        } catch (\Throwable $e) {
            // Already attached on the persistent in-memory connection.
        }

        Schema::dropIfExists('ops.ai_sessions');
        Schema::create('ops.ai_sessions', function ($t): void {
            $t->uuid('id')->primary();
            $t->string('session_type', 50);
            $t->string('trigger_source', 100)->nullable();
            $t->text('user_query')->nullable();
            $t->string('status', 20)->default('processing');
            $t->timestamp('started_at')->nullable();
            $t->timestamp('completed_at')->nullable();
            $t->string('created_by')->nullable();
            $t->timestamps();
        });

        Schema::dropIfExists('ops.incidents');
        Schema::create('ops.incidents', function ($t): void {
            $t->uuid('id')->primary();
            $t->integer('incident_number')->nullable();
            $t->string('title');
            $t->text('description')->nullable();
            $t->string('severity', 20);
            $t->string('category', 50)->nullable();
            $t->text('impact_description')->nullable();
            $t->json('affected_components')->nullable();
            $t->integer('affected_communities')->nullable();
            $t->integer('affected_customers')->nullable();
            $t->string('status', 20)->default('investigating');
            $t->timestamp('started_at')->nullable();
            $t->timestamp('identified_at')->nullable();
            $t->timestamp('resolved_at')->nullable();
            $t->string('lead_responder', 100)->nullable();
            $t->json('responders')->nullable();
            $t->text('public_message')->nullable();
            $t->text('internal_notes')->nullable();
            $t->string('status_page_id', 100)->nullable();
            $t->text('postmortem_url')->nullable();
            $t->text('root_cause')->nullable();
            $t->json('corrective_actions')->nullable();
            $t->timestamps();
        });

        // Empty aggregate-source tables for the dashboard snapshot.
        $simple = [
            'ops.revenue_snapshots' => ['snapshot_date'],
            'ops.pipeline_metrics' => ['snapshot_date'],
            'ops.infrastructure_components' => ['current_status'],
            'ops.email_ip_reputation' => [],
            'ops.alerts' => ['status', 'severity'],
        ];
        foreach ($simple as $table => $cols) {
            Schema::dropIfExists($table);
            Schema::create($table, function ($t) use ($cols): void {
                $t->uuid('id')->primary();
                foreach ($cols as $col) {
                    if (str_contains($col, 'date')) {
                        $t->timestamp($col)->nullable();
                    } else {
                        $t->string($col)->nullable();
                    }
                }
                $t->timestamps();
            });
        }

        Schema::dropIfExists('ops.cost_tracking');
        Schema::create('ops.cost_tracking', function ($t): void {
            $t->uuid('id')->primary();
            $t->timestamp('cost_date')->nullable();
            $t->decimal('cost_total', 14, 2)->nullable();
            $t->timestamps();
        });

        Schema::dropIfExists('ops.health_checks');
        Schema::create('ops.health_checks', function ($t): void {
            $t->uuid('id')->primary();
            $t->timestamp('checked_at')->nullable();
            $t->integer('response_time_ms')->nullable();
            $t->timestamps();
        });

        Schema::dropIfExists('ops.queue_metrics');
        Schema::create('ops.queue_metrics', function ($t): void {
            $t->uuid('id')->primary();
            $t->timestamp('recorded_at')->nullable();
            $t->timestamps();
        });
    }

    public function test_new_ops_endpoints_forbidden_without_admin_record()
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        $this->getJson('/api/v1/ops/ai-sessions')->assertStatus(403);
        $this->postJson('/api/v1/ops/incidents', ['title' => 'x', 'severity' => 'minor'])
            ->assertStatus(403);
        $this->getJson('/api/v1/ops/dashboard/snapshot')->assertStatus(403);
    }

    public function test_ops_ai_sessions_index_returns_envelope()
    {
        $this->actingAsMunicipalAdmin();
        $this->createOpsSchema();

        AISession::create([
            'session_type' => 'user_query',
            'trigger_source' => 'test',
            'status' => 'completed',
            'started_at' => now(),
            'completed_at' => now(),
            'created_by' => 'system',
        ]);

        $this->getJson('/api/v1/ops/ai-sessions')
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => [['id', 'sessionType', 'status']],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_ops_incidents_store_creates_and_returns_data()
    {
        $this->actingAsMunicipalAdmin();
        $this->createOpsSchema();

        $this->postJson('/api/v1/ops/incidents', [
            'title' => 'Queue backlog',
            'severity' => 'major',
            'description' => 'Horizon workers stalled.',
        ])
            ->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'title', 'severity', 'status']])
            ->assertJsonPath('data.title', 'Queue backlog');

        $this->assertSame(1, DB::table('ops.incidents')->count());
    }

    public function test_ops_dashboard_snapshot_returns_data()
    {
        $this->actingAsMunicipalAdmin();
        $this->createOpsSchema();

        $this->getJson('/api/v1/ops/dashboard/snapshot')
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['asOf', 'financial', 'infrastructure', 'email', 'pipeline', 'system', 'costs', 'alerts'],
            ]);
    }

    public function test_municipal_admin_can_access_ops_dashboard()
    {
        $admin = User::factory()->create();

        // Create a community using the factory to fulfill all required fields automatically
        $community = \App\Models\Community::factory()->create();

        // Create municipal admin record
        DB::table('municipal_admins')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $admin->id,
            'community_id' => $community->id,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Insert some dummy data to avoid entirely empty JSON if tables exist
        try {
            DB::table('metric_aggregates')->insert([
                'metric_id' => '1',
                'value' => 5,
                'dimension' => 'global',
                'period_start' => now(),
                'period_end' => now(),
            ]);
        } catch (\Exception $e) {
            // Ignored if table scheme differs slightly
        }

        $endpoints = [
            '/api/v1/ops/metrics',
            '/api/v1/ops/health',
            '/api/v1/ops/queues',
            '/api/v1/ops/costs',
            '/api/v1/ops/incidents',
            '/api/v1/ops/pipeline',
            '/api/v1/ops/actions',
            '/api/v1/ops/metric-definitions',
            '/api/v1/ops/system-status',
        ];

        foreach ($endpoints as $endpoint) {
            $response = $this->actingAs($admin, 'sanctum')->getJson($endpoint);
            // Even if tables are missing, it might throw 500. We just assert 200 to verify the route and controller work.
            $response->assertStatus(200);
            $response->assertJsonStructure(['data']);
        }
    }
}
