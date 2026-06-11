<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\ScheduleAssignment;
use App\Models\Attendance;
use App\Models\TestEvaluation;
use App\Models\Student;
use App\Models\Instructor; // Added this
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class InstructorAssignmentController extends Controller
{
    /**
     * Helper function to get the Instructor profile ID for the logged-in user.
     */
    private function getInstructorId()
    {
        // Finds the instructor record where user_id matches the logged-in user
        $instructor = Instructor::where('user_id', Auth::id())->first();
        return $instructor ? $instructor->id : null;
    }

    /**
     * 1. GET MY DUTY BLOCKS
     */
    public function getMyDutyBlocks()
    {
        $instructorId = $this->getInstructorId();

        if (!$instructorId) {
            return response()->json(['message' => 'Instructor profile not found.'], 404);
        }

        return Schedule::where('instructor_id', $instructorId)
            ->with('location')
            ->orderBy('start_date', 'desc')
            ->get();
    }

  
public function getActiveManifest()
{
    $instructorId = $this->getInstructorId();

    return ScheduleAssignment::where('instructor_id', $instructorId)
        // Ensure student.user is loaded to get the 'name'
        ->with(['student.user', 'attendance', 'evaluation']) 
        ->orderBy('date', 'asc')
        ->orderBy('start_time', 'asc')
        ->get();
}

    /**
     * 3. BOOK STUDENT
     */

   public function store(Request $request)
{
    // Resolve which instructor ID to use
    $instructorId = $this->getInstructorId() ?? $request->instructor_id;

    if (!$instructorId) {
        return response()->json(['message' => 'Instructor ID is required.'], 422);
    }

    $validated = $request->validate([
        'schedule_id'      => 'required|exists:schedules,id',
        'student_id'       => 'required|exists:students,id',
        'date'             => 'required|date',
        'start_time'       => 'required',
        'end_time'         => 'required',
        'student_location' => 'nullable|string',
    ]);

    // Create the assignment
    $assignment = ScheduleAssignment::create([
        'schedule_id'      => $validated['schedule_id'],
        'student_id'       => $validated['student_id'],
        'instructor_id'    => $instructorId, 
        'date'             => $validated['date'],
        'start_time'       => $validated['start_time'],
        'end_time'         => $validated['end_time'],
        'student_location' => $validated['student_location'] ?? 'Main Office',
    ]);

$assignment->load('schedule'); 
    
    

    // Send notification to student
    $student = Student::with('user')->find($validated['student_id']);
    $instructor = Instructor::with('user')->find($instructorId);

    if ($student && $student->user) {
        $data = [
            'student_name' => $student->user->name,
            'instructor_name' => $instructor->user->name ?? 'Your Instructor',
            'date' => $assignment->date,
            'time' => Carbon::parse($assignment->start_time)->format('h:i A') . ' - ' . Carbon::parse($assignment->end_time)->format('h:i A'),
            'pickup_location' => $assignment->student_location ?? 'Main Office',
            'topic' => $assignment->schedule->task_description ?? 'Driving Lesson',
        ];

        \App\Services\NotificationService::send(
            'student_new_assignment',
            $student->user->email,
            $data,
            $student->user, // notifiable user
            true
        );
    }

    return response()->json([
        'message' => 'Student lesson booked successfully!',
        'data' => $assignment
    ], 201);
}


        public function markAttendance(Request $request, $id)
{
    $request->validate([
        'status' => 'required|in:present,absent'
    ]);

    $assignment = ScheduleAssignment::findOrFail($id);

    Attendance::updateOrCreate(
        ['assignment_id' => $assignment->id],
        [
            'status' => $request->status,
            'marked_at' => now()
        ]
    );

    return response()->json([
        'message' => 'Attendance updated successfully'
    ]);
}

//for restoting the marked attendance .
public function deleteAttendance($id)
{
    $assignment = ScheduleAssignment::findOrFail($id);
    
    // Verify instructor owns this assignment
    $instructorId = $this->getInstructorId();
    if ($assignment->instructor_id !== $instructorId) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }
    
    $assignment->attendance()->delete();
    
    return response()->json([
        'success' => true,
        'message' => 'Session restored to active roster'
    ]);
}


