<?php

namespace App\Http\Middleware;

use App\Models\EmailClient;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateEmailClient
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json(['error' => 'Unauthorized. Bearer token missing.'], 401);
        }

        $hash = hash('sha256', $token);
        $client = EmailClient::where('api_token_hash', $hash)->first();

        if (! $client) {
            return response()->json(['error' => 'Unauthorized. Invalid token.'], 401);
        }

        $request->attributes->add(['email_client' => $client]);

        return $next($request);
    }
}
