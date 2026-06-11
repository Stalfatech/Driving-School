<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Leave this completely empty! 
        // The database already dropped the index in the previous run.
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unique('email');
        });
    }
};