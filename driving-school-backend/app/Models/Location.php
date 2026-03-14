<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
    'province_name',
    'tax_rate',
    'tax-type'
];

    /**
     * Get all packages available for this location/province
     */
    public function packages()
    {
        return $this->hasMany(Package::class);
    }

    /**
     * Get all cars registered at this branch location
     */
    public function cars()
    {
        return $this->hasMany(Car::class);
    }
}