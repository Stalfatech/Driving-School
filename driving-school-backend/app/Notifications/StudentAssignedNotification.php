<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class StudentAssignedNotification extends Notification
{
    use Queueable;

    protected $details;

    public function __construct($details)
    {
        $this->details = $details;
    }

    public function via(object $notifiable): array
    {
        // We only save to database because Email is handled by NotificationService
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Student Assigned',
            'message' => 'Student ' . $this->details['student_name'] . ' has been assigned to you.',
            'package_name' => $this->details['package_name'],
            'student_id' => $this->details['student_id'],
            'type' => 'instructor_assignment'
        ];
    }
}