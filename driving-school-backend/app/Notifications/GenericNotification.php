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

    private function generateMessage()
    {
        switch ($this->type) {
            case 'student_reschedule_request':
                $student = $this->data['student_name'] ?? 'A student';
                return "{$student} requested to reschedule a lesson.";
            case 'student_assignment_updated':
                $instructor = $this->data['instructor_name'] ?? 'Your instructor';
                $date = $this->data['new_date'] ?? 'a new date';
                return "Your lesson has been rescheduled by {$instructor} to {$date}.";
            case 'student_new_assignment':
                $instructor = $this->data['instructor_name'] ?? 'Your instructor';
                $date = $this->data['date'] ?? 'upcoming date';
                return "New lesson scheduled with {$instructor} on {$date}.";
            default:
                return 'New notification';
        }
    }
}