<?php

namespace Database\Factories;

use App\Models\Approval;
use App\Models\ProvisioningTask;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProvisioningTask>
 */
class ProvisioningTaskFactory extends Factory
{
    protected $model = ProvisioningTask::class;

    public function definition(): array
    {
        return [
            'approval_id' => Approval::factory(),
            'customer_id' => function (array $attributes) {
                $approval = Approval::find($attributes['approval_id']);
                return $approval?->customer_id;
            },
            'service_type' => function (array $attributes) {
                $approval = Approval::find($attributes['approval_id']);
                return $approval?->service_type ?? 'appointment_booking';
            },
            'status' => 'queued',
            'priority' => 3,
            'result_data' => [],
        ];
    }
}

