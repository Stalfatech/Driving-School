<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use HasFactory;

   protected $fillable = [
    'package_name',
    'license_class',
    'amount',
    'hours'
];

// Delete the public function location() { ... }

    /**
     * Link to the location (and its tax rate) this package belongs to
     */
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get all students who have purchased this package
     */
    public function students()
    {
        return $this->hasMany(Student::class);
    }
}