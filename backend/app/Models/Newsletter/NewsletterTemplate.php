<?php

namespace App\Models\Newsletter;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NewsletterTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'description',
        'newsletter_type',
        'structure_json',
        'html_template',
        'is_active',
        'is_default',
    ];

    protected $casts = [
        'structure_json' => 'array',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    /**
     * Get schedules using this template
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(NewsletterSchedule::class, 'daily_template_id')
            ->orWhere('weekly_template_id', $this->id);
    }
}



