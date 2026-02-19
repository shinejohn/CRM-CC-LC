<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CrmNotification extends Model
{
    use HasUuids;

    protected $table = 'crm_notifications';

    protected $fillable = [
        'tenant_id',
        'user_id',
        'type',
        'category',
        'title',
        'message',
        'read',
        'read_at',
        'important',
        'archived',
        'action_label',
        'action_url',
        'metadata',
    ];

    protected $casts = [
        'read' => 'boolean',
        'read_at' => 'datetime',
        'important' => 'boolean',
        'archived' => 'boolean',
        'metadata' => 'array',
    ];
}
