<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrolment_id',
        'student_id',
        'transaction_id',
        'amount_subtotal',
        'tax_amount',
        'amount_total',
        'currency',
        'payment_method',
        'receipt_url',
        'status'
    ];

    /**
     * Link to the specific enrolment/contract
     */
    public function enrolment()
    {
        return $this->belongsTo(Enrolment::class);
    }

    /**
     * Link to the student who made the payment
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}