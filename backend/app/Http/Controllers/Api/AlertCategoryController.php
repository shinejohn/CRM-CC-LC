<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert\AlertCategory;
use Illuminate\Http\JsonResponse;

class AlertCategoryController extends Controller
{
    /**
     * List alert categories
     */
    public function index(): JsonResponse
    {
        $categories = AlertCategory::where('is_active', true)
            ->orderBy('display_order')
            ->get();
        
        return response()->json($categories);
    }
}



