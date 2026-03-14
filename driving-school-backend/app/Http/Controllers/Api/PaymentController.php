<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Enrolment;
use App\Notifications\PaymentReceived;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id'     => 'required|exists:students,id',
            'amount_total'   => 'required|numeric|min:0.01',
            'payment_method' => 'required|string',
            'transaction_id' => 'nullable|string',
            'status'         => 'required|string|in:succeeded,pending,failed',
        ]);

        try {
            DB::beginTransaction();

            // 1. Find the active enrolment for this student
            $enrolment = Enrolment::where('student_id', $validated['student_id'])
                ->where('status', 'active')
                ->latest()
                ->first();

            if (!$enrolment) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active enrolment found for this student'
                ], 404);
            }

            // 2. Create the payment record with ALL required fields
            $payment = Payment::create([
                'enrolment_id'     => $enrolment->id,
                'student_id'       => $validated['student_id'],
                'transaction_id'   => $validated['transaction_id'] ?? 'MANUAL-' . time(),
                'amount_subtotal'  => $validated['amount_total'], // Same as total (no tax)
                'tax_amount'       => 0.00, // No tax for manual payments
                'amount_total'     => $validated['amount_total'],
                'currency'         => 'CAD',
                'payment_method'   => $validated['payment_method'],
                'status'           => $validated['status'],
                // 'receipt_url'    => null, // Optional
            ]);

            // 3. Update enrolment balance if payment is successful
            if ($validated['status'] === 'succeeded') {
                // Calculate new balance due
                $currentBalanceDue = $enrolment->balance_due;
                $newBalanceDue = max(0, $currentBalanceDue - $validated['amount_total']);
                
                // Update enrolment
                $enrolment->update([
                    'balance_due' => $newBalanceDue,
                    'status' => $newBalanceDue <= 0 ? 'paid' : 'active'
                ]);

                // 4. Send notification to student
                $student = $payment->student;
                if ($student && $student->user) {
                    $student->user->notify(new PaymentReceived($payment));
                }
            }

            DB::commit();

            // Return the updated enrolment data along with the payment
            return response()->json([
                'success' => true,
                'message' => 'Payment recorded successfully',
                'data'    => [
                    'payment' => $payment->load('enrolment'),
                    'updated_balance' => $enrolment->fresh()->balance_due,
                    'enrolment_status' => $enrolment->fresh()->status
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to record payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
 * Download payments as CSV
 */
public function download(Request $request)
{
    try {
        $query = Payment::with(['student.user', 'enrolment.package'])
            ->latest('created_at');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhereHas('student.user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('filter_date')) {
            $filterDate = $request->filter_date;
            
            if ($filterDate === 'today') {
                $query->whereDate('created_at', today());
            } elseif ($filterDate === 'yesterday') {
                $query->whereDate('created_at', today()->subDay());
            } elseif ($filterDate === 'range' && $request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('created_at', [
                    $request->start_date . ' 00:00:00',
                    $request->end_date . ' 23:59:59'
                ]);
            }
        }

        if ($request->filled('method')) {
            $query->where('payment_method', $request->method);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $payments = $query->get();

        // Create CSV
        $filename = 'payments_' . now()->format('Y-m-d_His') . '.csv';
        $handle = fopen('php://temp', 'w+');
        
        // Add CSV headers with BOM for Excel
        fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
        fputcsv($handle, [
            'ID',
            'Transaction ID',
            'Student Name',
            'Student Email',
            'Course',
            'Amount (CAD)',
            'Payment Method',
            'Status',
            'Date',
            'Time'
        ]);

        // Add data rows
        foreach ($payments as $payment) {
            fputcsv($handle, [
                $payment->id,
                $payment->transaction_id,
                $payment->student->user->name ?? 'N/A',
                $payment->student->user->email ?? 'N/A',
                $payment->enrolment->package->package_name ?? 'N/A',
                number_format($payment->amount_total, 2),
                $payment->payment_method,
                $payment->status,
                $payment->created_at->format('Y-m-d'),
                $payment->created_at->format('H:i:s')
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
        \Log::error('Download Error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to download payments: ' . $e->getMessage()
        ], 500);
    }
}


public function index(Request $request)
    {
        try {
            $query = Payment::with(['student.user', 'enrolment.package'])
                ->latest('created_at');

            // Search by transaction ID, student name, or email
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('transaction_id', 'like', "%{$search}%")
                      ->orWhereHas('student.user', function($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%")
                                    ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            // Filter by date range
            if ($request->filled('filter_date')) {
                $filterDate = $request->filter_date;
                
                if ($filterDate === 'today') {
                    $query->whereDate('created_at', today());
                } elseif ($filterDate === 'yesterday') {
                    $query->whereDate('created_at', today()->subDay());
                } elseif ($filterDate === 'range' && $request->filled('start_date') && $request->filled('end_date')) {
                    $query->whereBetween('created_at', [
                        $request->start_date . ' 00:00:00',
                        $request->end_date . ' 23:59:59'
                    ]);
                }
            }

            // Filter by payment method
            if ($request->filled('method')) {
                $query->where('payment_method', $request->method);
            }

            // Filter by status
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            // Pagination
            $perPage = $request->get('per_page', 10);
            $payments = $query->paginate($perPage);

            // Calculate total revenue based on filters
            $revenueQuery = clone $query;
            $totalRevenue = $revenueQuery->where('status', 'succeeded')->sum('amount_total');

            // Transform data for frontend
            $transformedPayments = $payments->map(function($payment) {
                return [
                    'id' => $payment->id,
                    'transaction_id' => $payment->transaction_id,
                    'amount' => $payment->amount_total,
                    'method' => $payment->payment_method,
                    'status' => $payment->status,
                    'date' => $payment->created_at->format('Y-m-d'),
                    'formatted_date' => $payment->created_at->format('M d, Y'),
                    'student' => [
                        'id' => $payment->student->id ?? null,
                        'name' => $payment->student->user->name ?? 'N/A',
                        'email' => $payment->student->user->email ?? 'N/A',
                    ],
                    'course' => $payment->enrolment->package->package_name ?? 'N/A',
                    'receipt_url' => $payment->receipt_url,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedPayments,
                'total_revenue' => $totalRevenue,
                'meta' => [
                    'current_page' => $payments->currentPage(),
                    'last_page' => $payments->lastPage(),
                    'total' => $payments->total(),
                    'per_page' => $payments->perPage(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payments: ' . $e->getMessage()
            ], 500);
        }
    }
    /**
     * Get payment by ID
     */
    public function show($id)
    {
        try {
            $payment = Payment::with(['student.user', 'enrolment.package'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $payment->id,
                    'transaction_id' => $payment->transaction_id,
                    'amount' => $payment->amount_total,
                    'method' => $payment->payment_method,
                    'status' => $payment->status,
                    'date' => $payment->created_at->format('Y-m-d H:i:s'),
                    'student' => [
                        'id' => $payment->student->id,
                        'name' => $payment->student->user->name,
                        'email' => $payment->student->user->email,
                    ],
                    'enrolment' => [
                        'id' => $payment->enrolment->id,
                        'total_amount' => $payment->enrolment->total_amount,
                        'balance_due' => $payment->enrolment->balance_due,
                        'course' => $payment->enrolment->package->package_name ?? 'N/A',
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }
    }

    /**
     * Update payment status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:succeeded,pending,failed,refunded'
        ]);

        try {
            DB::beginTransaction();

            $payment = Payment::findOrFail($id);
            $oldStatus = $payment->status;
            $newStatus = $request->status;

            $payment->update(['status' => $newStatus]);

            // If payment is refunded, update enrolment balance
            if ($newStatus === 'refunded' && $oldStatus === 'succeeded') {
                $enrolment = $payment->enrolment;
                $enrolment->update([
                    'balance_due' => $enrolment->balance_due + $payment->amount_total,
                    'status' => 'active'
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment status updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payment status'
            ], 500);
        }
    }

    /**
     * Generate receipt URL
     */
    public function generateReceipt($id)
    {
        try {
            $payment = Payment::with(['student.user', 'enrolment.package'])
                ->findOrFail($id);

            // Generate unique receipt ID
            $receiptId = 'RCPT-' . strtoupper(uniqid());
            
            // Update payment with receipt URL
            $payment->update([
                'receipt_url' => url("/receipts/{$receiptId}")
            ]);

            return response()->json([
                'success' => true,
                'receipt_url' => $payment->receipt_url,
                'receipt_data' => [
                    'receipt_number' => $receiptId,
                    'student_name' => $payment->student->user->name,
                    'amount' => $payment->amount_total,
                    'date' => $payment->created_at->format('M d, Y'),
                    'transaction_id' => $payment->transaction_id,
                    'course' => $payment->enrolment->package->package_name ?? 'N/A',
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate receipt'
            ], 500);
        }
    }

    /**
     * Send payment receipt email
     */
    public function sendReceiptEmail(Request $request, $id)
    {
        $request->validate([
            'template' => 'nullable|string'
        ]);

        try {
            $payment = Payment::with(['student.user', 'enrolment.package'])
                ->findOrFail($id);

            // Send notification with custom template if provided
            if ($payment->student && $payment->student->user) {
                $payment->student->user->notify(new PaymentReceived($payment, $request->template));
            }

            return response()->json([
                'success' => true,
                'message' => 'Receipt email sent successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send receipt email'
            ], 500);
        }
    }

    /**
     * Get payment statistics
     */
    public function getStats()
    {
        try {
            $totalRevenue = Payment::where('status', 'succeeded')->sum('amount_total');
            $todayRevenue = Payment::where('status', 'succeeded')
                ->whereDate('created_at', today())
                ->sum('amount_total');
            
            $weeklyRevenue = Payment::where('status', 'succeeded')
                ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->sum('amount_total');

            $monthlyRevenue = Payment::where('status', 'succeeded')
                ->whereMonth('created_at', now()->month)
                ->sum('amount_total');

            $paymentMethods = Payment::where('status', 'succeeded')
                ->select('payment_method', DB::raw('count(*) as count'), DB::raw('sum(amount_total) as total'))
                ->groupBy('payment_method')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_revenue' => $totalRevenue,
                    'today_revenue' => $todayRevenue,
                    'weekly_revenue' => $weeklyRevenue,
                    'monthly_revenue' => $monthlyRevenue,
                    'payment_methods' => $paymentMethods
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payment stats'
            ], 500);
        }
    }

}