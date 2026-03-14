<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminNotification extends Notification
{
    use Queueable;

    protected $data;
    protected $type;

    public function __construct($type, $data)
    {
        $this->type = $type;
        $this->data = $data;
    }

    public function via($notifiable)
    {
        return ['database']; // Only store in database, no email
    }

    public function toArray($notifiable)
    {
        $message = '';
        $additionalData = [];

        if ($this->type === 'new_student') {
            $message = "New student registered: {$this->data['name']}";
            $additionalData = [
                'student_id' => $this->data['student_id'],
                'email' => $this->data['email'],
                'phone' => $this->data['phone'] ?? 'N/A'
            ];
        } elseif ($this->type === 'new_expense') {
            $message = "New expense claim submitted: {$this->data['category']} - $" . number_format($this->data['amount'], 2);
            $additionalData = [
                'expense_id' => $this->data['expense_id'],
                'instructor_name' => $this->data['instructor_name'],
                'amount' => $this->data['amount'],
                'category' => $this->data['category']
            ];
        }

        return array_merge([
            'type' => $this->type,
            'message' => $message,
            'time' => now()->toDateTimeString(),
        ], $additionalData);
    }
}