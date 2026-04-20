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
        'name' => $instructor->user->name ?? 'Not Assigned',
        'email' => $instructor->user->email ?? '',
        'phone' => $instructor->user->phone ?? '',
        'experience' => $experienceDisplay,
        'specialization' => $instructor->specialization ?? 'Defensive Driving'
    ];
} else {
    $instructorData = [
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
                    'attended' => optional($assignment->attendance)->status === 'present'
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
        return response()->json(['success' => false, 'message' => 'Assignment not found or not yours'], 404);
    }

    $instructor = $assignment->instructor;
    if (!$instructor || !$instructor->user || !$instructor->user->email) {
        return response()->json(['success' => false, 'message' => 'Instructor not assigned'], 400);
    }

    // Optional: Save request to reschedule_requests table

    $data = [
        'instructor_name' => $instructor->user->name,
        'student_name' => $student->user->name,
        'current_date' => $assignment->date,
        'current_time' => Carbon::parse($assignment->start_time)->format('h:i A') . ' - ' . Carbon::parse($assignment->end_time)->format('h:i A'),
        'requested_date' => $validated['requested_date'],
        'requested_time' => Carbon::parse($validated['requested_start_time'])->format('h:i A') . ' - ' . Carbon::parse($validated['requested_end_time'])->format('h:i A'),
        'pickup_location' => $validated['pickup_location'] ?? $assignment->student_location,
        'reason' => $validated['reason'] ?? 'No reason provided',
    ];

    // Send email and database notification to instructor
    \App\Services\NotificationService::send(
        'student_reschedule_request',
        $instructor->user->email,
        $data,
        $instructor->user, // notifiable user
        true // send database notification
    );

    return response()->json([
        'success' => true,
        'message' => 'Reschedule request sent to your instructor.'
    ]);
}
}