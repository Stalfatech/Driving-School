<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmailTemplate;
use Illuminate\Support\Str;

class EmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Student Activation',
                'slug' => 'student_activation',
                'subject' => 'Welcome {student_name}! Your account is active',
                'email_body' => "Hello {student_name},\n\nYour driving lesson account has been activated! You can now log in to your dashboard and start booking lessons.\n\nYour package: {package_name}\nBalance due: {balance_due}\n\nIf you have any questions, please contact our support team.\n\nRegards,\nTerra Driving School Team",
                'sms_body' => 'Your account is active! Package: {package_name}, Balance: {balance_due}',
                'placeholders' => '{student_name}, {package_name}, {balance_due}'
            ],
            [
                'name' => 'Instructor Student Assigned',
                'slug' => 'instructor_student_assigned',
                'subject' => 'New Student Assigned: {student_name}',
                'email_body' => "Hello {instructor_name},\n\nA new student has been assigned to you.\n\nStudent Name: {student_name}\nPackage: {package_name}\n\nPlease log in to your dashboard to view the student details and schedule lessons.\n\nRegards,\nTerra Driving School Team",
                'sms_body' => 'New student {student_name} assigned to you. Package: {package_name}',
                'placeholders' => '{instructor_name}, {student_name}, {package_name}'
            ],
            [
                'name' => 'Payment Confirmation',
                'slug' => 'payment_confirmation',
                'subject' => 'Payment Confirmation - Receipt #{transaction_id}',
                'email_body' => "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>\n    <h2 style='color: #4F46E5;'>Payment Received!</h2>\n    \n    <p>Dear <strong>{student_name}</strong>,</p>\n    \n    <p>We have successfully received your payment of <strong style='color: #059669;'>{amount}</strong> for the <strong>{course_name}</strong> course.</p>\n    \n    <div style='background-color: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;'>\n        <h3 style='margin-top: 0; color: #374151;'>Payment Details</h3>\n        <table style='width: 100%;'>\n            <tr>\n                <td style='padding: 8px 0; color: #6B7280;'>Amount Paid:</td>\n                <td style='padding: 8px 0; font-weight: bold;'>{amount}</td>\n            </tr>\n            <tr>\n                <td style='padding: 8px 0; color: #6B7280;'>Transaction ID:</td>\n                <td style='padding: 8px 0; font-family: monospace;'>{transaction_id}</td>\n            </tr>\n            <tr>\n                <td style='padding: 8px 0; color: #6B7280;'>Payment Method:</td>\n                <td style='padding: 8px 0;'>{payment_method}</td>\n            </tr>\n            <tr>\n                <td style='padding: 8px 0; color: #6B7280;'>Date:</td>\n                <td style='padding: 8px 0;'>{payment_date}</td>\n            </tr>\n            <tr>\n                <td style='padding: 8px 0; color: #6B7280;'>Remaining Balance:</td>\n                <td style='padding: 8px 0; font-weight: bold; color: {balance_color};'>{remaining_balance}</td>\n            </tr>\n        </table>\n    </div>\n    \n    <p>You can view your full payment history by logging into your student dashboard.</p>\n    \n    <p>Thank you for choosing Terra Driving School!</p>\n    \n    <hr style='border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;' />\n    \n    <p style='color: #9CA3AF; font-size: 12px;'>\n        Terra Driving School<br>\n        Contact: info@terradriving.com | Phone: (123) 456-7890\n    </p>\n</div>",
                'sms_body' => 'Payment of {amount} received for {course_name}. Your new balance is {remaining_balance}. Thank you!',
                'placeholders' => '{student_name}, {amount}, {course_name}, {transaction_id}, {payment_method}, {payment_date}, {remaining_balance}, {balance_color}'
            ],
             [
                'name' => 'Student Reschedule Request',
                'slug' => 'student_reschedule_request',
                'subject' => 'Reschedule Request from {student_name}',
                'email_body' => "Hello {instructor_name},\n\nYour student {student_name} has requested to reschedule their driving lesson.\n\nCurrent Lesson:\nDate: {current_date}\nTime: {current_time}\n\nRequested New Time:\nDate: {requested_date}\nTime: {requested_time}\nPickup Location: {pickup_location}\n\nReason: {reason}\n\nPlease review and update the schedule in the instructor portal.\n\nThank you,\nDriving School System",
                'sms_body' => null,
                'placeholders' => '{instructor_name}, {student_name}, {current_date}, {current_time}, {requested_date}, {requested_time}, {pickup_location}, {reason}'
            ],
            [
                'name' => 'Student Assignment Updated',
                'slug' => 'student_assignment_updated',
                'subject' => 'Your Lesson Has Been Rescheduled',
                'email_body' => "Hello {student_name},\n\nYour instructor {instructor_name} has updated your driving lesson.\n\nPrevious Schedule:\nDate: {old_date}\nTime: {old_time}\n\nNew Schedule:\nDate: {new_date}\nTime: {new_time}\nPickup Location: {pickup_location}\n\nPlease check your dashboard for details.\n\nDrive safely,\nDriving School Team",
                'sms_body' => null,
                'placeholders' => '{student_name}, {instructor_name}, {old_date}, {old_time}, {new_date}, {new_time}, {pickup_location}'
            ],
            [
                'name' => 'Student New Assignment',
                'slug' => 'student_new_assignment',
                'subject' => 'New Driving Lesson Scheduled',
                'email_body' => "Hello {student_name},\n\nA new driving lesson has been scheduled for you.\n\nInstructor: {instructor_name}\nDate: {date}\nTime: {time}\nPickup Location: {pickup_location}\nTopic: {topic}\n\nWe look forward to seeing you!\n\nBest regards,\nDriving School",
                'sms_body' => null,
                'placeholders' => '{student_name}, {instructor_name}, {date}, {time}, {pickup_location}, {topic}'
            ]
        ];

        $this->command->info('Checking email templates...');
        
        foreach ($templates as $template) {
            // Check if template already exists by slug
            $existing = EmailTemplate::where('slug', $template['slug'])->first();
            
            if (!$existing) {
                EmailTemplate::create([
                    'slug' => $template['slug'],
                    'subject' => $template['subject'],
                    'email_body' => $template['email_body'],
                    'sms_body' => $template['sms_body'],
                    'placeholders' => $template['placeholders']
                ]);
                
                $this->command->info("✓ Created: {$template['name']} ({$template['slug']})");
            } else {
                $this->command->warn("✗ Skipped (already exists): {$template['name']} ({$template['slug']})");
            }
        }

        $this->command->newLine();
        $this->command->info('Email template seeding completed!');
    }
}