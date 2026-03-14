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

class StudentController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validation
        $validator = Validator::make($request->all(), [
            // User Fields
            'name'             => 'required|string|max:255',
            'email'            => 'required|email|unique:users,email',
            'phone'            => 'required|string|unique:users,phone',
            'password'         => 'required|string|min:8',
            'profile_picture'    => 'nullable|image|mimes:jpeg,png,jpg|max:2048',

            // Student Fields
            'package_id'       => 'nullable|exists:packages,id',
            'province'         => 'required|string',
            'street_address'   => 'required|string',
            'city'             => 'required|string',
            'postal_code'      => 'required|string',
            'state'            => 'required|string',
            'country'          => 'required|string',
            'permit_number'    => 'nullable|string|unique:students',
            'permit_issue_date'=> 'nullable|date',
            'has_foreign_license' => 'required', // Changed to allow flexible boolean input
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

public function index(Request $request)
{
    // 1. Start the query with relationships and the location join
    $query = Student::with(['user', 'package', 'instructor.user'])
        ->leftJoin('locations', 'students.province', '=', 'locations.id')
        ->select('students.*', 'locations.province_name as province_name_text');

    // 2. Filter by User Status (e.g., pending)
    if ($request->has('status')) {
        $status = $request->status;
        $query->whereHas('user', function($q) use ($status) {
            $q->where('status', $status);
        });
    }

    // 3. BACKEND SEARCH: Search by Name or Email
    if ($request->filled('search')) {
        $search = $request->search;
        $query->whereHas('user', function($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }

    // 4. BACKEND FILTER: Filter by Location ID
    if ($request->filled('location') && $request->location !== 'All') {
        $query->where('students.province', $request->location);
    }

    // 5. BACKEND PAGINATION: Get 10 results per page
    $students = $query->latest('students.created_at')->paginate(2);

    return response()->json([
        'success' => true,
        'data'    => $students->items(), // The actual student records
        'meta'    => [
            'current_page' => $students->currentPage(),
            'last_page'    => $students->lastPage(),
            'total'        => $students->total(),
        ]
    ]);
}

//test x good keeep this 
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

    public function adminIndex(Request $request)
{
    // 1. Start query with all necessary relationships
    $query = Student::with(['user', 'package', 'instructor.user']);

    // 2. Filter by User Status (pending, active, etc.)
    if ($request->filled('status')) {
        $status = strtolower($request->status);
        $query->whereHas('user', function($q) use ($status) {
            $q->where('status', $status);
        });
    }

    // 3. Search by Name or Email
    if ($request->filled('search')) {
        $search = $request->search;
        $query->whereHas('user', function($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }

    // 4. Filter by Location ID (Numeric ID from React)
    if ($request->filled('location') && $request->location !== 'All') {
        $query->where('province', $request->location);
    }

    // 5. Paginate (Set to 10 for a full-looking table)
    $students = $query->latest('students.created_at')->paginate(10);

    // 6. Attach the Location Name text manually
    $students->getCollection()->transform(function ($student) {
        $loc = \App\Models\Location::find($student->province);
        $student->province_name_text = $loc ? $loc->province_name : 'N/A';
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

        // 2. Get the active enrolment
        $enrolment = Enrolment::where('student_id', $student->id)
            ->whereIn('status', ['active', 'paid'])
            ->latest()
            ->first();

        // 3. Get location separately
        $location = null;
        if ($student->province) {
            $location = Location::find($student->province);
        }

        // 4. Financial Logic - Use enrolment data
        $totalToPay = $enrolment ? $enrolment->total_amount : ($student->package->amount ?? 0);
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
        // Get the evaluation date from the evaluation's created_at
        $evaluationDate = $assign->evaluation->created_at 
            ? $assign->evaluation->created_at->format('M d, Y') 
            : ($assign->date ? date('M d, Y', strtotime($assign->date)) : null);
        
        // Get remark date (same as evaluation date if not separate)
        $remarkDate = $assign->evaluation->created_at 
            ? $assign->evaluation->created_at->format('M d, Y') 
            : null;
        
        // Get reply date if student_reply exists and was updated
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
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
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



  }