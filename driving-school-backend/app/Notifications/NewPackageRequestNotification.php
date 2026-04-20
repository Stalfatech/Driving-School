<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\PackageRequest;

class NewPackageRequestNotification extends Notification
{
    use Queueable;

    protected $packageRequest;

    public function __construct(PackageRequest $packageRequest)
    {
        $this->packageRequest = $packageRequest;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $student = $this->packageRequest->student;
        $package = $this->packageRequest->package;

        return (new MailMessage)
            ->subject('New Package Request from Student')
            ->line("Student: {$student->user->name}")
            ->line("Email: {$student->user->email}")
            ->line("Requested Package: {$package->package_name}")
            ->line("Location ID: {$this->packageRequest->location_id}")
            ->action('Review Request', url("/admin/package-requests/{$this->packageRequest->id}"))
            ->line('Please log in to approve or reject this request.');
    }


    public function toArray($notifiable)
{
    return [
        'type' => 'new_package_request',
        'request_id' => $this->packageRequest->id,
        'location_id' => $this->packageRequest->location_id,  
        'request_status' => $this->packageRequest->status,
        'student_name' => $this->packageRequest->student->user->name,
        'package_name' => $this->packageRequest->package->package_name,
        'message' => 'A student has requested a new package.',
    ];
}
}