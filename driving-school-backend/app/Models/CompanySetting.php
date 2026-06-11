<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'company_address',
        'company_city',
        'company_province',
        'company_postal_code',
        'company_email',
        'company_phone',
        'company_logo',
        'payment_instructions'
    ];
}