<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Please login first.'
            ], 401);
        }

        // Check if user has student role
        $user = Auth::user();
        
        if ($user->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Student privileges required.'
            ], 403);
        }

        // Check if student profile exists
        if (!$user->student) {
            return response()->json([
                'success' => false,
                'message' => 'Student profile not found.'
            ], 404);
        }

        return $next($request);
    }
}