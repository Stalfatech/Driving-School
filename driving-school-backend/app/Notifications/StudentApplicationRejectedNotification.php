<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StudentApplicationRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $reason;
    protected $name; // 1. Add the name property

    // 2. Accept BOTH reason and name in the constructor
    public function __construct($reason, $name)
    {
        $this->reason = $reason;
        $this->name = $name;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->subject('Update on Your Driving School Application')
                    // 3. Use $this->name instead of $notifiable->name
                    ->greeting('Hello ' . $this->name . ',')
                    ->line('Thank you for applying to our driving school. Unfortunately, we are unable to approve your application at this time.')
                    ->line('Reason: ' . $this->reason)
                    ->line('If you have any questions or would like to provide additional information, please contact our support team.')
                    ->salutation('Best regards, Driving School Team');
    }
}