<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PackageRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id', 'package_id', 'location_id', 'instructor_id',
        'status', 'requested_at'
    ];

    protected $casts = [
        'requested_at' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function instructor()
    {
        return $this->belongsTo(Instructor::class);
    }
}