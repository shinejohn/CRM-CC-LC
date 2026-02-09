<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Events\SMSReceived;
use App\Services\SMSIntentClassifier;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TwilioSMSWebhookController extends Controller
{
    public function __construct(
        protected SMSIntentClassifier $intentClassifier
    ) {}

    /**
     * Handle incoming SMS webhook from Twilio
     * 
     * POST /webhooks/twilio/sms
     */
    public function handleIncomingSMS(Request $request): JsonResponse
    {
        try {
            // Validate Twilio webhook data
            $validator = Validator::make($request->all(), [
                'From' => 'required|string',
                'To' => 'required|string',
                'Body' => 'required|string',
                'MessageSid' => 'required|string',
            ]);

            if ($validator->fails()) {
                Log::warning('Invalid Twilio SMS webhook data', [
                    'errors' => $validator->errors(),
                    'data' => $request->all(),
                ]);
                
                return response()->json(['error' => 'Invalid webhook data'], 400);
            }

            $fromNumber = $request->input('From');
            $toNumber = $request->input('To');
            $messageBody = $request->input('Body');
            $messageSid = $request->input('MessageSid');

            Log::info('Received SMS webhook from Twilio', [
                'from' => $fromNumber,
                'to' => $toNumber,
                'message_sid' => $messageSid,
                'message_length' => strlen($messageBody),
            ]);

            // Find customer by phone number
            $customer = Customer::where('phone', $this->normalizePhoneNumber($fromNumber))
                ->orWhere('primary_phone', $this->normalizePhoneNumber($fromNumber))
                ->first();

            if (!$customer) {
                Log::warning('SMS received from unknown number', [
                    'from' => $fromNumber,
                    'normalized' => $this->normalizePhoneNumber($fromNumber),
                ]);
                
                // Return success to Twilio but don't process
                return response()->json(['status' => 'received', 'message' => 'Unknown sender']);
            }

            // Check if customer has opted in for SMS
            if (!$customer->sms_opted_in) {
                Log::info('SMS received from opted-out customer', [
                    'customer_id' => $customer->id,
                    'from' => $fromNumber,
                ]);
                
                // Still return success to Twilio
                return response()->json(['status' => 'received', 'message' => 'Customer opted out']);
            }

            // Pre-classify intent (optional optimization)
            $classification = $this->intentClassifier->classify($messageBody);
            $sentiment = $this->intentClassifier->analyzeSentiment($messageBody);

            // Fire SMSReceived event
            event(new SMSReceived(
                customer: $customer,
                fromNumber: $fromNumber,
                message: $messageBody,
                classifiedIntent: $classification['intent'],
                intentConfidence: $classification['confidence'],
                sentiment: $sentiment
            ));

            Log::info('SMSReceived event fired', [
                'customer_id' => $customer->id,
                'intent' => $classification['intent'],
                'confidence' => $classification['confidence'],
            ]);

            // Return success response to Twilio
            return response()->json([
                'status' => 'received',
                'message' => 'SMS processed successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('Error processing Twilio SMS webhook', [
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
     * Handle SMS status callback from Twilio
     * 
     * POST /webhooks/twilio/sms/status
     */
    public function handleStatusCallback(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'MessageSid' => 'required|string',
                'MessageStatus' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => 'Invalid status data'], 400);
            }

            $messageSid = $request->input('MessageSid');
            $status = $request->input('MessageStatus');

            Log::info('SMS status callback received', [
                'message_sid' => $messageSid,
                'status' => $status,
            ]);

            // TODO: Update campaign_sends or interaction records with status
            // This would require tracking message_sid in the database

            return response()->json(['status' => 'received']);

        } catch (\Exception $e) {
            Log::error('Error processing SMS status callback', [
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

