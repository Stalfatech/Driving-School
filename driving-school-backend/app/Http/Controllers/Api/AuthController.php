<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validate Input
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. Find User
        $user = User::where('email', $request->email)->first();

        // 3. Check Credentials
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials.'
            ], 401);
        }

        // 4. Check Status (Prevent Pending/Disabled users from logging in)
        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Your account is ' . $user->status . '. Please contact administration.'
            ], 403);
        }

        // 5. Generate Sanctum Token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user' => [
                'id'              => $user->id,
                'name'            => $user->name,
                'email'           => $user->email,
                'role'            => $user->role,
                'profile_picture' => $user->profile_picture ? asset('storage/' . $user->profile_picture) : null,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }


    public function updateProfile(Request $request)
{
    // Get the authenticated user
    $user = $request->user();
    
    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'User not authenticated'
        ], 401);
    }

    // 1. Validation
    $validator = Validator::make($request->all(), [
        'name'             => 'nullable|string|max:255',
        'profile_picture'  => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        'current_password' => 'required_with:new_password',
        'new_password'     => 'nullable|string|min:8|confirmed',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $updated = false;

    // 2. Handle Name
    if ($request->filled('name')) {
        $user->name = $request->name;
        $updated = true;
    }

    // 3. Handle Image
    if ($request->hasFile('profile_picture')) {
        // Delete old image if it exists
        if ($user->profile_picture && \Storage::disk('public')->exists($user->profile_picture)) {
            \Storage::disk('public')->delete($user->profile_picture);
        }
        
        // Store the new one
        $path = $request->file('profile_picture')->store('profiles', 'public');
        $user->profile_picture = $path;
        $updated = true;
    }

    // 4. Handle Password
    if ($request->filled('new_password')) {
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 400);
        }
        $user->password = Hash::make($request->new_password);
        $updated = true;
    }

    if (!$updated) {
        return response()->json([
            'success' => false,
            'message' => 'No changes detected'
        ], 400);
    }

    // 5. Save
    $user->save();
    
    // 6. Refresh and load appropriate relationships
    $user = $user->fresh();
    
    // Only load role-specific relationships for non-admin users
    if ($user->role !== 'admin') {
        if ($user->role === 'instructor' && method_exists($user, 'instructor')) {
            $user->load('instructor');
        } elseif ($user->role === 'student' && method_exists($user, 'student')) {
            $user->load('student');
        }
    }
    
    // Return consistent data structure matching the login response
    return response()->json([
        'success' => true,
        'message' => 'Profile updated successfully!',
        'data' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'profile_picture' => $user->profile_picture ? asset('storage/' . $user->profile_picture) : null,
        ]
    ]);
}



// ..froget pass
public function forgotPassword(Request $request)
{
    Log::info('=== FORGOT PASSWORD REQUEST ===');
    Log::info('Request data:', $request->all());
    
    try {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Email not found in our records'
            ], 422);
        }

        Log::info('Email validated successfully: ' . $request->email);

        $user = User::where('email', $request->email)->first();
        Log::info('User found:', ['id' => $user->id, 'email' => $user->email]);

        // Send reset link using the default broker
        $status = Password::sendResetLink(
            $request->only('email')
        );

        Log::info('Password reset status: ' . $status);

        if ($status === Password::RESET_LINK_SENT) {
            Log::info('Reset link sent successfully');
            return response()->json([
                'success' => true,
                'message' => 'Password reset link sent to your email'
            ]);
        } else {
            Log::error('Failed to send reset link. Status: ' . $status);
            return response()->json([
                'success' => false,
                'message' => 'Unable to send reset link'
            ], 500);
        }
    } catch (\Exception $e) {
        Log::error('EXCEPTION in forgotPassword: ' . $e->getMessage());
        Log::error('File: ' . $e->getFile() . ' Line: ' . $e->getLine());
        Log::error('Stack trace: ' . $e->getTraceAsString());
        
        return response()->json([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ], 500);
    } finally {
        Log::info('=== END FORGOT PASSWORD REQUEST ===');
    }
}
//passw rest
    public function resetPassword(Request $request)
{
    Log::info('=== RESET PASSWORD REQUEST ===');
    Log::info('Request data:', $request->except('password', 'password_confirmation'));
    
    try {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->password = Hash::make($password);
                $user->setRememberToken(\Str::random(60));
                $user->save();

                Log::info('Password reset successful for user: ' . $user->email);
            }
        );

        Log::info('Password reset status: ' . $status);

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Password reset successful'
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token or email'
            ], 400);
        }
    } catch (\Exception $e) {
        Log::error('EXCEPTION in resetPassword: ' . $e->getMessage());
        Log::error('File: ' . $e->getFile() . ' Line: ' . $e->getLine());
        
        return response()->json([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ], 500);
    } finally {
        Log::info('=== END RESET PASSWORD REQUEST ===');
    }
}
}