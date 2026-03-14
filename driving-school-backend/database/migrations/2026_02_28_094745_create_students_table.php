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
    Schema::create('students', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('package_id')->nullable()->constrained('packages')->onDelete('set null');
    $table->foreignId('instructor_id')->nullable()->constrained('instructors')->onDelete('set null');
    
    $table->string('province');
    $table->string('appartment')->nullable();
    $table->string('street_address');
    $table->string('city');
    $table->string('postal_code');
    $table->string('state');
    $table->string('country');
    $table->string('parent_name')->nullable();
    $table->string('parent_email')->nullable();
    $table->string('parent_phone')->nullable();
    $table->string('permit_number')->nullable();
    $table->date('permit_issue_date')->nullable();
    $table->string('experience')->nullable();
    $table->timestamps();
    $table->text('additional_notes')->nullable(); 
});
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
