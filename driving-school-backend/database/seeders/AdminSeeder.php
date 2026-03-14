<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@drivingschool.ca'], // Check if this email exists
            [
                'name' => 'System Administrator',
                'phone' => '1234567890',
                'password' => Hash::make('Admin123!'), 
                'role' => 'admin', 
                'status' => 'active', // Important: Set to active so they can log in
            ]
        );
    }
}