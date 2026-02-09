<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DialogTree extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'trigger_type',
        'pipeline_stage',
        'is_active',
        'metadata',
    ];
    
    protected $casts = [
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];
    
    public function nodes(): HasMany
    {
        return $this->hasMany(DialogTreeNode::class)->orderBy('order');
    }
    
    public function executions(): HasMany
    {
        return $this->hasMany(DialogExecution::class);
    }
    
    public function getStartNode(): ?DialogTreeNode
    {
        return $this->nodes()->where('node_key', 'start')->first()
            ?? $this->nodes()->orderBy('order')->first();
    }
    
    public function getNode(string $nodeKey): ?DialogTreeNode
    {
        return $this->nodes()->where('node_key', $nodeKey)->first();
    }
    
    /**
     * Find appropriate dialog tree for context.
     */
    public static function findForContext(string $triggerType, ?string $pipelineStage = null): ?self
    {
        $query = static::where('trigger_type', $triggerType)
            ->where('is_active', true);
        
        if ($pipelineStage) {
            $query->where(function ($q) use ($pipelineStage) {
                $q->where('pipeline_stage', $pipelineStage)
                  ->orWhereNull('pipeline_stage');
            });
        }
        
        return $query->first();
    }
}

