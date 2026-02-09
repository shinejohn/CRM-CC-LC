<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Events\VoicemailReceived;
use App\Jobs\ProcessVoicemail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TwilioVoicemailWebhookController extends Controller
{
    /**
     * Handle voicemail webhook from Twilio
     * 
     * POST /webhooks/twilio/voicemail
     */
    public function handleVoicemail(Request $request): JsonResponse
    {
        try {
            // Validate Twilio webhook data
            $validator = Validator::make($request->all(), [
                'From' => 'required|string',
                'To' => 'required|string',
                'RecordingUrl' => 'required|string',
                'RecordingSid' => 'required|string',
                'RecordingDuration' => 'nullable|integer',
            ]);

            if ($validator->fails()) {
                Log::warning('Invalid Twilio voicemail webhook data', [
                    'errors' => $validator->errors(),
                    'data' => $request->all(),
                ]);
                
                return response()->json(['error' => 'Invalid webhook data'], 400);
            }

            $fromNumber = $request->input('From');
            $toNumber = $request->input('To');
            $recordingUrl = $request->input('RecordingUrl');
            $recordingSid = $request->input('RecordingSid');
            $durationSeconds = $request->input('RecordingDuration');

            Log::info('Received voicemail webhook from Twilio', [
                'from' => $fromNumber,
                'to' => $toNumber,
                'recording_sid' => $recordingSid,
                'recording_url' => $recordingUrl,
                'duration' => $durationSeconds,
            ]);

            // Find customer by phone number
            $customer = Customer::where('phone', $this->normalizePhoneNumber($fromNumber))
                ->orWhere('primary_phone', $this->normalizePhoneNumber($fromNumber))
                ->first();

            if (!$customer) {
                Log::warning('Voicemail received from unknown number', [
                    'from' => $fromNumber,
                    'normalized' => $this->normalizePhoneNumber($fromNumber),
                ]);
                
                // Return success to Twilio but don't process
                return response()->json([
                    'status' => 'received',
                    'message' => 'Unknown sender',
                ]);
            }

            // Check if customer has opted in for phone calls
            if (!$customer->phone_opted_in && !$customer->rvm_opted_in) {
                Log::info('Voicemail received from opted-out customer', [
                    'customer_id' => $customer->id,
                    'from' => $fromNumber,
                ]);
                
                // Still return success to Twilio
                return response()->json([
                    'status' => 'received',
                    'message' => 'Customer opted out',
                ]);
            }

            // Fire VoicemailReceived event
            event(new VoicemailReceived(
                customer: $customer,
                fromNumber: $fromNumber,
                recordingUrl: $recordingUrl,
                transcription: null, // Will be set by ProcessVoicemail job
                durationSeconds: $durationSeconds,
                urgency: null // Will be determined during transcription
            ));

            // Also dispatch job to process voicemail asynchronously (transcription, etc.)
            ProcessVoicemail::dispatch(
                customer: $customer,
                fromNumber: $fromNumber,
                recordingUrl: $recordingUrl,
                durationSeconds: $durationSeconds
            );

            Log::info('VoicemailReceived event fired and ProcessVoicemail job dispatched', [
                'customer_id' => $customer->id,
                'recording_sid' => $recordingSid,
            ]);

            // Return success response to Twilio
            return response()->json([
                'status' => 'received',
                'message' => 'Voicemail queued for processing',
            ]);

        } catch (\Exception $e) {
            Log::error('Error processing Twilio voicemail webhook', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
            ]);

            // Still return success to Twilio to prevent retries
            // (we'll handle errors internally)
            return response()->json([
                'status' => 'received',
                'error' => 'Internal processing error',
            ], 200);
        }
    }

    /**
     * Handle voicemail status callback from Twilio
     * 
     * POST /webhooks/twilio/voicemail/status
     */
    public function handleStatusCallback(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'RecordingSid' => 'required|string',
                'RecordingStatus' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => 'Invalid status data'], 400);
            }

            $recordingSid = $request->input('RecordingSid');
            $status = $request->input('RecordingStatus');

            Log::info('Voicemail status callback received', [
                'recording_sid' => $recordingSid,
                'status' => $status,
            ]);

            // TODO: Update interaction records with status if needed
            // This would require tracking recording_sid in the database

            return response()->json(['status' => 'received']);

        } catch (\Exception $e) {
            Log::error('Error processing voicemail status callback', [
                'error' => $e->getMessage(),
            ]);

            return response()->json(['status' => 'received'], 200);
        }
    }

    /**
     * Normalize phone number for database lookup
     * Converts various formats to E.164 format
     */
    protected function normalizePhoneNumber(string $phone): string
    {
        // Remove all non-digit characters
        $digits = preg_replace('/\D/', '', $phone);
        
        // If starts with 1 and has 11 digits, it's US/Canada
        if (strlen($digits) === 11 && $digits[0] === '1') {
            return '+' . $digits;
        }
        
        // If 10 digits, assume US and add +1
        if (strlen($digits) === 10) {
            return '+1' . $digits;
        }
        
        // If already starts with +, return as is
        if (str_starts_with($phone, '+')) {
            return $phone;
        }
        
        // Otherwise, try to add + if it looks like an international number
        if (strlen($digits) > 10) {
            return '+' . $digits;
        }
        
        // Fallback: return original
        return $phone;
    }
}

