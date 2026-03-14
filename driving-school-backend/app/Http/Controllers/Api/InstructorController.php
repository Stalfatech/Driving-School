<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Instructor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
class InstructorController extends Controller
{

    public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        // User Fields
        'name'            => 'required|string|max:255',
        'email'           => 'required|email|unique:users,email',
        'phone'           => 'required|string|unique:users,phone',
        'password'        => 'required|string|min:8',
        'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        
        // Instructor Fields
        'car_id'          => 'nullable|exists:cars,id',
        'dob'             => 'required|date',
        'licence_no'      => 'required|string|unique:instructors',
        'inst_license_no' => 'required|string|unique:instructors',
        'licence_expiry'  => 'required|date',
        
        // Missing Location & Professional Fields (CRITICAL FOR 422 FIX)
        'assigned_location'       => 'required|string',
        'city'                    => 'nullable|string',
        'province'                => 'nullable|string',
        'country'                 => 'nullable|string',
        'language'                => 'nullable|string',
        'street_address'          => 'nullable|string',
        'postal_code'             => 'nullable|string',
        'emp_status'              => 'nullable|string',
        'qualifications_to_teach' => 'nullable|string', 
        
        // Document Uploads
        'doc_criminal_cert'     => 'nullable|file|mimes:pdf,jpg,png|max:2048',
        'doc_vulnerable_sector' => 'nullable|file|mimes:pdf,jpg,png|max:2048',
        'doc_driver_abstract'   => 'nullable|file|mimes:pdf,jpg,png|max:2048',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    // 2. Start Transaction
    return DB::transaction(function () use ($request) {
        
        // A. Handle Profile Image
        $profilePath = null;
        if ($request->hasFile('profile_picture')) {
            $profilePath = $request->file('profile_picture')->store('profiles', 'public');
        }

        // B. Create User
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => Hash::make($request->password),
            'role'     => 'instructor',
            'status'   => 'active',
            'profile_picture' => $profilePath,
        ]);

        // C. Handle Instructor Documents
        $docs = [];
        foreach (['doc_criminal_cert', 'doc_vulnerable_sector', 'doc_driver_abstract'] as $docField) {
            $docs[$docField] = $request->hasFile($docField) 
                ? $request->file($docField)->store('instructor_docs', 'public') 
                : null;
        }

        // D. Create Instructor Profile
        $instructor = Instructor::create([
            'user_id'                 => $user->id,
            'car_id'                  => $request->car_id,
            'dob'                     => $request->dob,
            'language'                => $request->language,
            'country'                 => $request->country,
            'city'                    => $request->city,
            'province'                => $request->province,
            'street_address'          => $request->street_address,
            'postal_code'             => $request->postal_code,
            'assigned_location'       => $request->assigned_location,
            'emp_status'              => $request->emp_status ?? 'active',
            'qualifications_to_teach' => $request->qualifications_to_teach, // SAVING NEW COLUMN
            'licence_no'              => $request->licence_no,
            'inst_license_no'         => $request->inst_license_no,
            'licence_expiry'          => $request->licence_expiry,
            'doc_criminal_cert'       => $docs['doc_criminal_cert'],
            'doc_vulnerable_sector'   => $docs['doc_vulnerable_sector'],
            'doc_driver_abstract'     => $docs['doc_driver_abstract'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Instructor and User account created successfully!',
            'user'    => $user,
            'profile' => $instructor
        ], 201);
    });
}

    //list all instructor 
    public function index()
    {
        $instructors = Instructor::with(['user', 'car','students.user'])->get();
        return response()->json(['success' => true, 'data' => $instructors]);
    }
    public function show($id)
{
    // Eager load the 'user' and 'car' relationships to get full details
    $instructor = Instructor::with(['user', 'car','students.user'])->find($id);

    if (!$instructor) {
        return response()->json([
            'success' => false, 
            'message' => 'Instructor not found'
        ], 404);
    }

    return response()->json([
        'success' => true,
        'data'    => $instructor
    ]);
}

    public function update(Request $request, $id)
    {
        $instructor = Instructor::findOrFail($id);
        $user = $instructor->user;

        // 1. Validation for Admin-controlled fields
        $validator = Validator::make($request->all(), [
            // User Table Fields
            'email'           => 'sometimes|email|unique:users,email,' . $user->id,
            'phone'           => 'sometimes|string|unique:users,phone,' . $user->id,
            'status'          => 'sometimes|in:active,inactive,disabled',
            'name'            => 'sometimes|string' ,
            // Instructor Table Fields
            'car_id'          => 'sometimes|nullable|exists:cars,id',
            'dob'             => 'sometimes|date',
            'assigned_location' => 'sometimes|string',
            'emp_status'      => 'sometimes|string',
            'licence_no'      => 'sometimes|string|unique:instructors,licence_no,' . $instructor->id,
            'inst_license_no' => 'sometimes|string|unique:instructors,inst_license_no,' . $instructor->id,
            'licence_expiry'  => 'sometimes|date',
            
            // Document Files
            'doc_criminal_cert'     => 'nullable|file|mimes:pdf,jpg,png|max:2048',
            'doc_vulnerable_sector' => 'nullable|file|mimes:pdf,jpg,png|max:2048',
            'doc_driver_abstract'   => 'nullable|file|mimes:pdf,jpg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request, $user, $instructor) {
            
            // A. Update User Account Status/Contact
            $user->update($request->only(['email', 'phone', 'status','name']));

            // B. Update Instructor Professional Info
            $instructor->update($request->only([
                'car_id', 'dob', 'language', 'country', 'city', 'province', 
                'street_address', 'postal_code', 'assigned_location', 
                'emp_status', 'licence_no', 'inst_license_no', 'licence_expiry'
            ]));

            // C. Handle Document Overwrites
            foreach (['doc_criminal_cert', 'doc_vulnerable_sector', 'doc_driver_abstract'] as $docField) {
                if ($request->hasFile($docField)) {
                    // Delete old file if it exists
                    if ($instructor->$docField) {
                        Storage::disk('public')->delete($instructor->$docField);
                    }
                    // Store new file
                    $instructor->$docField = $request->file($docField)->store('instructor_docs', 'public');
                }
            }

            $instructor->save();

            return response()->json([
                'success' => true,
                'message' => 'Instructor professional details updated by Admin.',
                'data'    => $instructor->load('user')
            ]);
        });
    }

    /**
     * Delete Instructor (Admin Only)
     */
    public function destroy($id)
    {
        $instructor = Instructor::findOrFail($id);
        $user = $instructor->user;

        DB::transaction(function () use ($instructor, $user) {
            // Cleanup all files from storage
            $filesToDelete = array_filter([
                $user->profile_picture,
                $instructor->doc_criminal_cert,
                $instructor->doc_vulnerable_sector,
                $instructor->doc_driver_abstract
            ]);
            
            Storage::disk('public')->delete($filesToDelete);

            $instructor->delete();
            $user->delete();
        });

        return response()->json([
            'success' => true, 
            'message' => 'Instructor and associated User account deleted.'
        ]);
    }


public function getMyAssignedStudents()
{
    try {
        $instructorId = $this->getInstructorId();

        if (!$instructorId) {
            return response()->json(['message' => 'Instructor profile not found.'], 404);
        }

        // Get all students where instructor_id matches
        $students = \App\Models\Student::with(['user', 'package'])
            ->where('instructor_id', $instructorId)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $students
        ]);
        
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

}