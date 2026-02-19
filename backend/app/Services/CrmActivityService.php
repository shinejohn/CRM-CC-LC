<?php

namespace App\Services;

use App\Models\CrmActivity;
use Illuminate\Pagination\LengthAwarePaginator;

class CrmActivityService
{
    /**
     * List activities for tenant.
     */
    public function list(string $tenantId, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = CrmActivity::where('tenant_id', $tenantId)
            ->with(['customer', 'deal', 'contact']);

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (!empty($filters['deal_id'])) {
            $query->where('deal_id', $filters['deal_id']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'ilike', "%{$search}%")
                    ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('scheduled_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('scheduled_at', '<=', $filters['date_to']);
        }

        $sortBy = $filters['sort_by'] ?? 'scheduled_at';
        $sortDir = $filters['sort_dir'] ?? 'asc';
        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($perPage);
    }

    /**
     * Create activity.
     */
    public function create(string $tenantId, array $data): CrmActivity
    {
        $activity = CrmActivity::create([
            'tenant_id' => $tenantId,
            'customer_id' => $data['customer_id'],
            'deal_id' => $data['deal_id'] ?? null,
            'contact_id' => $data['contact_id'] ?? null,
            'type' => $data['type'],
            'subject' => $data['subject'],
            'description' => $data['description'] ?? null,
            'scheduled_at' => $data['scheduled_at'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'priority' => $data['priority'] ?? 'normal',
            'reminder_at' => $data['reminder_at'] ?? null,
        ]);

        return $activity->load(['customer', 'deal', 'contact']);
    }

    /**
     * Update activity.
     */
    public function update(CrmActivity $activity, array $data): CrmActivity
    {
        $activity->fill(array_filter([
            'deal_id' => $data['deal_id'] ?? $activity->deal_id,
            'contact_id' => $data['contact_id'] ?? $activity->contact_id,
            'type' => $data['type'] ?? $activity->type,
            'subject' => $data['subject'] ?? $activity->subject,
            'description' => $data['description'] ?? $activity->description,
            'scheduled_at' => $data['scheduled_at'] ?? $activity->scheduled_at,
            'status' => $data['status'] ?? $activity->status,
            'priority' => $data['priority'] ?? $activity->priority,
            'reminder_at' => $data['reminder_at'] ?? $activity->reminder_at,
        ]));

        $activity->save();

        return $activity->load(['customer', 'deal', 'contact']);
    }

    /**
     * Complete activity.
     */
    public function complete(CrmActivity $activity, ?string $outcome = null): CrmActivity
    {
        $activity->update([
            'status' => 'completed',
            'completed_at' => now(),
            'outcome' => $outcome,
        ]);

        return $activity->load(['customer', 'deal', 'contact']);
    }

    /**
     * Get overdue activities for tenant.
     */
    public function getOverdue(string $tenantId): array
    {
        return CrmActivity::where('tenant_id', $tenantId)
            ->where('status', 'pending')
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<', now())
            ->with(['customer', 'deal', 'contact'])
            ->orderBy('scheduled_at')
            ->get()
            ->all();
    }

    /**
     * Get activities due for reminder.
     */
    public function getDueForReminder(string $tenantId): array
    {
        return CrmActivity::where('tenant_id', $tenantId)
            ->where('status', 'pending')
            ->where('reminder_sent', false)
            ->whereNotNull('reminder_at')
            ->where('reminder_at', '<=', now())
            ->with(['customer', 'deal', 'contact'])
            ->get()
            ->all();
    }
}
