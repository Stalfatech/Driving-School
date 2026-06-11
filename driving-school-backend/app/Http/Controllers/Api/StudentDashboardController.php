<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\ScheduleAssignment;
use App\Models\Enrolment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class StudentDashboardController extends Controller
{
    public function dashboard()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Load student with required relationships
            $student = Student::with([
                'user',
                'instructor.user',
                'enrolments' => function ($q) {
                    $q->orderBy('created_at', 'desc')->with('package');
                }
            ])->where('user_id', $user->id)->first();

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student profile not found'
                ], 404);
            }

            // Student info
            $studentData = [
                'name' => $student->user->name ?? 'Student',
                'email' => $student->user->email ?? '',
                'phone' => $student->user->phone ?? '',
                'avatar' => $student->user->profile_picture
                    ? asset('storage/' . $student->user->profile_picture)
                    : null
            ];

            // Get the latest enrolment (active or not)
            $enrolment = $student->enrolments->first();
            $package = $enrolment ? $enrolment->package : null;

            // Package data
            $totalHours = $package ? (float) $package->hours : 0;
            $progress = $enrolment ? (int) $enrolment->progress_percentage : 0;
            $completedHours = $totalHours > 0 ? round(($progress / 100) * $totalHours, 1) : 0;
            $remainingHours = max(0, $totalHours - $completedHours);

            $includes = $package ? $package->included_items : [];
            if (is_string($includes)) {
                $includes = json_decode($includes, true);
            }
            if (!is_array($includes) || empty($includes)) {
                $includes = $totalHours > 0
                    ? ["{$totalHours} hours in-car training", "Online theory modules", "Road test preparation"]
                    : ["No active package"];
            }

            $packageData = [
                'name' => $package ? $package->package_name : 'No Active Package',
                'hours' => $totalHours,
                'completed_hours' => $completedHours,
                'remaining_hours' => $remainingHours,
                'progress' => $progress,
                'start_date' => $enrolment ? $enrolment->created_at->toDateString() : null,
                'end_date' => $enrolment ? $enrolment->created_at->addDays(90)->toDateString() : null,
                'includes' => $includes
            ];

           
