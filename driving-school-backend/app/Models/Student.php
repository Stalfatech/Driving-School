<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'package_id',
        'instructor_id',
        'province',
        'appartment',
        'street_address',
        'city',
        'postal_code',
        'state',
        'country',
        'parent_name',
        'parent_email',
        'parent_phone',
        'permit_number',
        'permit_issue_date',
        // --- ADDED FOREIGN LICENSE FIELDS HERE ---
        'has_foreign_license',
        'foreign_license_number',
        'foreign_street_address',
        'foreign_appartment',
        'foreign_city',
        'foreign_state',
        'foreign_postal_code',
        'foreign_country',
        //
        'experience',
        'additional_notes'
    ];

    /**
     * Link back to the primary User account
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Link to the selected Package
     */
    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id');
    }

    /**
     * Link to the assigned Instructor's profile
     */
    public function instructor()
    {
        return $this->belongsTo(Instructor::class, 'instructor_id');
    }
    public function assignments()
    {
        // Adjust 'student_id' if your foreign key in schedule_assignments is different
        return $this->hasMany(ScheduleAssignment::class, 'student_id');
    }
    public function payments()
    {
        return $this->hasMany(Payment::class, 'student_id');
    }
     public function location()
    {
        return $this->belongsTo(Location::class, 'province', 'id');
    }
}