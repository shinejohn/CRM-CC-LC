<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class AgentKnowledgeConfig extends Model
{
    use \App\Traits\HasTenantScope, HasUuids;

    protected $fillable = [
        'tenant_id',
        'agent_id',
        'config',
    ];

    protected $casts = [
        'config' => 'array',
    ];

    /**
     * @return BelongsTo<AiPersonality, AgentKnowledgeConfig>
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(AiPersonality::class, 'agent_id');
    }
}