public function addEvaluation(Request $request, $id)
{
    $request->validate([
        'score' => 'required|numeric|min:0|max:100',
        'remarks' => 'nullable|string',
        'test_type' => 'nullable|string'
    ]);

    $assignment = ScheduleAssignment::findOrFail($id);

    $evaluation = TestEvaluation::updateOrCreate(
        ['assignment_id' => $assignment->id],
        [
            'test_type' => $request->test_type ?? 'Manual Evaluation',
            'score' => $request->score,
            'instructor_remarks' => $request->remarks
        ]
    );

    return response()->json([
        'message' => 'Evaluation saved successfully',
        'data' => $evaluation
    ]);
}

public function updateEvaluation(Request $request, $id)
{
    $request->validate([
        'score' => 'required|numeric|min:0|max:100',
        'remarks' => 'nullable|string',
        'test_type' => 'nullable|string'
    ]);

    // Find by the evaluation ID itself
    $evaluation = TestEvaluation::findOrFail($id);

    $evaluation->update([
        'test_type' => $request->test_type ?? $evaluation->test_type,
        'score' => $request->score,
        'instructor_remarks' => $request->remarks
    ]);

    return response()->json([
        'message' => 'Evaluation updated successfully',
        'data' => $evaluation
    ]);
}


public function deleteEvaluation($id)
{
    // Find the evaluation record
    $evaluation = TestEvaluation::findOrFail($id);
    
    $evaluation->delete();

    return response()->json([
        'message' => 'Evaluation deleted successfully'
    ]);
}





 // UPDATE EXISTING ASSIGNMENT



public function update(Request $request, $id)
{
    $assignment = ScheduleAssignment::with(['student.user', 'instructor.user'])->findOrFail($id);

    $oldDate = $assignment->date;
    $oldStart = $assignment->start_time;
    $oldEnd = $assignment->end_time;
    $oldLocation = $assignment->student_location;

    $validated = $request->validate([
        'date'             => 'required|date',
        'start_time'       => 'required',
        'end_time'         => 'required',
        'student_location' => 'nullable|string',
    ]);
    $assignment->update($validated);

    // Notify student if date/time/location changed
    if ($oldDate != $assignment->date || $oldStart != $assignment->start_time || $oldEnd != $assignment->end_time || $oldLocation != $assignment->student_location) {
        $student = $assignment->student;
        $instructor = $assignment->instructor;

        if ($student && $student->user) {
            $data = [
                'student_name' => $student->user->name,
                'instructor_name' => $instructor->user->name ?? 'Your Instructor',
                'old_date' => $oldDate,
                'old_time' => Carbon::parse($oldStart)->format('h:i A') . ' - ' . Carbon::parse($oldEnd)->format('h:i A'),
                'new_date' => $assignment->date,
                'new_time' => Carbon::parse($assignment->start_time)->format('h:i A') . ' - ' . Carbon::parse($assignment->end_time)->format('h:i A'),
                'pickup_location' => $assignment->student_location ?? 'Main Office',
            ];

            \App\Services\NotificationService::send(
                'student_assignment_updated',
                $student->user->email,
                $data,
                $student->user,
                true
            );
        }
    }

    return response()->json(['message' => 'Booking updated successfully!', 'data' => $assignment]);
}

/**
 * DELETE ASSIGNMENT
 */
public function destroy($id)
{
    $assignment = ScheduleAssignment::findOrFail($id);
    $assignment->delete();

    return response()->json(['message' => 'Booking removed.']);
}


    public function getAssignmentsByBlock($blockId)
{
    // We load student.user to get the name, and attendance to check if finished
    $assignments = ScheduleAssignment::where('schedule_id', $blockId)
        ->with(['student.user', 'attendance', 'evaluation'])
        ->orderBy('start_time', 'asc')
        ->get();

    return response()->json($assignments);
}


