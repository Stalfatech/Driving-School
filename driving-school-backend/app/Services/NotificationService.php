<?php

namespace App\Services;

use App\Models\EmailTemplate;
use Illuminate\Support\Facades\Mail;
use App\Mail\DynamicEmail;

class NotificationService
{
    public static function send($slug, $recipientEmail, $data)
    {
        $template = EmailTemplate::where('slug', $slug)->first();
        if (!$template) return;

        // Replace {tags} with real data
        $subject = self::parse($template->subject, $data);
        $content = self::parse($template->email_body, $data);

        // Mail::to($recipientEmail)->send(new DynamicEmail($subject, $content));
        Mail::to($recipientEmail)-> queue(new DynamicEmail($subject, $content));
    }

    private static function parse($text, $data)
    {
        foreach ($data as $key => $value) {
            $text = str_replace('{' . $key . '}', $value, $text);
        }
        return $text;
    }
}