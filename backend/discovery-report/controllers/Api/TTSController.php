<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ElevenLabsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TTSController extends Controller
{
    protected ElevenLabsService $elevenLabsService;

    public function __construct(ElevenLabsService $elevenLabsService)
    {
        $this->elevenLabsService = $elevenLabsService;
    }

    /**
     * Generate TTS audio
     */
    public function generate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'text' => 'required|string|max:5000',
            'voice_id' => 'nullable|string',
            'save' => 'nullable|boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $text = $request->input('text');
        $voiceId = $request->input('voice_id');
        $save = $request->input('save', false);
        
        $audioData = $this->elevenLabsService->generateAudio($text, $voiceId);
        
        if (!$audioData) {
            return response()->json([
                'error' => 'Failed to generate audio'
            ], 500);
        }
        
        $response = [
            'audio_base64' => base64_encode($audioData),
            'text' => $text,
            'voice_id' => $voiceId ?? config('services.elevenlabs.default_voice_id'),
            'length' => strlen($audioData),
        ];
        
        // Save to storage if requested
        if ($save) {
            $filename = 'tts/' . Str::uuid() . '.mp3';
            Storage::disk('public')->put($filename, $audioData);
            $response['url'] = Storage::disk('public')->url($filename);
            $response['filename'] = $filename;
        }
        
        return response()->json([
            'data' => $response,
            'message' => 'Audio generated successfully',
        ], 201);
    }
    
    /**
     * Get available voices
     */
    public function voices(): JsonResponse
    {
        $voices = $this->elevenLabsService->getVoices();
        
        return response()->json([
            'data' => $voices,
            'count' => count($voices),
        ]);
    }
    
    /**
     * Batch generate TTS for multiple texts
     */
    public function batchGenerate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'texts' => 'required|array|min:1|max:50',
            'texts.*' => 'required|string|max:5000',
            'voice_id' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $texts = $request->input('texts');
        $voiceId = $request->input('voice_id');
        $results = [];
        
        foreach ($texts as $index => $text) {
            $audioData = $this->elevenLabsService->generateAudio($text, $voiceId);
            
            if ($audioData) {
                $filename = 'tts/batch/' . Str::uuid() . '.mp3';
                Storage::disk('public')->put($filename, $audioData);
                
                $results[] = [
                    'index' => $index,
                    'text' => $text,
                    'url' => Storage::disk('public')->url($filename),
                    'filename' => $filename,
                    'success' => true,
                ];
            } else {
                $results[] = [
                    'index' => $index,
                    'text' => $text,
                    'success' => false,
                    'error' => 'Failed to generate audio',
                ];
            }
        }
        
        return response()->json([
            'data' => $results,
            'message' => 'Batch generation completed',
            'success_count' => count(array_filter($results, fn($r) => $r['success'])),
            'failed_count' => count(array_filter($results, fn($r) => !$r['success'])),
        ]);
    }
}
