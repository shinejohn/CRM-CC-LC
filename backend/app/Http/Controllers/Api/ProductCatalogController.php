<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\ProductDependencyService;
use Illuminate\Http\Request;

class ProductCatalogController extends Controller
{
    private ProductDependencyService $dependencyService;

    public function __construct(ProductDependencyService $dependencyService)
    {
        $this->dependencyService = $dependencyService;
    }

    /**
     * List all active products with purchase eligibility for authenticated tenant.
     */
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? $request->user()->id;

        $products = $this->dependencyService->availableProducts($tenantId);

        return response()->json(['data' => $products]);
    }

    /**
     * Get a single product by slug.
     */
    public function show(string $slug)
    {
        $product = Service::where('product_slug', $slug)->first();

        if (! $product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        return response()->json(['data' => $product]);
    }

    /**
     * Check if the authenticated tenant can purchase a product.
     */
    public function canPurchase(Request $request, string $slug)
    {
        $tenantId = $request->user()->tenant_id ?? $request->user()->id;

        $result = $this->dependencyService->canPurchase($tenantId, $slug);

        return response()->json(['data' => $result]);
    }
}
