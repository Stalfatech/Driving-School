<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestEvaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id',
        'test_type',
        'score',
        'instructor_remarks',
        'student_reply'
    ];

    /**
     * Link back to the assigned test session
     */
    public function assignment()
    {
        return $this->belongsTo(ScheduleAssignment::class);
    }
}