<?php

declare(strict_types=1);

namespace App\Services\Sarah;

use App\Models\Customer;
use App\Models\SarahNotebook;
use App\Models\SarahNotebookEntry;

final class SarahNotebookService
{
    /**
     * Profile fields that map to Customer columns when approved.
     * notebook_field => customer_column
     */
    private const PROFILE_FIELD_MAP = [
        'business_name' => 'business_name',
        'contact_name' => 'name',
        'email' => 'email',
        'phone' => 'phone',
        'address' => 'address',
        'city' => 'city',
        'state' => 'state',
        'zip' => 'zip',
        'category' => 'business_type',
        'website' => 'website',
        'description' => 'notes',
    ];

    /**
     * All known profile fields and their weight for completeness calculation.
     */
    private const PROFILE_WEIGHTS = [
        'business_name' => 15,
        'contact_name' => 10,
        'email' => 15,
        'phone' => 10,
        'address' => 5,
        'city' => 5,
        'state' => 5,
        'zip' => 3,
        'category' => 10,
        'website' => 5,
        'description' => 7,
        'hours' => 5,
        'services' => 5,
    ];

    /**
     * Get or create a notebook for a customer.
     */
    public function resolve(string $customerId, string $purpose = 'profile'): SarahNotebook
    {
        return SarahNotebook::firstOrCreate(
            ['customer_id' => $customerId, 'purpose' => $purpose],
            ['data' => [], 'field_log' => [], 'status' => 'draft', 'completeness' => 0],
        );
    }

    /**
     * Set one or more fields on the notebook.
     *
     * @param  array<string, mixed>  $fields  key => value pairs
     * @param  string  $source  'ai', 'user', 'form', 'scrape', 'import'
     * @param  string|null  $sourceDetail  e.g. campaign ID, form ID, chat message ID
     */
    public function setFields(
        SarahNotebook $notebook,
        array $fields,
        string $source = 'ai',
        ?string $sourceDetail = null,
    ): SarahNotebook {
        $data = $notebook->data ?? [];
        $fieldLog = $notebook->field_log ?? [];
        $entries = [];

        foreach ($fields as $key => $value) {
            if ($value === null || $value === '') {
                continue;
            }

            $oldValue = $data[$key] ?? null;

            // Don't overwrite user-verified data with AI guesses
            if ($source === 'ai' && isset($fieldLog[$key]) && ($fieldLog[$key]['source'] ?? '') === 'user') {
                continue;
            }

            $stringValue = is_array($value) ? json_encode($value, JSON_THROW_ON_ERROR) : (string) $value;
            $oldStringValue = $oldValue !== null
                ? (is_array($oldValue) ? json_encode($oldValue, JSON_THROW_ON_ERROR) : (string) $oldValue)
                : null;

            // Skip if value hasn't changed
            if ($oldStringValue === $stringValue) {
                continue;
            }

            $data[$key] = $value;
            $fieldLog[$key] = [
                'source' => $source,
                'source_detail' => $sourceDetail,
                'updated_at' => now()->toISOString(),
            ];

            $entries[] = [
                'field_name' => $key,
                'old_value' => $oldStringValue,
                'new_value' => $stringValue,
                'source' => $source,
                'source_detail' => $sourceDetail,
            ];
        }

        if (count($entries) === 0) {
            return $notebook;
        }

        $notebook->update([
            'data' => $data,
            'field_log' => $fieldLog,
            'completeness' => $this->calculateCompleteness($data, $notebook->purpose),
        ]);

        foreach ($entries as $entry) {
            $notebook->entries()->create($entry);
        }

        return $notebook->refresh();
    }

    /**
     * Get notebook data formatted as AI context for Sarah.
     *
     * @return array{known_fields: array<string, mixed>, missing_fields: string[], completeness: float}
     */
    public function getAIContext(SarahNotebook $notebook): array
    {
        $data = $notebook->data ?? [];
        $weights = $notebook->purpose === 'profile' ? self::PROFILE_WEIGHTS : [];

        $known = [];
        $missing = [];

        foreach ($weights as $field => $weight) {
            if (isset($data[$field]) && $data[$field] !== '' && $data[$field] !== null) {
                $known[$field] = $data[$field];
            } else {
                $missing[] = $field;
            }
        }

        // Include any extra fields not in weights
        foreach ($data as $key => $value) {
            if (! isset($known[$key]) && $value !== null && $value !== '') {
                $known[$key] = $value;
            }
        }

        return [
            'known_fields' => $known,
            'missing_fields' => $missing,
            'completeness' => (float) $notebook->completeness,
        ];
    }

    /**
     * Get change history for a specific field or all fields.
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, SarahNotebookEntry>
     */
    public function getHistory(SarahNotebook $notebook, ?string $fieldName = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = $notebook->entries();

        if ($fieldName !== null) {
            $query->where('field_name', $fieldName);
        }

        return $query->orderByDesc('created_at')->limit(100)->get();
    }

    /**
     * Approve the notebook and commit data to Customer record.
     */
    public function approve(SarahNotebook $notebook): SarahNotebook
    {
        if ($notebook->purpose !== 'profile') {
            $notebook->update(['status' => 'approved', 'committed_at' => now()]);

            return $notebook->refresh();
        }

        $data = $notebook->data ?? [];
        $updates = [];

        foreach (self::PROFILE_FIELD_MAP as $notebookField => $customerColumn) {
            if (isset($data[$notebookField]) && $data[$notebookField] !== '' && $data[$notebookField] !== null) {
                $updates[$customerColumn] = $data[$notebookField];
            }
        }

        // Store any extra fields in customer metadata
        $extraFields = array_diff_key($data, self::PROFILE_FIELD_MAP);
        if (count($extraFields) > 0) {
            $customer = $notebook->customer;
            $metadata = $customer->metadata ?? [];
            $metadata['notebook_extras'] = $extraFields;
            $updates['metadata'] = $metadata;
        }

        if (count($updates) > 0) {
            Customer::where('id', $notebook->customer_id)->update($updates);
        }

        $notebook->update(['status' => 'approved', 'committed_at' => now()]);

        return $notebook->refresh();
    }

    /**
     * Reset to draft (e.g., if customer wants to make more changes).
     */
    public function reopen(SarahNotebook $notebook): SarahNotebook
    {
        $notebook->update(['status' => 'draft', 'committed_at' => null]);

        return $notebook->refresh();
    }

    private function calculateCompleteness(array $data, string $purpose): float
    {
        $weights = $purpose === 'profile' ? self::PROFILE_WEIGHTS : [];

        if (count($weights) === 0) {
            // For non-profile notebooks, just count non-empty fields
            $filled = count(array_filter($data, fn ($v) => $v !== null && $v !== ''));
            $total = max(count($data), 1);

            return round(($filled / $total) * 100, 2);
        }

        $totalWeight = array_sum($weights);
        $earnedWeight = 0;

        foreach ($weights as $field => $weight) {
            if (isset($data[$field]) && $data[$field] !== '' && $data[$field] !== null) {
                $earnedWeight += $weight;
            }
        }

        return round(($earnedWeight / max($totalWeight, 1)) * 100, 2);
    }
}
