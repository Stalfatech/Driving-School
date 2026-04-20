<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class StudentProfileController extends Controller
{
    /**
     * Get the authenticated student's complete profile (user + student)
     */
    public function show()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
            }

            $student = Student::where('user_id', $user->id)->with(['package', 'instructor.user'])->first();
            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student profile not found'], 404);
            }

            $data = [
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'profile_picture' => $user->profile_picture ? asset('storage/' . $user->profile_picture) : null,
                ],
                'dob' => $student->dob,
                'street_address' => $student->street_address,
                'appartment' => $student->appartment,
                'city' => $student->city,
                'province' => $student->province,
                'state' => $student->state,
                'country' => $student->country,
                'postal_code' => $student->postal_code,
                'parent_name' => $student->parent_name,
                'parent_email' => $student->parent_email,
                'parent_phone' => $student->parent_phone,
                'permit_number' => $student->permit_number,
                'permit_issue_date' => $student->permit_issue_date,
                'has_foreign_license' => (bool) $student->has_foreign_license,
                'foreign_license_number' => $student->foreign_license_number,
                'foreign_street_address' => $student->foreign_street_address,
                'foreign_appartment' => $student->foreign_appartment,
                'foreign_city' => $student->foreign_city,
                'foreign_state' => $student->foreign_state,
                'foreign_postal_code' => $student->foreign_postal_code,
                'foreign_country' => $student->foreign_country,
                'experience' => $student->experience,
                'additional_notes' => $student->additional_notes,
                // Read-only data
                'package' => $student->package ? [
                    'name' => $student->package->package_name,
                    'hours' => $student->package->hours,
                    'price' => $student->package->amount,
                    'includes' => $student->package->included_items ?? [],
                ] : null,
                'instructor' => $student->instructor ? [
                    'user' => [
                        'name' => $student->instructor->user->name ?? null,
                        'email' => $student->instructor->user->email ?? null,
                        'phone' => $student->instructor->user->phone ?? null,
                    ],
                    'specialization' => $student->instructor->specialization ?? null,
                ] : null,
            ];

            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Exception $e) {
            Log::error('StudentProfileController@show error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Update student profile (both user and student fields)
     */
    public function update(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
            }

            $student = Student::where('user_id', $user->id)->first();
            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student profile not found'], 404);
            }

            // Validation rules
            $rules = [
                // User fields
                'user.name' => 'sometimes|string|max:255',
                'user.email' => 'sometimes|email|unique:users,email,' . $user->id,
                'user.phone' => 'sometimes|string|max:20',
                // Student fields
                'dob' => 'nullable|date',
                'street_address' => 'nullable|string|max:255',
                'appartment' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'province' => 'nullable|string|max:255',
                'state' => 'nullable|string|max:255',
                'country' => 'nullable|string|max:255',
                'postal_code' => 'nullable|string|max:20',
                'parent_name' => 'nullable|string|max:255',
                'parent_email' => 'nullable|email|max:255',
                'parent_phone' => 'nullable|string|max:20',
                'permit_number' => 'nullable|string|max:255',
                'permit_issue_date' => 'nullable|date',
                'has_foreign_license' => 'nullable|boolean',
                'foreign_license_number' => 'nullable|string|max:255',
                'foreign_street_address' => 'nullable|string|max:255',
                'foreign_appartment' => 'nullable|string|max:255',
                'foreign_city' => 'nullable|string|max:255',
                'foreign_state' => 'nullable|string|max:255',
                'foreign_postal_code' => 'nullable|string|max:20',
                'foreign_country' => 'nullable|string|max:255',
                'experience' => 'nullable|string',
                'additional_notes' => 'nullable|string',
            ];

            $validator = Validator::make($request->all(), $rules);
            if ($validator->fails()) {
                return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
            }

            // Update User fields
            $userData = [];
            if ($request->has('user.name')) $userData['name'] = $request->input('user.name');
            if ($request->has('user.email')) $userData['email'] = $request->input('user.email');
            if ($request->has('user.phone')) $userData['phone'] = $request->input('user.phone');
            if (!empty($userData)) {
                $user->update($userData);
            }

            // Update Student fields
            $studentData = $request->only([
                'dob', 'street_address', 'appartment', 'city', 'province', 'state', 'country',
                'postal_code', 'parent_name', 'parent_email', 'parent_phone', 'permit_number',
                'permit_issue_date', 'has_foreign_license', 'foreign_license_number',
                'foreign_street_address', 'foreign_appartment', 'foreign_city', 'foreign_state',
                'foreign_postal_code', 'foreign_country', 'experience', 'additional_notes'
            ]);
            if (array_key_exists('has_foreign_license', $studentData)) {
                $studentData['has_foreign_license'] = $studentData['has_foreign_license'] ? 1 : 0;
            }
            $student->update($studentData);

            // Refresh data for response
            $user->refresh();
            $student->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'user' => [
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'profile_picture' => $user->profile_picture ? asset('storage/' . $user->profile_picture) : null,
                    ],
                    // Include updated student fields if needed, but frontend will refetch
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('StudentProfileController@update error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error: ' . $e->getMessage()], 500);
        }
    }
}