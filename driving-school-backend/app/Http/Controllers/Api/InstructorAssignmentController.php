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


}