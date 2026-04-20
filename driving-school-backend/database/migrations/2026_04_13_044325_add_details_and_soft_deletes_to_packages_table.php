<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('packages', function (Blueprint $table) {
            // Add new columns
            $table->text('description')->nullable()->after('hours');
            $table->json('included_items')->nullable()->after('description');
            // Add soft delete column
            $table->softDeletes(); // adds deleted_at column
        });
    }

    public function down()
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn(['description', 'included_items', 'deleted_at']);
        });
    }
};