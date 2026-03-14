<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            // "Do you have any other license from different country?" (Boolean)
            $table->boolean('has_foreign_license')->default(false)->after('permit_issue_date');
            
            // The specific fields you requested
            $table->string('foreign_license_number')->nullable()->after('has_foreign_license');
            $table->string('foreign_street_address')->nullable()->after('foreign_license_number');
            $table->string('foreign_appartment')->nullable()->after('foreign_street_address');
            $table->string('foreign_city')->nullable()->after('foreign_appartment');
            $table->string('foreign_state')->nullable()->after('foreign_city');
            $table->string('foreign_postal_code')->nullable()->after('foreign_state');
            $table->string('foreign_country')->nullable()->after('foreign_postal_code');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'has_foreign_license',
                'foreign_license_number',
                'foreign_street_address',
                'foreign_appartment',
                'foreign_city',
                'foreign_state',
                'foreign_postal_code',
                'foreign_country'
            ]);
        });
    }
};