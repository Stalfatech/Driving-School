<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Instructor;
use App\Models\Car;
use App\Models\Location;
use App\Models\Student;
use App\Models\Package;
use App\Models\Enrolment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
class InstructorController extends Controller
{

//     public function store(Request $request)
// {
//     $validator = Validator::make($request->all(), [
//         // User Fields
//         'name'            => 'required|string|max:255',
//         'email'           => 'required|email|unique:users,email',
//         'phone'           => 'required|string|unique:users,phone',
//         'password'        => 'required|string|min:8',
//         'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        
//         // Instructor Fields
//         'car_id'          => 'nullable|exists:cars,id',
//         'dob'             => 'required|date',
//         'licence_no'      => 'required|string|unique:instructors',
//         'inst_license_no' => 'required|string|unique:instructors',
//         'licence_expiry'  => 'required|date',
        
//         // Missing Location & Professional Fields (CRITICAL FOR 422 FIX)
//         'assigned_location'       => 'required|string',
//         'city'                    => 'nullable|string',
//         'province'                => 'nullable|string',
//         'country'                 => 'nullable|string',
//         'language'                => 'nullable|string',
//         'street_address'          => 'nullable|string',
//         'postal_code'             => 'nullable|string',
//         'emp_status'              => 'nullable|string',
//         'qualifications_to_teach' => 'nullable|string', 
        
//         // Document Uploads
//         'doc_criminal_cert'     => 'nullable|file|mimes:pdf,jpg,png|max:2048',
//         'doc_vulnerable_sector' => 'nullable|file|mimes:pdf,jpg,png|max:2048',
//         'doc_driver_abstract'   => 'nullable|file|mimes:pdf,jpg,png|max:2048',
//     ]);

//     if ($validator->fails()) {
//         return response()->json(['errors' => $validator->errors()], 422);
//     }

//     // 2. Start Transaction
//     return DB::transaction(function () use ($request) {
        
//         // A. Handle Profile Image
//         $profilePath = null;
//         if ($request->hasFile('profile_picture')) {
//             $profilePath = $request->file('profile_picture')->store('profiles', 'public');
//         }

//         // B. Create User
//         $user = User::create([
//             'name'     => $request->name,
//             'email'    => $request->email,
//             'phone'    => $request->phone,
//             'password' => Hash::make($request->password),
//             'role'     => 'instructor',
//             'status'   => 'active',
//             'profile_picture' => $profilePath,
//         ]);

//         // C. Handle Instructor Documents
//         $docs = [];
//         foreach (['doc_criminal_cert', 'doc_vulnerable_sector', 'doc_driver_abstract'] as $docField) {
//             $docs[$docField] = $request->hasFile($docField) 
//                 ? $request->file($docField)->store('instructor_docs', 'public') 
//                 : null;
//         }

//         // D. Create Instructor Profile
//         $instructor = Instructor::create([
//             'user_id'                 => $user->id,
//             'car_id'                  => $request->car_id,
//             'dob'                     => $request->dob,
//             'language'                => $request->language,
//             'country'                 => $request->country,
//             'city'                    => $request->city,
//             'province'                => $request->province,
//             'street_address'          => $request->street_address,
//             'postal_code'             => $request->postal_code,
//             'assigned_location'       => $request->assigned_location,
//             'emp_status'              => $request->emp_status ?? 'active',
//             'qualifications_to_teach' => $request->qualifications_to_teach, // SAVING NEW COLUMN
//             'licence_no'              => $request->licence_no,
//             'inst_license_no'         => $request->inst_license_no,
//             'licence_expiry'          => $request->licence_expiry,
//             'doc_criminal_cert'       => $docs['doc_criminal_cert'],
//             'doc_vulnerable_sector'   => $docs['doc_vulnerable_sector'],
//             'doc_driver_abstract'     => $docs['doc_driver_abstract'],
//         ]);

//         return response()->json([
//             'success' => true,
//             'message' => 'Instructor and User account created successfully!',
//             'user'    => $user,
//             'profile' => $instructor
//         ], 201);
//     });
// }


public function store(Request $request)
    {
        try {
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
                
                // Location & Professional Fields 
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

            // FIX: If validation fails, combine errors into a message string for the frontend
            if ($validator->fails()) {
                $errorMessages = implode("\n", $validator->errors()->all());
                return response()->json([
                    'success' => false,
                    'message' => $errorMessages, // Frontend will now display this exact reason!
                    'errors'  => $validator->errors()
                ], 422);
            }

            // Start Transaction
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
                    'qualifications_to_teach' => $request->qualifications_to_teach,
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

        } catch (\Exception $e) {
            // Catch any other server/database errors and show the exact issue
            return response()->json([
                'success' => false,
                'message' => 'Server Error: ' . $e->getMessage()
            ], 500);
        }
    }

