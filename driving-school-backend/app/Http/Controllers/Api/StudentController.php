<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\Location;
use App\Models\Enrolment;
use App\Models\Package;
use App\Models\Instructor;
use App\Models\PackageRequest;
use App\Notifications\PackageRequestApprovedNotification;
use App\Notifications\StudentAssignedNotification;
use App\Notifications\SendDepositInvoiceNotification;


class StudentController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validation
       $validator = Validator::make($request->all(), [
            // User Fields
            'name'             => 'required|string|max:255',
            'email'            => [
                                    'required', 
                                    'email:rfc,dns', // <--- Strict DNS check added here!
                                    \Illuminate\Validation\Rule::unique('users')->whereNull('deleted_at')
                                ],
            'phone'            => [
                                    'required', 
                                    'string', 
                                    'min:10', // <--- Minimum length enforced!
                                    \Illuminate\Validation\Rule::unique('users')->whereNull('deleted_at')
                                ],
            'password'         => 'required|string|min:8',
            'profile_picture'    => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            
            // Student Fields
            'package_id'       => 'nullable|exists:packages,id',
            'province'         => 'required|string',
            'dob'              => 'required|date|before:today',
            'street_address'   => 'required|string',
            'city'             => 'required|string',
            'postal_code'      => 'required|string',
            'state'            => 'required|string',
            'country'          => 'required|string',
            'permit_number'    => 'nullable|string|unique:students',
            'permit_issue_date'=> 'nullable|date',
            'has_foreign_license' => 'required', 
            'foreign_license_number' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. Database Transaction
        return DB::transaction(function () use ($request) {
            
            // A. Handle Profile Picture
            $profilePath = null;
            if ($request->hasFile('profile_picture')) {
                $profilePath = $request->file('profile_picture')->store('profiles', 'public');
            }

            // B. Create User (Role: student, Status: pending)
            $user = User::create([
                'name'            => $request->name,
                'email'           => $request->email,
                'phone'           => $request->phone,
                'password'        => Hash::make($request->password),
                'role'            => 'student',
                'status'          => 'pending', 
                'profile_picture' => $profilePath,
            ]);

            // C. Create Student Profile
            $student = Student::create([
                'user_id'           => $user->id,
                'package_id'        => $request->package_id,
                'instructor_id'     => null, 
                'dob'               => $request->dob,
                'province'          => $request->province,
                'appartment'        => $request->appartment,
                'street_address'    => $request->street_address,
                'city'              => $request->city,
                'postal_code'       => $request->postal_code,
                'state'             => $request->state,
                'country'           => $request->country,
                'parent_name'       => $request->parent_name,
                'parent_email'      => $request->parent_email,
                'parent_phone'      => $request->parent_phone,
                'permit_number'     => $request->permit_number,
                'permit_issue_date' => $request->permit_issue_date,
                'experience'        => $request->experience,
                'additional_notes'  => $request->additional_notes,
                
                // FIX: Use boolean() helper to prevent NULL constraint violation
                'has_foreign_license' => $request->boolean('has_foreign_license'), 
                
                'foreign_license_number' => $request->foreign_license_number,
                'foreign_street_address' => $request->foreign_street_address,
                'foreign_appartment' => $request->foreign_appartment,
                'foreign_city' => $request->foreign_city,
                'foreign_state' => $request->foreign_state,
                'foreign_postal_code' => $request->foreign_postal_code,
                'foreign_country' => $request->foreign_country, 
            ]);

            //admin notifi
            $adminUsers = User::where('role', 'admin')->get();
        foreach ($adminUsers as $admin) {
            $admin->notify(new \App\Notifications\AdminNotification('new_student', [
                'name' => $user->name,
                'student_id' => $student->id,
                'email' => $user->email,
                'phone' => $user->phone
            ]));
        }

            return response()->json([
                'success' => true,
                'message' => 'Student registered successfully! Account is pending approval.',
                'data'    => [
                    'user'    => $user,
                    'student' => $student
                ]
            ], 201);
        });
    }

// public function index(Request $request)
// {
//     // 1. Start the query with relationships and the location join
//     $query = Student::with(['user', 'package', 'instructor.user'])
//         ->leftJoin('locations', 'students.province', '=', 'locations.id')
//         ->select('students.*', 'locations.province_name as province_name_text');

//     // 2. Filter by User Status (e.g., pending)
//     if ($request->has('status')) {
//         $status = $request->status;
//         $query->whereHas('user', function($q) use ($status) {
//             $q->where('status', $status);
//         });
//     }

//     // 3. BACKEND SEARCH: Search by Name or Email
//     if ($request->filled('search')) {
//         $search = $request->search;
//         $query->whereHas('user', function($q) use ($search) {
//             $q->where('name', 'like', "%{$search}%")
//               ->orWhere('email', 'like', "%{$search}%");
//         });
//     }

//     // 4. BACKEND FILTER: Filter by Location ID
//     if ($request->filled('location') && $request->location !== 'All') {
//         $query->where('students.province', $request->location);
//     }

//     // 5. BACKEND PAGINATION: Get 10 results per page
//     $students = $query->latest('students.created_at')->paginate(10);

//     return response()->json([
//         'success' => true,
//         'data'    => $students->items(), // The actual student records
//         'meta'    => [
//             'current_page' => $students->currentPage(),
//             'last_page'    => $students->lastPage(),
//             'total'        => $students->total(),
//         ]
//     ]);
// }

public function index(Request $request)
    {
        // 1. Eager Load Location
        $query = Student::with(['user', 'package', 'instructor.user', 'location']);

        // 2. Filter by User Status
        if ($request->filled('status')) {
            $status = strtolower($request->status);
            if ($status === 'pending') {
                $query->whereHas('user', function($q) {
                    $q->whereIn('status', ['pending', 'awaiting_payment']);
                });
            } else {
                $query->whereHas('user', function($q) use ($status) {
                    $q->where('status', $status);
                });
            }
        }

        // 3. Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where(function ($subQ) use ($search) {
                    $subQ->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                });
            });
        }

        // 4. Location Filter
        if ($request->filled('location') && $request->location !== 'All') {
            $query->where('province', $request->location);
        }

        // 5. Paginate
        $perPage = $request->get('per_page', 10);
        $students = $query->latest()->paginate($perPage);

        // 6. Calculate payment data so the frontend can display the badge
        $students->getCollection()->transform(function ($student) {
            $student->province_name_text = $student->location ? $student->location->province_name : 'N/A';
            
            $enrolment = \App\Models\Enrolment::where('student_id', $student->id)
                ->whereIn('status', ['active', 'paid', 'pending_payment'])
                ->latest()
                ->first();
            
            if ($enrolment) {
                $totalToPay = $enrolment->total_amount;
                $balanceDue = $enrolment->balance_due;
                
                if ($balanceDue <= 0) {
                    $student->paymentStatus = 'Paid';
                } elseif ($balanceDue <= ($totalToPay / 2)) {
                    $student->paymentStatus = 'Deposit Paid'; // 50% or more is paid
                } else {
                    $student->paymentStatus = 'Awaiting Payment';
                }
            } else {
                $student->paymentStatus = 'Due';
            }
            
            return $student;
        });

        return response()->json([
            'success' => true,
            'data'    => $students->items(), 
            'meta'    => [
                'current_page' => $students->currentPage(),
                'last_page'    => $students->lastPage(),
                'total'        => $students->total(),
            ]
        ]);
    }




