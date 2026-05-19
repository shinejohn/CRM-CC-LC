<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class SarahNotebook extends Model
{
    use HasUuids;

    protected $fillable = [
        'customer_id',
        'purpose',
        'status',
        'data',
        'field_log',
        'completeness',
        'committed_at',
    ];

    protected $casts = [
        'data' => 'array',
        'field_log' => 'array',
        'completeness' => 'decimal:2',
        'committed_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function entries(): HasMany
    {
        return $this->hasMany(SarahNotebookEntry::class, 'notebook_id')->orderByDesc('created_at');
    }

    public function getField(string $key, mixed $default = null): mixed
    {
        $data = $this->data ?? [];

        return $data[$key] ?? $default;
    }

    public function getFieldSource(string $key): ?string
    {
        $log = $this->field_log ?? [];

        return $log[$key]['source'] ?? null;
    }

    public function isCommitted(): bool
    {
        return $this->status === 'approved' && $this->committed_at !== null;
    }
}
