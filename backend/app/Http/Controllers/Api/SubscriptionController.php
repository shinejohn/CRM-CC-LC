<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Subscriber\SubscriberService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SubscriptionController extends Controller
{
    public function __construct(
        private SubscriberService $subscriberService
    ) {}

    /**
     * Register new subscriber
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'zip_code' => 'nullable|string|max:20',
            'newsletter_frequency' => 'nullable|in:daily,weekly,none',
            'community_ids' => 'nullable|array',
            'community_ids.*' => 'uuid',
            'source' => 'nullable|string|max:50',
            'source_detail' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $subscriber = $this->subscriberService->register($validator->validated());
            
            return response()->json([
                'message' => 'Subscription successful. Please check your email to verify your address.',
                'subscriber' => $subscriber,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Verify email address
     */
    public function verify(string $token): JsonResponse
    {
        try {
            $subscriber = $this->subscriberService->verifyEmail($token);
            
            return response()->json([
                'message' => 'Email verified successfully.',
                'subscriber' => $subscriber,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Handle one-click unsubscribe
     */
    public function unsubscribe(string $token): JsonResponse
    {
        try {
            $result = $this->subscriberService->unsubscribe($token);
            
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }
}



