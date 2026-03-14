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
    Schema::create('instructors', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('car_id')->nullable()->constrained('cars')->onDelete('set null'); // Added Assigned Car
    $table->date('dob');
    $table->string('language')->nullable();
    $table->string('country');
    $table->string('city');
    $table->string('province');
    $table->string('street_address');
    $table->string('postal_code');
    $table->string('assigned_location')->nullable();
    $table->string('emp_status'); 
    $table->string('licence_no');
    $table->string('inst_license_no');
    $table->date('licence_expiry')->nullable();
    $table->string('doc_criminal_cert')->nullable();
    $table->string('doc_vulnerable_sector')->nullable();
    $table->string('doc_driver_abstract')->nullable();
    $table->timestamps();
});
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('instructors');
    }
};
