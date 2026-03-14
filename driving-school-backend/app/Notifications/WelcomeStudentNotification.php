<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class WelcomeStudentNotification extends Notification
{
    use Queueable;

    protected $details;

    public function __construct($details)
    {
        $this->details = $details;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Account Activated!',
            'message' => 'Welcome! Your driving lessons are ready to begin.',
            'instructor' => $this->details['instructor_name'],
            'package' => $this->details['package_name'],
            'type' => 'student_welcome'
        ];
    }
}