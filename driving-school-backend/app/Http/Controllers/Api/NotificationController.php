<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated admin
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            $query = $user->notifications();
            
            // Filter by read/unread
            if ($request->filled('filter')) {
                if ($request->filter === 'unread') {
                    $query = $user->unreadNotifications();
                } elseif ($request->filter === 'read') {
                    $query = $user->readNotifications();
                }
            }
            
            // Pagination
            $perPage = $request->get('per_page', 20);
            $notifications = $query->paginate($perPage);
            
            // Transform the data
            $transformed = $notifications->map(function($notification) {
                $data = is_array($notification->data) ? $notification->data : json_decode($notification->data, true);
                
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $data,
                    'message' => $data['message'] ?? $this->getDefaultMessage($notification->type, $data),
                    'read_at' => $notification->read_at ? $notification->read_at->diffForHumans() : null,
                    'read_at_timestamp' => $notification->read_at,
                    'created_at' => $notification->created_at->diffForHumans(),
                    'created_at_timestamp' => $notification->created_at,
                    'is_read' => !is_null($notification->read_at)
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformed,
                'unread_count' => $user->unreadNotifications->count(),
                'meta' => [
                    'current_page' => $notifications->currentPage(),
                    'last_page' => $notifications->lastPage(),
                    'total' => $notifications->total(),
                    'per_page' => $notifications->perPage(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notifications: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead($id)
    {
        try {
            $user = Auth::user();
            $notification = $user->notifications()->where('id', $id)->first();
            
            if ($notification) {
                $notification->markAsRead();
            }

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read',
                'unread_count' => $user->unreadNotifications->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read'
            ], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        try {
            $user = Auth::user();
            $user->unreadNotifications->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read',
                'unread_count' => 0
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark all notifications as read'
            ], 500);
        }
    }

    /**
     * Delete a notification
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            $user->notifications()->where('id', $id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification deleted',
                'unread_count' => $user->unreadNotifications->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notification'
            ], 500);
        }
    }

    /**
     * Get unread count only
     */
    public function getUnreadCount()
    {
        try {
            $user = Auth::user();
            
            return response()->json([
                'success' => true,
                'unread_count' => $user->unreadNotifications->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get unread count'
            ], 500);
        }
    }

    /**
     * Default message based on notification type
     */
    private function getDefaultMessage($type, $data)
    {
        if (str_contains($type, 'StudentAssigned')) {
            return 'New student assigned to you';
        } elseif (str_contains($type, 'PaymentReceived')) {
            return 'Payment received: $' . number_format($data['amount'] ?? 0, 2);
        } elseif (str_contains($type, 'WelcomeStudent')) {
            return 'Welcome to the driving school!';
        } elseif (str_contains($type, 'InstructorChanged')) {
            return 'Your instructor has been changed';
        } else {
            return 'New notification';
        }
    }
}