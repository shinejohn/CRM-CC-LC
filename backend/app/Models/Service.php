<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'service_category_id',
        'name',
        'slug',
        'description',
        'long_description',
        'images',
        'price',
        'compare_at_price',
        'service_type', // 'day.news', 'goeventcity', 'downtownsguide', 'golocalvoices', 'alphasite', 'fibonacco'
        'service_tier', // 'basic', 'standard', 'premium', 'enterprise'
        'is_subscription',
        'billing_period', // 'monthly', 'annual', 'one-time'
        'features',
        'capabilities',
        'integrations',
        'quantity',
        'track_inventory',
        'sku',
        'is_active',
        'is_featured',
        'stripe_price_id',
        'stripe_product_id',
        'metadata',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(ServiceSubscription::class);
    }

    public function isInStock(): bool
    {
        if (! $this->track_inventory) {
            return true;
        }

        return $this->quantity > 0;
    }

    public function hasDiscount(): bool
    {
        return $this->compare_at_price && $this->compare_at_price > $this->price;
    }

    public function getDiscountPercentageAttribute(): ?float
    {
        if (! $this->hasDiscount()) {
            return null;
        }

        return round((($this->compare_at_price - $this->price) / $this->compare_at_price) * 100, 2);
    }

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'price' => 'decimal:2',
            'compare_at_price' => 'decimal:2',
            'is_subscription' => 'boolean',
            'features' => 'array',
            'capabilities' => 'array',
            'integrations' => 'array',
            'track_inventory' => 'boolean',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'metadata' => 'array',
        ];
    }
}
