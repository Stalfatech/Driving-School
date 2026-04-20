<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\PackageRequest;

class PackageRequestApprovedNotification extends Notification
{
    use Queueable;

    protected $packageRequest;
    protected $instructorName;

    public function __construct(PackageRequest $packageRequest, $instructorName)
    {
        $this->packageRequest = $packageRequest;
        $this->instructorName = $instructorName;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $package = $this->packageRequest->package;

        return (new MailMessage)
            ->subject('Your Package Request Has Been Approved')
            ->line("Dear {$this->packageRequest->student->user->name},")
            ->line("Your request for the {$package->package_name} package has been approved.")
            ->line("Assigned Instructor: {$this->instructorName}")
            ->line("Total Amount: \$" . number_format($this->packageRequest->package->amount, 2))
            ->action('View My Packages', url('/student/packages'))
            ->line('Thank you for choosing our driving school!');
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'package_request_approved',
            'request_id' => $this->packageRequest->id,
            'package_name' => $this->packageRequest->package->package_name,
            'instructor_name' => $this->instructorName,
            'message' => 'Your package request has been approved.',
        ];
    }
}