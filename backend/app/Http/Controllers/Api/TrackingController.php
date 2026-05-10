<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\RecordClick;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class TrackingController extends Controller
{
    public function redirect(Request $request, string $code): RedirectResponse
    {
        $parts = explode('.', $code, 2);

        if (count($parts) !== 2) {
            return redirect('/');
        }

        [$encoded, $signature] = $parts;

        $expected = hash_hmac('sha256', $encoded, config('app.key'));

        if (!hash_equals($expected, $signature)) {
            return redirect('/');
        }

        $payload = json_decode(base64_decode($encoded), true);

        if (!is_array($payload)) {
            return redirect('/');
        }

        // Dispatch async click recording
        RecordClick::dispatch([
            'smb_id' => $payload['smb'] ?? null,
            'community_id' => $payload['community'] ?? null,
            'content_card_id' => $payload['card_id'] ?? null,
            'asset_id' => $payload['asset_id'] ?? null,
            'partner_id' => $payload['partner_id'] ?? null,
            'source' => $payload['source'] ?? 'unknown',
            'utm_params' => $payload,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Redirect to destination (alphasite or default)
        $destination = $payload['destination'] ?? $payload['url'] ?? '/';

        return redirect($destination, 301);
    }
}
