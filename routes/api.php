<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\GlobalController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\RequestController;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/


Route::get('/cors-test', function () {
    return response()->json([
        'message' => 'CORS is working!',
        'origin' => request()->header('Origin'),
        'cors_headers' => [
            'Access-Control-Allow-Origin' => request()->header('Origin'),
            'Access-Control-Allow-Credentials' => 'true',
        ],
        'timestamp' => now()->toDateTimeString(),
    ]);
});


// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/refresh', [AuthController::class, 'refreshToken']);

// Protected routes (require authentication)
Route::middleware(['auth:sanctum'])->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'user']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    // User management routes
    Route::apiResource('users', UserController::class);
    Route::put('/users/{user}/settings', [UserController::class, 'updateSettings']);
    Route::get('/users/statistics', [UserController::class, 'statistics']);

    // Dashboard routes
    Route::get('/dashboard/stats', function () {
        return response()->json([
            'revenue' => 125000,
            'orders' => 1250,
            'users' => 250,
            'growth' => 12.5,
        ]);
    });

    // Example protected route
    Route::get('/protected-data', function () {
        return response()->json([
            'message' => 'This is protected data',
            'user' => auth()->user(),
            'timestamp' => now()->toDateTimeString(),
        ]);
    });
    Route::get('/get-roles', [GlobalController::class, 'getRoles']);

    Route::get('/departments', [GlobalController::class, 'getDepartments']);
    Route::get('/positions', [GlobalController::class, 'getPositions']);
    Route::apiResource('members', MemberController::class);
    Route::get('/profile', [MemberController::class, 'showAuthUser']);
    Route::put('/update-profile', [MemberController::class, 'updateProfile']);
    Route::apiResource('groups', GroupController::class);

    // Request routes
    Route::prefix('requests')->group(function () {
        Route::get('/', [RequestController::class, 'index']);
        Route::post('/', [RequestController::class, 'store']);
        Route::post('/{id}/update-status', [RequestController::class, 'updateStatus']);
        Route::get('/dashboard', [RequestController::class, 'dashboard']);
        Route::get('/approvers', [RequestController::class, 'getApprovers']);
        Route::get('/export', [RequestController::class, 'export']);
        Route::get('/calendar-view', [RequestController::class, 'calendarView']);
 
        // Single request operations
        // Route::prefix('{request}')->group(function () {
        //     Route::get('/', [RequestController::class, 'show']);
        //     Route::put('/', [RequestController::class, 'update']);
        //     Route::delete('/', [RequestController::class, 'destroy']); // Optional
        //     Route::post('/approve', [RequestController::class, 'approve']);
        //     Route::post('/reject', [RequestController::class, 'reject']);
        //     Route::post('/cancel', [RequestController::class, 'cancel']);
        // });
    });
    //Route::get('/realtime-notification', [NotificationController::class, 'realtimeNotification']);
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/realtime', [NotificationController::class, 'realtimeNotification']);
        Route::get('/count', [NotificationController::class, 'count']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
        Route::get('/{id}', [NotificationController::class, 'show']);
        Route::get('/type/{type}', [NotificationController::class, 'byType']);
    });
});
Route::get('/users/statistics', [UserController::class, 'statistics']);
