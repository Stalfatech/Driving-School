<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice #{{ $invoice['transaction_id'] }}</title>
    <style>
        /* Reset and Base Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 0;
            margin: 0;
        }

        .invoice-wrapper {
            max-width: 900px;
            margin: 0 auto;
            background: white;
        }

        /* Header Section */
        .invoice-header {
            background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
            color: white;
            padding: 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            align-items: start;
        }

        .company-info h1 {
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .company-info p {
            font-size: 14px;
            opacity: 0.95;
            margin-bottom: 5px;
        }

        .invoice-number {
            text-align: right;
        }

        .invoice-number-label {
            font-size: 12px;
            opacity: 0.9;
            margin-bottom: 5px;
        }

        .invoice-number-value {
            font-size: 24px;
            font-weight: 700;
            font-family: 'Courier New', monospace;
        }

        .invoice-type-badge {
            display: inline-block;
            margin-top: 10px;
            padding: 6px 14px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.5);
        }

        /* Content */
        .invoice-content {
            padding: 40px;
        }

        /* Status Badge */
        .status-section {
            margin-bottom: 30px;
            padding: 15px 20px;
            border-radius: 6px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
        }

        .status-section.pending {
            background: #fef3c7;
            border: 1px solid #fcd34d;
        }

        .status-section.paid {
            background: #dcfce7;
            border: 1px solid #86efac;
        }

        .status-section.partial {
            background: #dbeafe;
            border: 1px solid #93c5fd;
        }

        .status-label {
            font-weight: 600;
            font-size: 14px;
        }

        /* Invoice Details Grid */
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }

        .detail-section h3 {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 12px;
            letter-spacing: 0.5px;
        }

        .detail-section p {
            font-size: 14px;
            margin-bottom: 4px;
        }

        .detail-section .label {
            color: #888;
            font-size: 12px;
            margin-bottom: 2px;
        }

        /* Items Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }

        .items-table thead tr {
            background: #f3f4f6;
            border-bottom: 2px solid #d1d5db;
        }

        .items-table th {
            padding: 15px 12px;
            text-align: left;
            font-size: 13px;
            font-weight: 700;
            color: #374151;
        }

        .items-table td {
            padding: 15px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
        }

        .text-right {
            text-align: right;
        }

        .amount {
            font-weight: 600;
            color: #0d9488;
        }

        /* Summary */
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 40px;
            margin: 30px 0;
        }

        .notes-box {
            padding: 20px;
            background: #f9fafb;
            border-radius: 6px;
        }

        .notes-box h4 {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .notes-box p {
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
        }

        .totals {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            padding-bottom: 12px;
            border-bottom: 1px solid #e5e7eb;
        }

        .total-row.grand-total {
            border-bottom: none;
            padding-bottom: 0;
        }

        .grand-total .label,
        .grand-total .value {
            font-weight: 700;
            font-size: 16px;
            color: #0d9488;
        }

        /* Payment Instructions */
        .payment-instructions {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            border-radius: 6px;
            margin: 30px 0;
        }

        .payment-instructions h4 {
            color: #d97706;
            margin-bottom: 12px;
        }

        /* Footer */
        .invoice-footer {
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            padding: 25px 40px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 30px;
        }

        .footer-section h5 {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 8px;
        }

        .footer-section p {
            font-size: 13px;
            color: #555;
        }

        .footer-bottom {
            grid-column: 1 / -1;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #888;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .invoice-header {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            .invoice-number {
                text-align: left;
            }
            .details-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            .summary-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            .invoice-footer {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            .invoice-content {
                padding: 20px;
            }
        }

        /* Print Styles */
        @media print {
            body {
                background: white;
                padding: 0;
                margin: 0;
            }
            .invoice-header {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .status-section {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .items-table thead tr {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-wrapper">
        <!-- Header -->
        <div class="invoice-header">
            <div class="company-info">
                <h1>{{ $company['company_name'] ?? 'Company Name' }}</h1>
                <p>{{ $company['company_address'] ?? '' }}, {{ $company['company_city'] ?? '' }}, {{ $company['company_province'] ?? '' }} {{ $company['company_postal_code'] ?? '' }}</p>
                <p>📧 {{ $company['company_email'] ?? '' }}</p>
                <p>📞 {{ $company['company_phone'] ?? '' }}</p>
            </div>
            <div class="invoice-number">
                <div class="invoice-number-label">Invoice Number</div>
                <div class="invoice-number-value">{{ $invoice['transaction_id'] }}</div>
                <div class="invoice-type-badge">{{ $invoice['invoice_type'] }}</div>
            </div>
        </div>

        <!-- Content -->
        <div class="invoice-content">
            <!-- Status -->
            <div class="status-section {{ strtolower($invoice['status']) }}">
                <span class="status-icon">
                    @if($invoice['status'] === 'paid') ✓
                    @elseif($invoice['status'] === 'partial') ◐
                    @else ⏱
                    @endif
                </span>
                <span class="status-label">{{ $invoice['status_text'] }}</span>
            </div>

            <!-- Details Grid -->
            <div class="details-grid">
                <div class="detail-section">
                    <h3>Bill To</h3>
                    <p class="label">Student Name</p>
                    <p><strong>{{ $invoice['student']['name'] }}</strong></p>
                    <p class="label" style="margin-top: 10px;">Email</p>
                    <p>{{ $invoice['student']['email'] }}</p>
                    <p class="label" style="margin-top: 10px;">Address</p>
                    <p>{{ $invoice['student']['address'] ?: 'N/A' }}</p>
                </div>

                <div class="detail-section">
                    <h3>Invoice Details</h3>
                    <div>
                        <p class="label">Invoice Date</p>
                        <p>{{ $invoice['formatted_date'] }}</p>
                    </div>
                    <div style="margin-top: 10px;">
                        <p class="label">Course</p>
                        <p>{{ $invoice['course'] }}</p>
                    </div>
                </div>
            </div>

            <!-- Items Table -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-right">Amount (CAD)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <strong>{{ $invoice['course'] }}</strong>
                            <p style="font-size: 12px; color: #888; margin-top: 4px;">Professional Driving Course Package</p>
                        </td>
                        <td class="text-right amount">${{ number_format($invoice['amount'], 2) }}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Summary Grid -->
            <div class="summary-grid">
                <div class="notes-box">
                    @if($invoice['status'] === 'pending')
                        <h4>📝 Important Notes</h4>
                        <p>• A 50% deposit is required to activate your enrollment</p>
                        <p>• Please submit payment within 7 days to secure your spot</p>
                        <p>• Auto-deposit is enabled for Interac e-Transfer payments</p>
                    @else
                        <h4>✓ Payment Received</h4>
                        <p>Thank you for your payment! Your enrollment is confirmed.</p>
                        <p>You will receive further instructions via email shortly.</p>
                    @endif
                </div>

                <div class="totals">
                    <div class="total-row">
                        <span>Total Amount:</span>
                        <span>${{ number_format($invoice['amount'], 2) }}</span>
                    </div>
                    <div class="total-row">
                        <span>Amount Paid:</span>
                        <span>${{ number_format($invoice['amount_paid'], 2) }}</span>
                    </div>
                    <div class="total-row grand-total">
                        <span class="label">Balance Due:</span>
                        <span class="value">${{ number_format($invoice['balance_due'], 2) }}</span>
                    </div>
                </div>
            </div>

            <!-- Payment Instructions -->
            @if($invoice['status'] === 'pending')
                <div class="payment-instructions">
                    <h4>💳 Payment Instructions</h4>
                    <p>Send Interac e-Transfer to:</p>
                    <p style="margin-top: 10px;"><strong>{{ $company['company_email'] ?? '' }}</strong></p>
                    <p style="margin-top: 10px;">📌 Auto-deposit is enabled. Please include your full name in the notes.</p>
                </div>
            @endif
        </div>

        <!-- Footer -->
        <div class="invoice-footer">
            <div class="footer-section">
                <h5>Contact</h5>
                <p>{{ $company['company_email'] ?? '' }}<br>{{ $company['company_phone'] ?? '' }}</p>
            </div>
            <div class="footer-section">
                <h5>Location</h5>
                <p>{{ $company['company_address'] ?? '' }}<br>{{ $company['company_city'] ?? '' }}, {{ $company['company_province'] ?? '' }} {{ $company['company_postal_code'] ?? '' }}</p>
            </div>
            <div class="footer-section">
                <h5>Invoice #</h5>
                <p>{{ $invoice['transaction_id'] }}<br>{{ $invoice['formatted_date'] }}</p>
            </div>
            <div class="footer-bottom">
                <p>Thank you for choosing {{ $company['company_name'] ?? 'our company' }}. This is a system-generated invoice.</p>
            </div>
        </div>
    </div>
</body>
</html>