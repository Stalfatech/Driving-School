<?php

namespace App\Notifications;

use App\Models\Payment;
use App\Models\EmailTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentReceived extends Notification
{
    use Queueable;

    protected $payment;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment->load(['student.user', 'enrolment.package']);
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $template = EmailTemplate::where('slug', 'payment_confirmation')->first();
        
        $student = $this->payment->student;
        $enrolment = $this->payment->enrolment;
        
        // Calculate remaining balance
        $totalPaid = Payment::where('enrolment_id', $enrolment->id)
            ->where('status', 'succeeded')
            ->sum('amount_total');
        $remainingBalance = max(0, $enrolment->total_amount - $totalPaid);
        
        // Determine balance color
        $balanceColor = $remainingBalance <= 0 ? '#059669' : '#DC2626';

        if (!$template) {
            // Fallback HTML content if template not found
            $htmlContent = $this->getFallbackHtmlContent(
                $student->user->name ?? 'Student',
                '$' . number_format($this->payment->amount_total, 2),
                $enrolment->package->package_name ?? 'Driving Course',
                $this->payment->transaction_id ?? 'N/A',
                $this->payment->payment_method ?? 'N/A',
                $this->payment->created_at->format('M d, Y'),
                '$' . number_format($remainingBalance, 2),
                $balanceColor
            );
        } else {
            // Replace placeholders in the template
            $placeholders = [
                '{student_name}'      => $student->user->name ?? 'Student',
                '{amount}'            => '$' . number_format($this->payment->amount_total, 2),
                '{course_name}'       => $enrolment->package->package_name ?? 'Driving Course',
                '{transaction_id}'    => $this->payment->transaction_id ?? 'N/A',
                '{payment_method}'    => $this->payment->payment_method ?? 'N/A',
                '{payment_date}'      => $this->payment->created_at->format('M d, Y'),
                '{remaining_balance}' => '$' . number_format($remainingBalance, 2),
                '{balance_color}'     => $balanceColor,
            ];

            $htmlContent = str_replace(
                array_keys($placeholders), 
                array_values($placeholders), 
                $template->email_body
            );
        }

        // Use your existing dynamic.blade.php template
        return (new MailMessage)
            ->subject('Payment Confirmation - Receipt #' . ($this->payment->transaction_id ?? 'RECEIPT'))
            ->view('emails.dynamic', ['content' => $htmlContent]);
    }

    private function getFallbackHtmlContent($studentName, $amount, $courseName, $transactionId, $paymentMethod, $paymentDate, $remainingBalance, $balanceColor)
    {
        return "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <h2 style='color: #4F46E5;'>Payment Received!</h2>
            
            <p>Dear <strong>{$studentName}</strong>,</p>
            
            <p>We have successfully received your payment of <strong style='color: #059669;'>{$amount}</strong> for the <strong>{$courseName}</strong> course.</p>
            
            <div style='background-color: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;'>
                <h3 style='margin-top: 0; color: #374151;'>Payment Details</h3>
                <table style='width: 100%;'>
                    <tr>
                        <td style='padding: 8px 0; color: #6B7280;'>Amount Paid:</td>
                        <td style='padding: 8px 0; font-weight: bold;'>{$amount}</td>
                    </tr>
                    <tr>
                        <td style='padding: 8px 0; color: #6B7280;'>Transaction ID:</td>
                        <td style='padding: 8px 0; font-family: monospace;'>{$transactionId}</td>
                    </tr>
                    <tr>
                        <td style='padding: 8px 0; color: #6B7280;'>Payment Method:</td>
                        <td style='padding: 8px 0;'>{$paymentMethod}</td>
                    </tr>
                    <tr>
                        <td style='padding: 8px 0; color: #6B7280;'>Date:</td>
                        <td style='padding: 8px 0;'>{$paymentDate}</td>
                    </tr>
                    <tr>
                        <td style='padding: 8px 0; color: #6B7280;'>Remaining Balance:</td>
                        <td style='padding: 8px 0; font-weight: bold; color: {$balanceColor};'>{$remainingBalance}</td>
                    </tr>
                </table>
            </div>
            
            <p>You can view your full payment history by logging into your student dashboard.</p>
            
            <div style='text-align: center; margin: 30px 0;'>
                <a href='" . url('/dashboard') . "' style='background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;'>View Dashboard</a>
            </div>
            
            <p>Thank you for choosing Terra Driving School!</p>
            
            <hr style='border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;' />
            
            <p style='color: #9CA3AF; font-size: 12px;'>
                Terra Driving School<br>
                Contact: info@terradriving.com | Phone: (123) 456-7890
            </p>
        </div>
        ";
    }

    public function toArray($notifiable)
    {
        $enrolment = $this->payment->enrolment;
        
        return [
            'payment_id'       => $this->payment->id,
            'amount'           => $this->payment->amount_total,
            'transaction_id'   => $this->payment->transaction_id,
            'message'          => "Payment of $" . number_format($this->payment->amount_total, 2) . " received",
            'type'             => 'payment_received'
        ];
    }
}