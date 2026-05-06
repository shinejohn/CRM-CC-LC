<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CommunitySubscription;
use App\Models\Customer;
use App\Models\Service;
use App\Models\ServiceSubscription;

final class ProductDependencyService
{
    public function canPurchase(string $tenantId, string $productSlug): array
    {
        $product = Service::where('product_slug', $productSlug)->first();

        if (! $product) {
            return ['allowed' => false, 'missing' => [], 'error' => 'Product not found'];
        }

        $requires = $product->requires_products ?? [];

        if (empty($requires)) {
            return ['allowed' => true, 'missing' => []];
        }

        $activeProductSlugs = ServiceSubscription::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->join('services', 'services.id', '=', 'service_subscriptions.service_id')
            ->pluck('services.product_slug')
            ->filter()
            ->toArray();

        $customerIds = Customer::query()
            ->withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->pluck('id');

        $communityProductSlugs = $customerIds->isEmpty()
            ? []
            : CommunitySubscription::query()
                ->whereIn('customer_id', $customerIds)
                ->where('status', 'active')
                ->pluck('product_slug')
                ->all();

        $allActive = array_unique(array_merge($activeProductSlugs, $communityProductSlugs));
        $missing = array_diff($requires, $allActive);

        return [
            'allowed' => empty($missing),
            'missing' => array_values($missing),
        ];
    }

    public function availableProducts(string $tenantId): array
    {
        $allProducts = Service::where('is_active', true)
            ->where('is_perk', false)
            ->orderBy('name')
            ->get();

        $result = [];
        foreach ($allProducts as $product) {
            $check = $this->canPurchase($tenantId, $product->product_slug);
            $result[] = [
                'product' => $product,
                'can_purchase' => $check['allowed'],
                'missing_prerequisites' => $check['missing'] ?? [],
            ];
        }

        return $result;
    }
}
