<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\CarController;
use App\Http\Controllers\Api\InstructorController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmailTemplateController;
use App\Http\Controllers\Api\SchedulingController;
use App\Http\Controllers\Api\InstructorAssignmentController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\NotificationController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/students', [StudentController::class, 'store']); 
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/packages', [PackageController::class, 'index']);
Route::get('/locations', [LocationController::class, 'index']);
 //for testing purpose 

//     Route::get('/test-notification', function () {
//     try {
//         // Use the SLUG from your JSON response: 'student_activation'
//         \App\Services\NotificationService::send('student_activation', 'test-student@example.com', [
//             'student_name' => 'Salman',
//             'package_name' => 'Gold Package',
//             'balance_due'  => '500.00'
//         ]);
//         return response()->json(['message' => 'Go check your Mailtrap Inbox!']);
//     } catch (\Exception $e) {
//         return response()->json(['error' => $e->getMessage()], 500);
//     }
// });

/*
|--------------------------------------------------------------------------
| Protected Routes (Must be Logged In)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // --- Auth & Profile ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/profile/update', [AuthController::class, 'updateProfile']);
    // Route::get('/user', function (Request $request) {
    //     return $request->user();
    // });
    Route::get('/user', function (Request $request) {
    $user = $request->user();
    return [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        'profile_picture' => $user->profile_picture ? asset('storage/' . $user->profile_picture) : null,
    ];
});

    // --- Shared Viewing Routes (Admins, Students, Instructors can see these) ---
    Route::get('/cars', [CarController::class, 'index']);
    Route::get('/students', [StudentController::class, 'index']);
    
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | Admin-Only Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('admin')->group(function () {
        //template management
        Route::get('/templates', [EmailTemplateController::class, 'index']);      // List all
        Route::post('/templates', [EmailTemplateController::class, 'store']);     // Create new
        Route::put('/templates/{id}', [EmailTemplateController::class, 'update']); // Edit existing
        
        // Package Management
        Route::post('/packages', [PackageController::class, 'store']);
        Route::get('/packages/{id}', [PackageController::class, 'show']); // To get data for Edit form
        Route::put('/packages/{id}', [PackageController::class, 'update']);
        Route::delete('/packages/{id}', [PackageController::class, 'destroy']);

        // Location Management
       Route::post('/locations', [LocationController::class, 'store']);     // Create
        Route::get('/locations/{id}', [LocationController::class, 'show']);   // Get one for editing
        Route::put('/locations/{id}', [LocationController::class, 'update']); // Update
        Route::delete('/locations/{id}', [LocationController::class, 'destroy']); // Delete

        // instruuctor management by admi 

        Route::post('/instructors', [InstructorController::class, 'store']);             // Create
        Route::put('/instructors/update/{id}', [InstructorController::class, 'update']); // Admin Update
        Route::delete('/instructors/{id}', [InstructorController::class, 'destroy']);      // Admin Delete
        Route::get('/instructors', [InstructorController::class, 'index']);  
        Route::get('/instructors/{id}', [InstructorController::class, 'show']);    
             // List All

        //student 
        Route::get('/students/by-duty', [StudentController::class, 'getStudentsByInstructor']);
        Route::get('/students/onboarding-data', [StudentController::class, 'getOnboardingData']);
        Route::get('/students', [StudentController::class, 'index']);
        Route::get('/students/{id}', [StudentController::class, 'show']);
        Route::post('/students/{id}/activate', [StudentController::class, 'activateStudent']);
        Route::delete('/students/{id}', [StudentController::class, 'destroy']);
        //reassign student
        Route::post('/students/{id}/reassign', [StudentController::class, 'reassignInstructor']);
        //status change for student 

        


        //student page 
        Route::get('/admin/students/list', [StudentController::class, 'adminIndex']);
        Route::post('/{id}/block', [StudentController::class, 'blockStudent']);
        Route::post('/{id}/unblock', [StudentController::class, 'unblockStudent']);
        Route::get('admin/students/{id}', [StudentController::class, 'adminShow']);



        // Record a payment
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/stats', [PaymentController::class, 'getStats']);
    Route::get('/payments/download', [PaymentController::class, 'download']); // ADD THIS LINE
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
    Route::put('/payments/{id}/status', [PaymentController::class, 'updateStatus']);
    Route::post('/payments/{id}/generate-receipt', [PaymentController::class, 'generateReceipt']);
    Route::post('/payments/{id}/send-receipt', [PaymentController::class, 'sendReceiptEmail']);



    //notifi


    ///email template management for payment 
    Route::get('/templates', [EmailTemplateController::class, 'index']);      // List all templates
    Route::post('/templates', [EmailTemplateController::class, 'store']);     // Create new template
    Route::put('/templates/{id}', [EmailTemplateController::class, 'update']); // Edit existing template
        
    

// // Get student's payment history
// Route::get('/admin/student/{studentId}/payments', function($studentId) {
//     return \App\Models\Payment::where('student_id', $studentId)
//         ->orderBy('created_at', 'desc')
//         ->get();
// });

        



        // Car & Staff Management
       Route::post('/cars', [CarController::class, 'store']);
       Route::get('/cars', [CarController::class, 'index']);
       Route::post('/cars/{id}', [CarController::class, 'update']); // ← POST instead of PUT
       Route::delete('/cars/{id}', [CarController::class, 'destroy']);



       // duty schedule and assignment

    Route::post('/admin/duty', [SchedulingController::class, 'adminCreateDuty']);
    Route::get('/admin/all-duties', [SchedulingController::class, 'index']); 
    Route::put('/admin/duty/{id}', [SchedulingController::class, 'updateDuty']); // NEW
    Route::delete('/admin/duty/{id}', [SchedulingController::class, 'destroyDuty']);

    //assign to a duty 
        Route::post('/assignments/book', [InstructorAssignmentController::class, 'store']);
        Route::get('/admin/assignments/block/{blockId}', [InstructorAssignmentController::class, 'getAssignmentsByBlock']);
        Route::put('/assignments/{id}', [InstructorAssignmentController::class, 'update']); 
        Route::delete('/assignments/{id}', [InstructorAssignmentController::class, 'destroy']);





        //expense

        // --- Expense Management ---
        Route::get('/admin/expenses/all', [ExpenseController::class, 'index']); // View all claims
        Route::post('/admin/expenses/{id}/status', [ExpenseController::class, 'updateStatus']); // Approve/Reject
        Route::get('/admin/expenses/stats', [ExpenseController::class, 'getStats']);


    });




    /// instrutor area 


Route::middleware('instructor')->group(function () {

    Route::get('/instructor/my-duties', [InstructorAssignmentController::class, 'getMyDutyBlocks']);

    Route::post('/instructor/assignments', [InstructorAssignmentController::class, 'store']);

    Route::get('/instructor/manifest', [InstructorAssignmentController::class, 'getActiveManifest']);

    Route::post('/instructor/assignments/{id}/attendance', [InstructorAssignmentController::class, 'markAttendance']);

    Route::post('/instructor/assignments/{id}/evaluation', [InstructorAssignmentController::class, 'addEvaluation']);

    Route::get('/instructor/students', [InstructorAssignmentController::class, 'getAvailableStudents']);
    Route::post('/instructor/student/{studentId}/progress', [InstructorAssignmentController::class, 'updateStudentProgress']);

    // ⭐ ADD THIS
    Route::get('/instructor/history', [InstructorAssignmentController::class, 'getAttendanceHistory']);
    Route::get('/instructor/my-students', [InstructorAssignmentController::class, 'getMyAssignedStudents']);
   Route::put('/instructor/assignments/{id}', [InstructorAssignmentController::class, 'update']);

//car and expense 

    Route::get('/my-assigned-car', [CarController::class, 'assignedCar']);
        Route::post('/my-car-update/{id}', [CarController::class, 'update']);
        Route::post('/expenses', [ExpenseController::class, 'store']);
        Route::get('/expenses/my-history', [ExpenseController::class, 'instructorExpenses']);
        Route::post('/expenses/{id}', [ExpenseController::class, 'update']); // Logic handles 'pending' only
        Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy']);

});

});