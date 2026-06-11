<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')->default('Terra Nova Driving School');
            $table->text('company_address')->default('123 Learning Way, Suite 100');
            $table->string('company_city')->default('Toronto');
            $table->string('company_province')->default('ON');
            $table->string('company_postal_code')->default('M4B 1B3');
            $table->string('company_email')->default('info@terranovadriverstraining.ca');
            $table->string('company_phone')->default('(555) 123-4567');
            $table->string('company_logo')->nullable();
            $table->text('payment_instructions')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('company_settings');
    }
};