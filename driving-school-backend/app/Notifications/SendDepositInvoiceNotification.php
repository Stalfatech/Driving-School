<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\CompanySetting;

class SendDepositInvoiceNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $studentName;
    protected $packageName;
    protected $totalAmount;
    protected $depositAmount;
    protected $enrolmentId;
    protected $studentEmail;
    protected $studentAddress;

    public function __construct($studentName, $packageName, $totalAmount, $depositAmount, $enrolmentId = null, $studentEmail = null, $studentAddress = null)
    {
        $this->studentName = $studentName;
        $this->packageName = $packageName;
        $this->totalAmount = $totalAmount;
        $this->depositAmount = $depositAmount;
        $this->enrolmentId = $enrolmentId;
        $this->studentEmail = $studentEmail;
        $this->studentAddress = $studentAddress;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $company = CompanySetting::first();
        
        // ✅ Use simple MailMessage - clean email without HTML issues
        return (new MailMessage)
            ->subject('Application Approved - Deposit Required | ' . ($company->company_name ?? 'Terra Nova Driving School'))
            ->greeting('Hello ' . $this->studentName . '!')
            ->line('Great news! Your application for the **' . $this->packageName . '** has been successfully approved.')
            ->line('')
            ->line('To finalize your registration and get assigned to an instructor, a 50% deposit is required.')
            ->line('')
            ->line('**📄 Invoice Summary**')
            ->line('- Total Course Cost (incl. tax): $' . number_format($this->totalAmount, 2))
            ->line('- **Deposit Due Now: $' . number_format($this->depositAmount, 2) . '**')
            ->line('')
            ->line('**💳 Payment Instructions**')
            ->line('Please send your payment via Interac e-Transfer to:')
            ->line('**Email:** ' . ($company->company_email ?? 'info@terranovadriverstraining.ca'))
            ->line('*(Auto-deposit is enabled, no password required. Please include your full name in the e-Transfer notes).*')
            ->line('')
            ->line('Once we receive your payment, we will assign your professional instructor and fully activate your account.')
            ->line('')
            ->line('Thank you for choosing ' . ($company->company_name ?? 'Terra Nova Driving School') . '!')
            ->salutation('Best regards,\n' . ($company->company_name ?? 'Terra Nova Driving School') . ' Team');
    }
}