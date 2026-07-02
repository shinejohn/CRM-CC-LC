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
     *
     * CRITICAL: GET must NOT mutate. Mail clients and security scanners (Outlook
     * SafeLinks, Proofpoint, Barracuda, etc.) silently prefetch/GET every link in
     * a message — suppressing on GET would unsubscribe recipients who never clicked.
     * We render a confirmation page whose button POSTs back to the same signed URL;
     * the suppression happens there.
     */
    public function show(Request $request, string $customer): Response
    {
        $model = $this->resolveCustomer($customer);

        return response()->view('unsubscribe', [
            'confirmed' => false,
            'businessName' => $model?->business_name,
            'mailto' => (string) config('mail.unsubscribe_mailto'),
            // Same signed URL — the signature is method-agnostic, so the confirm
            // button can POST to it. Route is CSRF-exempt for mailbox providers.
            'actionUrl' => $request->fullUrl(),
        ]);
    }

    /**
     * POST handler. Performs the actual suppression. Backs both:
     *   - the RFC 8058 one-click List-Unsubscribe-Post header (mailbox providers),
     *     which send `List-Unsubscribe=One-Click` in the body and expect a bare 200;
     *   - the human confirmation button rendered by show(), which gets a friendly
     *     confirmation page.
     */
    public function oneClick(Request $request, string $customer): Response
    {
        $model = $this->resolveCustomer($customer);

        if ($model) {
            $this->suppress($model);
        }

        // RFC 8058 one-click from a mailbox provider — bare 200, no body.
        if ($request->input('List-Unsubscribe') === 'One-Click') {
            return response('', 200);
        }

        // Genuine human click on the confirmation button — show the result page.
        return response()->view('unsubscribe', [
            'confirmed' => true,
            'businessName' => $model?->business_name,
            'mailto' => (string) config('mail.unsubscribe_mailto'),
            'actionUrl' => $request->fullUrl(),
        ]);
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
