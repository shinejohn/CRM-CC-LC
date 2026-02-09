<?php

namespace App\Jobs;

use App\Models\Approval;
use App\Services\EmailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendApprovalConfirmationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $approvalId
    ) {
    }

    public function handle(EmailService $emailService): void
    {
        $approval = Approval::with('customer')->find($this->approvalId);

        if (!$approval) {
            Log::warning("Approval not found for confirmation email: {$this->approvalId}");
            return;
        }

        $subject = 'Approval received - Next steps from Fibonacco';
        $html = view('emails.approval-confirmation', [
            'approval' => $approval,
            'customer' => $approval->customer,
            'serviceConfig' => config("fibonacco.services.{$approval->service_type}", []),
        ])->render();

        $emailService->send(
            $approval->approver_email,
            $subject,
            $html,
            strip_tags($html),
            [
                'from_name' => config('fibonacco.email.from_name', config('mail.from.name')),
                'from_email' => config('fibonacco.email.from_email', config('mail.from.address')),
                'tag' => 'approval_confirmation',
            ]
        );
    }
}

