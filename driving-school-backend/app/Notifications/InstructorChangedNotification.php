<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InstructorChangedNotification extends Notification
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
            'title' => 'Instructor Updated',
            'message' => 'Your driving instructor has been changed to ' . $this->details['instructor_name'] . '.',
            'instructor' => $this->details['instructor_name'],
            'type' => 'instructor_reassigned'
        ];
    }
}