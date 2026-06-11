<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RescheduleRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id', 'student_id', 'instructor_id',
        'requested_date', 'requested_start_time', 'requested_end_time',
        'pickup_location', 'reason', 'status', 'handled_by_user_id'
    ];

    public function assignment() {
        return $this->belongsTo(ScheduleAssignment::class, 'assignment_id');
    }

    public function student() {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function instructor() {
        return $this->belongsTo(Instructor::class, 'instructor_id');
    }
}