<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Newsletter\NewsletterTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NewsletterTemplateController extends Controller
{
    /**
     * List templates
     */
    public function index(Request $request): JsonResponse
    {
        $query = NewsletterTemplate::query();

        if ($request->has('newsletter_type')) {
            $query->where('newsletter_type', $request->newsletter_type);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $templates = $query->orderBy('name')->paginate($request->get('per_page', 20));

        return response()->json($templates);
    }

    /**
     * Get template
     */
    public function show(int $id): JsonResponse
    {
        $template = NewsletterTemplate::findOrFail($id);

        return response()->json([
            'template' => $template,
        ]);
    }
}



