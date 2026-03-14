<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
{
    // 1. Check if the user is logged in (Sanctum handles the check, but we double-verify)
    // 2. Use the helper from your User model to check the role
    if ($request->user() && $request->user()->isAdmin()) {
        return $next($request);
    }

    // If not an admin, return a 403 Forbidden response
    return response()->json([
        'success' => false,
        'message' => 'Unauthorized. Admin access only.'
    ], 403);
}
}
