<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PresentationTemplate;
use App\Models\GeneratedPresentation;
use App\Models\Customer;
use App\Services\OpenRouterService;
use App\Services\ElevenLabsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class PresentationController extends Controller
{
    protected OpenRouterService $openRouterService;
    protected ElevenLabsService $elevenLabsService;

    public function __construct(
        OpenRouterService $openRouterService,
        ElevenLabsService $elevenLabsService
    ) {
        $this->openRouterService = $openRouterService;
        $this->elevenLabsService = $elevenLabsService;
    }

    /**
     * List presentation templates
     */
    public function templates(Request $request): JsonResponse
    {
        $query = PresentationTemplate::where('is_active', true);
        
        if ($request->has('purpose')) {
            $query->where('purpose', $request->purpose);
        }
        
        $templates = $query->orderBy('name')->get();
        
        return response()->json([
            'data' => $templates,
            'count' => $templates->count(),
        ]);
    }
    
    /**
     * Get presentation template
     */
    public function showTemplate(string $id): JsonResponse
    {
        $template = PresentationTemplate::findOrFail($id);
        
        return response()->json([
            'data' => $template,
        ]);
    }
    
    /**
     * Get generated presentation
     */
    public function show(string $id): JsonResponse
    {
        $presentation = GeneratedPresentation::with('template')->findOrFail($id);
        
        // Increment view count
        $presentation->increment('view_count');
        $presentation->last_viewed_at = now();
        $presentation->save();
        
        return response()->json([
            'data' => $presentation,
        ]);
    }
    
    /**
     * Generate presentation
     */
    public function generate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tenant_id' => 'required|uuid',
            'template_id' => 'required|string|exists:presentation_templates,id',
            'customer_id' => 'nullable|uuid|exists:customers,id',
            'custom_data' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $tenantId = $request->input('tenant_id');
        $templateId = $request->input('template_id');
        $customerId = $request->input('customer_id');
        $customData = $request->input('custom_data', []);
        
        // Get template
        $template = PresentationTemplate::findOrFail($templateId);
        
        // Get customer data if provided
        $customerData = null;
        if ($customerId) {
            $customer = Customer::where('tenant_id', $tenantId)->findOrFail($customerId);
            $customerData = [
                'business_name' => $customer->business_name,
                'owner_name' => $customer->owner_name,
                'industry' => $customer->industry_category,
                'description' => $customer->business_description,
            ];
        }
        
        // Generate presentation content
        $presentationJson = $this->generatePresentationContent($template, $customerData, $customData);
        
        // Create input hash for caching
        $inputHash = hash('sha256', json_encode([
            'template_id' => $templateId,
            'customer_id' => $customerId,
            'custom_data' => $customData,
        ]));
        
        // Check for existing cached presentation
        $existing = GeneratedPresentation::where('input_hash', $inputHash)
            ->where('expires_at', '>', now())
            ->first();
        
        if ($existing) {
            return response()->json([
                'data' => $existing,
                'message' => 'Cached presentation retrieved',
                'cached' => true,
            ]);
        }
        
        // Create new presentation
        $presentation = GeneratedPresentation::create([
            'tenant_id' => $tenantId,
            'customer_id' => $customerId,
            'template_id' => $templateId,
            'presentation_json' => $presentationJson,
            'input_hash' => $inputHash,
            'expires_at' => now()->addDays(30), // Cache for 30 days
        ]);
        
        return response()->json([
            'data' => $presentation,
            'message' => 'Presentation generated successfully',
            'cached' => false,
        ], 201);
    }
    
    /**
     * Generate presentation content from template
     */
    protected function generatePresentationContent(
        PresentationTemplate $template,
        ?array $customerData,
        array $customData
    ): array {
        $slides = $template->slides ?? [];
        $injectionPoints = $template->injection_points ?? [];
        
        // Process each slide
        $generatedSlides = [];
        foreach ($slides as $slide) {
            $slideData = $slide;
            
            // Inject customer data if available
            if ($customerData) {
                foreach ($injectionPoints as $field => $targetSlides) {
                    if (in_array($slide['id'] ?? null, $targetSlides)) {
                        $slideData['content'] = str_replace(
                            "{{{$field}}}",
                            $customerData[$field] ?? '',
                            $slideData['content'] ?? ''
                        );
                    }
                }
            }
            
            // Inject custom data
            foreach ($customData as $key => $value) {
                $slideData['content'] = str_replace(
                    "{{{$key}}}",
                    $value,
                    $slideData['content'] ?? ''
                );
            }
            
            $generatedSlides[] = $slideData;
        }
        
        return [
            'id' => (string) Str::uuid(),
            'template_id' => $template->id,
            'template_name' => $template->name,
            'slides' => $generatedSlides,
            'theme' => $template->default_theme ?? [],
            'presenter_id' => $template->default_presenter_id,
            'generated_at' => now()->toIso8601String(),
        ];
    }
    
    /**
     * Generate audio for presentation
     */
    public function generateAudio(Request $request, string $id): JsonResponse
    {
        $presentation = GeneratedPresentation::findOrFail($id);
        
        if ($presentation->audio_generated) {
            return response()->json([
                'data' => $presentation,
                'message' => 'Audio already generated',
            ]);
        }
        
        $slides = $presentation->presentation_json['slides'] ?? [];
        $audioFiles = [];
        
        // Generate audio for each slide
        foreach ($slides as $slide) {
            $text = $this->extractTextFromSlide($slide);
            if (empty($text)) {
                continue;
            }
            
            $audioData = $this->elevenLabsService->generateAudio($text);
            if ($audioData) {
                // Save audio file
                $filename = "presentations/{$presentation->id}/slide-{$slide['id']}.mp3";
                Storage::disk('public')->put($filename, $audioData);
                
                $audioFiles[$slide['id']] = $filename;
            }
        }
        
        // Update presentation
        $presentation->audio_generated = true;
        $presentation->audio_generated_at = now();
        $presentation->audio_base_url = Storage::disk('public')->url('presentations/' . $presentation->id);
        
        // Update presentation JSON with audio file references
        $presentationJson = $presentation->presentation_json;
        $presentationJson['audio_files'] = $audioFiles;
        $presentation->presentation_json = $presentationJson;
        $presentation->save();
        
        return response()->json([
            'data' => $presentation->fresh(),
            'message' => 'Audio generated successfully',
        ]);
    }
    
    /**
     * Extract text content from slide
     */
    protected function extractTextFromSlide(array $slide): string
    {
        $text = '';
        
        // Extract from content field
        if (isset($slide['content'])) {
            $text .= strip_tags($slide['content']) . ' ';
        }
        
        // Extract from title
        if (isset($slide['title'])) {
            $text .= $slide['title'] . ' ';
        }
        
        // Extract from body
        if (isset($slide['body'])) {
            $text .= strip_tags($slide['body']) . ' ';
        }
        
        return trim($text);
    }
}
