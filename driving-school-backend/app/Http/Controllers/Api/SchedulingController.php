<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;           // The Duty Block
use App\Models\ScheduleAssignment; // The Student Lesson
use App\Models\Location;           // Burin, Marystown, etc.
use App\Models\Student;
use Illuminate\Http\Request;

class SchedulingController extends Controller
{
    /**
     * ADMIN ONLY: Create a Duty Block for an Instructor
     * This links a teacher to a specific Province/Location (e.g., Burin)
     */
    public function adminCreateDuty(Request $request)
    {
        $validated = $request->validate([
            'instructor_id'    => 'required|exists:instructors,id',
            'location_id'      => 'required|exists:locations,id', // From your Location DB
            'start_date'       => 'required|date',
            'end_date'         => 'required|date|after_or_equal:start_date',
            'start_time'       => 'required',
            'end_time'         => 'required',
            'task_description' => 'required|string', // e.g., "Parallel Parking"
        ]);

        $duty = Schedule::create([
            'admin_id'         => auth()->id(),
            'instructor_id'    => $validated['instructor_id'],
            'location_id'      => $validated['location_id'],
            'start_date'       => $validated['start_date'],
            'end_date'         => $validated['end_date'],
            'start_time'       => $validated['start_time'],
            'end_time'         => $validated['end_time'],
            'task_description' => $validated['task_description'],
        ]);

        return response()->json(['message' => 'Duty assigned to instructor', 'duty' => $duty], 201);
    }

    /**
     * INSTRUCTOR/ADMIN: Book a Student into a specific slot
     * Crucial: The student must be assigned WITHIN the Duty Block's parameters.
     */
    public function bookStudent(Request $request)
    {
        $validated = $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'student_id'  => 'required|exists:students,id',
            'date'        => 'required|date',
            'start_time'  => 'required',
            'end_time'    => 'required',
        ]);

        $duty = Schedule::findOrFail($validated['schedule_id']);

        // Check if the chosen date is within the Admin's assigned date range
        if ($validated['date'] < $duty->start_date || $validated['date'] > $duty->end_date) {
            return response()->json(['error' => 'The selected date is outside of the instructor\'s assigned duty period.'], 422);
        }

        $student = Student::find($validated['student_id']);

        $assignment = ScheduleAssignment::create([
            'schedule_id'      => $duty->id,
            'student_id'       => $validated['student_id'],
            'instructor_id'    => $duty->instructor_id,
            'date'             => $validated['date'],
            'start_time'       => $validated['start_time'],
            'end_time'         => $validated['end_time'],
            // Default to student's registered address if no specific location provided
            'student_location' => $request->student_location ?? $student->address,
        ]);

        return response()->json(['message' => 'Student lesson booked!', 'assignment' => $assignment]);
    }

    /**
     * GET DATA: Show Instructor their assigned Duty Blocks
     */
    public function getInstructorDashboard()
    {
        // Fetches duties + the students already booked inside them
        return Schedule::where('instructor_id', auth()->id())
            ->with(['location', 'assignments.student'])
            ->get();
    }


    /**
 * GET: List all duty blocks for the Admin
 */
public function index()
{
    // Fetches every duty block, including the instructor and location details
    return Schedule::with(['instructor', 'location'])
        ->orderBy('start_date', 'desc')
        ->get();
}

/**
 * DELETE: Remove a duty block
 */
// public function destroyDuty($id)
// {
//     $duty = Schedule::findOrFail($id);
    
//     // Optional: Check if it has assignments before deleting
//     if ($duty->assignments()->count() > 0) {
//         return response()->json([
//             'error' => 'Cannot delete duty block that already has students booked.'
//         ], 422);
//     }

//     $duty->delete();

//     return response()->json(['message' => 'Duty block deleted successfully.']);
// }

public function destroyDuty(Request $request, $id)
{
    $duty = Schedule::findOrFail($id);
    
    $force = $request->query('force', false);
    
    if ($duty->assignments()->count() > 0 && !$force) {
        return response()->json([
            'success' => false,
            'error' => 'Cannot delete duty block that already has students booked. Use force=true to delete anyway.'
        ], 422);
    }

    // Delete assignments if force is true
    if ($force) {
        $duty->assignments()->delete();
    }

    $duty->delete();

    return response()->json([
        'success' => true,
        'message' => $force 
            ? 'Duty block and all associated assignments deleted successfully.'
            : 'Duty block deleted successfully.'
    ]);
}

public function updateDuty(Request $request, $id)
{
    $duty = Schedule::findOrFail($id);

    $validated = $request->validate([
        'location_id'      => 'sometimes|exists:locations,id',
        'start_date'       => 'sometimes|date',
        'end_date'         => 'sometimes|date|after_or_equal:start_date',
        'start_time'       => 'sometimes',
        'end_time'         => 'sometimes',
        'task_description' => 'sometimes|string',
    ]);

    $duty->update($validated);

    return response()->json([
        'success' => true,
        'message' => 'Duty block updated successfully',
        'data' => $duty->load(['instructor', 'location'])
    ]);
}

}