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
                
            case 'reschedule_rejected':  
                $date = $data['requested_date'] ?? 'the requested date';
                $reason = $data['rejection_reason'] ?? 'Schedule conflicts';
                return "❌ Reschedule Rejected: Your request to reschedule on {$date} has been rejected. Reason: {$reason}";
            
            case 'student_assignment_updated':
                $instructor = $data['instructor_name'] ?? 'Your instructor';
                $date = $data['new_date'] ?? 'a new date';
                return "Your lesson has been rescheduled by {$instructor} to {$date}.Check your dashboard for more details";
            case 'student_new_assignment':
                $instructor = $data['instructor_name'] ?? 'Your instructor';
                $date = $data['date'] ?? 'upcoming date';
                return "New lesson scheduled with {$instructor} on {$date}.";
            default:
                return "You have a new notification.";
        }
    }

    // In NotificationService.php, add a new method
public static function sendInvoiceEmail($enrolment, $student, $package, $company, $invoiceHtml)
{
    $data = [
        'student_name' => $student->user->name,
        'package_name' => $package->package_name,
        'company_name' => $company->company_name ?? 'Terra Nova Driving School',
        'company_email' => $company->company_email ?? 'info@terranovadriverstraining.ca',
        'company_phone' => $company->company_phone ?? '(555) 123-4567',
        'company_address' => $company->company_address ?? '',
        'invoice_number' => 'INV-' . str_pad($enrolment->id, 5, '0', STR_PAD_LEFT),
        'invoice_date' => $enrolment->created_at->format('M d, Y'),
        'total_amount' => number_format($enrolment->total_amount, 2),
        'deposit_amount' => number_format($enrolment->total_amount / 2, 2),
        'invoice_link' => url('/invoices/' . $enrolment->id),
    ];
    
    Mail::to($student->user->email)
        ->queue(new \App\Mail\InvoiceEmail($data, $invoiceHtml));
}
}