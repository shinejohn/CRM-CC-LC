<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class Presenter extends Model
{
    use HasUuids;

    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'role',
        'avatar_url',
        'voice_provider',
        'voice_id',
        'voice_settings',
        'personality',
        'communication_style',
        'is_active',
    ];

    protected $casts = [
        'voice_settings' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
    ];
}






