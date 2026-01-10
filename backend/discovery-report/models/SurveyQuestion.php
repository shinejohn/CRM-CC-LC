<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SurveyQuestion extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'section_id',
        'question_text',
        'help_text',
        'question_type',
        'is_required',
        'display_order',
        'validation_rules',
        'options',
        'scale_config',
        'is_conditional',
        'show_when',
        'auto_populate_source',
        'requires_owner_verification',
        'industry_specific',
        'applies_to_industries',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'validation_rules' => 'array',
        'options' => 'array',
        'scale_config' => 'array',
        'is_conditional' => 'boolean',
        'show_when' => 'array',
        'requires_owner_verification' => 'boolean',
        'industry_specific' => 'boolean',
        'applies_to_industries' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get section
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(SurveySection::class, 'section_id');
    }
}






