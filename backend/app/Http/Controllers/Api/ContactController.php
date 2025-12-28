<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ContactService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    protected ContactService $contactService;

    public function __construct(ContactService $contactService)
    {
        $this->contactService = $contactService;
    }

    /**
     * Contact customer using their assigned personality
     */
    public function contactCustomer(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|uuid|exists:customers,id',
            'contact_type' => 'required|in:email,sms,call,phone',
            'message' => 'nullable|string',
            'subject' => 'nullable|string',
            'purpose' => 'nullable|string',
            'options' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $success = $this->contactService->contactCustomer(
                $request->input('customer_id'),
                $request->input('contact_type'),
                array_merge(
                    $request->only(['message', 'subject', 'purpose', 'campaign_id']),
                    $request->input('options', [])
                )
            );

            return response()->json([
                'success' => $success,
                'message' => $success ? 'Contact sent successfully' : 'Contact failed',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to contact customer',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Schedule contact for customer
     */
    public function scheduleContact(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|uuid|exists:customers,id',
            'contact_type' => 'required|in:email,sms,call,phone',
            'scheduled_at' => 'required|date',
            'options' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $this->contactService->scheduleContact(
                $request->input('customer_id'),
                $request->input('contact_type'),
                new \DateTime($request->input('scheduled_at')),
                $request->input('options', [])
            );

            return response()->json([
                'success' => true,
                'message' => 'Contact scheduled successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to schedule contact',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get customer contact preferences
     */
    public function getPreferences(Request $request, string $customerId): JsonResponse
    {
        try {
            $preferences = $this->contactService->getContactPreferences($customerId);

            return response()->json(['data' => $preferences]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get contact preferences',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update customer contact preferences
     */
    public function updatePreferences(Request $request, string $customerId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'preferred_channel' => 'nullable|in:email,sms,call,chat',
            'allowed_channels' => 'nullable|array',
            'allowed_channels.*' => 'in:email,sms,call,chat',
            'time_of_day' => 'nullable|string',
            'frequency' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $this->contactService->updateContactPreferences(
                $customerId,
                $request->only(['preferred_channel', 'allowed_channels', 'time_of_day', 'frequency'])
            );

            return response()->json([
                'success' => true,
                'message' => 'Contact preferences updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update contact preferences',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
