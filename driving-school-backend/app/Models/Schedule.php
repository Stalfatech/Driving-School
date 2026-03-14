<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'instructor_id',
        'admin_id',
        'location_id',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'task_description'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * The instructor assigned to this duty shift
     */
    public function instructor()
    {
        return $this->belongsTo(Instructor::class);
    }

    /**
     * The admin who created the schedule
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Get all specific student assignments within this duty shift
     */
    public function assignments()
    {
        return $this->hasMany(ScheduleAssignment::class);
    }
    public function location() {
    return $this->belongsTo(Location::class);
}
}