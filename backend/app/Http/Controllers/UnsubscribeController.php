<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerTimelineProgress;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

final class UnsubscribeController extends Controller
{
    /**
     * GET handler for human-facing unsubscribe links.
     *
     * The route is protected by the `signed` middleware, so by the time we
     * reach this method the signature has already been verified. Unauthenticated
     * visitors have no tenant context, so the customer lookup must bypass the
     * tenant global scope.
     */
    public function show(Request $request, string $customer): Response
    {
        $model = $this->resolveCustomer($customer);

        if ($model) {
            $this->suppress($model);
        }

        return response()->view('unsubscribe', [
            'businessName' => $model?->business_name,
            'mailto' => (string) config('mail.unsubscribe_mailto'),
        ]);
    }

    /**
     * POST handler backing the RFC 8058 one-click List-Unsubscribe-Post header.
     * Returns a bare 200 with no body, as mailbox providers expect.
     */
    public function oneClick(Request $request, string $customer): Response
    {
        $model = $this->resolveCustomer($customer);

        if ($model) {
            $this->suppress($model);
        }

        return response('', 200);
    }

    /**
     * Resolve a customer without the tenant global scope (public, unauthenticated).
     */
    private function resolveCustomer(string $customer): ?Customer
    {
        return Customer::withoutGlobalScopes()->find($customer);
    }

    /**
     * Suppress the customer and pause any active campaign timelines. Idempotent.
     */
    private function suppress(Customer $customer): void
    {
        if (! $customer->email_suppressed) {
            $customer->forceFill([
                'email_suppressed' => true,
                'email_suppressed_reason' => 'unsubscribed',
            ])->save();
        }

        CustomerTimelineProgress::where('customer_id', $customer->id)
            ->where('status', 'active')
            ->update([
                'status' => 'paused',
                'paused_at' => now(),
            ]);
    }
}
