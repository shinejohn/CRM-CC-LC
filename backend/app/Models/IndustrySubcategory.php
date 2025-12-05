<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IndustrySubcategory extends Model
{
    use HasUuids;

    protected $fillable = [
        'industry_id',
        'name',
        'code',
        'faq_count',
        'profile_questions_count',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Get parent industry
     */
    public function industry(): BelongsTo
    {
        return $this->belongsTo(IndustryCategory::class, 'industry_id');
    }
}

