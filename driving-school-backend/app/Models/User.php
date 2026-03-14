<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'role', 'status', 'profile_picture',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // --- RELATIONSHIPS ---

    public function student()
    {
        return $this->hasOne(Student::class, 'user_id');
    }
    public function instructor()
    {
    return $this->hasOne(Instructor::class, 'user_id');
    }

    // If this user is an instructor, they can see their assigned students
    public function assignedStudents()
    {
        return $this->hasMany(Student::class, 'instructor_id');
    }

    // --- HELPERS ---
    public function isActive(): bool { return $this->status === 'active'; }
    public function isAdmin(): bool { return $this->role === 'admin'; }
    public function isInstructor(): bool { return $this->role === 'instructor'; }
    public function isStudent(): bool { return $this->role === 'student'; }


    public function sendPasswordResetNotification($token)
{
    $this->notify(new \App\Notifications\CustomResetPassword($token));
}
}