    //list all instructor 
//     public function index()
//     {
//         $instructors = Instructor::with(['user', 'car','students.user'])->get();
//         return response()->json(['success' => true, 'data' => $instructors]);
//     }
//     public function show($id)
// {
//     // Eager load the 'user' and 'car' relationships to get full details
//     $instructor = Instructor::with(['user', 'car','students.user'])->find($id);

//     if (!$instructor) {
//         return response()->json([
//             'success' => false, 
//             'message' => 'Instructor not found'
//         ], 404);
//     }

//     return response()->json([
//         'success' => true,
//         'data'    => $instructor
//     ]);
// }

public function index()
    {
        $instructors = Instructor::with(['user', 'car','students.user'])->get();
        
        // Dynamically attach enrolment data so the frontend can calculate active/completed
        $instructors->each(function ($instructor) {
            $instructor->students->each(function ($student) {
                $enrolment = \App\Models\Enrolment::where('student_id', $student->id)->latest()->first();
                
                $student->progress_percentage = $enrolment ? (float)$enrolment->progress_percentage : 0;
                $student->paymentStatus = ($enrolment && ($enrolment->balance_due <= 0 || $enrolment->status === 'paid')) ? 'Paid' : 'Due';
            });
        });

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

        // Dynamically attach enrolment data so the frontend can calculate active/completed
        $instructor->students->each(function ($student) {
            $enrolment = \App\Models\Enrolment::where('student_id', $student->id)->latest()->first();
            
            $student->progress_percentage = $enrolment ? (float)$enrolment->progress_percentage : 0;
            $student->paymentStatus = ($enrolment && ($enrolment->balance_due <= 0 || $enrolment->status === 'paid')) ? 'Paid' : 'Due';
        });

        return response()->json([
            'success' => true,
            'data'    => $instructor
        ]);
    }

