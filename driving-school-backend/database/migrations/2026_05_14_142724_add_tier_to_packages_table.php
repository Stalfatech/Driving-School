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
    Schema::table('packages', function (Blueprint $table) {
        // Adds a tier column that defaults to 'Basic'
        $table->enum('tier', ['Basic', 'Premium'])->default('Basic')->after('package_name');
    });
}

public function down()
{
    Schema::table('packages', function (Blueprint $table) {
        $table->dropColumn('tier');
    });
}
};
