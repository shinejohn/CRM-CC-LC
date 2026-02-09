<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Subscriber\SubscriberService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SubscriberController extends Controller
{
    public function __construct(
        private SubscriberService $subscriberService
    ) {}

    /**
     * Get subscriber profile
     */
    public function profile(Request $request): JsonResponse
    {
        $subscriberId = $request->user()->id; // Assuming auth:subscriber guard
        
        $subscriber = $this->subscriberService->getWithPreferences($subscriberId);
        
        return response()->json([
            'subscriber' => $subscriber,
        ]);
    }

    /**
     * Update subscriber profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $subscriberId = $request->user()->id;
        
        $validator = Validator::make($request->all(), [
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'zip_code' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $subscriber = $this->subscriberService->updateProfile($subscriberId, $validator->validated());
        
        return response()->json([
            'message' => 'Profile updated successfully.',
            'subscriber' => $subscriber,
        ]);
    }

    /**
     * Get preferences
     */
    public function getPreferences(Request $request): JsonResponse
    {
        $subscriberId = $request->user()->id;
        
        $subscriber = $this->subscriberService->getWithPreferences($subscriberId);
        
        return response()->json([
            'preferences' => [
                'email_opted_in' => $subscriber->email_opted_in,
                'sms_opted_in' => $subscriber->sms_opted_in,
                'push_opted_in' => $subscriber->push_opted_in,
                'newsletter_frequency' => $subscriber->newsletter_frequency,
                'alerts_enabled' => $subscriber->alerts_enabled,
                'alert_preferences' => $subscriber->alertPreferences,
            ],
        ]);
    }

    /**
     * Update preferences
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        $subscriberId = $request->user()->id;
        
        $validator = Validator::make($request->all(), [
            'email_opted_in' => 'nullable|boolean',
            'sms_opted_in' => 'nullable|boolean',
            'push_opted_in' => 'nullable|boolean',
            'newsletter_frequency' => 'nullable|in:daily,weekly,none',
            'alerts_enabled' => 'nullable|boolean',
            'alert_preferences' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $subscriber = $this->subscriberService->updatePreferences($subscriberId, $validator->validated());
        
        return response()->json([
            'message' => 'Preferences updated successfully.',
            'subscriber' => $subscriber,
        ]);
    }

    /**
     * Get communities
     */
    public function getCommunities(Request $request): JsonResponse
    {
        $subscriberId = $request->user()->id;
        
        $subscriber = $this->subscriberService->getWithPreferences($subscriberId);
        
        return response()->json([
            'communities' => $subscriber->communities,
        ]);
    }

    /**
     * Subscribe to community
     */
    public function subscribeToCommunity(Request $request, string $id): JsonResponse
    {
        $subscriberId = $request->user()->id;
        
        try {
            $this->subscriberService->subscribeToCommunity($subscriberId, $id);
            
            return response()->json([
                'message' => 'Subscribed to community successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Unsubscribe from community
     */
    public function unsubscribeFromCommunity(Request $request, string $id): JsonResponse
    {
        $subscriberId = $request->user()->id;
        
        try {
            $this->subscriberService->unsubscribeFromCommunity($subscriberId, $id);
            
            return response()->json([
                'message' => 'Unsubscribed from community successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get alert preferences
     */
    public function getAlertPreferences(Request $request): JsonResponse
    {
        $subscriberId = $request->user()->id;
        
        $subscriber = $this->subscriberService->getWithPreferences($subscriberId);
        
        return response()->json([
            'alert_preferences' => $subscriber->alertPreferences,
        ]);
    }

    /**
     * Update alert preferences
     */
    public function updateAlertPreferences(Request $request): JsonResponse
    {
        $subscriberId = $request->user()->id;
        
        $validator = Validator::make($request->all(), [
            'alert_preferences' => 'required|array',
            'alert_preferences.*.category_slug' => 'required|string',
            'alert_preferences.*.email_enabled' => 'nullable|boolean',
            'alert_preferences.*.sms_enabled' => 'nullable|boolean',
            'alert_preferences.*.push_enabled' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = ['alert_preferences' => []];
        foreach ($request->input('alert_preferences') as $pref) {
            $data['alert_preferences'][$pref['category_slug']] = [
                'email' => $pref['email_enabled'] ?? true,
                'sms' => $pref['sms_enabled'] ?? false,
                'push' => $pref['push_enabled'] ?? true,
            ];
        }

        $subscriber = $this->subscriberService->updatePreferences($subscriberId, $data);
        
        return response()->json([
            'message' => 'Alert preferences updated successfully.',
            'subscriber' => $subscriber,
        ]);
    }

    /**
     * Register device token for push notifications
     */
    public function registerDevice(Request $request): JsonResponse
    {
        $subscriberId = $request->user()->id;
        
        $validator = Validator::make($request->all(), [
            'device_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $subscriber = \App\Models\Subscriber\Subscriber::findOrFail($subscriberId);
        $tokens = $subscriber->device_tokens ?? [];
        
        if (!in_array($request->device_token, $tokens)) {
            $tokens[] = $request->device_token;
            $subscriber->update([
                'device_tokens' => $tokens,
                'push_opted_in' => true,
            ]);
        }
        
        return response()->json([
            'message' => 'Device registered successfully.',
        ]);
    }

    /**
     * Unregister device token
     */
    public function unregisterDevice(Request $request, string $token): JsonResponse
    {
        $subscriberId = $request->user()->id;
        
        $subscriber = \App\Models\Subscriber\Subscriber::findOrFail($subscriberId);
        $tokens = $subscriber->device_tokens ?? [];
        
        $tokens = array_values(array_filter($tokens, fn($t) => $t !== $token));
        
        $subscriber->update([
            'device_tokens' => $tokens,
            'push_opted_in' => count($tokens) > 0,
        ]);
        
        return response()->json([
            'message' => 'Device unregistered successfully.',
        ]);
    }
}



