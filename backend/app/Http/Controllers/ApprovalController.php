<?php

namespace App\Http\Controllers;

use App\Models\Approval;
use App\Models\Customer;
use App\Services\ApprovalService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ApprovalController extends Controller
{
    public function __construct(
        protected ApprovalService $approvalService
    ) {
    }

    public function showConfirmation(Request $request)
    {
        $validated = $request->validate([
            'task' => 'required|string',
            'customer_id' => 'required|exists:customers,id',
            'source' => 'required|string',
            'token' => 'required|string',
        ]);

        $payload = $this->approvalService->validateToken($validated['token']);
        if (!$payload) {
            return view('approvals.invalid-token');
        }

        if (($payload['customer_id'] ?? null) !== $validated['customer_id'] || $payload['service_type'] !== $validated['task']) {
            return view('approvals.invalid-token');
        }

        $customer = Customer::with('community')->findOrFail($validated['customer_id']);
        $serviceConfig = config("fibonacco.services.{$validated['task']}", []);

        return view('approvals.confirm', [
            'customer' => $customer,
            'serviceType' => $validated['task'],
            'serviceName' => $serviceConfig['name'] ?? $validated['task'],
            'serviceDescription' => $serviceConfig['description'] ?? '',
            'source' => $validated['source'],
            'token' => $validated['token'],
        ]);
    }

    public function submitApproval(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'service_type' => 'required|string',
            'source' => 'required|string',
            'token' => 'required|string',
            'approver_name' => 'required|string|max:255',
            'approver_email' => 'required|email',
            'approver_phone' => 'nullable|string|max:50',
            'contact_consent' => 'required|accepted',
        ]);

        $payload = $this->approvalService->validateToken($validated['token']);
        if (!$payload || ($payload['customer_id'] ?? null) !== $validated['customer_id']) {
            return response()->json(['error' => 'Invalid token'], Response::HTTP_FORBIDDEN);
        }

        $existingApproval = Approval::where('customer_id', $validated['customer_id'])
            ->where('service_type', $validated['service_type'])
            ->whereIn('status', ['pending', 'provisioning', 'provisioned'])
            ->first();

        if ($existingApproval) {
            return redirect()->route('approval.success', ['uuid' => $existingApproval->uuid]);
        }

        $approval = $this->approvalService->create([
            'customer_id' => $validated['customer_id'],
            'service_type' => $validated['service_type'],
            'approver_name' => $validated['approver_name'],
            'approver_email' => $validated['approver_email'],
            'approver_phone' => $validated['approver_phone'],
            'source_type' => $this->determineSourceType($validated['source']),
            'source_id' => $validated['source'],
            'source_url' => $request->header('Referer'),
            'contact_consent' => true,
            'status' => 'pending',
            'approved_at' => now(),
        ]);

        $customer = Customer::find($validated['customer_id']);
        if ($customer) {
            $primaryEmail = $customer->primary_email ?? $customer->email;
            $primaryContactName = $customer->primary_contact_name ?? $customer->owner_name;
            
            if ($primaryEmail !== $validated['approver_email'] || $primaryContactName !== $validated['approver_name']) {
                $customer->update([
                    'primary_contact_name' => $validated['approver_name'],
                    'primary_email' => $validated['approver_email'],
                    'primary_phone' => $validated['approver_phone'] ?? ($customer->primary_phone ?? $customer->phone),
                ]);
            }
        }

        $this->approvalService->process($approval->id);

        return redirect()->route('approval.success', ['uuid' => $approval->uuid]);
    }

    public function showSuccess(string $uuid)
    {
        $approval = Approval::where('uuid', $uuid)->with(['customer', 'upsells'])->firstOrFail();

        $offers = collect($this->approvalService->getUpsellOffers($approval->service_type));
        $upsells = $offers->map(function (array $offer) use ($approval) {
            $record = $approval->upsells->firstWhere('upsell_service_type', $offer['type']);
            $status = null;
            if ($record?->accepted_at) {
                $status = 'accepted';
            } elseif ($record?->declined_at) {
                $status = 'declined';
            }

            return array_merge($offer, [
                'status' => $status,
            ]);
        })->values();

        $meetingTopic = config("fibonacco.services.{$approval->service_type}.meeting_topic");

        return view('approvals.success', [
            'approval' => $approval,
            'upsells' => $upsells,
            'meetingTopic' => $meetingTopic,
        ]);
    }

    protected function determineSourceType(string $source): string
    {
        if (str_starts_with($source, 'HOOK-') ||
            str_starts_with($source, 'EDU-') ||
            str_starts_with($source, 'HOWTO-')) {
            return 'email';
        }

        if (str_contains($source, '-')) {
            return 'learning_center';
        }

        return 'direct';
    }
}

