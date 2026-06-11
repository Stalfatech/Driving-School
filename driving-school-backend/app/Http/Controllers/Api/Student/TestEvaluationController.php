<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\TestEvaluation;
use App\Models\Attendance;
use App\Models\ScheduleAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TestEvaluationController extends Controller
{
    /**
     * Helper function to get grade letter based on score
     */
    private function getGradeLetter($score)
    {
        if ($score >= 90) return 'A+';
        if ($score >= 85) return 'A';
        if ($score >= 80) return 'A-';
        if ($score >= 75) return 'B+';
        if ($score >= 70) return 'B';
        if ($score >= 65) return 'C+';
        if ($score >= 60) return 'C';
        if ($score >= 55) return 'D+';
        if ($score >= 50) return 'D';
        return 'F';
    }

    /**
     * Helper function to get performance description
     */
    private function getPerformanceDescription($score)
    {
        if ($score >= 90) return 'Excellent! Outstanding performance.';
        if ($score >= 80) return 'Very Good! Great progress.';
        if ($score >= 70) return 'Good! Keep practicing.';
        if ($score >= 60) return 'Satisfactory. Need more practice.';
        if ($score >= 50) return 'Below Average. Requires significant improvement.';
        return 'Needs Improvement. Please focus on key areas.';
    }

    /**
     * Get all lesson evaluations for the authenticated student
     */
    /**
 * Get all lesson evaluations for the authenticated student
 */
public function getEvaluations(Request $request)
{
    try {
        $student = Auth::user()->student;
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Student profile not found'], 404);
        }

        $evaluations = TestEvaluation::with(['assignment.instructor.user', 'assignment.attendance', 'assignment.schedule'])
            ->whereHas('assignment', function ($query) use ($student) {
                $query->where('student_id', $student->id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        $transformed = $evaluations->through(function ($evaluation) {
            $schedule = $evaluation->assignment->schedule;
            $attendance = $evaluation->assignment->attendance;
            
            // FIXED: Use test_type from evaluation instead of lesson_type
            return [
                'id' => $evaluation->id,
                'assignment_id' => $evaluation->assignment_id,
                'test_type' => $evaluation->test_type ?? $schedule->task_description ?? 'Driving Test', // ✅ FIXED
                'score' => $evaluation->score,
                'grade' => $this->getGradeLetter($evaluation->score),
                'performance' => $this->getPerformanceDescription($evaluation->score),
                'instructor_remarks' => $evaluation->instructor_remarks,
                'student_reply' => $evaluation->student_reply,
                'has_replied' => !empty($evaluation->student_reply),
                'attendance_status' => $attendance ? $attendance->status : 'pending',
                'created_at' => $evaluation->created_at->format('Y-m-d'),
                'lesson_date' => $evaluation->assignment->date,
                'lesson_time' => $evaluation->assignment->start_time . ' - ' . $evaluation->assignment->end_time,
                'location' => $evaluation->assignment->student_location,
                'instructor' => [
                    'id' => $evaluation->assignment->instructor->id,
                    'name' => $evaluation->assignment->instructor->user->name ?? 'Unknown',
                    'email' => $evaluation->assignment->instructor->user->email ?? ''
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
     * Get single lesson evaluation details
     */
    public function getEvaluation($id)
    {
        try {
            $student = Auth::user()->student;
            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student profile not found'], 404);
            }

            $evaluation = TestEvaluation::with(['assignment.instructor.user', 'assignment.attendance', 'assignment.schedule'])
                ->whereHas('assignment', function ($query) use ($student) {
                    $query->where('student_id', $student->id);
                })
                ->findOrFail($id);

            $schedule = $evaluation->assignment->schedule;
            $attendance = $evaluation->assignment->attendance;

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $evaluation->id,
                    'assignment_id' => $evaluation->assignment_id,
                    'lesson_type' => $schedule->task_description ?? $evaluation->test_type ?? 'Driving Lesson',
                    'score' => $evaluation->score,
                    'grade' => $this->getGradeLetter($evaluation->score),
                    'performance' => $this->getPerformanceDescription($evaluation->score),
                    'instructor_remarks' => $evaluation->instructor_remarks,
                    'student_reply' => $evaluation->student_reply,
                    'has_replied' => !empty($evaluation->student_reply),
                    'attendance_status' => $attendance ? $attendance->status : 'pending',
                    'created_at' => $evaluation->created_at->format('Y-m-d H:i:s'),
                    'lesson_date' => $evaluation->assignment->date,
                    'lesson_time' => $evaluation->assignment->start_time . ' - ' . $evaluation->assignment->end_time,
                    'location' => $evaluation->assignment->student_location,
                    'instructor' => [
                        'name' => $evaluation->assignment->instructor->user->name ?? 'Unknown',
                        'email' => $evaluation->assignment->instructor->user->email ?? ''
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Evaluation not found'], 404);
        }
    }

    /**
     * Submit or update student response/reflection to evaluation
     */
    public function submitResponse(Request $request, $id)
    {
        try {
            $request->validate([
                'student_reply' => 'required|string|min:1|max:1000'
            ]);

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
                'message' => 'Lesson reflection submitted successfully',
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
            return response()->json(['success' => false, 'message' => 'Failed to submit reflection'], 500);
        }
    }

    /**
     * Get attendance and lesson history for the student
     */
    public function getAttendanceHistory(Request $request)
    {
        try {
            $student = Auth::user()->student;
            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student profile not found'], 404);
            }

            $attendances = Attendance::with(['assignment.instructor.user', 'assignment.testEvaluation', 'assignment.schedule'])
                ->whereHas('assignment', function ($query) use ($student) {
                    $query->where('student_id', $student->id);
                })
                ->orderBy('marked_at', 'desc')
                ->paginate($request->get('per_page', 10));

            $transformed = $attendances->through(function ($attendance) {
                $evaluation = $attendance->assignment->testEvaluation;
                $schedule = $attendance->assignment->schedule;

                $lessonType = 'Driving Lesson';
                if ($schedule && !empty($schedule->task_description)) {
                    $lessonType = $schedule->task_description;
                } elseif ($evaluation && !empty($evaluation->test_type)) {
                    $lessonType = $evaluation->test_type;
                }

                return [
                    'id' => $attendance->id,
                    'assignment_id' => $attendance->assignment_id,
                    'attendance_status' => $attendance->status,
                    'marked_at' => $attendance->marked_at,
                    'lesson' => [
                        'id' => $attendance->assignment->id,
                        'date' => $attendance->assignment->date,
                        'start_time' => $attendance->assignment->start_time,
                        'end_time' => $attendance->assignment->end_time,
                        'type' => $lessonType,
                        'location' => $attendance->assignment->student_location,
                        'has_evaluation' => !is_null($evaluation),
                        'evaluation_score' => $evaluation ? $evaluation->score : null,
                        'evaluation_grade' => $evaluation ? $this->getGradeLetter($evaluation->score) : null,
                        'evaluation_remarks' => $evaluation ? $evaluation->instructor_remarks : null,
                        'student_replied' => $evaluation && !empty($evaluation->student_reply),
                        'student_reply' => $evaluation ? $evaluation->student_reply : null
                    ],
                    'instructor' => [
                        'name' => $attendance->assignment->instructor->user->name ?? 'Unknown'
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
            Log::error('getAttendanceHistory error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance history',
                'error' => $e->getMessage()
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

            $totalLessons = $evaluations->count();
            $averageScore = $totalLessons > 0 ? round($evaluations->avg('score')) : 0;
            // Assuming 80 is pass for tests
            $passedLessons = $evaluations->where('score', '>=', 80)->count(); 
            $excellentLessons = $evaluations->where('score', '>=', 90)->count();
            
            // 🔥 FIXED: Make status checking case-insensitive to prevent 0 counts
            $presentCount = $attendances->filter(function($a) {
                return strtolower($a->status) === 'present';
            })->count();
            
            $absentCount = $attendances->filter(function($a) {
                return strtolower($a->status) === 'absent';
            })->count();

            $scoreDistribution = [
                'excellent' => $evaluations->where('score', '>=', 90)->count(),
                'very_good' => $evaluations->whereBetween('score', [80, 89])->count(),
                'good' => $evaluations->whereBetween('score', [70, 79])->count(),
                'satisfactory' => $evaluations->whereBetween('score', [60, 69])->count(),
                'needs_improvement' => $evaluations->whereBetween('score', [50, 59])->count(),
                'poor' => $evaluations->where('score', '<', 50)->count()
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    // 🔥 FIXED: Changed these keys to exactly match what React expects!
                    'total_tests' => $totalLessons,
                    'average_score' => $averageScore,
                    'passed_tests' => $passedLessons,
                    'present_count' => $presentCount,
                    'total_attendances' => $attendances->count(),

                    // Kept your other data in case you expand the UI later
                    'average_grade' => $this->getGradeLetter($averageScore),
                    'excellent_lessons' => $excellentLessons,
                    'absent_count' => $absentCount,
                    'attendance_percentage' => $attendances->count() > 0 
                        ? round(($presentCount / $attendances->count()) * 100) 
                        : 0,
                    'score_distribution' => $scoreDistribution,
                    'recent_improvement' => $this->calculateImprovement($evaluations)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('getStatistics error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch statistics'], 500);
        }
    }

    /**
     * Calculate recent improvement trend
     */
    private function calculateImprovement($evaluations)
    {
        $recentScores = $evaluations->sortByDesc('created_at')->take(5)->pluck('score')->toArray();
        if (count($recentScores) < 2) {
            return 'not_enough_data';
        }
        
        $first = array_slice($recentScores, -1)[0];
        $last = $recentScores[0];
        
        if ($last > $first + 10) return 'improving';
        if ($last < $first - 10) return 'declining';
        return 'stable';
    }

    /**
     * Get upcoming lessons (without evaluations yet)
     */
    public function getUpcomingLessons()
    {
        try {
            $student = Auth::user()->student;
            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student profile not found'], 404);
            }

            $upcomingLessons = ScheduleAssignment::with(['schedule', 'instructor.user'])
                ->where('student_id', $student->id)
                ->where('date', '>=', now()->toDateString())
                ->whereDoesntHave('testEvaluation')
                ->orderBy('date', 'asc')
                ->orderBy('start_time', 'asc')
                ->take(5)
                ->get()
                ->map(function ($assignment) {
                    return [
                        'id' => $assignment->id,
                        'date' => $assignment->date,
                        'start_time' => $assignment->start_time,
                        'end_time' => $assignment->end_time,
                        'lesson_type' => $assignment->schedule->task_description ?? 'Driving Lesson',
                        'location' => $assignment->student_location,
                        'instructor' => [
                            'name' => $assignment->instructor->user->name ?? 'Unknown'
                        ]
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $upcomingLessons
            ]);

        } catch (\Exception $e) {
            Log::error('getUpcomingLessons error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch upcoming lessons'], 500);
        }
    }
}