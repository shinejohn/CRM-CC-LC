<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\PipelineStage;

class CampaignTimeline extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'pipeline_stage',
        'duration_days',
        'is_active',
        'metadata',
    ];
    
    protected $casts = [
        'pipeline_stage' => PipelineStage::class,
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];
    
    public function actions(): HasMany
    {
        return $this->hasMany(CampaignTimelineAction::class)->orderBy('day_number')->orderBy('priority');
    }
    
    public function customerProgress(): HasMany
    {
        return $this->hasMany(CustomerTimelineProgress::class);
    }
    
    public function getActionsForDay(int $day): \Illuminate\Database\Eloquent\Collection
    {
        return $this->actions()->where('day_number', $day)->where('is_active', true)->get();
    }
    
    public static function getActiveForStage(PipelineStage $stage): ?self
    {
        return static::where('pipeline_stage', $stage)
            ->where('is_active', true)
            ->first();
    }
}

