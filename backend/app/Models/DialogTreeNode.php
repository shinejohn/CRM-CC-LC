<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DialogTreeNode extends Model
{
    protected $fillable = [
        'dialog_tree_id',
        'node_key',
        'node_type',
        'content',
        'prompt',
        'expected_responses',
        'branches',
        'default_next',
        'action_type',
        'action_params',
        'order',
    ];
    
    protected $casts = [
        'expected_responses' => 'array',
        'branches' => 'array',
        'action_params' => 'array',
    ];
    
    public function tree(): BelongsTo
    {
        return $this->belongsTo(DialogTree::class, 'dialog_tree_id');
    }
    
    /**
     * Determine next node based on response.
     */
    public function getNextNode(string $response): ?string
    {
        if (!$this->branches) {
            return $this->default_next;
        }
        
        $response = strtolower(trim($response));
        
        foreach ($this->branches as $branch) {
            $triggers = array_map('strtolower', $branch['triggers'] ?? []);
            
            foreach ($triggers as $trigger) {
                if (str_contains($response, $trigger)) {
                    return $branch['next_node'];
                }
            }
        }
        
        return $this->default_next;
    }
    
    /**
     * Check if this is a terminal node.
     */
    public function isTerminal(): bool
    {
        return $this->node_type === 'end' || 
               (empty($this->default_next) && empty($this->branches));
    }
}

