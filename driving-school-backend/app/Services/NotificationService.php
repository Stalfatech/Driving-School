<?php

namespace App\Services;

use App\Models\EmailTemplate;
use App\Models\User;
use App\Notifications\GenericNotification;
use Illuminate\Support\Facades\Mail;
use App\Mail\DynamicEmail;

class NotificationService
{
    public static function send($slug, $recipientEmail, $data, $notifiableUser = null, $sendDatabase = true)
    {
        // Email
        $template = EmailTemplate::where('slug', $slug)->first();
        if ($template) {
            $subject = self::parse($template->subject, $data);
            $content = self::parse($template->email_body, $data);
            Mail::to($recipientEmail)->queue(new DynamicEmail($subject, $content));
        }

        // Database notification
        if ($sendDatabase && $notifiableUser instanceof User) {
            $notificationData = array_merge($data, [
                'message' => self::generatePreviewMessage($slug, $data)
            ]);
            $notifiableUser->notify(new GenericNotification($notificationData, $slug));
        }
    }

    private static function parse($text, $data)
    {
        foreach ($data as $key => $value) {
            $text = str_replace('{' . $key . '}', $value, $text);
        }
        return $text;
    }

    private static function generatePreviewMessage($slug, $data)
    {
        switch ($slug) {
            case 'student_reschedule_request':
                $student = $data['student_name'] ?? 'A student';
                return "{$student} requested to reschedule a lesson.";
            case 'student_assignment_updated':
                $instructor = $data['instructor_name'] ?? 'Your instructor';
                $date = $data['new_date'] ?? 'a new date';
                return "Your lesson has been rescheduled by {$instructor} to {$date}.";
            case 'student_new_assignment':
                $instructor = $data['instructor_name'] ?? 'Your instructor';
                $date = $data['date'] ?? 'upcoming date';
                return "New lesson scheduled with {$instructor} on {$date}.";
            default:
                return "You have a new notification.";
        }
    }
}