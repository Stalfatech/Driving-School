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
    Schema::create('email_templates', function (Blueprint $table) {
        $table->id();
        $table->string('slug')->unique(); // e.g., 'student_activation'
        $table->string('subject');         // The Email Subject
        $table->text('email_body');       // The Message with {name} {balance}
        $table->text('sms_body')->nullable(); 
        $table->text('placeholders')->nullable(); // Just a hint for the Admin
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_templates');
    }
};
