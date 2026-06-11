<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Package extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'package_name',
        'tier',
        'license_class',
        'amount',
        'hours',
        'description',
        'included_items'
    ];

    protected $casts = [
        'included_items' => 'array',
        'deleted_at' => 'datetime',
    ];

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