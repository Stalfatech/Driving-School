<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    use HasFactory;

    protected $fillable = [
        'location_id',
        'car_name',
        'model',
        'number_plate',
        'color',
        'odometer',
        'insurance_number',
        'insurance_expiry',
        'rc_number',
        'rc_expiry',
        'car_document'
    ];

    protected $casts = [
        'insurance_expiry' => 'date',
        'rc_expiry' => 'date',
    ];

    /**
     * Link to the branch location where the car is kept
     */
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get the instructor currently assigned to this car
     */
    public function instructor()
    {
        return $this->hasOne(Instructor::class, 'car_id');
    }
}