// /test x good keeep this 
public function getOnboardingData(Request $request)
{
    $locationId = $request->query('location_id');
    $locationName = $locationId;

    // Convert ID to Name if numeric
    if (is_numeric($locationId)) {
        $locRecord = \App\Models\Location::find($locationId);
        $locationName = $locRecord ? $locRecord->province_name : $locationId;
    }

    $instructors = \App\Models\Instructor::whereHas('user', function($q) {
            $q->where('status', 'active');
        })
        ->where(function($q) use ($locationName) {
            $q->where('assigned_location', 'like', "%$locationName%")
              ->orWhere('province', 'like', "%$locationName%");
        })
        ->with('user:id,name')
        ->get();

    return response()->json([
        'packages' => \App\Models\Package::all(['id', 'package_name', 'amount']),
        'locations' => \App\Models\Location::all(['id', 'province_name']), // For the main page dropdown
        'instructors' => $instructors->map(fn($ins) => [
            'id' => $ins->id,
            'name' => $ins->user ? $ins->user->name : 'Unknown'
        ])
    ]);
}


public function show($id)
{
    try {
        // Use with('province_relation') or join the locations table to get the name
        $student = \App\Models\Student::with(['user', 'package'])
            ->leftJoin('locations', 'students.province', '=', 'locations.id')
            ->select('students.*', 'locations.province_name as province_text')
            ->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $student
        ]);
    } catch (\Exception $e) {
        return response()->json(['success' => false], 404);
    }
}

        public function activateStudent(Request $request, $id)
{
    // 1. Validation
    $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
        'package_id'    => 'required|exists:packages,id',
        'instructor_id' => 'required|exists:instructors,id',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    return \Illuminate\Support\Facades\DB::transaction(function () use ($request, $id) {
        // 2. Fetch Data
        $student = \App\Models\Student::with('user')->findOrFail($id);
        $package = \App\Models\Package::findOrFail($request->package_id);
        $instructor = \App\Models\Instructor::with('user')->findOrFail($request->instructor_id);
        
        // $location = \App\Models\Location::where('province_name', $student->province)->first();
        // if (!$location) {
        //     return response()->json(['error' => 'No tax location found for province: ' . $student->province], 422);
        // }
        $location = \App\Models\Location::find($student->province);

if (!$location) {
    return response()->json([
        'error' => 'No tax location found for ID: ' . $student->province
    ], 422);
}

        // 3. Financials
        $taxAmount = ($package->amount * $location->tax_rate) / 100;
        $totalWithTax = round($package->amount + $taxAmount, 2);

        // 4. Update Status
        $student->update([
            'instructor_id' => $instructor->id,
            'package_id'    => $package->id,
        ]);
        $student->user->update(['status' => 'active']);

        // 5. Enrolment
        $enrolment = \App\Models\Enrolment::create([
            'student_id'   => $student->id,
            'package_id'   => $package->id,
            'location_id'  => $location->id,
            'total_amount' => $totalWithTax,
            'balance_due'  => $totalWithTax, 
            'progress_percentage' => 0,
            'status'       => 'active'
        ]);

            // 6. QUEUED EMAILS (Sent in Background via Terminal 2)
            \App\Services\NotificationService::send('student_activation', $student->user->email, [
                'student_name' => $student->user->name,
                'package_name' => $package->package_name,
                'balance_due'  => $totalWithTax
            ]);

            \App\Services\NotificationService::send('instructor_student_assigned', $instructor->user->email, [
                'instructor_name' => $instructor->user->name,
                'student_name'    => $student->user->name,
                'package_name'    => $package->package_name
            ]);

            // 7. DATABASE NOTIFICATIONS (For Dashboard Bell Icon)
            
            // Notify Instructor
            $instructor->user->notify(new \App\Notifications\StudentAssignedNotification([
                'student_name' => $student->user->name,
                'package_name' => $package->package_name,
                'student_id'   => $student->id
            ]));

            // Notify Student
            $student->user->notify(new \App\Notifications\WelcomeStudentNotification([
                'instructor_name' => $instructor->user->name,
                'package_name'    => $package->package_name
            ]));

            return response()->json([ 
                'success' => true,
                'message' => 'Activation successful! Emails and Dashboard alerts have been sent.',
                'data' => [
                    'total_with_tax' => $totalWithTax,
                    'instructor' => $instructor->user->name
                ]
            ]);
        });
    }


    public function destroy($id)
{
    try {
        $student = Student::findOrFail($id);
        
        // Optionally delete the user account associated with this student
        if ($student->user) {
            $student->user->delete();
        }

        $student->delete();

        return response()->json([
            'success' => true,
            'message' => 'Application deleted successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete application'
        ], 500);
    }
}
// reassign the student
public function reassignInstructor(Request $request, $studentId)
{
    $validator = Validator::make($request->all(), [
        'new_instructor_id' => 'required|exists:instructors,id',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    return DB::transaction(function () use ($request, $studentId) {
        // 1. CHANGE: Added 'package' to the with() array
        $student = Student::with(['user', 'package'])->findOrFail($studentId);
        $newInstructor = \App\Models\Instructor::with('user')->findOrFail($request->new_instructor_id);

        // 2. Update the student's assigned instructor
        $student->update([
            'instructor_id' => $newInstructor->id
        ]);

        // 3. QUEUED EMAILS
        \App\Services\NotificationService::send('instructor_changed_student', $student->user->email, [
            'student_name'    => $student->user->name,
            'new_instructor'  => $newInstructor->user->name,
        ]);

        \App\Services\NotificationService::send('instructor_student_assigned', $newInstructor->user->email, [
            'instructor_name' => $newInstructor->user->name,
            'student_name'    => $student->user->name,
            // Uses the package data loaded above
            'package_name'    => $student->package->package_name ?? 'Your Package'
        ]);

        // 4. DATABASE NOTIFICATIONS
        $student->user->notify(new \App\Notifications\InstructorChangedNotification([
            'instructor_name' => $newInstructor->user->name,
        ]));

        $newInstructor->user->notify(new \App\Notifications\StudentAssignedNotification([
            'student_name' => $student->user->name,
            'student_id'   => $student->id,
            // ADDED: Pass package_name here so the notification toArray() can use it
            'package_name' => $student->package->package_name ?? 'Not Assigned'
        ]));

        return response()->json([
            'success' => true,
            'message' => "Student reassigned to {$newInstructor->user->name} successfully. Notifications sent.",
            // Correctly accesses the package name for the frontend
            'package_name' => $student->package->package_name ?? 'Not Assigned'
        ]);
    });
}


//student X instructor

public function getStudentsByInstructor(Request $request)
{
    try {
        $instructorId = $request->query('instructor_id');
        $locationId = $request->query('location_id');

        // 1. Ensure we only get ACTIVE students assigned to this instructor
        $query = \App\Models\Student::with('user');

        if ($instructorId) {
            $query->where('instructor_id', $instructorId);
        }

        if ($locationId) {
            // FIX: You saved the Location ID in the 'province' column in your store() method
            $query->where('province', $locationId); 
        }

        $students = $query->get();

        return response()->json($students);

    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Server Error',
            'message' => $e->getMessage()
        ], 500);
    }
}

