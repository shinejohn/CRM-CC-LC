<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IndustryCategory extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'code',
        'parent_industry',
        'display_order',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Get subcategories
     */
    public function subcategories(): HasMany
    {
        return $this->hasMany(IndustrySubcategory::class, 'industry_id');
    }
}

