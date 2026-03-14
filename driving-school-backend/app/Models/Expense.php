<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage; // Added for URL generation

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'instructor_id',
        'amount',
        'category',
        'payment_method',
        'description',
        'receipt_path',
        'status',
        'admin_remarks'
    ];

    // This ensures 'receipt_url' is always included in your API response
    protected $appends = ['receipt_url'];

    /**
     * Relationship: Expense belongs to an Instructor.
     */
    public function instructor()
    {
        return $this->belongsTo(Instructor::class);
    }

    /**
     * Accessor: Automatically generates the full URL for the receipt image.
     * In React, you can now use: <img src={expense.receipt_url} />
     */
    public function getReceiptUrlAttribute()
    {
        return $this->receipt_path 
            ? asset('storage/' . $this->receipt_path) 
            : null;
    }

    /**
     * Scope: Easily filter expenses by status in the Controller.
     * Usage: Expense::status('pending')->get();
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}