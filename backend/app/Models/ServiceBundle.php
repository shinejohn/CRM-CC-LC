<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class ServiceBundle extends Model
{
    use HasUuids;

    protected $fillable = [
        'slug',
        'name',
        'tagline',
        'description',
        'price_cents',
        'setup_fee_cents',
        'stripe_price_id',
        'stripe_product_id',
        'features',
        'included_services',
        'is_active',
        'sort_order',
        'highlight_badge',
    ];

    protected $casts = [
        'features'          => 'array',
        'included_services' => 'array',
        'is_active'         => 'boolean',
        'price_cents'       => 'integer',
        'setup_fee_cents'   => 'integer',
        'sort_order'        => 'integer',
    ];

    public function getPriceAttribute(): float
    {
        return $this->price_cents / 100;
    }

    public function getSetupFeeAttribute(): float
    {
        return $this->setup_fee_cents / 100;
    }
}