public function getAvailableStudents(Request $request)
{
    try {
        $instructorId = $this->getInstructorId();
        $scheduleId = $request->query('schedule_id');

        $bookedStudentIds = \App\Models\ScheduleAssignment::where('schedule_id', $scheduleId)
            ->pluck('student_id');

        $students = \App\Models\Student::join('users', 'students.user_id', '=', 'users.id')
            ->where('students.instructor_id', $instructorId)
            ->whereNotIn('students.id', $bookedStudentIds)
            ->select(
                'students.id', 
                'users.name', 
                'users.email', 
                'students.province',
                'students.street_address', // Make sure this matches DB exactly
                'students.appartment',    // Double 'p' as per your DB
                'students.city',
                'students.postal_code',
                'students.state'           // Added state just in case
            )
            ->get();

        return response()->json($students);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

public function getAttendanceHistory(Request $request)
{
    $instructorId = $this->getInstructorId();
    $date = $request->query('date');

    $query = ScheduleAssignment::where('instructor_id', $instructorId)
        ->with(['student.user', 'attendance', 'evaluation'])
        ->whereHas('attendance', function ($q) {
            // UPDATED: Include both present and absent
            $q->whereIn('status', ['present', 'absent']);
        });

    if ($date) {
        $query->where('date', $date);
    }

    return response()->json(
        $query->orderBy('date', 'desc')
              ->orderBy('start_time', 'desc')
              ->get()
    );
}

//new fetch student with the prograss
public function getMyAssignedStudents()
{
    try {
        $instructorId = $this->getInstructorId();

        if (!$instructorId) {
            return response()->json([
                'success' => false,
                'message' => 'Instructor profile not found.'
            ], 404);
        }

        $students = Student::with(['user', 'package'])
            ->where('instructor_id', $instructorId)
            ->get();

        $formattedStudents = $students->map(function ($student) {
            // Get the latest enrolment for this student (any status)
            $enrolment = \App\Models\Enrolment::where('student_id', $student->id)
                ->orderBy('created_at', 'desc')
                ->first();

            $progress = $enrolment ? (int) $enrolment->progress_percentage : 0;

            return [
                'id' => $student->id,
                'user_id' => $student->user_id,
                'name' => $student->user->name ?? 'Unknown',
                'email' => $student->user->email ?? '',
                'phone' => $student->user->phone ?? '',
                'province' => $student->province,
                'city' => $student->city,
                'street_address' => $student->street_address,
                'progress' => $progress,
                'package' => $student->package ? [
                    'id' => $student->package->id,
                    'name' => $student->package->package_name,
                    'lessons' => $student->package->lessons,
                    'amount' => $student->package->amount
                ] : null,
                'created_at' => $student->created_at,
                'updated_at' => $student->updated_at
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedStudents
        ]);

    } catch (\Exception $e) {
        \Log::error('getMyAssignedStudents error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ], 500);
    }
}
//progress update 
public function updateStudentProgress(Request $request, $studentId)
{
    try {
        $instructorId = $this->getInstructorId();

        if (!$instructorId) {
            return response()->json([
                'success' => false,
                'message' => 'Instructor profile not found.'
            ], 404);
        }

        // Validate request - only progress_percentage needed
        $validator = \Validator::make($request->all(), [
            'progress_percentage' => 'required|numeric|min:0|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Find the student and verify they belong to this instructor
        $student = Student::where('id', $studentId)
            ->where('instructor_id', $instructorId)
            ->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found or not assigned to you.'
            ], 404);
        }

        // Find the active enrolment for this student
        $enrolment = \App\Models\Enrolment::where('student_id', $studentId)
            // ->where('status', ['active', 'paid'])
            ->latest()
            ->first();

        if (!$enrolment) {
            return response()->json([
                'success' => false,
                'message' => 'No active enrolment found for this student.'
            ], 404);
        }

        // Update only progress_percentage
        $enrolment->progress_percentage = (int)$request->progress_percentage;
        $enrolment->save();

        return response()->json([
            'success' => true,
            'message' => 'Student progress updated successfully',
            'data' => [
                'progress_percentage' => $enrolment->progress_percentage
            ]
        ]);

    } catch (\Exception $e) {
        \Log::error('Error updating student progress: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to update progress: ' . $e->getMessage()
        ], 500);
    }
}




// Add to InstructorAssignmentController.php
public function checkSlotConflict(Request $request)
{
    $request->validate([
        'schedule_id' => 'required',
        'date'        => 'required|date',
        'start_time'  => 'required',
        'end_time'    => 'required',
    ]);

    $hasOverlap = ScheduleAssignment::where('schedule_id', $request->schedule_id)
        ->where('date', $request->date)
        ->where(function ($query) use ($request) {
            $query->where('start_time', '<', $request->end_time)
                  ->where('end_time', '>', $request->start_time);
        })
        ->exists();

    return response()->json(['has_conflict' => $hasOverlap]);
}

/**
 * Check for instructor schedule conflicts (for instructor side)
 */
public function checkInstructorConflict(Request $request)
{
    $request->validate([
        'schedule_id' => 'required|exists:schedules,id',
        'date'        => 'required|date',
        'start_time'  => 'required',
        'end_time'    => 'required',
    ]);

    $instructorId = $this->getInstructorId();
    
    if (!$instructorId) {
        return response()->json(['message' => 'Instructor profile not found.'], 404);
    }

    $assignmentId = $request->input('assignment_id', null);
    
    $query = ScheduleAssignment::where('schedule_id', $request->schedule_id)
        ->where('instructor_id', $instructorId)
        ->where('date', $request->date)
        ->where(function ($query) use ($request) {
            $query->where(function ($q) use ($request) {
                $q->where('start_time', '<', $request->end_time)
                  ->where('end_time', '>', $request->start_time);
            });
        });
    
    // Exclude current assignment when editing
    if ($assignmentId) {
        $query->where('id', '!=', $assignmentId);
    }
    
    $hasOverlap = $query->exists();

    return response()->json([
        'success' => true,
        'has_conflict' => $hasOverlap,
        'message' => $hasOverlap ? 'Time slot conflicts with an existing session' : 'Time slot is available'
    ]);
}
/**
 * Get students eligible for tests (assigned to this instructor)
 */
/**
 * Get students eligible for tests (assigned to this instructor)
 */
public function getTestEligibleStudents()
{
    $instructorId = $this->getInstructorId();
    
    if (!$instructorId) {
        return response()->json(['message' => 'Instructor profile not found.'], 404);
    }

    $students = Student::with(['user', 'package'])
        ->where('instructor_id', $instructorId)
        ->get()
        ->map(function ($student) {
            // Build full address
            $addressParts = [];
            if ($student->street_address) $addressParts[] = $student->street_address;
            if ($student->city) $addressParts[] = $student->city;
            if ($student->province) $addressParts[] = $student->province;
            if ($student->postal_code) $addressParts[] = $student->postal_code;
            $fullAddress = !empty($addressParts) ? implode(', ', $addressParts) : 'Address not set';
            
            // Get previous test attempts for this student
            $testAttempts = ScheduleAssignment::where('student_id', $student->id)
                ->where('is_test', true)
                ->where('test_type', '!=', null)
                ->count();
            
            return [
                'id' => $student->id,
                'name' => $student->user->name ?? 'Unknown',
                'email' => $student->user->email ?? '',
                'phone' => $student->user->phone ?? '',
                'address' => $fullAddress,
                'street_address' => $student->street_address ?? '',
                'city' => $student->city ?? '',
                'province' => $student->province ?? '',
                'postal_code' => $student->postal_code ?? '',
                'test_attempts_count' => $testAttempts,
                'package' => $student->package->package_name ?? 'No Package'
            ];
        });

    return response()->json([
        'success' => true,
        'data' => $students
    ]);
}

/**
 * Schedule a test for a student
 */
public function scheduleTest(Request $request)
{
    $request->validate([
        'student_id' => 'required|exists:students,id',
        'test_type' => 'required|string|in:Road Test,Written Test,Parking Test,Highway Test',
        'date' => 'required|date',
        'start_time' => 'required',
        'end_time' => 'required',
    ]);

    $instructorId = $this->getInstructorId();

    if (!$instructorId) {
        return response()->json(['message' => 'Instructor profile not found.'], 404);
    }

    // Get the current duty shift
    $schedule = Schedule::where('instructor_id', $instructorId)
        ->where('start_date', '<=', $request->date)
        ->where('end_date', '>=', $request->date)
        ->first();

    if (!$schedule) {
        return response()->json(['message' => 'No active duty shift found for this date.'], 422);
    }

    // Check for conflicts
    $conflict = ScheduleAssignment::where('schedule_id', $schedule->id)
        ->where('date', $request->date)
        ->where(function($q) use ($request) {
            $q->where('start_time', '<', $request->end_time)
              ->where('end_time', '>', $request->start_time);
        })
        ->exists();

    if ($conflict) {
        return response()->json(['message' => 'Time slot conflict! Please choose a different time.'], 422);
    }

    // Get attempt number
    $attemptNumber = ScheduleAssignment::where('student_id', $request->student_id)
        ->where('is_test', true)
        ->where('test_type', $request->test_type)
        ->count() + 1;

    // Create test assignment
    $assignment = ScheduleAssignment::create([
        'schedule_id' => $schedule->id,
        'student_id' => $request->student_id,
        'instructor_id' => $instructorId,
        'date' => $request->date,
        'start_time' => $request->start_time,
        'end_time' => $request->end_time,
        'student_location' => $request->pickup_location ?? 'Test Center',
        'is_test' => true,
        'test_type' => $request->test_type,
        'test_attempt' => $attemptNumber
    ]);

    // Send notification to student
    $student = Student::with('user')->find($request->student_id);
    $instructor = Instructor::with('user')->find($instructorId);

    if ($student && $student->user) {
        $data = [
            'student_name' => $student->user->name,
            'instructor_name' => $instructor->user->name ?? 'Your Instructor',
            'date' => $assignment->date,
            'time' => Carbon::parse($assignment->start_time)->format('h:i A') . ' - ' . Carbon::parse($assignment->end_time)->format('h:i A'),
            'test_type' => $request->test_type,
            'pickup_location' => $assignment->student_location ?? 'Test Center',
            'topic' => $request->test_type . ' (Attempt #' . $attemptNumber . ')',
        ];

        \App\Services\NotificationService::send(
            'student_new_assignment',
            $student->user->email,
            $data,
            $student->user,
            true
        );
    }

    return response()->json([
        'success' => true,
        'message' => 'Test scheduled successfully!',
        'data' => $assignment
    ]);
}

/**
 * Save test results (after marking present)
 */
public function saveTestResult(Request $request, $assignmentId)
{
    $request->validate([
        'score' => 'required|integer|min:0|max:100',
        'result' => 'required|in:Pass,Fail',
        'remarks' => 'required|string|min:5'
    ]);

    $assignment = ScheduleAssignment::findOrFail($assignmentId);
    
    // Verify instructor owns this
    $instructorId = $this->getInstructorId();
    if ($assignment->instructor_id !== $instructorId) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    // Update test results on assignment
    $assignment->update([
        'test_score' => $request->score,
        'test_result' => $request->result
    ]);

    // Create/update attendance as present
    Attendance::updateOrCreate(
        ['assignment_id' => $assignment->id],
        ['status' => 'present', 'marked_at' => now()]
    );

    // Save evaluation to TestEvaluation table
    $evaluation = TestEvaluation::updateOrCreate(
        ['assignment_id' => $assignment->id],
        [
            'test_type' => $assignment->test_type ?? 'Driving Test',
            'score' => $request->score,
            'instructor_remarks' => $request->remarks,
            'student_reply' => null
        ]
    );

    // Send notification to student about test result
    $student = Student::with('user')->find($assignment->student_id);
    if ($student && $student->user) {
        $data = [
            'student_name' => $student->user->name,
            'test_type' => $assignment->test_type,
            'attempt_number' => $assignment->test_attempt ?? 1,
            'result' => $request->result,
            'score' => $request->score,
            'remarks' => $request->remarks
        ];

        \App\Services\NotificationService::send(
            'test_result_available',
            $student->user->email,
            $data,
            $student->user,
            true
        );
    }

    return response()->json([
        'success' => true,
        'message' => 'Test results saved successfully!',
        'data' => [
            'assignment' => $assignment,
            'evaluation' => $evaluation
        ]
    ]);
}

/**
 * Get student's test history (for instructor view)
 */
public function getStudentTestHistory($studentId)
{
    $instructorId = $this->getInstructorId();

    $testHistory = ScheduleAssignment::where('student_id', $studentId)
        ->where('instructor_id', $instructorId)
        ->where('is_test', true)
        ->orderBy('date', 'desc')
        ->orderBy('test_attempt', 'desc')
        ->get()
        ->map(function ($test) {
            return [
                'id' => $test->id,
                'test_type' => $test->test_type,
                'attempt_number' => $test->test_attempt,
                'date' => $test->date,
                'start_time' => $test->start_time,
                'end_time' => $test->end_time,
                'result' => $test->test_result,
                'score' => $test->test_score,
                'remarks' => $test->evaluation?->instructor_remarks,
                'status' => $test->attendance ? 'completed' : 'scheduled'
            ];
        });

    return response()->json([
        'success' => true,
        'data' => $testHistory
    ]);
}

/**
 * Get all test sessions for instructor (for Tests tab)
 */
public function getTestSessions(Request $request)
{
    $instructorId = $this->getInstructorId();
    
    $query = ScheduleAssignment::where('instructor_id', $instructorId)
        ->where('is_test', true)
        ->with(['student.user', 'attendance', 'evaluation']);

    // Filter by status
    if ($request->has('status')) {
        if ($request->status === 'upcoming') {
            $query->where('date', '>=', now()->toDateString())
                  ->whereDoesntHave('attendance');
        } elseif ($request->status === 'completed') {
            $query->whereHas('attendance');
        } elseif ($request->status === 'pending') {
            $query->where('date', '<', now()->toDateString())
                  ->whereDoesntHave('attendance');
        }
    }

    $tests = $query->orderBy('date', 'asc')->get();

    return response()->json([
        'success' => true,
        'data' => $tests
    ]);
}

}