<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enrolment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'package_id',
        'location_id',
        'total_amount',
        'balance_due',
        'progress_percentage',
        'status'
    ];

    /**
     * Link to the student who is enrolled
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Link to the selected driving package
     */
    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    /**
     * Link to the branch location for this enrolment
     */
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get all payments made against this enrolment
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}