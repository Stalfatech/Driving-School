<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Instructor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'car_id',
        'dob',
        'language',
        'country',
        'city',
        'province',
        'street_address',
        'postal_code',
        'assigned_location',
        'emp_status',
        'qualifications_to_teach',
        'licence_no',
        'inst_license_no',
        'licence_expiry',
        'doc_criminal_cert',
        'doc_vulnerable_sector',
        'doc_driver_abstract',
    ];

    protected $casts = [
        'dob' => 'date',
        'licence_expiry' => 'date',
    ];

    /**
     * Link back to the primary User account
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Link to the car assigned to this instructor
     */
    public function car()
    {
        return $this->belongsTo(Car::class, 'car_id');
    }

    /**
     * Get all students assigned to this instructor
     */
    public function students()
    {
        return $this->hasMany(Student::class, 'instructor_id');
    }
}