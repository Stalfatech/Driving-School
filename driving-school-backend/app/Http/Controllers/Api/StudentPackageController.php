<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Enrolment;
use App\Models\Package;
use App\Models\Instructor;
use App\Models\User;
use App\Models\Location;
use App\Models\ScheduleAssignment;
use App\Models\PackageRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use App\Notifications\NewPackageRequestNotification;


class StudentPackageController extends Controller
{
    /**
     * Get current active package (if any)
     */
    public function activePackage()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not authenticated'], 401);
            }

            $student = Student::with(['user', 'instructor.user', 'instructor.car'])
                ->where('user_id', $user->id)
                ->first();

            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student profile not found'], 404);
            }

            // Load active enrolment with package and location
            $enrolment = Enrolment::with(['package', 'location'])
                ->where('student_id', $student->id)
                // ->where('status', 'active')
                ->whereIn('status', ['active', 'paid'])       // Both statuses accepted
                ->where('progress_percentage', '<=', 100) 
                ->first();

            if (!$enrolment) {
                return response()->json(['success' => true, 'data' => null]);
            }

            $package  = $enrolment->package;
            $location = $enrolment->location;

            // ── Progress: use stored progress_percentage from enrolment ──
            $progress       = (int) ($enrolment->progress_percentage ?? 0);
            $totalHours     = (float) $package->hours;

            // ── Sessions from schedule_assignments ──
            $totalSessions = ScheduleAssignment::where('student_id', $student->id)->count();

            $completedSessions = ScheduleAssignment::where('student_id', $student->id)
                ->whereHas('attendance', fn($q) => $q->where('status', 'Present'))
                ->count();

            // ── Remaining hours from progress percentage ──
            $completedHours  = round(($progress / 100) * $totalHours, 1);
            $remainingHours  = max(0, round($totalHours - $completedHours, 1));

            // ── Tax from enrolment's location ──
            $taxRate    = $location ? (float) ($location->tax_rate ?? 0) : 0;
            $taxType    = $location ? ($location->{'tax-type'} ?? 'HST') : 'HST';
            $subtotal   = (float) $package->amount;
            $taxAmount  = round($subtotal * ($taxRate / 100), 2);
            $totalWithTax = round($subtotal + $taxAmount, 2);

            // ── Expiry: 1 year from enrolment creation ──
            $expiryDate = $enrolment->created_at->addDays(365)->toDateString();

            // ── Instructor info ──
            $instructorData = null;
            $instructor = $student->instructor;
            if ($instructor && $instructor->user) {
                $instructorData = [
                    'name'           => $instructor->user->name,
                    'specialization' => $instructor->specialization ?? 'Driving Instructor',
                    'rating'         => 4.8,
                    'car'            => optional($instructor->car)->car_name ?? 'Training Vehicle',
                    'phone'          => $instructor->user->phone ?? '',
                    'email'          => $instructor->user->email ?? '',
                ];
            }

            // ── Next upcoming session ──
            $nextSession     = ScheduleAssignment::where('student_id', $student->id)
                ->where('date', '>=', Carbon::today()->toDateString())
                ->whereDoesntHave('attendance')
                ->orderBy('date', 'asc')
                ->orderBy('start_time', 'asc')
                ->first();

            $nextSessionData = null;
            if ($nextSession) {
                $nextSessionData = [
                    'date'  => $nextSession->date,
                    'time'  => Carbon::parse($nextSession->start_time)->format('h:i A'),
                    'topic' => optional($nextSession->schedule)->task_description ?? 'Driving Lesson',
                ];
            }

            $data = [
                'id'                 => $enrolment->id,
                'package_name'       => $package->package_name,
                'license_class'      => $package->license_class,
                'base_amount'        => $subtotal,
                'tax_rate'           => $taxRate,
                'tax_type'           => $taxType,
                'tax_amount'         => $taxAmount,
                'total_amount'       => $totalWithTax,
                'hours'              => $totalHours,
                'remaining_hours'    => $remainingHours,
                'progress'           => $progress,
                'sessions_completed' => $completedSessions,
                'total_sessions'     => $totalSessions,
                'purchased_date'     => $enrolment->created_at->toDateString(),
                'expiry_date'        => $expiryDate,
                'status'             => $enrolment->status,
                'location'           => $location ? [
                    'name'    => $location->province_name ?? $location->name ?? '',
                    'address' => $location->address ?? '',
                    'phone'   => $location->phone ?? '',
                ] : null,
                'instructor'         => $instructorData,
                'next_session'       => $nextSessionData,
                'includes'           => $this->getPackageIncludes($package),
            ];

            return response()->json(['success' => true, 'data' => $data]);

        } catch (\Exception $e) {
            Log::error('activePackage error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get package purchase history (completed / cancelled)
     */
    public function history()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not authenticated'], 401);
            }

            $student = Student::where('user_id', $user->id)->first();
            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student not found'], 404);
            }

            $enrolments = Enrolment::with(['package', 'location'])
                ->where('student_id', $student->id)
                ->where('progress_percentage', 100)           // ✅ Completed
                ->where('status', 'completed')                     
                ->orderBy('created_at', 'desc')
                ->get();

            $history = $enrolments->map(function ($enrolment) {
                $package  = $enrolment->package;
                $location = $enrolment->location;

                $taxRate      = $location ? (float) ($location->tax_rate ?? 0) : 0;
                $taxType      = $location ? ($location->{'tax-type'} ?? 'HST') : 'HST';
                $subtotal     = (float) $package->amount;
                $taxAmount    = round($subtotal * ($taxRate / 100), 2);
                $totalWithTax = round($subtotal + $taxAmount, 2);

                return [
                    'id'                  => $enrolment->id,
                    'package_name'        => $package->package_name,
                    'license_class'       => $package->license_class,
                    'base_amount'         => $subtotal,
                    'tax_rate'            => $taxRate,
                    'tax_type'            => $taxType,
                    'tax_amount'          => $taxAmount,
                    'total_amount'        => $totalWithTax,
                    'hours'               => (float) $package->hours,
                    'purchased_date'      => $enrolment->created_at->toDateString(),
                    'completed_date'      => $enrolment->updated_at->toDateString(),
                    'status'              => $enrolment->status,
                    'certificate_issued'  => $enrolment->status === 'completed',
                    'includes'            => $this->getPackageIncludes($package),
                ];
            });

            return response()->json(['success' => true, 'data' => $history]);

        } catch (\Exception $e) {
            Log::error('history error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Get available packages (not yet purchased) with tax from student's location
     */
    public function available(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not authenticated'], 401);
            }

            $student = Student::where('user_id', $user->id)->first();
            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student not found'], 404);
            }

            // Use enrolment location first, else student's province location, else first location
            $activeEnrolment = Enrolment::with('location')
                ->where('student_id', $student->id)
                ->where('status', 'active')
                ->first();

            if ($activeEnrolment && $activeEnrolment->location) {
                $location = $activeEnrolment->location;
            } elseif ($student->province) {
                $location = Location::find($student->province);
            }

            if (empty($location)) {
                $location = Location::first();
            }

            if (!$location) {
                return response()->json(['success' => false, 'message' => 'No location configured'], 500);
            }

            $taxRate = (float) ($location->tax_rate ?? 0);
            $taxType = $location->{'tax-type'} ?? 'HST';

            // Exclude already-purchased packages (any status)
            $purchasedIds = Enrolment::where('student_id', $student->id)->pluck('package_id')->toArray();

            $packages = Package::whereNotIn('id', $purchasedIds)
                ->whereNull('deleted_at')
                ->get();

            $available = $packages->map(function ($package) use ($taxRate, $taxType) {
                $subtotal     = (float) $package->amount;
                $taxAmount    = round($subtotal * ($taxRate / 100), 2);
                $totalWithTax = round($subtotal + $taxAmount, 2);

                return [
                    'id'           => $package->id,
                    'package_name' => $package->package_name,
                    'license_class'=> $package->license_class,
                    'base_amount'  => $subtotal,
                    'tax_rate'     => $taxRate,
                    'tax_type'     => $taxType,
                    'tax_amount'   => $taxAmount,
                    'total_amount' => $totalWithTax,
                    'hours'        => (float) $package->hours,
                    'description'  => $package->description ?? 'Comprehensive driver training program',
                    'includes'     => $this->getPackageIncludes($package),
                    'popularity'   => rand(70, 95),
                ];
            });

            return response()->json(['success' => true, 'data' => $available]);

        } catch (\Exception $e) {
            Log::error('available error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error'], 500);
        }
    }

 
   public function requestPackage(Request $request)
{
    $validator = Validator::make($request->all(), [
        'package_id'  => 'required|exists:packages,id',
        'location_id' => 'required|exists:locations,id',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $student = Auth::user()->student;

    // Get current enrolment (active or paid)
    $currentEnrolment = Enrolment::where('student_id', $student->id)
        ->whereIn('status', ['active', 'paid'])
        ->first();

    if ($currentEnrolment) {
        // Check 1: progress_percentage must be 100
        if ($currentEnrolment->progress_percentage < 100) {
            return response()->json([
                'success' => false,
                'message' => 'You must complete 100% of your current package before requesting a new one. Current progress: ' . $currentEnrolment->progress_percentage . '%'
            ], 400);
        }

        // Check 2: status must be 'paid'
        if ($currentEnrolment->status !== 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Your current package is not fully paid. Please complete the payment first.'
            ], 400);
        }

        // Check 3: balance_due must be 0
        if ($currentEnrolment->balance_due != 0) {
            return response()->json([
                'success' => false,
                'message' => 'Your current package still has an outstanding balance of $' . number_format($currentEnrolment->balance_due, 2) . '. Please clear all dues.'
            ], 400);
        }
    }

    // Prevent duplicate pending requests
    $existing = PackageRequest::where('student_id', $student->id)
        ->where('package_id', $request->package_id)
        ->where('status', 'pending')
        ->first();
    if ($existing) {
        return response()->json([
            'success' => false,
            'message' => 'You already have a pending request for this package.'
        ], 400);
    }

    // Create the package request
    $packageRequest = PackageRequest::create([
        'student_id'   => $student->id,
        'package_id'   => $request->package_id,
        'location_id'  => $request->location_id,
        'instructor_id'=> null,
        'status'       => 'pending',
        'requested_at' => now(),
    ]);

    // Notify admins
    $admins = User::where('role', 'admin')->get();
    foreach ($admins as $admin) {
        $admin->notify(new \App\Notifications\NewPackageRequestNotification($packageRequest));
    }

    return response()->json([
        'success' => true,
        'message' => 'Package request submitted successfully. Admin will review it.'
    ]);
}

    private function getPackageIncludes($package): array
    {
        if (!$package->included_items) return [];
        if (is_array($package->included_items)) return $package->included_items;
        return json_decode($package->included_items, true) ?? [];
    }
}