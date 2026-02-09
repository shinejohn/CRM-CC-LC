<?php

namespace App\Http\Controllers;

use App\Models\ApprovalUpsell;
use App\Services\ApprovalService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class UpsellController extends Controller
{
    public function __construct(
        protected ApprovalService $approvalService
    ) {
    }

    public function acceptUpsell(Request $request)
    {
        $validated = $request->validate([
            'approval_id' => 'required|exists:approvals,id',
            'upsell_type' => 'required|string',
        ]);

        $approval = $this->approvalService->acceptUpsell($validated['approval_id'], $validated['upsell_type']);

        return response()->json([
            'success' => true,
            'approval_id' => $approval->uuid,
        ]);
    }

    public function declineUpsell(Request $request)
    {
        $validated = $request->validate([
            'approval_id' => 'required|exists:approvals,id',
            'upsell_type' => 'required|string',
        ]);

        ApprovalUpsell::where('approval_id', $validated['approval_id'])
            ->where('upsell_service_type', $validated['upsell_type'])
            ->update([
                'accepted' => false,
                'declined_at' => now(),
            ]);

        return response()->json(['success' => true], Response::HTTP_OK);
    }
}



