<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PresentationTemplate extends Model
{
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'description',
        'purpose',
        'target_audience',
        'slides',
        'audio_base_url',
        'audio_files',
        'injection_points',
        'default_theme',
        'default_presenter_id',
        'estimated_duration',
        'slide_count',
        'is_active',
    ];

    protected $casts = [
        'slides' => 'array',
        'audio_files' => 'array',
        'injection_points' => 'array',
        'default_theme' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get generated presentations
     */
    public function generatedPresentations(): HasMany
    {
        return $this->hasMany(GeneratedPresentation::class, 'template_id');
    }
}

