<?php

namespace App\Listeners;

use App\Events\SMSReceived;
use App\Services\SMSIntentClassifier;
use App\Services\SMSResponseHandler;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class HandleSMSReceived implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        protected SMSIntentClassifier $intentClassifier,
        protected SMSResponseHandler $responseHandler
    ) {}

    /**
     * Handle the SMSReceived event
     */
    public function handle(SMSReceived $event): void
    {
        try {
            $customer = $event->customer;
            $message = $event->message;
            
            // If intent already classified (from webhook), use it
            if ($event->classifiedIntent) {
                $intent = $event->classifiedIntent;
                $confidence = $event->intentConfidence ?? 0.8;
            } else {
                // Classify intent
                $classification = $this->intentClassifier->classify($message);
                $intent = $classification['intent'];
                $confidence = $classification['confidence'];
            }
            
            // Analyze sentiment if not already set
            $sentiment = $event->sentiment ?? $this->intentClassifier->analyzeSentiment($message);
            
            // Handle the response based on intent
            $result = $this->responseHandler->handle(
                $customer,
                $message,
                $intent,
                $confidence
            );
            
            Log::info("SMS received and handled", [
                'customer_id' => $customer->id,
                'intent' => $intent,
                'confidence' => $confidence,
                'sentiment' => $sentiment,
                'result' => $result,
            ]);
            
        } catch (\Exception $e) {
            Log::error("Failed to handle SMS received event", [
                'customer_id' => $event->customer->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            // Re-throw to allow queue retry
            throw $e;
        }
    }

    /**
     * Handle a job failure
     */
    public function failed(SMSReceived $event, \Throwable $exception): void
    {
        Log::error("HandleSMSReceived job failed permanently", [
            'customer_id' => $event->customer->id ?? null,
            'error' => $exception->getMessage(),
        ]);
    }
}

