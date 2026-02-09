<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DialogExecution extends Model
{
    protected $fillable = [
        'customer_id',
        'dialog_tree_id',
        'ai_personality_id',
        'current_node',
        'status',
        'collected_data',
        'path_taken',
        'outcome',
        'started_at',
        'completed_at',
    ];
    
    protected $casts = [
        'collected_data' => 'array',
        'path_taken' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];
    
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
    
    public function dialogTree(): BelongsTo
    {
        return $this->belongsTo(DialogTree::class);
    }
    
    public function personality(): BelongsTo
    {
        return $this->belongsTo(AiPersonality::class, 'ai_personality_id');
    }
    
    /**
     * Advance to next node.
     */
    public function advanceTo(string $nodeKey): void
    {
        $path = $this->path_taken ?? [];
        $path[] = $nodeKey;
        
        $this->update([
            'current_node' => $nodeKey,
            'path_taken' => $path,
        ]);
    }
    
    /**
     * Store collected data.
     */
    public function collectData(string $key, mixed $value): void
    {
        $data = $this->collected_data ?? [];
        $data[$key] = $value;
        $this->update(['collected_data' => $data]);
    }
    
    /**
     * Complete the dialog.
     */
    public function complete(string $outcome): void
    {
        $this->update([
            'status' => 'completed',
            'outcome' => $outcome,
            'completed_at' => now(),
        ]);
    }
    
    /**
     * Escalate to human.
     */
    public function escalate(string $reason): void
    {
        $this->update([
            'status' => 'escalated',
            'outcome' => 'escalated: ' . $reason,
            'completed_at' => now(),
        ]);
    }
}

