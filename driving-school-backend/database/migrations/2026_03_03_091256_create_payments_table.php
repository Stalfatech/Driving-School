<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('payments', function (Blueprint $table) {
        $table->id();
        $table->foreignId('enrolment_id')->constrained('enrolments')->onDelete('cascade');
        $table->foreignId('student_id')->constrained('students');
        $table->string('transaction_id')->unique(); 
        $table->decimal('amount_subtotal', 10, 2);
        $table->decimal('tax_amount', 10, 2);
        $table->decimal('amount_total', 10, 2);
        $table->string('currency')->default('CAD');
        $table->string('payment_method'); 
        $table->string('receipt_url')->nullable();
        $table->string('status'); 
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