//student main pgae

//     public function adminIndex(Request $request)
// {
//     // 1. Start query with all necessary relationships
//     $query = Student::with(['user', 'package', 'instructor.user']);

//     // 2. Filter by User Status (pending, active, etc.)
//     if ($request->filled('status')) {
//         $status = strtolower($request->status);
//         $query->whereHas('user', function($q) use ($status) {
//             $q->where('status', $status);
//         });
//     }

//     // 3. Search by Name or Email
//     if ($request->filled('search')) {
//         $search = $request->search;
//         $query->whereHas('user', function($q) use ($search) {
//             $q->where('name', 'like', "%{$search}%")
//               ->orWhere('email', 'like', "%{$search}%");
//         });
//     }

//     // 4. Filter by Location ID (Numeric ID from React)
//     if ($request->filled('location') && $request->location !== 'All') {
//         $query->where('province', $request->location);
//     }

//     // 5. Paginate (Set to 10 for a full-looking table)
//     $students = $query->latest('students.created_at')->paginate(10);

//     // 6. Attach the Location Name text manually
//     $students->getCollection()->transform(function ($student) {
//         $loc = \App\Models\Location::find($student->province);
//         $student->province_name_text = $loc ? $loc->province_name : 'N/A';
//         return $student;
//     });

//     return response()->json([
//         'success' => true,
//         'data'    => $students->items(),
//         'meta'    => [
//             'current_page' => $students->currentPage(),
//             'last_page'    => $students->lastPage(),
//             'total'        => $students->total(),
//         ]
//     ]);
// }



///index test 04-04
public function adminIndex(Request $request)
    {
        // 1. Start query, using Eloquent Eager Loading for location
        $query = Student::with(['user', 'package', 'instructor.user', 'location']);

        // 2. COMBINED User Filters: Single whereHas for maximum performance
        $query->whereHas('user', function ($q) use ($request) {
            
            // --- A. Status Filtering ---
            if ($request->filled('status')) {
                $status = strtolower($request->status);
                if ($status === 'pending') {
                    $q->whereIn('status', ['pending', 'awaiting_payment']);
                } else {
                    $q->where('status', $status);
                }
            } else {
                // FIXED: Now defaults to showing active, blocked, AND awaiting_payment
                $q->whereIn('status', ['active', 'blocked', 'awaiting_payment']);
            }

            // --- B. Search Filtering (Name or Email) ---
            if ($request->filled('search')) {
                $search = $request->search;
                $q->where(function ($subQ) use ($search) {
                    $subQ->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                });
            }
        });

        // 3. Filter by Location ID
        if ($request->filled('location') && $request->location !== 'All') {
            $query->where('province', $request->location);
        }

        // 4. Paginate
        $perPage = $request->get('per_page', 10);
        $students = $query->latest()->paginate($perPage);

        // 5. Append location name AND calculate payment info
        $students->getCollection()->transform(function ($student) {
            
            $student->province_name_text = $student->location ? $student->location->province_name : 'N/A';
            
            $enrolment = \App\Models\Enrolment::where('student_id', $student->id)
                ->whereIn('status', ['active', 'paid', 'pending_payment'])
                ->latest()
                ->first();
            
            if ($enrolment) {
                $totalToPay = $enrolment->total_amount;
                $balanceDue = $enrolment->balance_due;
                $student->balanceCAD = number_format($balanceDue, 2);
                
                if ($balanceDue <= 0) {
                    $student->paymentStatus = 'Paid';
                } elseif ($balanceDue < $totalToPay) {
                    $student->paymentStatus = 'Deposit Paid';
                } else {
                    $student->paymentStatus = 'Awaiting Payment';
                }
                
                $student->totalPaid = number_format($totalToPay - $balanceDue, 2);
                $student->totalPackageAmount = number_format($totalToPay, 2);
            } else {
                $student->balanceCAD = '0.00';
                $student->paymentStatus = 'Due';
                $student->totalPaid = '0.00';
                $student->totalPackageAmount = $student->package ? number_format($student->package->amount, 2) : '0.00';
            }
            
            return $student;
        });

        return response()->json([
            'success' => true,
            'data'    => $students->items(), 
            'meta'    => [
                'current_page' => $students->currentPage(),
                'last_page'    => $students->lastPage(),
                'total'        => $students->total(),
                'per_page'     => $students->perPage(),
            ]
        ]);
    }



