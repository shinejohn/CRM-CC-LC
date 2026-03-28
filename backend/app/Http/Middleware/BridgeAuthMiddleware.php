<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class BridgeAuthMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $apiKey = config('services.publishing_bridge.api_key');

        if (! $apiKey) {
            return response()->json(['error' => 'Bridge API not configured'], 503);
        }

        $token = $request->bearerToken();

        if (! $token || ! hash_equals($apiKey, $token)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}
