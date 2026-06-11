<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $data['invoice_number'] }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .email-wrapper {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .email-header {
            background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .email-header h1 {
            margin: 0;
            font-size: 24px;
        }
        .email-header p {
            margin: 5px 0 0;
            opacity: 0.9;
        }
        .email-body {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .invoice-preview {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid #e5e7eb;
        }
        .invoice-summary {
            background: #f0fdfa;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        .amount {
            font-size: 28px;
            font-weight: bold;
            color: #0d9488;
        }
        .payment-instructions {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #0d9488;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 10px;
        }
        .email-footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e5e7eb;
        }
        hr {
            margin: 20px 0;
            border: none;
            border-top: 1px solid #e5e7eb;
        }
        @media (max-width: 600px) {
            .email-body {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-header">
            <h1>{{ $data['company_name'] }}</h1>
            <p>Your Invoice is Ready</p>
        </div>
        
        <div class="email-body">
            <div class="greeting">
                Dear <strong>{{ $data['student_name'] }}</strong>,
            </div>
            
            <p>Great news! Your application for the <strong>{{ $data['package_name'] }}</strong> has been approved. Please find your invoice details below:</p>
            
            <div class="invoice-preview">
                <div class="invoice-summary">
                    <div style="margin-bottom: 10px;">
                        <strong>Invoice Number:</strong> {{ $data['invoice_number'] }}<br>
                        <strong>Date:</strong> {{ $data['invoice_date'] }}<br>
                        <strong>Course:</strong> {{ $data['package_name'] }}
                    </div>
                    <div class="amount">
                        Total: ${{ $data['total_amount'] }} CAD
                    </div>
                    <div style="margin-top: 10px; font-size: 14px; color: #d97706;">
                        <strong>Deposit Required: ${{ $data['deposit_amount'] }} CAD</strong>
                    </div>
                </div>
            </div>
            
            <div class="payment-instructions">
                <strong>💳 Payment Instructions</strong><br>
                Send Interac e-Transfer to:<br>
                <strong>{{ $data['company_email'] }}</strong><br>
                <em>Auto-deposit is enabled. Please include your full name in the e-Transfer notes.</em>
            </div>
            
            <!-- <div style="text-align: center;">
                <a href="{{ $data['invoice_link'] }}" class="button">📄 View Full Invoice</a>
            </div> -->
            
            <hr>
            
            <div style="font-size: 13px; color: #666; text-align: center;">
                <p>Once we receive your deposit, we will assign your professional instructor and fully activate your account.</p>
            </div>
        </div>
        
        <div class="email-footer">
            <p>
                <strong>{{ $data['company_name'] }}</strong><br>
                {{ $data['company_address'] }}<br>
                📧 {{ $data['company_email'] }} | 📞 {{ $data['company_phone'] }}
            </p>
            <p style="margin-top: 10px;">This is a system-generated invoice. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>