    public function update(Request $request, $id)
{
    $instructor = Instructor::findOrFail($id);
    $user = $instructor->user;

    // 1. Validation for Admin-controlled fields - MAKE ALL FIELDS SOMETIMES
    $validator = Validator::make($request->all(), [
        // User Table Fields
        'email'           => 'sometimes|email|unique:users,email,' . $user->id,
        'phone'           => 'sometimes|string|unique:users,phone,' . $user->id,
        'status'          => 'sometimes|in:active,inactive,blocked',
        'name'            => 'sometimes|string|max:255',
        
        // Instructor Table Fields - ALL SHOULD BE 'sometimes'
        'car_id'          => 'sometimes|nullable|exists:cars,id',
        'dob'             => 'sometimes|date',
        'language'        => 'sometimes|nullable|string',
        'country'         => 'sometimes|nullable|string',
        'city'            => 'sometimes|nullable|string',
        'province'        => 'sometimes|nullable|string',
        'street_address'  => 'sometimes|nullable|string',
        'postal_code'     => 'sometimes|nullable|string',
        'assigned_location' => 'sometimes|string',
        'emp_status'      => 'sometimes|string',
        'licence_no'      => 'sometimes|string|unique:instructors,licence_no,' . $instructor->id,
        'inst_license_no' => 'sometimes|string|unique:instructors,inst_license_no,' . $instructor->id,
        'licence_expiry'  => 'sometimes|date',
        'qualifications_to_teach' => 'sometimes|nullable|string',
        
        // Document Files
        'doc_criminal_cert'     => 'nullable|file|mimes:pdf,jpg,png|max:2048',
        'doc_vulnerable_sector' => 'nullable|file|mimes:pdf,jpg,png|max:2048',
        'doc_driver_abstract'   => 'nullable|file|mimes:pdf,jpg,png|max:2048',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    return DB::transaction(function () use ($request, $user, $instructor) {
        
        // A. Update User Account (only fields that are present)
        $userData = [];
        if ($request->has('name')) $userData['name'] = $request->name;
        if ($request->has('email')) $userData['email'] = $request->email;
        if ($request->has('phone')) $userData['phone'] = $request->phone;
        if ($request->has('status')) $userData['status'] = $request->status;
        
        if (!empty($userData)) {
            $user->update($userData);
        }

        // B. Update Instructor Professional Info (only fields that are present)
        $instructorData = [];
        if ($request->has('car_id')) $instructorData['car_id'] = $request->car_id;
        if ($request->has('dob')) $instructorData['dob'] = $request->dob;
        if ($request->has('language')) $instructorData['language'] = $request->language;
        if ($request->has('country')) $instructorData['country'] = $request->country;
        if ($request->has('city')) $instructorData['city'] = $request->city;
        if ($request->has('province')) $instructorData['province'] = $request->province;
        if ($request->has('street_address')) $instructorData['street_address'] = $request->street_address;
        if ($request->has('postal_code')) $instructorData['postal_code'] = $request->postal_code;
        if ($request->has('assigned_location')) $instructorData['assigned_location'] = $request->assigned_location;
        if ($request->has('emp_status')) $instructorData['emp_status'] = $request->emp_status;
        if ($request->has('licence_no')) $instructorData['licence_no'] = $request->licence_no;
        if ($request->has('inst_license_no')) $instructorData['inst_license_no'] = $request->inst_license_no;
        if ($request->has('licence_expiry')) $instructorData['licence_expiry'] = $request->licence_expiry;
        if ($request->has('qualifications_to_teach')) $instructorData['qualifications_to_teach'] = $request->qualifications_to_teach;
        
        if (!empty($instructorData)) {
            $instructor->update($instructorData);
        }

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
        
        // Save instructor if documents were updated
        if ($request->hasFile('doc_criminal_cert') || $request->hasFile('doc_vulnerable_sector') || $request->hasFile('doc_driver_abstract')) {
            $instructor->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Instructor professional details updated by Admin.',
            'data'    => $instructor->load('user', 'car', 'students.user')
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
public function getInstructorsByLocation(Request $request)
{
    $validator = Validator::make($request->all(), [
        'location_id' => 'required|exists:locations,id',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $location = Location::find($request->location_id);
    $locationName = $location ? $location->province_name : null;

    if (!$locationName) {
        return response()->json(['success' => true, 'data' => []]);
    }

    $instructors = Instructor::with('user')
        ->where('assigned_location', 'LIKE', "%{$locationName}%")
        ->orWhere('province', 'LIKE', "%{$locationName}%")
        ->get();

    return response()->json(['success' => true, 'data' => $instructors]);
}

/**
 * Export instructors to CSV
 */
public function export(Request $request)
{
    try {
        $query = Instructor::with(['user', 'car']);

        // Apply filters (same as frontend)
        if ($request->filled('location') && $request->location !== 'All') {
            $query->where('assigned_location', $request->location);
        }
        if ($request->filled('status') && $request->status !== 'All') {
            $query->whereHas('user', fn($q) => $q->where('status', $request->status));
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', fn($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
            )->orWhere('id', 'like', "%{$search}%");
        }

        $instructors = $query->get();

        // CSV filename
        $filename = 'instructors_' . now()->format('Y-m-d_His') . '.csv';
        $handle = fopen('php://temp', 'w+');

        // UTF-8 BOM for Excel
        fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

        // Headers
        fputcsv($handle, [
            'ID',
            'Name',
            'Email',
            'Phone',
            'Assigned Location',
            'City',
            'Province',
            'Country',
            'Status',
            'Car',
            'License No',
            'License Expiry',
            'Employment Status',
            'Qualifications'
        ]);

        // Data rows
        foreach ($instructors as $ins) {
            fputcsv($handle, [
                $ins->id,
                $ins->user->name ?? '',
                $ins->user->email ?? '',
                $ins->user->phone ?? '',
                $ins->assigned_location ?? '',
                $ins->city ?? '',
                $ins->province ?? '',
                $ins->country ?? '',
                $ins->user->status ?? '',
                $ins->car ? ($ins->car->car_name ?? $ins->car->name ?? '') : '',
                $ins->licence_no ?? '',
                // $ins->licence_expiry ? date('Y-m-d', strtotime($ins->licence_expiry)) : '',
                $ins->licence_expiry ? '="' . date('Y-m-d', strtotime($ins->licence_expiry)) . '"' : '',
                $ins->emp_status ?? '',
                $ins->qualifications_to_teach ?? ''
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv)
            ->header('Content-Type', 'text/csv; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Export failed: ' . $e->getMessage()
        ], 500);
    }
}
}