// public function adminShow($id)
// {
//     try {
//         // 1. Eager load everything
//         $student = Student::with([
//             'user', 
//             'package', 
//             'instructor.user',
//             'payments',
//             'assignments.attendance', 
//             'assignments.evaluation'
//         ])->findOrFail($id);

//         // 2. Get the active enrolment
//         $enrolment = Enrolment::where('student_id', $student->id)
//             ->whereIn('status', ['active', 'paid'])
//             ->latest()
//             ->first();

//         // 3. Get location separately
//         $location = null;
//         if ($student->province) {
//             $location = Location::find($student->province);
//         }

//         // 4. Financial Logic - Use enrolment data
//         $totalToPay = $enrolment ? $enrolment->total_amount : ($student->package->amount ?? 0);
//         $balanceDue = $enrolment ? $enrolment->balance_due : $totalToPay;
//         $totalPaid = $totalToPay - $balanceDue;

//         // 5. Get instructor details
//         $instructorPhone = null;
//         $instructorEmail = null;
//         if ($student->instructor && $student->instructor->user) {
//             $instructorPhone = $student->instructor->user->phone;
//             $instructorEmail = $student->instructor->user->email;
//         }

//         // 6. Map attendance
//         $attendanceData = $student->assignments->map(function($assign) {
//             return [
//                 'date'    => $assign->date,
//                 'session' => ($assign->start_time ?? '') . ' - ' . ($assign->end_time ?? ''),
//                 'status'  => $assign->attendance->status ?? 'Not Marked',
//             ];
//         })->values();

//         // 7. Map evaluation data
//         $evaluationData = $student->assignments
//     ->filter(function($assign) {
//         return $assign->evaluation !== null;
//     })
//     ->map(function($assign) {
//         // Get the evaluation date from the evaluation's created_at
//         $evaluationDate = $assign->evaluation->created_at 
//             ? $assign->evaluation->created_at->format('M d, Y') 
//             : ($assign->date ? date('M d, Y', strtotime($assign->date)) : null);
        
//         // Get remark date (same as evaluation date if not separate)
//         $remarkDate = $assign->evaluation->created_at 
//             ? $assign->evaluation->created_at->format('M d, Y') 
//             : null;
        
//         // Get reply date if student_reply exists and was updated
//         $replyDate = $assign->evaluation->student_reply && $assign->evaluation->updated_at 
//             ? $assign->evaluation->updated_at->format('M d, Y') 
//             : null;

//         return [
//             'id'             => $assign->evaluation->id ?? null,
//             'category'       => $assign->evaluation->test_type ?? 'Driving Evaluation',
//             'test_type'      => $assign->evaluation->test_type ?? 'Practical Test',
//             'score'          => $assign->evaluation->score ?? 0,
//             'note'           => $assign->evaluation->instructor_remarks ?? 'No remarks provided',
//             'student_reply'  => $assign->evaluation->student_reply ?? null,
//             'date'           => $evaluationDate ?? 'Date not recorded',
//             'remark_date'    => $remarkDate,
//             'reply_date'     => $replyDate,
//         ];
//     })->values();
//         return response()->json([
//             'success' => true,
//             'data' => [
//                 // Basic Info
//                 'id'              => $student->id,
//                 'name'            => $student->user->name ?? 'N/A',
//                 'email'           => $student->user->email ?? 'N/A',
//                 'phone'           => $student->user->phone ?? 'N/A',
//                 'status'          => $student->user->status,
//                 'isActive'        => $student->user->status === 'active',
//                 'profile_picture' => $student->user->profile_picture,
//                 'permit_number'   => $student->permit_number ?? 'N/A',
                
//                 // Package & Location
//                 'packageName'      => $student->package->package_name ?? 'Not Assigned',
//                 'packageAmount'    => $student->package->amount ?? 0,
//                 'location'         => $location ? $location->province_name : ($student->province ?? 'N/A'),
//                 'locationName'     => $location ? $location->province_name : ($student->province ?? 'N/A'),
//                 'province'         => $student->province,
//                 'licenseClass'     => $student->license_class ?? 'Class 5',
                
//                 // Instructor
//                 'instructor'       => $student->instructor->user->name ?? 'Unassigned',
//                 'instructorName'   => $student->instructor->user->name ?? 'Unassigned',
//                 'instructorPhone'  => $instructorPhone,
//                 'instructorEmail'  => $instructorEmail,
                
//                 // Payments
//                 'totalPackageAmount' => number_format($totalToPay, 2),
//                 'totalPaid'          => number_format($totalPaid, 2),
//                 'balanceCAD'         => number_format($balanceDue, 2),
//                 'paymentStatus'      => $balanceDue <= 0 ? 'Paid' : 'Balance Due',
                
//                 // Course Progress
//                 'hoursLogged' => $student->assignments->where('attendance.status', 'present')->count(),
//                 'totalHours'  => $student->package->hours ?? 0,
                
