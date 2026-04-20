<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Instructor;
use App\Models\Payment;
use App\Models\Expense;
use App\Models\Location;
use App\Models\Enrolment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get all dashboard statistics
     */
    public function index()
    {
        try {
            // Get counts
            $totalStudents = Student::count();
            $activeStudents = Student::whereHas('user', function($q) {
                $q->where('status', 'active');
            })->count();
            
            $totalInstructors = Instructor::count();
            
            // Revenue calculations
            $totalRevenue = Payment::where('status', 'succeeded')->sum('amount_total');
            
            // Today's revenue
            $todayRevenue = Payment::where('status', 'succeeded')
                ->whereDate('created_at', today())
                ->sum('amount_total');
            
            // This week's revenue
            $weekRevenue = Payment::where('status', 'succeeded')
                ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->sum('amount_total');
            
            // This month's revenue
            $monthRevenue = Payment::where('status', 'succeeded')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount_total');
            
            // Expenses (approved only)
            $totalExpenses = Expense::where('status', 'approved')->sum('amount');
            
            // Monthly revenue & expenses for chart (last 6 months)
            $monthlyData = $this->getMonthlyFinancialData();
            
            // Students by location
            $locationDistribution = $this->getStudentsByLocation();
            
            // Package popularity
            $packagePopularity = $this->getPackagePopularity();
            
            // Recent registrations
            $recentRegistrations = $this->getRecentRegistrations();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => [
                        'total_students' => $totalStudents,
                        'active_students' => $activeStudents,
                        'total_instructors' => $totalInstructors,
                        'total_revenue' => $totalRevenue,
                        'total_expenses' => $totalExpenses,
                        'net_income' => $totalRevenue - $totalExpenses,
                        'today_revenue' => $todayRevenue,
                        'week_revenue' => $weekRevenue,
                        'month_revenue' => $monthRevenue,
                    ],
                    'monthly_financials' => $monthlyData,
                    'location_distribution' => $locationDistribution,
                    'package_popularity' => $packagePopularity,
                    'recent_registrations' => $recentRegistrations,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get monthly revenue and expenses for last 6 months
     */
    private function getMonthlyFinancialData()
    {
        $months = [];
        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $month = $monthNames[$date->month - 1];
            $year = $date->year;
            
            // Revenue for this month
            $revenue = Payment::where('status', 'succeeded')
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $year)
                ->sum('amount_total');
            
            // Expenses for this month
            $expenses = Expense::where('status', 'approved')
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $year)
                ->sum('amount');
            
            $months[] = [
                'month' => $month,
                'revenue' => $revenue,
                'expenses' => $expenses,
                'year' => $year
            ];
        }
        
        return $months;
    }

    /**
     * Get student distribution by location
     */
    private function getStudentsByLocation()
    {
        // Get all locations
        $locations = Location::all();
        $distribution = [];
        
        foreach ($locations as $location) {
            $count = Student::where('province', $location->id)->count();
            if ($count > 0) {
                $distribution[] = [
                    'location' => $location->province_name,
                    'students' => $count
                ];
            }
        }
        
        // Also count students with no location
        $unassigned = Student::whereNull('province')->count();
        if ($unassigned > 0) {
            $distribution[] = [
                'location' => 'Unassigned',
                'students' => $unassigned
            ];
        }
        
        // Sort by students count descending
        usort($distribution, function($a, $b) {
            return $b['students'] - $a['students'];
        });
        
        return $distribution;
    }



    private function getPackagePopularity()
{
    // Get ALL packages first
    $allPackages = \App\Models\Package::all();
    
    // Get student counts per package
    $studentCounts = Student::select('package_id', DB::raw('count(*) as total'))
        ->whereNotNull('package_id')
        ->groupBy('package_id')
        ->pluck('total', 'package_id')
        ->toArray();
    
    $result = [];
    
    foreach ($allPackages as $package) {
        $count = $studentCounts[$package->id] ?? 0;
        
        $result[] = [
            'package_name' => $package->package_name,
            'package_id' => $package->id,
            'students' => $count,
            'amount' => $package->amount,
            'has_students' => $count > 0
        ];
    }
    
    // Sort by students count descending (packages with students first)
    usort($result, function($a, $b) {
        return $b['students'] - $a['students'];
    });
    
    return $result;
}

    /**
     * Get recent student registrations
     */
    private function getRecentRegistrations()
    {
        return Student::with(['user', 'package'])
         ->whereHas('user', function($q) {
            $q->where('status', 'pending');
        })
            ->latest()
            ->take(7)
            ->get()
            ->map(function($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->user->name ?? 'Unknown',
                    'email' => $student->user->email ?? '',
                    'status' => $student->user->status ?? 'pending',
                    'package' => $student->package->package_name ?? 'Not Assigned',
                    'registered_at' => $student->created_at->format('Y-m-d'),
                    'formatted_date' => $student->created_at->format('M d, Y'),
                    'dob' => $student->dob
                ];
            });
    }

    /**
     * Get quick stats for header cards
     */
    public function getQuickStats()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'total_students' => Student::count(),
                    'active_students' => Student::whereHas('user', fn($q) => $q->where('status', 'active'))->count(),
                    'total_instructors' => Instructor::count(),
                    'total_revenue' => Payment::where('status', 'succeeded')->sum('amount_total'),
                    'today_revenue' => Payment::where('status', 'succeeded')->whereDate('created_at', today())->sum('amount_total'),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get chart data for frontend
     */
    public function getChartData()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'monthly' => $this->getMonthlyFinancialData(),
                    'locations' => $this->getStudentsByLocation(),
                    'packages' => $this->getPackagePopularity(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}