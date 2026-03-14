<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    use HasFactory;

    // Add this array to allow these fields to be saved via the API
    protected $fillable = [
        'slug',
        'subject',
        'email_body',
        'sms_body',
        'placeholders'
    ];
}
