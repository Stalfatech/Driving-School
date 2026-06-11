<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $data;
    public $invoiceHtml;

    /**
     * Create a new message instance.
     */
    public function __construct($data, $invoiceHtml)
    {
        $this->data = $data;
        $this->invoiceHtml = $invoiceHtml;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Invoice from ' . ($this->data['company_name'] ?? 'Driving School'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice-email',
            with: [
                'data' => $this->data,
                'invoiceHtml' => $this->invoiceHtml,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        // Optional: Attach PDF version of invoice
        try {
            $pdf = Pdf::loadHTML($this->invoiceHtml);
            return [
                Attachment::fromData(fn () => $pdf->output(), 'Invoice_' . $this->data['invoice_number'] . '.pdf')
                    ->withMime('application/pdf'),
            ];
        } catch (\Exception $e) {
            return [];
        }
    }
}