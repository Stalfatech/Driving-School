<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Instructor;
use App\Models\User; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Exception;

class ExpenseController extends Controller
{
    /**
     * For ADMINS: List all expenses from all instructors with pagination, search, and filters.
     */
    public function index(Request $request)
    {
        try {
            // Start query with eager loading
            $query = Expense::with(['instructor.user']);

            // 1. Filter by Status
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            // 2. Filter by Category
            if ($request->filled('category') && $request->category !== 'All') {
                $query->where('category', $request->category);
            }

            // 3. Filter by Location (via instructor's assigned_location)
            if ($request->filled('location') && $request->location !== 'All') {
                $query->whereHas('instructor', function($q) use ($request) {
                    $q->where('assigned_location', $request->location);
                });
            }

            // 4. Search by instructor name or category
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereHas('instructor.user', function($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%");
                    })->orWhere('category', 'like', "%{$search}%");
                });
            }

            // 5. Pagination (default 10 items per page)
            $perPage = $request->input('per_page', 10);
            $expenses = $query->orderBy('created_at', 'desc')->paginate($perPage);

            // 6. Get unique categories and locations for filter dropdowns
            $categories = Expense::distinct()->pluck('category')->toArray();
            $locations = Instructor::whereNotNull('assigned_location')
                ->distinct()
                ->pluck('assigned_location')
                ->toArray();

            // 7. Transform the data to include display location
            $expenses->getCollection()->transform(function ($expense) {
                // Get instructor's location
                $expense->displayLocation = $expense->instructor?->assigned_location ?? 'Not Assigned';
                return $expense;
            });

            return response()->json([
                'success' => true,
                'data'    => $expenses->items(),
                'meta'    => [
                    'current_page' => $expenses->currentPage(),
                    'last_page'    => $expenses->lastPage(),
                    'total'        => $expenses->total(),
                    'per_page'     => $expenses->perPage(),
                ],
                'filters' => [
                    'categories' => $categories,
                    'locations'  => $locations,
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Admin Load Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export expenses to CSV based on filters
     */
    public function export(Request $request)
    {
        try {
            $query = Expense::with(['instructor.user']);

            // Apply same filters as index
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }
            if ($request->filled('category') && $request->category !== 'All') {
                $query->where('category', $request->category);
            }
            if ($request->filled('location') && $request->location !== 'All') {
                $query->whereHas('instructor', function($q) use ($request) {
                    $q->where('assigned_location', $request->location);
                });
            }
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereHas('instructor.user', function($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%");
                    })->orWhere('category', 'like', "%{$search}%");
                });
            }

            $expenses = $query->orderBy('created_at', 'desc')->get();

            // Create CSV
            $filename = 'expenses_' . now()->format('Y-m-d_His') . '.csv';
            $handle = fopen('php://temp', 'w+');
            
            // Add CSV headers with BOM for Excel
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($handle, [
                'ID',
                'Instructor Name',
                'Instructor ID',
                'Category',
                'Amount',
                'Location',
                'Date',
                'Status',
                'Description',
                'Admin Remarks'
            ]);

            // Add data rows
            foreach ($expenses as $expense) {
                fputcsv($handle, [
                    $expense->id,
                    $expense->instructor?->user?->name ?? 'Unknown',
                    $expense->instructor_id ?? 'N/A',
                    $expense->category ?? '',
                    $expense->amount ?? 0,
                    $expense->instructor?->assigned_location ?? 'Not Assigned',
                    // $expense->created_at?->format('Y-m-d') ?? '',
                    '="' . ($expense->created_at?->format('Y-m-d') ?? '') . '"',
                    $expense->status ?? '',
                    $expense->description ?? '',
                    $expense->admin_remarks ?? ''
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

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Export failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get expense statistics for admin dashboard
     */
    public function getStats()
    {
        try {
            // Get all approved expenses for total calculation
            $approvedExpenses = Expense::where('status', 'approved')->get();
            $totalApproved = $approvedExpenses->sum('amount');
            
            // Get expenses grouped by month for charts (only approved)
            $monthlyExpenses = Expense::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, SUM(amount) as total')
                ->where('status', 'approved')
                ->groupBy('year', 'month')
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->limit(6)
                ->get()
                ->map(function($item) {
                    $date = \DateTime::createFromFormat('Y-m', $item->year . '-' . $item->month);
                    return [
                        'month' => $date->format('M'),
                        'amount' => $item->total
                    ];
                })
                ->reverse()
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_approved' => $totalApproved,
                    'monthly' => $monthlyExpenses
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load expense stats: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * For INSTRUCTORS: Get their own expense history.
     */
    public function instructorExpenses(Request $request)
    {
        try {
            $instructor = $request->user()->instructor;

            if (!$instructor) {
                return response()->json(['success' => false, 'message' => 'Instructor profile not found.'], 404);
            }

            $expenses = Expense::where('instructor_id', $instructor->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data'    => $expenses
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * For INSTRUCTORS: Submit a new claim.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount'         => 'required|numeric|min:0',
            'category'       => 'required|string',
            'payment_method' => 'required|in:cash,online,card',
            'description'    => 'nullable|string',
            'receipt'        => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $instructor = $request->user()->instructor;
        $path = $request->file('receipt')->store('expenses', 'public');

        $expense = Expense::create([
            'instructor_id'  => $instructor->id,
            'amount'         => $request->amount,
            'category'       => $request->category,
            'payment_method' => $request->payment_method,
            'description'    => $request->description,
            'receipt_path'   => $path,
            'status'         => 'pending',
        ]);

        //admin notification
        $adminUsers = User::where('role', 'admin')->get();
        foreach ($adminUsers as $admin) {
            $admin->notify(new \App\Notifications\AdminNotification('new_expense', [
                'expense_id' => $expense->id,
                'instructor_name' => $instructor->user->name ?? 'Unknown Instructor',
                'amount' => $expense->amount,
                'category' => $expense->category
            ]));
        }

        return response()->json(['success' => true, 'data' => $expense], 201);
    }

    /**
     * For INSTRUCTORS: Update an expense (Only if Pending).
     */
    public function update(Request $request, $id)
    {
        $expense = Expense::findOrFail($id);

        if ($expense->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => "This expense is already {$expense->status} and cannot be modified."
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'amount'         => 'sometimes|numeric|min:0',
            'category'       => 'sometimes|string',
            'payment_method' => 'sometimes|in:cash,online,card',
            'description'    => 'nullable|string',
            'receipt'        => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->only(['amount', 'category', 'payment_method', 'description']);

        if ($request->hasFile('receipt')) {
            if ($expense->receipt_path) {
                Storage::disk('public')->delete($expense->receipt_path);
            }
            $data['receipt_path'] = $request->file('receipt')->store('expenses', 'public');
        }

        $expense->update($data);

        return response()->json(['success' => true, 'data' => $expense->refresh()]);
    }

    /**
     * For INSTRUCTORS: Delete an expense (Only if Pending).
     */
    public function destroy($id)
    {
        $expense = Expense::findOrFail($id);

        if ($expense->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete an expense that has been {$expense->status}."
            ], 403);
        }

        if ($expense->receipt_path) {
            Storage::disk('public')->delete($expense->receipt_path);
        }

        $expense->delete();

        return response()->json(['success' => true, 'message' => 'Expense claim removed.']);
    }

    /**
     * For ADMINS: Approve or Reject an expense.
     */
    public function updateStatus(Request $request, $id)
    {
        $expense = Expense::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status'        => 'required|in:approved,rejected',
            'admin_remarks' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $expense->update([
            'status'        => $request->status,
            'admin_remarks' => $request->admin_remarks,
        ]);

        // Load relationships before returning so the UI updates correctly
        return response()->json([
            'success' => true,
            'message' => "Expense has been {$request->status}.",
            'data'    => $expense->load('instructor.user')
        ]);
    }
}