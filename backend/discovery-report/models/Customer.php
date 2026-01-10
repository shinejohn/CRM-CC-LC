<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * @method static \Illuminate\Database\Eloquent\Builder|Customer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Customer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Customer query()
 */

class Customer extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'slug',
        'external_id',
        'business_name',
        'owner_name',
        'industry_id',
        'sub_category',
        'phone',
        'email',
        'website',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'zip',
        'country',
        'timezone',
        'hours',
        'services',
        'social_media',
        'pos_system',
        'current_integrations',
        'google_rating',
        'google_review_count',
        'yelp_rating',
        'yelp_review_count',
        'established_year',
        'employee_count',
        'annual_revenue_range',
        'challenges',
        'goals',
        'competitors',
        'unique_selling_points',
        'unknown_fields',
        'lead_source',
        'lead_score',
        'subscription_tier',
        'first_contact_at',
        'onboarded_at',
        'assigned_rep',
        'notes',
        'tags',
        // AI-First CRM fields
        'industry_category',
        'industry_subcategory',
        'business_description',
        'products_services',
        'target_audience',
        'business_hours',
        'service_area',
        'brand_voice',
        'content_preferences',
        'contact_preferences',
    ];

    protected $casts = [
        'hours' => 'array',
        'services' => 'array',
        'social_media' => 'array',
        'current_integrations' => 'array',
        'challenges' => 'array',
        'goals' => 'array',
        'competitors' => 'array',
        'unique_selling_points' => 'array',
        'tags' => 'array',
        'unknown_fields' => 'array',
        'products_services' => 'array',
        'target_audience' => 'array',
        'business_hours' => 'array',
        'brand_voice' => 'array',
        'content_preferences' => 'array',
        'contact_preferences' => 'array',
        'google_rating' => 'decimal:1',
        'yelp_rating' => 'decimal:1',
        'lead_score' => 'integer',
        'established_year' => 'integer',
        'employee_count' => 'integer',
        'first_contact_at' => 'datetime',
        'onboarded_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($customer) {
            if (empty($customer->id)) {
                $customer->id = (string) Str::uuid();
            }
            if (empty($customer->slug) && !empty($customer->business_name)) {
                $customer->slug = Str::slug($customer->business_name) . '-' . Str::random(6);
            }
        });
    }

    /**
     * Get all conversations for this customer
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    /**
     * Get all pending questions for this customer
     */
    public function pendingQuestions(): HasMany
    {
        return $this->hasMany(PendingQuestion::class);
    }

    /**
     * Get all customer FAQs
     */
    public function faqs(): HasMany
    {
        return $this->hasMany(CustomerFaq::class);
    }
}
