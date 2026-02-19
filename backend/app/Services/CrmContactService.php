<?php

namespace App\Services;

use App\Models\CrmContact;
use Illuminate\Pagination\LengthAwarePaginator;

class CrmContactService
{
    /**
     * List contacts for tenant.
     */
    public function list(string $tenantId, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = CrmContact::where('tenant_id', $tenantId)
            ->with('customer');

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhereHas('customer', fn ($cq) => $cq->where('business_name', 'ilike', "%{$search}%"));
            });
        }

        if (!empty($filters['is_primary'])) {
            $query->where('is_primary', (bool) $filters['is_primary']);
        }

        $sortBy = $filters['sort_by'] ?? 'name';
        $sortDir = $filters['sort_dir'] ?? 'asc';
        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($perPage);
    }

    /**
     * Create contact.
     */
    public function create(string $tenantId, array $data): CrmContact
    {
        if (!empty($data['is_primary'])) {
            CrmContact::where('customer_id', $data['customer_id'])->update(['is_primary' => false]);
        }

        $contact = CrmContact::create([
            'tenant_id' => $tenantId,
            'customer_id' => $data['customer_id'],
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'title' => $data['title'] ?? null,
            'is_primary' => $data['is_primary'] ?? false,
            'notes' => $data['notes'] ?? null,
        ]);

        return $contact->load('customer');
    }

    /**
     * Update contact.
     */
    public function update(CrmContact $contact, array $data): CrmContact
    {
        if (!empty($data['is_primary']) && $data['is_primary']) {
            CrmContact::where('customer_id', $contact->customer_id)->update(['is_primary' => false]);
        }

        $contact->fill(array_filter([
            'name' => $data['name'] ?? $contact->name,
            'email' => $data['email'] ?? $contact->email,
            'phone' => $data['phone'] ?? $contact->phone,
            'title' => $data['title'] ?? $contact->title,
            'is_primary' => $data['is_primary'] ?? $contact->is_primary,
            'notes' => $data['notes'] ?? $contact->notes,
        ]));

        $contact->save();

        return $contact->load('customer');
    }

    /**
     * Find potential duplicates by email.
     */
    public function findDuplicates(string $tenantId, string $email, ?string $excludeId = null): array
    {
        $query = CrmContact::where('tenant_id', $tenantId)
            ->where('email', $email);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->with('customer')->get()->all();
    }

    /**
     * Merge two contacts (keep target, move related records from source, delete source).
     */
    public function merge(CrmContact $target, CrmContact $source): CrmContact
    {
        if ($target->id === $source->id) {
            throw new \InvalidArgumentException('Cannot merge contact with itself');
        }

        if ($target->customer_id !== $source->customer_id) {
            throw new \InvalidArgumentException('Can only merge contacts from the same customer');
        }

        \DB::transaction(function () use ($target, $source) {
            \App\Models\Deal::where('contact_id', $source->id)->update(['contact_id' => $target->id]);
            \App\Models\CrmActivity::where('contact_id', $source->id)->update(['contact_id' => $target->id]);
            $source->delete();
        });

        return $target->fresh('customer');
    }
}
