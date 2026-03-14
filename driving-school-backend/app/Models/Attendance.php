<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id',
        'status',
        'marked_at'
    ];

    protected $casts = [
        'marked_at' => 'datetime',
    ];

    /**
     * Link back to the assigned class session
     */
    public function assignment()
    {
        return $this->belongsTo(ScheduleAssignment::class);
    }
}