<?php

namespace App\Models\Emergency;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmergencyCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'description',
        'default_severity',
        'template_message',
        'template_instructions',
        'default_voice',
        'icon',
        'color',
        'display_order',
    ];

    protected $casts = [
        'default_voice' => 'boolean',
    ];

    /**
     * Get all broadcasts for this category
     */
    public function broadcasts()
    {
        return $this->hasMany(EmergencyBroadcast::class, 'category', 'slug');
    }
}



