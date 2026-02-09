<?php

namespace App\Http\Controllers\Api;

use App\Events\Alert\AlertClicked;
use App\Events\Alert\AlertOpened;
use App\Http\Controllers\Controller;
use App\Models\Alert\Alert;
use App\Models\Alert\AlertSend;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertTrackingController extends Controller
{
    /**
     * Track alert open
     */
    public function open(string $uuid): JsonResponse
    {
        $alert = Alert::where('uuid', $uuid)->firstOrFail();
        
        // Find alert send record (we need subscriber_id from request or session)
        // For now, we'll update the alert stats directly
        // In production, you'd track this per recipient
        
        $alert->increment('email_opened');
        
        // Try to find and update AlertSend record if we have subscriber context
        // This would typically come from a tracking pixel with subscriber ID
        
        return response()->json(['success' => true], 200);
    }

    /**
     * Track alert click
     */
    public function click(string $uuid, Request $request): JsonResponse
    {
        $alert = Alert::where('uuid', $uuid)->firstOrFail();
        
        // Update alert stats
        $alert->increment('total_clicks');
        
        // Try to find AlertSend record and mark as clicked
        if ($request->has('subscriber_id')) {
            $alertSend = AlertSend::where('alert_id', $alert->id)
                ->where('subscriber_id', $request->subscriber_id)
                ->first();
            
            if ($alertSend && !$alertSend->clicked_at) {
                $alertSend->update(['clicked_at' => now()]);
                event(new AlertClicked($alertSend));
            }
        }
        
        // Redirect to source URL
        if ($alert->source_url) {
            return redirect($alert->source_url);
        }
        
        return response()->json(['success' => true]);
    }
}



