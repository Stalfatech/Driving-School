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
public function destroyDuty(Request $request, $id)
{
    $duty = Schedule::findOrFail($id);

    // Just soft-delete — no force option needed anymore
    // Assignments, attendance, evaluations are all untouched
    $duty->delete(); // sets deleted_at timestamp, data preserved

    return response()->json([
        'success' => true,
        'message' => 'Duty block deactivated successfully.'
    ]);
}
public function restoreDuty($id)
{
    $duty = Schedule::withTrashed()->findOrFail($id);
    $duty->restore(); // clears deleted_at

    return response()->json(['success' => true, 'message' => 'Duty block restored.']);
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





public function getInstructorAvailability(Request $request)
{
    try {
        $request->validate([
            'instructor_id' => 'required',
            'date' => 'required|date'
        ]);

        $date = $request->date;
        $instructorId = $request->instructor_id;

        // 1. Get ALL Schedules (Shifts) for this instructor on this date
        // Changed from ->first() to ->get() to support multiple shifts in one day
        $schedules = \App\Models\Schedule::where('instructor_id', $instructorId)
            ->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->get();

        // If they aren't working at all, return empty
        if ($schedules->isEmpty()) {
            return response()->json(['success' => true, 'available_slots' => []]);
        }

        // 2. Get existing bookings to filter them out
        $booked = \App\Models\ScheduleAssignment::where('instructor_id', $instructorId)
            ->where('date', $date)
            ->get();

        $slots = [];
        $slotDurationMinutes = 60; // Configurable gap

        // 3. Loop through EVERY shift they are working that day
       // 3. Loop through EVERY shift they are working that day
foreach ($schedules as $schedule) {
    // Force the parsing to use your server's timezone (or UTC if you prefer)
    $start = \Carbon\Carbon::parse($date . ' ' . $schedule->start_time);
    $end = \Carbon\Carbon::parse($date . ' ' . $schedule->end_time);

    // Failsafe: Correct 12-hour AM/PM confusion
    if ($end->lte($start)) {
        $end->addHours(12);
    }

    $tempStart = $start->copy();
    $now = \Carbon\Carbon::now(); // Current time

    while ($tempStart->copy()->addMinutes($slotDurationMinutes)->lte($end)) {
        $slotStart = $tempStart->format('H:i:s');
        $slotEnd = $tempStart->copy()->addMinutes($slotDurationMinutes)->format('H:i:s');
        
        // ✨ THE IMPROVED TIME-GATE:
        // Only skip if the date is TODAY AND the slot end time has passed
        $isToday = ($date === $now->format('Y-m-d'));
        $slotEndDateTime = \Carbon\Carbon::parse($date . ' ' . $slotEnd);
        
        $skipSlot = ($isToday && $slotEndDateTime->lte($now));

        if (!$skipSlot) {
            $isBooked = $booked->contains(function ($item) use ($slotStart, $slotEnd) {
                // Ensure we are comparing simple time strings (H:i:s)
                $itemStart = \Carbon\Carbon::parse($item->start_time)->format('H:i:s');
                $itemEnd = \Carbon\Carbon::parse($item->end_time)->format('H:i:s');
                
                return ($slotStart < $itemEnd && $slotEnd > $itemStart);
            });
            
            if (!$isBooked) {
                // Prevent duplicate slots
                $slotExists = collect($slots)->contains(function($s) use ($slotStart, $slotEnd) {
                    return $s['start'] === $slotStart && $s['end'] === $slotEnd;
                });
                
                if (!$slotExists) {
                    $slots[] = ['start' => $slotStart, 'end' => $slotEnd];
                }
            }
        }
        
        $tempStart->addMinutes($slotDurationMinutes);
    }
}

        // 4. Sort all slots chronologically just to be safe
        usort($slots, function($a, $b) {
            return strcmp($a['start'], $b['start']);
        });

        return response()->json(['success' => true, 'available_slots' => $slots]);
        
    } catch (\Exception $e) {
        \Log::error('Availability Error: ' . $e->getMessage());
        return response()->json(['success' => false, 'message' => 'Server error: ' . $e->getMessage()], 500);
    }
}
}