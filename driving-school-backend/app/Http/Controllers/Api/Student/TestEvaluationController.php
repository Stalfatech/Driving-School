<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\TestEvaluation;
use App\Models\Attendance;
use App\Models\ScheduleAssignment; // ✅ Use correct model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TestEvaluationController extends Controller
{
    /**
     * Get all test evaluations for the authenticated student
     */
    public function getEvaluations(Request $request)
    {
        try {
            $student = Auth::user()->student;
            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student profile not found'], 404);
            }

            $evaluations = TestEvaluation::with(['assignment.instructor.user', 'assignment.attendance'])
                ->whereHas('assignment', function ($query) use ($student) {
                    $query->where('student_id', $student->id);
                })
                ->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 10));

            // Transform data for frontend
            $transformed = $evaluations->through(function ($evaluation) {
                return [
                    'id' => $evaluation->id,
                    'assignment_id' => $evaluation->assignment_id,
                    'test_type' => $evaluation->test_type,
                    'score' => $evaluation->score,
                    'instructor_remarks' => $evaluation->instructor_remarks,
                    'student_reply' => $evaluation->student_reply,
                    'created_at' => $evaluation->created_at->format('Y-m-d'),
                    'assignment' => [
                        'id' => $evaluation->assignment->id,
                        'schedule_date' => $evaluation->assignment->date,
                        'start_time' => $evaluation->assignment->start_time,
                        'end_time' => $evaluation->assignment->end_time,
                        'location' => $evaluation->assignment->student_location,
                        'instructor' => [
                            'id' => $evaluation->assignment->instructor->id,
                            'name' => $evaluation->assignment->instructor->user->name ?? 'Unknown',
                            'email' => $evaluation->assignment->instructor->user->email ?? ''
                        ]
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformed,
                'meta' => [
                    'current_page' => $evaluations->currentPage(),
                    'total' => $evaluations->total(),
                    'per_page' => $evaluations->perPage(),
                    'last_page' => $evaluations->lastPage()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('getEvaluations error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch evaluations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single test evaluation details
     */
    public function getEvaluation($id)
    {
        try {
            $student = Auth::user()->student;
            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student profile not found'], 404);
            }

            $evaluation = TestEvaluation::with(['assignment.instructor.user', 'assignment.attendance'])
                ->whereHas('assignment', function ($query) use ($student) {
                    $query->where('student_id', $student->id);
                })
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $evaluation->id,
                    'assignment_id' => $evaluation->assignment_id,
                    'test_type' => $evaluation->test_type,
                    'score' => $evaluation->score,
                    'instructor_remarks' => $evaluation->instructor_remarks,
                    'student_reply' => $evaluation->student_reply,
                    'created_at' => $evaluation->created_at->format('Y-m-d H:i:s'),
                    'assignment' => [
                        'id' => $evaluation->assignment->id,
                        'schedule_date' => $evaluation->assignment->date,
                        'start_time' => $evaluation->assignment->start_time,
                        'end_time' => $evaluation->assignment->end_time,
                        'location' => $evaluation->assignment->student_location,
                        'instructor' => [
                            'name' => $evaluation->assignment->instructor->user->name ?? 'Unknown',
                            'email' => $evaluation->assignment->instructor->user->email ?? ''
                        ]
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Evaluation not found'], 404);
        }
    }

    /**
     * Submit or update student response to evaluation
     */
    public function submitResponse(Request $request, $id)
    {
        try {
            $request->validate(['student_reply' => 'required|string|min:1|max:1000']);

            $student = Auth::user()->student;
            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student not found'], 404);
            }

            $evaluation = TestEvaluation::whereHas('assignment', function ($query) use ($student) {
                $query->where('student_id', $student->id);
            })->findOrFail($id);

            $evaluation->student_reply = $request->student_reply;
            $evaluation->save();

            return response()->json([
                'success' => true,
                'message' => 'Response submitted successfully',
                'data' => [
                    'id' => $evaluation->id,
                    'student_reply' => $evaluation->student_reply,
                    'updated_at' => $evaluation->updated_at->format('Y-m-d H:i:s')
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('submitResponse error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to submit response'], 500);
        }
    }

    /**
     * Get attendance history for the student
     */


public function getAttendanceHistory(Request $request)
{
    try {
        $student = Auth::user()->student;
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Student profile not found'], 404);
        }

        // Load the correct relationships. Adjust 'assignment.schedule' to your actual relation name.
        $attendances = Attendance::with(['assignment.instructor.user', 'assignment.testEvaluation', 'assignment.schedule'])
            ->whereHas('assignment', function ($query) use ($student) {
                $query->where('student_id', $student->id);
            })
            ->orderBy('marked_at', 'desc')
            ->paginate($request->get('per_page', 10));

        $transformed = $attendances->through(function ($attendance) {
            $evaluation = $attendance->assignment->testEvaluation;
            $schedule = $attendance->assignment->schedule;

            // Priority: evaluation test_type (if not empty) > schedule task_description > default lesson name
            $testType = 'Driving Lesson'; // default fallback
            if ($evaluation && !empty($evaluation->test_type)) {
                $testType = $evaluation->test_type;
            } elseif ($schedule && !empty($schedule->task_description)) {
                $testType = $schedule->task_description;
            } else {
                // Log a warning so you can investigate missing data
                \Log::warning("Missing evaluation test_type and schedule task_description for assignment ID: {$attendance->assignment->id}");
            }

            return [
                'id' => $attendance->id,
                'assignment_id' => $attendance->assignment_id,
                'status' => $attendance->status,
                'marked_at' => $attendance->marked_at,
                'assignment' => [
                    'id' => $attendance->assignment->id,
                    'date' => $attendance->assignment->date,
                    'start_time' => $attendance->assignment->start_time,
                    'end_time' => $attendance->assignment->end_time,
                    'test_evaluation' => ['test_type' => $testType],
                    'instructor' => [
                        'name' => $attendance->assignment->instructor->user->name ?? 'Unknown'
                    ]
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $transformed,
            'meta' => [
                'current_page' => $attendances->currentPage(),
                'total' => $attendances->total(),
                'per_page' => $attendances->perPage(),
                'last_page' => $attendances->lastPage()
            ]
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch attendance history',
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => $e->getFile()
        ], 500);
    }
}
    /**
     * Get statistics for the student
     */
    public function getStatistics()
{
    try {
        $student = Auth::user()->student;
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Student profile not found'], 404);
        }

        $evaluations = TestEvaluation::whereHas('assignment', function ($query) use ($student) {
            $query->where('student_id', $student->id);
        })->get();

        $attendances = Attendance::whereHas('assignment', function ($query) use ($student) {
            $query->where('student_id', $student->id);
        })->get();

        $totalTests = $evaluations->count();
        $averageScore = $totalTests > 0 ? round($evaluations->avg('score')) : 0;
        $passedTests = $evaluations->where('score', '>=', 80)->count();
        
        // ✅ Fix: Match case of status in database (usually 'Present')
        $presentCount = $attendances->where('status', 'Present')->count();
        // Or case‑insensitive:
        // $presentCount = $attendances->filter(fn($a) => strtolower($a->status) === 'present')->count();

        $scoreDistribution = [
            'excellent' => $evaluations->where('score', '>=', 90)->count(),
            'good' => $evaluations->whereBetween('score', [80, 89])->count(),
            'satisfactory' => $evaluations->whereBetween('score', [70, 79])->count(),
            'needs_improvement' => $evaluations->whereBetween('score', [60, 69])->count(),
            'poor' => $evaluations->where('score', '<', 60)->count()
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'total_tests' => $totalTests,
                'average_score' => $averageScore,
                'passed_tests' => $passedTests,
                'present_count' => $presentCount,
                'total_attendances' => $attendances->count(),
                'score_distribution' => $scoreDistribution
            ]
        ]);

    } catch (\Exception $e) {
        Log::error('getStatistics error: ' . $e->getMessage());
        return response()->json(['success' => false, 'message' => 'Failed to fetch statistics'], 500);
    }
}
}