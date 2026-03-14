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
       Schema::create('cars', function (Blueprint $table) {
    $table->id();
    $table->foreignId('location_id')->constrained('locations')->onDelete('cascade');
    $table->string('car_name');
    $table->string('model');
    $table->string('number_plate')->unique();
    $table->string('color');
    $table->integer('odometer');
    $table->string('insurance_number');
    $table->date('insurance_expiry');
    $table->string('rc_number');
    $table->date('rc_expiry');
    $table->string('car_document')->nullable(); 
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
