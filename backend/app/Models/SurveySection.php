<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SurveySection extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'display_order',
        'is_required',
        'is_conditional',
        'condition_config',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_conditional' => 'boolean',
        'condition_config' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get questions for this section
     */
    public function questions(): HasMany
    {
        return $this->hasMany(SurveyQuestion::class, 'section_id')->orderBy('display_order');
    }
}

