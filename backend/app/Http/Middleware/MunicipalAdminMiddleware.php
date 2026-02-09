<?php

namespace App\Http\Middleware;

use App\Models\Emergency\MunicipalAdmin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MunicipalAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
        
        $isAdmin = MunicipalAdmin::where('user_id', $user->id)
            ->where('is_active', true)
            ->exists();
        
        if (!$isAdmin) {
            return response()->json(['error' => 'Not authorized as municipal administrator'], 403);
        }
        
        return $next($request);
    }
}



