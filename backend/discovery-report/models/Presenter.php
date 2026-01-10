<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Presenter extends Model
{
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






