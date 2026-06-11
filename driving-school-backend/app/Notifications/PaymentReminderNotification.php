<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PaymentReminderNotification extends Notification
{
    use Queueable;

    protected $balanceDue;

    /**
     * Create a new notification instance.
     */
    public function __construct($balanceDue)
    {
        $this->balanceDue = $balanceDue;
    }

    /**
     * Get the notification's delivery channels.
     * ONLY returning 'database' guarantees no emails are sent.
     */
    public function via($notifiable)
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray($notifiable)
    {
        return [
            'notification_type' => 'payment_reminder',
            'message' => 'Friendly reminder: You have an outstanding balance of CAD $' . number_format($this->balanceDue, 2),
            'balance_due' => $this->balanceDue,
            'type' => 'payment_reminder'
        ];
    }
}