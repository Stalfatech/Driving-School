<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrolment;
use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;

class InvoiceController extends Controller
{
    /**
     * Get all invoices with pagination
     */
    public function index(Request $request)
    {
        try {
            $query = Enrolment::with(['student.user', 'package', 'location'])
                ->latest('created_at');

            // Filter by status
            if ($request->filled('status')) {
                $status = strtolower($request->status);
                if ($status === 'pending') {
                    $query->where('status', 'pending_payment');
                } elseif ($status === 'succeeded') {
                    $query->whereIn('status', ['active', 'paid', 'completed']);
                }
            }

            // Search by student name or email
            if ($request->filled('search')) {
                $search = $request->search;
                $query->whereHas('student.user', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $perPage = $request->get('per_page', 10);
            $enrolments = $query->paginate($perPage);

            $company = CompanySetting::first();

            $transformedInvoices = $enrolments->map(function($enrolment) use ($company) {
                return $this->transformEnrolmentToInvoice($enrolment, $company);
            });

            return response()->json([
                'success' => true,
                'data' => $transformedInvoices,
                'company' => $company,
                'meta' => [
                    'current_page' => $enrolments->currentPage(),
                    'last_page' => $enrolments->lastPage(),
                    'total' => $enrolments->total(),
                    'per_page' => $enrolments->perPage(),
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('InvoiceController@index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch invoices: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show a single invoice as rendered HTML
     */
    /**
 * Show a single invoice as rendered HTML
 */
public function show($enrolmentId)
{
    try {
        $enrolment = Enrolment::with(['student.user', 'package'])->findOrFail($enrolmentId);
        $company = CompanySetting::first();

        if (!$company) {
            return response()->json([
                'success' => false,
                'message' => 'Company settings not configured'
            ], 400);
        }

        $invoice = $this->transformEnrolmentToInvoice($enrolment, $company);

        // Convert company to array and ensure all required keys exist
        $companyArray = $company->toArray();
        
        // Add default values if any fields are missing
        $companyArray['company_name'] = $companyArray['company_name'] ?? $company->name ?? 'Company Name';
        $companyArray['company_address'] = $companyArray['company_address'] ?? $company->address ?? 'Address';
        $companyArray['company_city'] = $companyArray['company_city'] ?? $company->city ?? 'City';
        $companyArray['company_province'] = $companyArray['company_province'] ?? $company->province ?? 'Province';
        $companyArray['company_postal_code'] = $companyArray['company_postal_code'] ?? $company->postal_code ?? 'Postal Code';
        $companyArray['company_email'] = $companyArray['company_email'] ?? $company->email ?? 'email@company.com';
        $companyArray['company_phone'] = $companyArray['company_phone'] ?? $company->phone ?? 'Phone';

        // Render the Blade template
        $html = View::make('invoice', [
            'invoice' => $invoice,
            'company' => $companyArray,
            'company_name' => $companyArray['company_name'], // Add this for backwards compatibility
        ])->render();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $enrolment->id,
                'html_content' => $html,
                'transaction_id' => $invoice['transaction_id'],
            ]
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Invoice not found'
        ], 404);
    } catch (\Exception $e) {
        \Log::error('InvoiceController@show error: ' . $e->getMessage());
        \Log::error('Stack trace: ' . $e->getTraceAsString());
        return response()->json([
            'success' => false,
            'message' => 'Failed to load invoice: ' . $e->getMessage()
        ], 500);
    }
}

    /**
     * Export filtered invoices as CSV
     */
    public function export(Request $request)
    {
        try {
            $query = Enrolment::with(['student.user', 'package'])
                ->latest('created_at');

            // Filter by status
            if ($request->filled('status')) {
                $status = strtolower($request->status);
                if ($status === 'pending') {
                    $query->where('status', 'pending_payment');
                } elseif ($status === 'succeeded') {
                    $query->whereIn('status', ['active', 'paid', 'completed']);
                }
            }

            // Search by student name or email
            if ($request->filled('search')) {
                $search = $request->search;
                $query->whereHas('student.user', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $enrolments = $query->get();

            // Create CSV
            $filename = 'invoices_' . now()->format('Y-m-d_His') . '.csv';
            $handle = fopen('php://temp', 'w+');
            
            // Add CSV headers with BOM for Excel
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($handle, [
                'Invoice #',
                'Student Name',
                'Student Email',
                'Student Address',
                'Course',
                'Total Amount (CAD)',
                'Amount Paid (CAD)',
                'Balance Due (CAD)',
                'Status',
                'Date'
            ]);

            // Add data rows
            foreach ($enrolments as $enrolment) {
                $totalAmount = $enrolment->total_amount;
                $balanceDue = $enrolment->balance_due;
                $amountPaid = $totalAmount - $balanceDue;
                
                $status = $balanceDue <= 0 ? 'Paid' : ($amountPaid > 0 ? 'Partial' : 'Pending');
                
                // Build student address
                $studentAddress = $enrolment->student->street_address ?? '';
                if ($enrolment->student->city) $studentAddress .= ', ' . $enrolment->student->city;
                if ($enrolment->student->province) $studentAddress .= ', ' . $enrolment->student->province;
                
                // Format date for Excel
                $formattedDate = '="' . ($enrolment->created_at?->format('Y-m-d') ?? '') . '"';
                
                fputcsv($handle, [
                    'INV-' . str_pad($enrolment->id, 5, '0', STR_PAD_LEFT),
                    $enrolment->student->user->name ?? 'N/A',
                    $enrolment->student->user->email ?? 'N/A',
                    $studentAddress ?: 'N/A',
                    $enrolment->package->package_name ?? 'N/A',
                    number_format($totalAmount, 2),
                    number_format($amountPaid, 2),
                    number_format($balanceDue, 2),
                    $status,
                    $formattedDate
                ]);
            }

            rewind($handle);
            $content = stream_get_contents($handle);
            fclose($handle);

            return response($content)
                ->header('Content-Type', 'text/csv; charset=UTF-8')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Pragma', 'no-cache')
                ->header('Expires', '0');

        } catch (\Exception $e) {
            \Log::error('Invoice export error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Export failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transform an Enrolment to an Invoice array
     */
    private function transformEnrolmentToInvoice($enrolment, $company)
    {
        $totalAmount = $enrolment->total_amount;
        $balanceDue = $enrolment->balance_due;
        $amountPaid = $totalAmount - $balanceDue;
        
        // Determine status
        $status = 'pending';
        $statusText = 'Pending Deposit';
        $invoiceType = 'INVOICE';
        
        if ($balanceDue <= 0) {
            $status = 'paid';
            $statusText = 'Paid in Full';
            $invoiceType = 'RECEIPT';
        } elseif ($amountPaid > 0) {
            $status = 'partial';
            $statusText = 'Partial Payment';
            $invoiceType = 'STATEMENT';
        }

        // Build student address
        $studentAddress = $enrolment->student->street_address ?? '';
        if ($enrolment->student->city) $studentAddress .= ', ' . $enrolment->student->city;
        if ($enrolment->student->province) $studentAddress .= ', ' . $enrolment->student->province;

        return [
            'id' => $enrolment->id,
            'transaction_id' => 'INV-' . str_pad($enrolment->id, 5, '0', STR_PAD_LEFT),
            'amount' => $totalAmount,
            'balance_due' => $balanceDue,
            'amount_paid' => $amountPaid,
            'status' => $status,
            'status_text' => $statusText,
            'invoice_type' => $invoiceType,
            'date' => $enrolment->created_at->format('Y-m-d'),
            'formatted_date' => $enrolment->created_at->format('M d, Y'),
            'student' => [
                'id' => $enrolment->student->id ?? null,
                'name' => $enrolment->student->user->name ?? 'Unknown Student',
                'email' => $enrolment->student->user->email ?? 'N/A',
                'address' => $studentAddress,
            ],
            'course' => $enrolment->package->package_name ?? 'Custom Driving Package',
        ];
    }
}