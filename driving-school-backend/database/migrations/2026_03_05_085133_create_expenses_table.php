<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('expenses', function (Blueprint $table) {
        $table->id();
        // Link to the user/instructor who spent the money
        $table->foreignId('instructor_id')->constrained('instructors')->onDelete('cascade');
        $table->decimal('amount', 10, 2);
        $table->string('category'); // e.g., Fuel, Car Wash, Repair
        $table->text('description')->nullable();
        $table->string('receipt_path')->nullable(); // Path to the uploaded image
        $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
        $table->text('admin_remarks')->nullable(); // If rejected, why?
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
