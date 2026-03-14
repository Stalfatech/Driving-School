<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InstructorMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Ensure the user is authenticated and has the instructor role
        // Note: Assumes you have an isInstructor() method on your User model similar to isAdmin()
        if ($request->user() && $request->user()->isInstructor()) {
            return $next($request);
        }

        // 2. Return 403 if the user is not an instructor
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized. Instructor access only.'
        ], 403);
    }
}