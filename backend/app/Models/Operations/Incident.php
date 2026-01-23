<?php

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Incident extends Model
{
    protected $table = 'ops.incidents';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'incident_number',
        'title',
        'description',
        'severity',
        'category',
        'impact_description',
        'affected_components',
        'affected_communities',
        'affected_customers',
        'status',
        'started_at',
        'identified_at',
        'resolved_at',
        'lead_responder',
        'responders',
        'public_message',
        'internal_notes',
        'status_page_id',
        'postmortem_url',
        'root_cause',
        'corrective_actions',
    ];

    protected $casts = [
        'affected_components' => 'array',
        'responders' => 'array',
        'corrective_actions' => 'array',
        'affected_communities' => 'integer',
        'affected_customers' => 'integer',
        'started_at' => 'datetime',
        'identified_at' => 'datetime',
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class, 'incident_id');
    }

    /**
     * Check if incident is resolved
     */
    public function isResolved(): bool
    {
        return $this->status === 'resolved' && $this->resolved_at !== null;
    }

    /**
     * Check if incident is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active' || $this->status === 'investigating';
    }
}

