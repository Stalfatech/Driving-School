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
        Schema::create('test_evaluations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('assignment_id')->constrained('schedule_assignments')->onDelete('cascade');
    $table->string('test_type'); 
    $table->integer('score');
    $table->text('instructor_remarks');
    $table->text('student_reply')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('test_evaluations');
    }
};
