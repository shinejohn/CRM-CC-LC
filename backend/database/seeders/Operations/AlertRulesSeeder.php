<?php

namespace Database\Seeders\Operations;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AlertRulesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            $this->command->warn('Alert rules seeder requires PostgreSQL. Skipping...');
            return;
        }

        // Get metric IDs for reference
        $bounceRateMetric = DB::table('ops.metric_definitions')
            ->where('metric_key', 'email.bounce_rate')
            ->first();
        
        $deliverabilityMetric = DB::table('ops.metric_definitions')
            ->where('metric_key', 'email.deliverability')
            ->first();
        
        $errorRateMetric = DB::table('ops.metric_definitions')
            ->where('metric_key', 'infrastructure.error_rate')
            ->first();
        
        $queueDepthMetric = DB::table('ops.metric_definitions')
            ->where('metric_key', 'system.queue_depth')
            ->first();

        $alertRules = [];

        if ($bounceRateMetric) {
            $alertRules[] = [
                'id' => DB::raw('gen_random_uuid()'),
                'rule_key' => 'email.bounce_rate.high',
                'name' => 'High Email Bounce Rate',
                'description' => 'Alert when email bounce rate exceeds 5%',
                'category' => 'email',
                'severity' => 'warning',
                'metric_id' => $bounceRateMetric->id,
                'condition_type' => 'threshold',
                'condition_operator' => 'gt',
                'condition_value' => 5.0,
                'condition_window_seconds' => 3600,
                'notification_channels' => json_encode(['slack', 'email']),
                'evaluation_interval_seconds' => 300,
                'cooldown_seconds' => 1800,
                'is_active' => true,
            ];
        }

        if ($deliverabilityMetric) {
            $alertRules[] = [
                'id' => DB::raw('gen_random_uuid()'),
                'rule_key' => 'email.deliverability.low',
                'name' => 'Low Email Deliverability',
                'description' => 'Alert when email deliverability drops below 95%',
                'category' => 'email',
                'severity' => 'critical',
                'metric_id' => $deliverabilityMetric->id,
                'condition_type' => 'threshold',
                'condition_operator' => 'lt',
                'condition_value' => 95.0,
                'condition_window_seconds' => 3600,
                'notification_channels' => json_encode(['slack', 'email', 'sms']),
                'evaluation_interval_seconds' => 300,
                'cooldown_seconds' => 1800,
                'is_active' => true,
            ];
        }

        if ($errorRateMetric) {
            $alertRules[] = [
                'id' => DB::raw('gen_random_uuid()'),
                'rule_key' => 'infrastructure.error_rate.high',
                'name' => 'High Error Rate',
                'description' => 'Alert when error rate exceeds 1%',
                'category' => 'infrastructure',
                'severity' => 'critical',
                'metric_id' => $errorRateMetric->id,
                'condition_type' => 'threshold',
                'condition_operator' => 'gt',
                'condition_value' => 1.0,
                'condition_window_seconds' => 300,
                'notification_channels' => json_encode(['slack', 'email', 'pagerduty']),
                'evaluation_interval_seconds' => 60,
                'cooldown_seconds' => 600,
                'is_active' => true,
            ];
        }

        if ($queueDepthMetric) {
            $alertRules[] = [
                'id' => DB::raw('gen_random_uuid()'),
                'rule_key' => 'system.queue_depth.backup',
                'name' => 'Queue Backup',
                'description' => 'Alert when queue depth exceeds 1000 messages',
                'category' => 'system',
                'severity' => 'warning',
                'metric_id' => $queueDepthMetric->id,
                'condition_type' => 'threshold',
                'condition_operator' => 'gt',
                'condition_value' => 1000,
                'condition_window_seconds' => 300,
                'notification_channels' => json_encode(['slack', 'email']),
                'evaluation_interval_seconds' => 60,
                'cooldown_seconds' => 1800,
                'is_active' => true,
            ];
        }

        // Infrastructure component down alert (no metric, component-based)
        $dbComponent = DB::table('ops.infrastructure_components')
            ->where('component_key', 'db.primary')
            ->first();
        
        if ($dbComponent) {
            $alertRules[] = [
                'id' => DB::raw('gen_random_uuid()'),
                'rule_key' => 'infrastructure.component.down',
                'name' => 'Infrastructure Component Down',
                'description' => 'Alert when infrastructure component status is unhealthy',
                'category' => 'infrastructure',
                'severity' => 'critical',
                'component_id' => $dbComponent->id,
                'condition_type' => 'threshold',
                'condition_query' => "SELECT COUNT(*) FROM ops.health_checks WHERE component_id = '{$dbComponent->id}' AND status != 'healthy' AND checked_at > NOW() - INTERVAL '5 minutes'",
                'condition_window_seconds' => 300,
                'notification_channels' => json_encode(['slack', 'email', 'pagerduty']),
                'evaluation_interval_seconds' => 60,
                'cooldown_seconds' => 600,
                'is_active' => true,
            ];
        }

        foreach ($alertRules as $rule) {
            // Check if rule already exists
            $exists = DB::table('ops.alert_rules')
                ->where('rule_key', $rule['rule_key'])
                ->exists();

            if (!$exists) {
                DB::table('ops.alert_rules')->insert($rule);
            }
        }

        $this->command->info('Alert rules seeded successfully.');
    }
}

