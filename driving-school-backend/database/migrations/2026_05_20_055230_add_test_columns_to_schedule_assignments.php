<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('schedule_assignments', function (Blueprint $table) {
            $table->boolean('is_test')->default(false)->after('student_location');
            $table->string('test_type')->nullable()->after('is_test');
            $table->integer('test_attempt')->nullable()->after('test_type');
            $table->string('test_result')->nullable()->after('test_attempt');
            $table->integer('test_score')->nullable()->after('test_result');
        });
    }

    public function down()
    {
        Schema::table('schedule_assignments', function (Blueprint $table) {
            $table->dropColumn(['is_test', 'test_type', 'test_attempt', 'test_result', 'test_score']);
        });
    }
};