$instructor = $student->instructor;
$instructorData = null;
if ($instructor && $instructor->user) {
    $createdAt = $instructor->user->created_at;
    $experienceDisplay = 'N/A';
    if ($createdAt) {
        $diff = Carbon::parse($createdAt)->diff(now());
        $years = $diff->y;
        $months = $diff->m;
        
        if ($years > 0 && $months > 0) {
            $experienceDisplay = "{$years} year" . ($years > 1 ? 's' : '') . " {$months} month" . ($months > 1 ? 's' : '');
        } elseif ($years > 0) {
            $experienceDisplay = "{$years} year" . ($years > 1 ? 's' : '');
        } elseif ($months > 0) {
            $experienceDisplay = "{$months} month" . ($months > 1 ? 's' : '');
        } else {
            $experienceDisplay = 'Less than a month';
        }
    }

    $instructorData = [
        'id' => $instructor->id,
        'name' => $instructor->user->name ?? 'Not Assigned',
        'email' => $instructor->user->email ?? '',
        'phone' => $instructor->user->phone ?? '',
        'experience' => $experienceDisplay,
        'specialization' => $instructor->specialization ?? 'Defensive Driving'
    ];
} else {
    $instructorData = [
        'id' => null,
        'name' => 'To be assigned',
        'email' => '',
        'phone' => '',
        'experience' => '',
        'specialization' => ''
    ];
}

            // Fetch all assignments for this student with schedule info
            $assignments = ScheduleAssignment::where('student_id', $student->id)
                ->with(['attendance', 'evaluation', 'schedule'])
                ->orderBy('date', 'desc')
                ->orderBy('start_time', 'desc')
                ->get();

            $upcomingSessions = [];
            $completedSessions = [];
            $today = Carbon::today()->startOfDay();

            foreach ($assignments as $assignment) {
                $date = $assignment->date;
                if (!$date) continue;

                try {
                    $assignmentDate = Carbon::parse($date)->startOfDay();
                    $timeString = Carbon::parse($assignment->start_time)->format('h:i A') . ' - ' .
                                  Carbon::parse($assignment->end_time)->format('h:i A');
                } catch (\Exception $e) {
                    $timeString = 'Time TBD';
                    $assignmentDate = Carbon::parse($date)->startOfDay();
                }

               // Inside StudentDashboardController -> dashboard()
// Find the $sessionItem array and update it to look like this:

$sessionItem = [
    'id' => $assignment->id,
    'date' => $date,
    'startTime' => $assignment->start_time,
    'endTime' => $assignment->end_time,
    'time' => $timeString,
    'location' => $assignment->student_location ?? 'Main Office',
    'pickupLocation' => $assignment->student_location ?? 'Main Office',
    'instructor' => $instructorData['name'] ?? 'TBA',
    'topic' => $assignment->schedule->task_description ?? 'Driving Lesson',
    'status' => $assignmentDate->gte($today) ? 'upcoming' : 'completed',
    'score' => $assignment->evaluation->score ?? null,
    'attended' => optional($assignment->attendance)->status === 'present',
    
    // ✨ ADD THESE TWO LINES:
    'schedule_start_date' => $assignment->schedule ? \Carbon\Carbon::parse($assignment->schedule->start_date)->format('Y-m-d') : null,
    'schedule_end_date' => $assignment->schedule ? \Carbon\Carbon::parse($assignment->schedule->end_date)->format('Y-m-d') : null,
];
                if ($assignmentDate->gte($today)) {
                    $upcomingSessions[] = $sessionItem;
                } else {
                    $completedSessions[] = $sessionItem;
                }
            }

            // Sort upcoming by date ascending, completed by date descending
            usort($upcomingSessions, fn($a, $b) => strcmp($a['date'], $b['date']));
            usort($completedSessions, fn($a, $b) => strcmp($b['date'], $a['date']));

            return response()->json([
                'success' => true,
                'data' => [
                    'student' => $studentData,
                    'package' => $packageData,
                    'instructor' => $instructorData,
                    'upcoming_sessions' => $upcomingSessions,
                    'completed_sessions' => $completedSessions
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('StudentDashboardController error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

//    public function requestReschedule(Request $request)
// {
//     $user = Auth::user();
//     $student = Student::where('user_id', $user->id)->first();

//     if (!$student) {
//         return response()->json(['success' => false, 'message' => 'Student not found'], 404);
//     }

//     $validated = $request->validate([
//         'assignment_id' => 'required|exists:schedule_assignments,id',
//         'requested_date' => 'required|date',
//         'requested_start_time' => 'required',
//         'requested_end_time' => 'required',
//         'pickup_location' => 'nullable|string',
//         'reason' => 'nullable|string',
//     ]);

//     $assignment = ScheduleAssignment::with(['student.user', 'instructor.user'])
//         ->where('id', $validated['assignment_id'])
//         ->where('student_id', $student->id)
//         ->first();

//     if (!$assignment) {
//         return response()->json(['success' => false, 'message' => 'Assignment not found or not yours'], 404);
//     }

//     $instructor = $assignment->instructor;
//     if (!$instructor || !$instructor->user || !$instructor->user->email) {
//         return response()->json(['success' => false, 'message' => 'Instructor not assigned'], 400);
//     }

//     // Optional: Save request to reschedule_requests table

//     $data = [
//         'instructor_name' => $instructor->user->name,
//         'student_name' => $student->user->name,
//         'current_date' => $assignment->date,
//         'current_time' => Carbon::parse($assignment->start_time)->format('h:i A') . ' - ' . Carbon::parse($assignment->end_time)->format('h:i A'),
//         'requested_date' => $validated['requested_date'],
//         'requested_time' => Carbon::parse($validated['requested_start_time'])->format('h:i A') . ' - ' . Carbon::parse($validated['requested_end_time'])->format('h:i A'),
//         'pickup_location' => $validated['pickup_location'] ?? $assignment->student_location,
//         'reason' => $validated['reason'] ?? 'No reason provided',
//     ];

//     // Send email and database notification to instructor
//     \App\Services\NotificationService::send(
//         'student_reschedule_request',
//         $instructor->user->email,
//         $data,
//         $instructor->user, // notifiable user
//         true // send database notification
//     );

//     return response()->json([
//         'success' => true,
//         'message' => 'Reschedule request sent to your instructor.'
//     ]);
// }




public function requestReschedule(Request $request)
{
    $user = Auth::user();
    $student = Student::where('user_id', $user->id)->first();

    if (!$student) {
        return response()->json(['success' => false, 'message' => 'Student not found'], 404);
    }

    $validated = $request->validate([
        'assignment_id' => 'required|exists:schedule_assignments,id',
        'requested_date' => 'required|date',
        'requested_start_time' => 'required',
        'requested_end_time' => 'required',
        'pickup_location' => 'nullable|string',
        'reason' => 'nullable|string',
    ]);

    $assignment = ScheduleAssignment::with(['student.user', 'instructor.user'])
        ->where('id', $validated['assignment_id'])
        ->where('student_id', $student->id)
        ->first();

    if (!$assignment) {
        return response()->json(['success' => false, 'message' => 'Assignment not found'], 404);
    }

    // 1. Save to Database
    $rescheduleRequest = \App\Models\RescheduleRequest::create([
        'assignment_id' => $assignment->id,
        'student_id' => $student->id,
        'instructor_id' => $assignment->instructor_id,
        'requested_date' => $validated['requested_date'],
        'requested_start_time' => $validated['requested_start_time'],
        'requested_end_time' => $validated['requested_end_time'],
        'pickup_location' => $validated['pickup_location'] ?? $assignment->student_location,
        'reason' => $validated['reason'] ?? 'No reason provided',
        'status' => 'pending'
    ]);

    // 2. Prepare Notification Data for Admin
    $data = [
        'request_id' => $rescheduleRequest->id,
        'student_name' => $student->user->name,
        'instructor_name' => $assignment->instructor->user->name ?? 'Assigned Instructor',
        'requested_date' => $validated['requested_date'],
        'requested_time' => \Carbon\Carbon::parse($validated['requested_start_time'])->format('h:i A') . ' - ' . \Carbon\Carbon::parse($validated['requested_end_time'])->format('h:i A'),
        'reason' => $validated['reason'] ?? 'No reason provided',
    ];

    // 3. Notify Admins
    $admins = \App\Models\User::where('role', 'admin')->get();
    foreach ($admins as $admin) {
        \App\Services\NotificationService::send(
            'admin_reschedule_request_alert', // Create this template slug in your DB
            $admin->email,
            $data,
            $admin,
            true
        );
    }

    return response()->json([
        'success' => true,
        'message' => 'Reschedule request sent to Admin for approval.'
    ]);
}



/**
 * Get upcoming tests for the student
 */
public function getUpcomingTests()
{
    try {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Student not found'], 404);
        }
        
        $upcomingTests = ScheduleAssignment::where('student_id', $student->id)
            ->where('is_test', true)
            ->where('date', '>=', now()->toDateString())
            ->whereDoesntHave('attendance')
            ->with(['instructor.user', 'schedule'])
            ->orderBy('date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get()
            ->map(function($test) {
                return [
                    'id' => $test->id,
                    'test_type' => $test->test_type,
                    'attempt_number' => $test->test_attempt,
                    'date' => $test->date,
                    'start_time' => $test->start_time,
                    'end_time' => $test->end_time,
                    'location' => $test->student_location,
                    'instructor_name' => $test->instructor->user->name ?? 'Not Assigned',
                    'status' => 'upcoming'
                ];
            });
        
        return response()->json([
            'success' => true,
            'data' => $upcomingTests
        ]);
        
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
}

/**
 * Get completed tests for the student (with results)
 */
public function getCompletedTests()
{
    try {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Student not found'], 404);
        }
        
        $completedTests = ScheduleAssignment::where('student_id', $student->id)
            ->where('is_test', true)
            ->whereHas('attendance')
            ->with(['instructor.user', 'evaluation'])
            ->orderBy('date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get()
            ->map(function($test) {
                return [
                    'id' => $test->id,
                    'test_type' => $test->test_type,
                    'attempt_number' => $test->test_attempt,
                    'date' => $test->date,
                    'start_time' => $test->start_time,
                    'end_time' => $test->end_time,
                    'result' => $test->test_result,
                    'score' => $test->test_score,
                    'remarks' => $test->evaluation->instructor_remarks ?? null,
                    'instructor_name' => $test->instructor->user->name ?? 'Not Assigned',
                    'status' => 'completed'
                ];
            });
        
        return response()->json([
            'success' => true,
            'data' => $completedTests
        ]);
        
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
}

/**
 * Get all test history for the student
 */
public function getTestHistory()
{
    try {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Student not found'], 404);
        }
        
        $testHistory = ScheduleAssignment::where('student_id', $student->id)
            ->where('is_test', true)
            ->with(['instructor.user', 'evaluation', 'attendance'])
            ->orderBy('date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get()
            ->map(function($test) {
                $hasResult = $test->attendance && $test->test_result;
                
                return [
                    'id' => $test->id,
                    'test_type' => $test->test_type,
                    'attempt_number' => $test->test_attempt,
                    'date' => $test->date,
                    'start_time' => $test->start_time,
                    'end_time' => $test->end_time,
                    'result' => $test->test_result,
                    'score' => $test->test_score,
                    'remarks' => $test->evaluation->instructor_remarks ?? null,
                    'instructor_name' => $test->instructor->user->name ?? 'Not Assigned',
                    'attendance_status' => $test->attendance->status ?? 'pending',
                    'has_result' => $hasResult
                ];
            });
        
        // Calculate statistics
        $totalTests = $testHistory->count();
        $passedTests = $testHistory->where('result', 'Pass')->count();
        $failedTests = $testHistory->where('result', 'Fail')->count();
        $pendingTests = $testHistory->where('attendance_status', 'pending')->where('date', '<', now())->count();
        $upcomingTests = ScheduleAssignment::where('student_id', $student->id)
            ->where('is_test', true)
            ->where('date', '>=', now()->toDateString())
            ->whereDoesntHave('attendance')
            ->count();
        
        return response()->json([
            'success' => true,
            'data' => $testHistory,
            'statistics' => [
                'total_tests' => $totalTests,
                'passed_tests' => $passedTests,
                'failed_tests' => $failedTests,
                'pending_tests' => $pendingTests,
                'upcoming_tests' => $upcomingTests,
                'pass_rate' => $totalTests > 0 ? round(($passedTests / $totalTests) * 100) : 0
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
}

/**
     * Get the logged-in student's financial details and payment history
     */
    public function getPayments(\Illuminate\Http\Request $request)
    {
        try {
            $student = $request->user()->student;

            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student profile not found.'], 404);
            }

            // 1. Get the active enrolment to pull the total price and balance
            $enrolment = \App\Models\Enrolment::with('package')
                ->where('student_id', $student->id)
                ->whereIn('status', ['active', 'paid', 'pending_payment', 'completed'])
                ->latest()
                ->first();

            $totalAmount = $enrolment ? $enrolment->total_amount : 0;
            $balanceDue = $enrolment ? $enrolment->balance_due : 0;

            // 2. Get payment history for this student
            $payments = \App\Models\Payment::where('student_id', $student->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'transaction_id' => $payment->transaction_id,
                        'amount' => $payment->amount_total,
                        'method' => $payment->payment_method,
                        'status' => $payment->status,
                        'date' => $payment->created_at->format('M d, Y'),
                        'receipt_url' => $payment->receipt_url
                    ];
                });

            return response()->json([
                'success' => true,
                'financials' => [
                    'package_name' => $enrolment->package->package_name ?? 'N/A',
                    'total_amount' => $totalAmount,
                    'balance_due' => $balanceDue,
                ],
                'payments' => $payments
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Failed to load payments: ' . $e->getMessage()
            ], 500);
        }
    }


}