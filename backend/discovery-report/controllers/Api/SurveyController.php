<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SurveySection;
use App\Models\SurveyQuestion;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SurveyController extends Controller
{
    /**
     * List survey sections
     */
    public function sections(): JsonResponse
    {
        $sections = SurveySection::with('questions')
            ->orderBy('display_order')
            ->get();
        
        return response()->json([
            'data' => $sections,
        ]);
    }
    
    /**
     * Get survey section
     */
    public function showSection(string $id): JsonResponse
    {
        $section = SurveySection::with('questions')->findOrFail($id);
        
        return response()->json([
            'data' => $section,
        ]);
    }
    
    /**
     * List questions for a section
     */
    public function questions(string $id): JsonResponse
    {
        $section = SurveySection::findOrFail($id);
        $questions = $section->questions()->orderBy('display_order')->get();
        
        return response()->json([
            'data' => $questions,
        ]);
    }
    
    /**
     * Create survey question
     */
    public function storeQuestion(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'section_id' => 'required|uuid|exists:survey_sections,id',
            'question_text' => 'required|string',
            'help_text' => 'nullable|string',
            'question_type' => 'required|string',
            'is_required' => 'nullable|boolean',
            'display_order' => 'nullable|integer',
            'options' => 'nullable|array',
            'validation_rules' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $question = SurveyQuestion::create($request->all());
        
        return response()->json([
            'data' => $question,
            'message' => 'Survey question created successfully'
        ], 201);
    }
    
    /**
     * Update survey question
     */
    public function updateQuestion(Request $request, string $id): JsonResponse
    {
        $question = SurveyQuestion::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'question_text' => 'sometimes|string',
            'help_text' => 'nullable|string',
            'question_type' => 'sometimes|string',
            'is_required' => 'nullable|boolean',
            'display_order' => 'nullable|integer',
            'options' => 'nullable|array',
            'validation_rules' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $question->update($request->all());
        
        return response()->json([
            'data' => $question,
            'message' => 'Survey question updated successfully'
        ]);
    }
    
    /**
     * Delete survey question
     */
    public function destroyQuestion(string $id): JsonResponse
    {
        $question = SurveyQuestion::findOrFail($id);
        $question->delete();
        
        return response()->json([
            'message' => 'Survey question deleted successfully'
        ]);
    }
    
    /**
     * Create survey section
     */
    public function storeSection(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'display_order' => 'nullable|integer',
            'is_required' => 'nullable|boolean',
            'is_conditional' => 'nullable|boolean',
            'condition_config' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $section = SurveySection::create([
            'tenant_id' => $request->input('tenant_id', '00000000-0000-0000-0000-000000000000'),
            'name' => $request->name,
            'description' => $request->description,
            'display_order' => $request->display_order ?? 0,
            'is_required' => $request->is_required ?? false,
            'is_conditional' => $request->is_conditional ?? false,
            'condition_config' => $request->condition_config,
        ]);
        
        return response()->json([
            'data' => $section,
            'message' => 'Survey section created successfully'
        ], 201);
    }
    
    /**
     * Update survey section
     */
    public function updateSection(Request $request, string $id): JsonResponse
    {
        $section = SurveySection::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'display_order' => 'nullable|integer',
            'is_required' => 'nullable|boolean',
            'is_conditional' => 'nullable|boolean',
            'condition_config' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $section->update($request->all());
        
        return response()->json([
            'data' => $section->fresh(),
            'message' => 'Survey section updated successfully'
        ]);
    }
    
    /**
     * Delete survey section
     */
    public function destroySection(string $id): JsonResponse
    {
        $section = SurveySection::findOrFail($id);
        $section->delete();
        
        return response()->json([
            'message' => 'Survey section deleted successfully'
        ]);
    }
}
