<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RescheduleRequest;
use App\Models\ScheduleAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RescheduleController extends Controller
{
    // Fetch pending requests for Admin UI
    public function getPendingRequests()
    {
        $requests = RescheduleRequest::with(['student.user', 'instructor.user', 'assignment'])
            ->where('status', 'pending')
            ->get();
            
        return response()->json($requests);
    }

    // Admin Approves
    public function approve($id)
    {
        return DB::transaction(function () use ($id) {
            $req = RescheduleRequest::with(['assignment', 'student.user', 'instructor.user'])->findOrFail($id);

            if ($req->status !== 'pending') {
                return response()->json(['message' => 'Request already handled.'], 400);
            }

            // 1. Conflict Check
            $conflict = ScheduleAssignment::where('instructor_id', $req->instructor_id)
                ->where('date', $req->requested_date)
                ->where('id', '!=', $req->assignment_id)
                ->where(function($query) use ($req) {
                    $query->where('start_time', '<', $req->requested_end_time)
                          ->where('end_time', '>', $req->requested_start_time);
                })
                ->exists();

            if ($conflict) {
                return response()->json(['message' => 'Conflict! The instructor is booked for this slot.'], 422);
            }

            // Capture old data for the email
            $oldDate = $req->assignment->date;
            $oldStart = $req->assignment->start_time;
            $oldEnd = $req->assignment->end_time;
            $oldTimeString = \Carbon\Carbon::parse($oldStart)->format('h:i A') . ' - ' . \Carbon\Carbon::parse($oldEnd)->format('h:i A');

            // 2. Update Assignment
            $req->assignment->update([
                'date' => $req->requested_date,
                'start_time' => $req->requested_start_time,
                'end_time' => $req->requested_end_time,
                'student_location' => $req->pickup_location ?? $req->assignment->student_location
            ]);

            // 3. Mark Approved
            $req->update([
                'status' => 'approved',
                'handled_by_user_id' => Auth::id()
            ]);

            // 4. Notify Student & Instructor
            $timeString = \Carbon\Carbon::parse($req->requested_start_time)->format('h:i A') . ' - ' . \Carbon\Carbon::parse($req->requested_end_time)->format('h:i A');
            
            // Notify Student
            \App\Services\NotificationService::send('student_assignment_updated', $req->student->user->email, [
                'notification_type' => 'student_assignment_updated', // ADD THIS
                'message' => "Your lesson has been rescheduled by Admin to {$req->requested_date}.",
                'student_name' => $req->student->user->name,
                'updated_by' => 'Admin',
                'instructor_name' => $req->instructor->user->name ?? 'Your Instructor',
                'old_date' => $oldDate,
                'old_time' => $oldTimeString,
                'new_date' => $req->requested_date,
                'new_time' => $timeString,
                'pickup_location' => $req->pickup_location ?? $req->assignment->student_location,
            ], $req->student->user, true);

            // Notify Instructor
            \App\Services\NotificationService::send('instructor_schedule_updated', $req->instructor->user->email, [
                'notification_type' => 'instructor_schedule_updated', // ADD THIS
                'message' => "Your schedule has been updated by Admin for student {$req->student->user->name}.",
                'instructor_name' => $req->instructor->user->name,
                'student_name' => $req->student->user->name,
                'new_date' => $req->requested_date,
                'new_time' => $timeString,
            ], $req->instructor->user, true);

            return response()->json(['success' => true, 'message' => 'Schedule Updated!']);
        });
    }

    // Admin Rejects
    public function reject(Request $request, $id)
    {
        $req = RescheduleRequest::with(['student.user'])->findOrFail($id);

        if ($req->status !== 'pending') {
            return response()->json(['message' => 'Already handled.'], 400);
        }

        $req->update([
            'status' => 'rejected',
            'handled_by_user_id' => Auth::id()
        ]);

        // FIXED: Add notification_type to the data array
        \App\Services\NotificationService::send('reschedule_rejected', $req->student->user->email, [
            'notification_type' => 'reschedule_rejected', // ADD THIS - CRITICAL FIX
            'message' => "Your request to reschedule on {$req->requested_date} was rejected by Admin.",
            'student_name' => $req->student->user->name,
            'requested_date' => $req->requested_date,
            'updated_by' => 'Admin',
            'rejection_reason' => $request->reason ?? 'Schedule conflicts.',
        ], $req->student->user, true);

        return response()->json(['success' => true, 'message' => 'Request rejected.']);
    }

    // Get reschedule request status
    public function getStatus($id)
    {
        try {
            $request = RescheduleRequest::findOrFail($id);
            return response()->json([
                'success' => true,
                'status' => $request->status
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Request not found'
            ], 404);
        }
    }
}