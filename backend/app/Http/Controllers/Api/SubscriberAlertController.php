<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert\AlertCategory;
use App\Models\Subscriber\Subscriber;
use App\Models\Subscriber\SubscriberAlertPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriberAlertController extends Controller
{
    /**
     * Get subscriber alert preferences
     */
    public function getPreferences(Request $request): JsonResponse
    {
        $subscriber = $request->user(); // Assuming subscriber auth
        
        if (!$subscriber instanceof Subscriber) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $preferences = SubscriberAlertPreference::where('subscriber_id', $subscriber->id)
            ->get()
            ->keyBy('category_slug');
        
        $categories = AlertCategory::where('is_active', true)
            ->orderBy('display_order')
            ->get();
        
        $result = $categories->map(function ($category) use ($preferences) {
            $pref = $preferences->get($category->slug);
            return [
                'category_slug' => $category->slug,
                'category_name' => $category->name,
                'email_enabled' => $pref->email_enabled ?? true,
                'sms_enabled' => $pref->sms_enabled ?? $category->default_send_sms,
                'push_enabled' => $pref->push_enabled ?? true,
                'allow_opt_out' => $category->allow_opt_out,
            ];
        });
        
        return response()->json($result);
    }

    /**
     * Update subscriber alert preferences
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        $subscriber = $request->user();
        
        if (!$subscriber instanceof Subscriber) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $validated = $request->validate([
            'preferences' => 'required|array',
            'preferences.*.category_slug' => 'required|string|exists:alert_categories,slug',
            'preferences.*.email_enabled' => 'nullable|boolean',
            'preferences.*.sms_enabled' => 'nullable|boolean',
            'preferences.*.push_enabled' => 'nullable|boolean',
        ]);
        
        foreach ($validated['preferences'] as $pref) {
            $category = AlertCategory::where('slug', $pref['category_slug'])->first();
            
            // Check if category allows opt-out
            if (!$category->allow_opt_out) {
                continue; // Skip categories that don't allow opt-out
            }
            
            SubscriberAlertPreference::updateOrCreate(
                [
                    'subscriber_id' => $subscriber->id,
                    'category_slug' => $pref['category_slug'],
                ],
                [
                    'email_enabled' => $pref['email_enabled'] ?? true,
                    'sms_enabled' => $pref['sms_enabled'] ?? $category->default_send_sms,
                    'push_enabled' => $pref['push_enabled'] ?? true,
                ]
            );
        }
        
        return response()->json(['message' => 'Preferences updated']);
    }
}