//                 // Lists
//                 'attendance'   => $attendanceData,
//                 'evaluations'  => $evaluationData,
//                 'upcomingSchedules' => [],
//                 'payments' => $student->payments->map(fn($p) => [
//                     'date'           => $p->created_at->format('M d, Y'),
//                     'amount'         => $p->amount_total,
//                     'method'         => $p->payment_method ?? 'N/A',
//                     'transaction_id' => $p->transaction_id ?? null,
//                     'status'         => $p->status
//                 ])
//             ]
//         ]);
//     } catch (\Exception $e) {
//         return response()->json([
//             'success' => false, 
//             'error' => $e->getMessage(),
//             'file' => $e->getFile(),
//             'line' => $e->getLine(),
//             'trace' => $e->getTraceAsString()
//         ], 500);
//     }
// }
public function adminShow($id)
{
    try {
        // 1. Eager load everything
        $student = Student::with([
            'user', 
            'package', 
            'instructor.user',
            'payments',
            'assignments.attendance', 
            'assignments.evaluation'
        ])->findOrFail($id);

        // 2. Get the active enrolment - FIXED: Added 'pending_payment'
        $enrolment = Enrolment::where('student_id', $student->id)
            ->whereIn('status', ['active', 'paid', 'pending_payment'])
            ->latest()
            ->first();

        // 3. Get location separately
        $location = null;
        if ($student->province) {
            $location = Location::find($student->province);
        }

        // 4. Financial Logic - FIXED: Calculate tax if no enrolment exists yet
        if ($enrolment) {
            $totalToPay = $enrolment->total_amount;
        } else {
            $baseAmount = $student->package->amount ?? 0;
            $taxRate = $location ? $location->tax_rate : 0;
            $taxAmount = ($baseAmount * $taxRate) / 100;
            $totalToPay = round($baseAmount + $taxAmount, 2);
        }
        
        $balanceDue = $enrolment ? $enrolment->balance_due : $totalToPay;
        $totalPaid = $totalToPay - $balanceDue;

        // 5. Get instructor details
        $instructorPhone = null;
        $instructorEmail = null;
        if ($student->instructor && $student->instructor->user) {
            $instructorPhone = $student->instructor->user->phone;
            $instructorEmail = $student->instructor->user->email;
        }

        // 6. Map attendance
        $attendanceData = $student->assignments->map(function($assign) {
            return [
                'date'    => $assign->date,
                'session' => ($assign->start_time ?? '') . ' - ' . ($assign->end_time ?? ''),
                'status'  => $assign->attendance->status ?? 'Not Marked',
            ];
        })->values();

        // 7. Map evaluation data
        $evaluationData = $student->assignments
        ->filter(function($assign) {
            return $assign->evaluation !== null;
        })
        ->map(function($assign) {
            $evaluationDate = $assign->evaluation->created_at 
                ? $assign->evaluation->created_at->format('M d, Y') 
                : ($assign->date ? date('M d, Y', strtotime($assign->date)) : null);
            
            $remarkDate = $assign->evaluation->created_at 
                ? $assign->evaluation->created_at->format('M d, Y') 
                : null;
            
            $replyDate = $assign->evaluation->student_reply && $assign->evaluation->updated_at 
                ? $assign->evaluation->updated_at->format('M d, Y') 
                : null;

            return [
                'id'             => $assign->evaluation->id ?? null,
                'category'       => $assign->evaluation->test_type ?? 'Driving Evaluation',
                'test_type'      => $assign->evaluation->test_type ?? 'Practical Test',
                'score'          => $assign->evaluation->score ?? 0,
                'note'           => $assign->evaluation->instructor_remarks ?? 'No remarks provided',
                'student_reply'  => $assign->evaluation->student_reply ?? null,
                'date'           => $evaluationDate ?? 'Date not recorded',
                'remark_date'    => $remarkDate,
                'reply_date'     => $replyDate,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                // Basic Info
                'id'              => $student->id,
                'name'            => $student->user->name ?? 'N/A',
                'email'           => $student->user->email ?? 'N/A',
                'phone'           => $student->user->phone ?? 'N/A',
                'status'          => $student->user->status,
                'isActive'        => $student->user->status === 'active',
                'profile_picture' => $student->user->profile_picture,
                'permit_number'   => $student->permit_number ?? 'N/A',
                
                // Package & Location
                'packageName'      => $student->package->package_name ?? 'Not Assigned',
                'packageAmount'    => $student->package->amount ?? 0,
                'location'         => $location ? $location->province_name : ($student->province ?? 'N/A'),
                'locationName'     => $location ? $location->province_name : ($student->province ?? 'N/A'),
                'province'         => $student->province,
                'licenseClass'     => $student->license_class ?? 'Class 5',
                
                // Instructor
                'instructor'       => $student->instructor->user->name ?? 'Unassigned',
                'instructorName'   => $student->instructor->user->name ?? 'Unassigned',
                'instructorPhone'  => $instructorPhone,
                'instructorEmail'  => $instructorEmail,
                
                // Payments
                'totalPackageAmount' => number_format($totalToPay, 2),
                'totalPaid'          => number_format($totalPaid, 2),
                'balanceCAD'         => number_format($balanceDue, 2),
                'paymentStatus'      => $balanceDue <= 0 ? 'Paid' : 'Balance Due',
                
                // Course Progress
                'hoursLogged' => $student->assignments->where('attendance.status', 'present')->count(),
                'totalHours'  => $student->package->hours ?? 0,
                
                // Lists
                'attendance'   => $attendanceData,
                'evaluations'  => $evaluationData,
                'upcomingSchedules' => [],
                'payments' => $student->payments->map(fn($p) => [
                    'date'           => $p->created_at->format('M d, Y'),
                    'amount'         => $p->amount_total,
                    'method'         => $p->payment_method ?? 'N/A',
                    'transaction_id' => $p->transaction_id ?? null,
                    'status'         => $p->status
                ])
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false, 
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Block a student account
 */
public function blockStudent($id)
{
    try {
        $student = Student::findOrFail($id);
        $student->user->update(['status' => 'blocked']);

        return response()->json([
            'success' => true,
            'message' => 'Student account has been blocked successfully.'
        ]);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Failed to block student'], 500);
    }
}

/**
 * Unblock a student account (Return to active)
 */
public function unblockStudent($id)
{
    try {
        $student = Student::findOrFail($id);
        $student->user->update(['status' => 'active']);

        return response()->json([
            'success' => true,
            'message' => 'Student account has been unblocked successfully.'
        ]);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Failed to unblock student'], 500);
    }
}



/**
 * Update student information
 */
public function update(Request $request, $id)
{
    try {
        $student = Student::findOrFail($id);
        
        // Validation rules
        $validator = Validator::make($request->all(), [
            // User fields
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $student->user_id,
            'phone' => 'sometimes|string|unique:users,phone,' . $student->user_id,
            
            // Student fields
            'permit_number' => 'nullable|string|max:50|unique:students,permit_number,' . $id,
            'street_address' => 'nullable|string|max:255',
            'appartment' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'parent_name' => 'nullable|string|max:255',
            'parent_email' => 'nullable|email|max:255',
            'parent_phone' => 'nullable|string|max:20',
            'additional_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request, $student) {
            // 1. Update User table
            if ($student->user) {
                $userData = [];
                if ($request->has('name')) $userData['name'] = $request->name;
                if ($request->has('email')) $userData['email'] = $request->email;
                if ($request->has('phone')) $userData['phone'] = $request->phone;
                
                if (!empty($userData)) {
                    $student->user->update($userData);
                }
            }

            // 2. Update Student table
            $studentData = [];
            if ($request->has('permit_number')) $studentData['permit_number'] = $request->permit_number;
            if ($request->has('street_address')) $studentData['street_address'] = $request->street_address;
            if ($request->has('appartment')) $studentData['appartment'] = $request->appartment;
            if ($request->has('city')) $studentData['city'] = $request->city;
            if ($request->has('postal_code')) $studentData['postal_code'] = $request->postal_code;
            if ($request->has('state')) $studentData['state'] = $request->state;
            if ($request->has('country')) $studentData['country'] = $request->country;
            if ($request->has('parent_name')) $studentData['parent_name'] = $request->parent_name;
            if ($request->has('parent_email')) $studentData['parent_email'] = $request->parent_email;
            if ($request->has('parent_phone')) $studentData['parent_phone'] = $request->parent_phone;
            if ($request->has('additional_notes')) $studentData['additional_notes'] = $request->additional_notes;

            if (!empty($studentData)) {
                $student->update($studentData);
            }

            // 3. Return updated student data
            $updatedStudent = Student::with('user')->findOrFail($student->id);

            return response()->json([
                'success' => true,
                'message' => 'Student information updated successfully',
                'data' => [
                    'id' => $updatedStudent->id,
                    'name' => $updatedStudent->user->name ?? null,
                    'email' => $updatedStudent->user->email ?? null,
                    'phone' => $updatedStudent->user->phone ?? null,
                    'permit_number' => $updatedStudent->permit_number,
                    'street_address' => $updatedStudent->street_address,
                    'appartment' => $updatedStudent->appartment,
                    'city' => $updatedStudent->city,
                    'postal_code' => $updatedStudent->postal_code,
                    'state' => $updatedStudent->state,
                    'country' => $updatedStudent->country,
                    'parent_name' => $updatedStudent->parent_name,
                    'parent_email' => $updatedStudent->parent_email,
                    'parent_phone' => $updatedStudent->parent_phone,
                    'additional_notes' => $updatedStudent->additional_notes,
                ]
            ]);
        });
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => 'Failed to update student: ' . $e->getMessage()
        ], 500);
    }
}

public function approvePackageRequest(Request $request, $requestId)
{
    try {
        $validator = Validator::make($request->all(), [
            'instructor_id' => 'required|exists:instructors,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $packageRequest = PackageRequest::with(['student', 'package', 'location'])
            ->findOrFail($requestId);

        if ($packageRequest->status !== 'pending') {
            return response()->json(['error' => 'Request already processed'], 400);
        }

        $instructorId = $request->instructor_id;
        $instructor = Instructor::with('user')->findOrFail($instructorId);

        DB::transaction(function () use ($packageRequest, $instructorId, $instructor) {
            // 1. Complete old enrolment if exists
            $oldEnrolment = Enrolment::where('student_id', $packageRequest->student_id)
                ->whereIn('status', ['active', 'paid'])
                ->first();
            if ($oldEnrolment) {
                $oldEnrolment->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                ]);
            }

            // 2. Calculate total with tax
            $taxAmount = ($packageRequest->package->amount * $packageRequest->location->tax_rate) / 100;
            $totalWithTax = round($packageRequest->package->amount + $taxAmount, 2);

            // 3. Create new enrolment
            Enrolment::create([
                'student_id' => $packageRequest->student_id,
                'package_id' => $packageRequest->package_id,
                'location_id' => $packageRequest->location_id,
                'total_amount' => $totalWithTax,
                'balance_due' => $totalWithTax,
                'progress_percentage' => 0,
                'status' => 'active',
            ]);

            // 4. Update student record
            $student = $packageRequest->student;
            $student->package_id = $packageRequest->package_id;
            $student->instructor_id = $instructorId;
            $student->save();

            // 5. Mark request as approved
            $packageRequest->update([
                'status' => 'approved',
                'approved_at' => now(),
                'instructor_id' => $instructorId,
            ]);
            // After $packageRequest->update(...)
$this->updatePackageRequestNotification($packageRequest->id, 'approved');

            // 6. Notify student
            $student->user->notify(new PackageRequestApprovedNotification($packageRequest, $instructor->user->name));

            // 7. Notify instructor
            $instructor->user->notify(new \App\Notifications\StudentAssignedNotification([
                'student_name' => $student->user->name,
                'package_name' => $packageRequest->package->package_name,
                'student_id' => $student->id,
            ]));
        });

        return response()->json(['success' => true, 'message' => 'Package request approved and instructor assigned.']);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => $e->getFile()
        ], 500);
    }
}

public function rejectPackageRequest($requestId)
{
    $packageRequest = PackageRequest::findOrFail($requestId);

    if ($packageRequest->status !== 'pending') {
        return response()->json(['error' => 'Request already processed'], 400);
    }

    $packageRequest->update([
        'status' => 'rejected',
        'admin_notes' => request('admin_notes', 'Rejected by admin')
    ]);
    $this->updatePackageRequestNotification($packageRequest->id, 'rejected');

    // Optional: Notify student
    $packageRequest->student->user->notify(new \App\Notifications\PackageRequestRejectedNotification($packageRequest));

    return response()->json(['success' => true, 'message' => 'Package request rejected.']);
}
private function updatePackageRequestNotification($requestId, $newStatus)
{
    $notification = \Illuminate\Notifications\DatabaseNotification::where('type', 'App\Notifications\NewPackageRequestNotification')
        ->where('data->request_id', $requestId)
        ->first();
    
    if ($notification) {
        $data = $notification->data;
        $data['request_status'] = $newStatus;
        $notification->data = $data;
        $notification->save();
    }
}

public function rejectStudent(\Illuminate\Http\Request $request, $id)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'rejection_reason' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            return \Illuminate\Support\Facades\DB::transaction(function () use ($request, $id) {
                
                $student = \App\Models\Student::with('user')->findOrFail($id);
                $user = $student->user;

                // 1. Save the rejection reason BEFORE soft-deleting
                $student->update([
                    'rejection_reason' => $request->rejection_reason
                ]);

                // 2. Send the email (We still route it manually just to be safe during the deletion process)
                \Illuminate\Support\Facades\Notification::route('mail', $user->email)
                    ->notify(new \App\Notifications\StudentApplicationRejectedNotification($request->rejection_reason, $user->name));

                // 3. SOFT DELETE
                // Because we added the SoftDeletes trait, this hides the rows but keeps the data!
                $student->delete(); 
                if ($user) {
                    $user->delete();
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Application rejected. The history is saved, the email was sent, and the student can re-apply.'
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Failed to reject application', 
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Instantly check if an email or phone is already registered
     */
    public function checkUniqueField(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'field' => 'required|in:email,phone',
            'value' => 'required|string'
        ]);

        // Check if the value exists in the database and is NOT soft-deleted
        $exists = \App\Models\User::where($request->field, $request->value)
                    ->whereNull('deleted_at')
                    ->exists();

        return response()->json([
            'is_unique' => !$exists
        ]);
    }






    /**
     * Step 1: Approve Application & Send Deposit Invoice
     */
    // public function approveApplication(Request $request, $id)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'package_id' => 'required|exists:packages,id',
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json(['errors' => $validator->errors()], 422);
    //     }

    //     return DB::transaction(function () use ($request, $id) {
    //         $student = Student::with('user')->findOrFail($id);
    //         $package = Package::findOrFail($request->package_id);
            
    //         $location = Location::find($student->province);
    //         if (!$location) {
    //             return response()->json(['error' => 'No tax location found for province ID'], 422);
    //         }

    //         // Calculate Financials
    //         $taxAmount = ($package->amount * $location->tax_rate) / 100;
    //         $totalWithTax = round($package->amount + $taxAmount, 2);
    //         $depositRequired = round($totalWithTax / 2, 2); // 50% deposit

    //         // 1. Update Student
    //         $student->update([
    //             'package_id' => $package->id,
    //         ]);

    //         // 2. Update User Status
    //         $student->user->update(['status' => 'awaiting_payment']);

    //         // 3. Create Pending Enrolment
    //         $enrolment = Enrolment::create([
    //             'student_id'          => $student->id,
    //             'package_id'          => $package->id,
    //             'location_id'         => $location->id,
    //             'total_amount'        => $totalWithTax,
    //             'balance_due'         => $totalWithTax, 
    //             'progress_percentage' => 0,
    //             'status'              => 'pending_payment'
    //         ]);

    //         // 4. Send Deposit Invoice Notification
    //         $student->user->notify(new \App\Notifications\SendDepositInvoiceNotification(
    //             $student->user->name,
    //             $package->package_name,
    //             $totalWithTax,
    //             $depositRequired
    //         ));

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Application approved. Deposit invoice sent to student.',
    //             'data' => [
    //                 'total_amount' => $totalWithTax,
    //                 'deposit_due' => $depositRequired
    //             ]
    //         ]);
    //     });
    // }

public function approveApplication(Request $request, $id)
{
    $validator = Validator::make($request->all(), [
        'package_id' => 'required|exists:packages,id',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    return DB::transaction(function () use ($request, $id) {
        $student = Student::with('user')->findOrFail($id);
        $package = Package::findOrFail($request->package_id);
        
        $location = Location::find($student->province);
        if (!$location) {
            return response()->json(['error' => 'No tax location found for province ID'], 422);
        }

        // Calculate Financials
        $taxAmount = ($package->amount * $location->tax_rate) / 100;
        $totalWithTax = round($package->amount + $taxAmount, 2);
        $depositRequired = round($totalWithTax / 2, 2); // 50% deposit

        // 1. Update Student
        $student->update([
            'package_id' => $package->id,
        ]);

        // 2. Update User Status
        $student->user->update(['status' => 'awaiting_payment']);

        // 3. Create Pending Enrolment
        $enrolment = Enrolment::create([
            'student_id'          => $student->id,
            'package_id'          => $package->id,
            'location_id'         => $location->id,
            'total_amount'        => $totalWithTax,
            'balance_due'         => $totalWithTax, 
            'progress_percentage' => 0,
            'status'              => 'pending_payment'
        ]);

        // Build student address for invoice
        $studentAddress = $student->street_address ?? '';
        if ($student->city) $studentAddress .= ', ' . $student->city;
        if ($student->province) $studentAddress .= ', ' . $student->province;

        // Get company settings
        $company = \App\Models\CompanySetting::first();
        
        // Transform to invoice format
        $invoice = $this->transformToInvoice($enrolment, $package, $student, $company, $totalWithTax);
        
        // Generate invoice HTML using the blade template
        $invoiceHtml = \Illuminate\Support\Facades\View::make('invoice', [
            'invoice' => $invoice,
            'company' => $company ? $company->toArray() : [],
        ])->render();
        
        // Prepare data for email template
        $emailData = [
            'student_name' => $student->user->name,
            'package_name' => $package->package_name,
            'company_name' => $company->company_name ?? 'Terra Nova Driving School',
            'company_email' => $company->company_email ?? 'info@terranovadriverstraining.ca',
            'company_phone' => $company->company_phone ?? '(555) 123-4567',
            'company_address' => $company->company_address ?? '',
            'invoice_number' => 'INV-' . str_pad($enrolment->id, 5, '0', STR_PAD_LEFT),
            'invoice_date' => $enrolment->created_at->format('M d, Y'),
            'total_amount' => number_format($totalWithTax, 2),
            'deposit_amount' => number_format($depositRequired, 2),
            'invoice_link' => url('/invoices/' . $enrolment->id),
            'invoice_html' => $invoiceHtml, // Add the full invoice HTML
        ];

        // Send the invoice email with full HTML
        \Illuminate\Support\Facades\Mail::to($student->user->email)
            ->send(new \App\Mail\InvoiceEmail($emailData, $invoiceHtml));

        // Also send database notification
        // $student->user->notify(new \App\Notifications\SendDepositInvoiceNotification(
        //     $student->user->name,
        //     $package->package_name,
        //     $totalWithTax,
        //     $depositRequired,
        //     $enrolment->id,
        //     $student->user->email,
        //     $studentAddress
        // ));

        return response()->json([
            'success' => true,
            'message' => 'Application approved. Invoice sent to student.',
            'data' => [
                'enrolment_id' => $enrolment->id,
                'total_amount' => $totalWithTax,
                'deposit_due' => $depositRequired
            ]
        ]);
    });
}

// Add this helper method to your controller
private function transformToInvoice($enrolment, $package, $student, $company, $totalAmount)
{
    $balanceDue = $totalAmount;
    $amountPaid = 0;
    
    return [
        'id' => $enrolment->id,
        'transaction_id' => 'INV-' . str_pad($enrolment->id, 5, '0', STR_PAD_LEFT),
        'amount' => $totalAmount,
        'balance_due' => $balanceDue,
        'amount_paid' => $amountPaid,
        'status' => 'pending',
        'status_text' => 'Pending Deposit',
        'invoice_type' => 'INVOICE',
        'date' => $enrolment->created_at->format('Y-m-d'),
        'formatted_date' => $enrolment->created_at->format('M d, Y'),
        'student' => [
            'id' => $student->id,
            'name' => $student->user->name,
            'email' => $student->user->email,
            'address' => $student->street_address ?? '',
        ],
        'course' => $package->package_name,
    ];
}
    /**
     * Step 2: Assign Instructor & Activate Student
     */
   public function assignInstructorAndActivate(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'instructor_id' => 'required|exists:instructors,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request, $id) {
            $student = Student::with(['user', 'package'])->findOrFail($id);
            $instructor = Instructor::with('user')->findOrFail($request->instructor_id);

            // 1. Find Pending or Active Enrolment
            $enrolment = Enrolment::where('student_id', $student->id)
                ->whereIn('status', ['pending_payment', 'active'])
                ->latest()
                ->first();

            if (!$enrolment) {
                return response()->json(['error' => 'No active or pending enrolment found for this student.'], 422);
            }

            // --- NEW: STRICT 50% PAYMENT CHECK ---
            $totalAmount = $enrolment->total_amount;
            $balanceDue = $enrolment->balance_due;
            $amountPaid = $totalAmount - $balanceDue;
            $requiredDeposit = round($totalAmount / 2, 2); // 50% of total

            if ($amountPaid < $requiredDeposit) {
                return response()->json([
                    'error' => "Cannot activate student. A minimum 50% deposit (CAD $" . number_format($requiredDeposit, 2) . ") must be recorded first."
                ], 422);
            }
            // -------------------------------------

            // 2. Update Enrolment Status
            $enrolment->update(['status' => 'active']);

            // 3. Update Student and User
            $student->update([
                'instructor_id' => $instructor->id
            ]);
            $student->user->update(['status' => 'active']);

            // 4. QUEUED EMAILS
            \App\Services\NotificationService::send('student_activation', $student->user->email, [
                'student_name' => $student->user->name,
                'package_name' => $student->package->package_name ?? 'Assigned Package',
                'balance_due'  => $enrolment->balance_due
            ]);

            \App\Services\NotificationService::send('instructor_student_assigned', $instructor->user->email, [
                'instructor_name' => $instructor->user->name,
                'student_name'    => $student->user->name,
                'package_name'    => $student->package->package_name ?? 'Assigned Package'
            ]);

            // 5. DATABASE NOTIFICATIONS
            $instructor->user->notify(new \App\Notifications\StudentAssignedNotification([
                'student_name' => $student->user->name,
                'package_name' => $student->package->package_name ?? 'Assigned Package',
                'student_id'   => $student->id
            ]));

            $student->user->notify(new \App\Notifications\WelcomeStudentNotification([
                'instructor_name' => $instructor->user->name,
                'package_name'    => $student->package->package_name ?? 'Your Package'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Student fully activated and assigned to ' . $instructor->user->name . '. Emails sent.',
            ]);
        });
    }



    /**
     * Send Payment Reminder Notification to Student
     */
    public function sendPaymentReminder($id)
    {
        try {
            $student = \App\Models\Student::with(['user', 'package'])->findOrFail($id);
            
            // Get the active enrolment to find the exact balance
            $enrolment = \App\Models\Enrolment::where('student_id', $id)
                ->whereIn('status', ['active', 'pending_payment'])
                ->latest()
                ->first();

            $balanceDue = $enrolment ? $enrolment->balance_due : ($student->package->amount ?? 0);

            if ($balanceDue <= 0) {
                return response()->json([
                    'success' => false, 
                    'message' => 'This student has no pending balance.'
                ], 400);
            }

            // Trigger the Notification (Database ONLY, no emails)
            $student->user->notify(new \App\Notifications\PaymentReminderNotification($balanceDue));

            return response()->json([
                'success' => true,
                'message' => 'Payment reminder sent to student dashboard successfully!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send reminder: ' . $e->getMessage()
            ], 500);
        }
    }
  }