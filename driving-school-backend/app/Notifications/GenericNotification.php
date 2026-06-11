<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class GenericNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $data;
    protected $type;

    public function __construct($data, $type = 'generic')
    {
        $this->data = $data;
        $this->type = $type;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        // Return the data directly, not nested inside another 'data' key
        return array_merge($this->data, [
            'notification_type' => $this->type,
            'message' => $this->data['message'] ?? $this->generateMessage(),
        ]);
    }

    private static function generatePreviewMessage($slug, $data)
{
    switch ($slug) {
        case 'admin_reschedule_request_alert':
            $student = $data['student_name'] ?? 'A student';
            return "New reschedule request from {$student}.";
            
        case 'student_reschedule_request':
            $student = $data['student_name'] ?? 'A student';
            return "{$student} requested to reschedule a lesson.";
            
        case 'student_assignment_updated':
            $instructor = $data['instructor_name'] ?? 'Your instructor';
            $date = $data['new_date'] ?? 'a new date';
            return "Your lesson has been rescheduled by {$instructor} to {$date}.";
            
        case 'instructor_schedule_updated':
            $student = $data['student_name'] ?? 'student';
            return "Your schedule has been updated for {$student}.";
            
        case 'reschedule_rejected':
            return "Your reschedule request was rejected.";

        case 'student_new_assignment':
            $instructor = $data['instructor_name'] ?? 'Your instructor';
            $date = $data['date'] ?? 'upcoming date';
            return "New lesson scheduled with {$instructor} on {$date}.";
            
        default:
            return "You have a new notification.";
    }
}
}