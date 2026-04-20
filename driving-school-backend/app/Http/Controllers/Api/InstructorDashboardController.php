<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instructor;
use App\Models\Student;
use App\Models\ScheduleAssignment;
use App\Models\Attendance;
use App\Models\TestEvaluation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Enrolment;
use Carbon\Carbon;

class InstructorDashboardController extends Controller
{
    /**
     * Helper function to get the logged-in instructor's ID
     */
    private function getInstructorId()
    {
        $instructor = Instructor::where('user_id', Auth::id())->first();
        return $instructor ? $instructor->id : null;
    }

    /**
     * Get all dashboard data for the logged-in instructor
     */

public function index()
{
    try {
        $instructorId = $this->getInstructorId();
        if (!$instructorId) {
            return response()->json(['success' => false, 'message' => 'Instructor profile not found'], 404);
        }

        $instructor = Instructor::with(['user', 'car'])->find($instructorId);
        $students = Student::where('instructor_id', $instructorId)->with('user')->get();
        $assignments = ScheduleAssignment::where('instructor_id', $instructorId)
            ->with(['student.user', 'attendance', 'evaluation', 'schedule'])
            ->orderBy('date', 'desc')
            ->get();

        // Total students
        $totalStudents = $students->count();

        // Tests logged
        $testsLogged = $assignments->filter(fn($a) => $a->attendance !== null)->count();

        // Completion rate (average progress)
        $totalProgress = 0;
        $studentsWithEnrolment = 0;
        foreach ($students as $student) {
            $enrolment = Enrolment::where('student_id', $student->id)->first();
            if ($enrolment && is_numeric($enrolment->progress_percentage)) {
                $totalProgress += (float)$enrolment->progress_percentage;
                $studentsWithEnrolment++;
            }
        }
        $completionRate = $studentsWithEnrolment > 0 ? round($totalProgress / $studentsWithEnrolment) : 0;

        // Completed students (progress = 100%)
        $completedStudents = 0;
        foreach ($students as $student) {
            $enrolment = Enrolment::where('student_id', $student->id)->first();
            if ($enrolment && (float)$enrolment->progress_percentage === 100.0) {
                $completedStudents++;
            }
        }

        // Today & upcoming sessions 
        $today = now()->toDateString();
        $todaySessions = $assignments->filter(fn($a) => $a->date === $today)->values();
        $upcomingSessions = $assignments->filter(fn($a) => $a->date > now()->toDateString() && !$a->attendance)->take(5)->values();

        // Recent students 
        $recentStudents = $students->sortByDesc('created_at')->take(5)->map(function($student) {
    $enrolment = Enrolment::where('student_id', $student->id)->first();
    $progress = $enrolment ? (int)$enrolment->progress_percentage : 0;
    
    return [
        'id' => $student->id,
        'name' => $student->user->name ?? 'Unknown',
        'email' => $student->user->email ?? '',
        'progress' => $progress,
        'avatar' => $student->user->profile_picture ? asset('storage/' . $student->user->profile_picture) : null
    ];
})->values();

        $assignedCar = $instructor->car;

        return response()->json([
            'success' => true,
            'data' => [
                'instructor' => [
                    'id' => $instructor->id,
                    'name' => $instructor->user->name ?? 'Instructor',
                    'email' => $instructor->user->email ?? '',
                    'location' => $instructor->assigned_location ?? 'Main Branch',
                    'profile_picture' => $instructor->user->profile_picture ? asset('storage/' . $instructor->user->profile_picture) : null
                ],
                'metrics' => [
                    'total_students' => $totalStudents,
                    'tests_logged' => $testsLogged,
                    'pass_rate' => $completionRate,
                    'completed_students' => $completedStudents   // <-- new
                ],
                'today_sessions' => $todaySessions->map(fn($s) => [
                    'id' => $s->id,
                    'student_name' => $s->student->user->name ?? 'Unknown',
                    'start_time' => $s->start_time,
                    'end_time' => $s->end_time,
                    'task' => $s->schedule->task_description ?? 'Driving Lesson',
                    'status' => $s->attendance ? ($s->attendance->status === 'present' ? 'Completed' : 'Absent') : 'Upcoming',
                    'location' => $s->student_location ?? 'Main Office'
                ]),
                'upcoming_sessions' => $upcomingSessions->map(fn($s) => [
                    'id' => $s->id,
                    'student_name' => $s->student->user->name ?? 'Unknown',
                    'date' => $s->date,
                    'start_time' => $s->start_time,
                    'end_time' => $s->end_time,
                    'task' => $s->schedule->task_description ?? 'Driving Lesson',
                    'location' => $s->student_location ?? 'Main Office'
                ]),
                'recent_students' => $recentStudents,
                'assigned_car' => $assignedCar ? [
                    'id' => $assignedCar->id,
                    'car_name' => $assignedCar->car_name,
                    'number_plate' => $assignedCar->number_plate,
                    'odometer' => $assignedCar->odometer,
                    'insurance_expiry' => $assignedCar->insurance_expiry,
                    'rc_expiry' => $assignedCar->rc_expiry
                ] : null
            ]
        ]);

    } catch (\Exception $e) {
        \Log::error('InstructorDashboard@index error: ' . $e->getMessage());
        return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
}


    /**
     * Get only metrics (for quick updates)
     */
  

public function getMetrics()
{
    try {
        $instructorId = $this->getInstructorId();
        if (!$instructorId) {
            return response()->json(['success' => false, 'message' => 'Instructor profile not found'], 404);
        }

        $students = Student::where('instructor_id', $instructorId)->get();
        $totalStudents = $students->count();

        $assignments = ScheduleAssignment::where('instructor_id', $instructorId)->with('attendance')->get();
        $testsLogged = $assignments->filter(fn($a) => $a->attendance !== null)->count();

        // Completion rate (average progress)
        $totalProgress = 0;
        $studentsWithEnrolment = 0;
        foreach ($students as $student) {
            $enrolment = Enrolment::where('student_id', $student->id)->first();
            if ($enrolment && is_numeric($enrolment->progress_percentage)) {
                $totalProgress += (float)$enrolment->progress_percentage;
                $studentsWithEnrolment++;
            }
        }
        $completionRate = $studentsWithEnrolment > 0 ? round($totalProgress / $studentsWithEnrolment) : 0;

        // Completed students (progress = 100%)
        $completedStudents = 0;
        foreach ($students as $student) {
            $enrolment = Enrolment::where('student_id', $student->id)->first();
            if ($enrolment && (float)$enrolment->progress_percentage === 100.0) {
                $completedStudents++;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'total_students' => $totalStudents,
                'tests_logged' => $testsLogged,
                'pass_rate' => $completionRate,
                'completed_students' => $completedStudents
            ]
        ]);

    } catch (\Exception $e) {
        \Log::error('InstructorDashboard@getMetrics error: ' . $e->getMessage());
        return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
}

    /**
     * Get today's and upcoming sessions
     */
    public function getSessions()
    {
        try {
            $instructorId = $this->getInstructorId();
            
            if (!$instructorId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Instructor profile not found'
                ], 404);
            }

            $today = now()->toDateString();
            
            $assignments = ScheduleAssignment::where('instructor_id', $instructorId)
                ->with(['student.user', 'attendance', 'schedule'])
                ->orderBy('date')
                ->orderBy('start_time')
                ->get();
            
            $todaySessions = $assignments->filter(function($a) use ($today) {
                return $a->date === $today;
            })->values()->map(function($session) {
                return [
                    'id' => $session->id,
                    'student_name' => $session->student->user->name ?? 'Unknown',
                    'start_time' => $session->start_time,
                    'end_time' => $session->end_time,
                    'task' => $session->schedule->task_description ?? 'Driving Lesson',
                    'status' => $session->attendance ? ($session->attendance->status === 'present' ? 'Completed' : 'Absent') : 'Upcoming',
                    'location' => $session->student_location ?? 'Main Office'
                ];
            });
            
            $upcomingSessions = $assignments->filter(function($a) use ($today) {
                return $a->date > $today && !$a->attendance;
            })->take(5)->values()->map(function($session) {
                return [
                    'id' => $session->id,
                    'student_name' => $session->student->user->name ?? 'Unknown',
                    'date' => $session->date,
                    'start_time' => $session->start_time,
                    'end_time' => $session->end_time,
                    'task' => $session->schedule->task_description ?? 'Driving Lesson',
                    'location' => $session->student_location ?? 'Main Office'
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'today' => $todaySessions,
                    'upcoming' => $upcomingSessions
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get assigned car details
     */
    public function getAssignedCar()
    {
        try {
            $instructorId = $this->getInstructorId();
            
            if (!$instructorId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Instructor profile not found'
                ], 404);
            }

            $instructor = Instructor::with('car')->find($instructorId);
            
            $car = $instructor->car;
            
            return response()->json([
                'success' => true,
                'data' => $car ? [
                    'id' => $car->id,
                    'car_name' => $car->car_name,
                    'number_plate' => $car->number_plate,
                    'odometer' => $car->odometer,
                    'insurance_expiry' => $car->insurance_expiry,
                    'rc_expiry' => $car->rc_expiry,
                    'insurance_number' => $car->insurance_number,
                    'rc_number' => $car->rc_number
                ] : null
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}