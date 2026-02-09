<?php

namespace App\Models\Newsletter;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsletterContentItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'newsletter_id',
        'content_type',
        'content_id',
        'position',
        'section',
        'headline',
        'summary',
        'image_url',
        'link_url',
        'click_count',
    ];

    /**
     * Get the newsletter this item belongs to
     */
    public function newsletter(): BelongsTo
    {
        return $this->belongsTo(Newsletter::class);
    }
}



