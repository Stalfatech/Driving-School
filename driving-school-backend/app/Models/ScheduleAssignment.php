<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScheduleAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'schedule_id',
        'student_id',
        'instructor_id',
        'date',
        'student_location',
        'start_time',
        'end_time'
    ];

    /**
     * Link back to the main schedule shift
     */
    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    /**
     * The student assigned for this lesson
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * The instructor performing the lesson
     */
    public function instructor()
    {
        return $this->belongsTo(Instructor::class);
    }

    /**
     * The attendance record for this specific assignment
     */
    public function attendance()
    {
        return $this->hasOne(Attendance::class, 'assignment_id');
    }

    /**
     * The test evaluation result for this specific assignment
     */
    public function evaluation()
    {
        return $this->hasOne(TestEvaluation::class, 'assignment_id');
    }
}