<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Request as RequestModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function __construct()
    {
        // $this->middleware('auth:api');
    }

    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        
        $notifications = Notification::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        // Process notifications to extract data from JSON
        $processedNotifications = $notifications->map(function ($notification) {
            $data = $this->parseNotificationData($notification->data);
            
            return [
                'id' => $notification->id,
                'type' => $notification->notifiable_type,
                'title' => $data['title'] ?? 'Notification',
                'message' => $data['message'] ?? '',
                'read' => (bool)$notification->read,
                'created_at' => $notification->created_at->diffForHumans(),
                'raw_created_at' => $notification->created_at->toISOString(),
                'data' => $data // the parsed data
            ];
        });

        return response()->json([
            'notifications' => $processedNotifications,
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'last_page' => $notifications->lastPage(),
            ]
        ]);
    }

    public function realtimeNotification()
    {
        $user = Auth::user();
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get()
            ->map(function ($notification) {
                $data = $this->parseNotificationData($notification->data);
                $request = RequestModel::with(['user'])->find($data['id'] );
                return [
                    'id' => $notification->id,
                    'type' => $notification->notifiable_type,
                    'title' => $data['title'] ?? 'Notification',
                    'message' => $data['message'] ?? '',
                    'read' => (bool)$notification->read,
                    'created_at' => $notification->created_at->diffForHumans(),
                    'raw_created_at' => $notification->created_at->toISOString(),
                    'data' => $data,
                    'user_name' => $request->user->name ?? 'Unknown User',
                ];
            });

        return response()->json($notifications);
    }

    public function count()
    {
        $count = Notification::where('user_id', Auth::id())
            ->where('read', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    public function markAsRead($id)
    {
        $notification = Notification::where('user_id', Auth::id())
            ->findOrFail($id);

        $notification->update([
            'read' => true,
            'read_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read'
        ]);
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now()
            ]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read'
        ]);
    }

    public function unreadCount()
    {
        $count = Notification::where('user_id', Auth::id())
            ->where('read', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    public function destroy($id)
    {
        $notification = Notification::where('user_id', Auth::id())
            ->findOrFail($id);

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted successfully'
        ]);
    }

    // Add this endpoint for fetching single notification with full details
    public function show($id)
    {
        $notification = Notification::where('user_id', Auth::id())
            ->findOrFail($id);
        
        $data = $this->parseNotificationData($notification->data);
        
        return response()->json([
            'id' => $notification->id,
            'type' => $notification->notifiable_type,
            'title' => $data['title'] ?? 'Notification',
            'message' => $data['message'] ?? '',
            'read' => (bool)$notification->read,
            'created_at' => $notification->created_at->diffForHumans(),
            'raw_created_at' => $notification->created_at->toISOString(),
            'read_at' => $notification->read_at,
            'data' => $data,
            'full_notification' => $notification // include full model if needed
        ]);
    }

    // Optional: Filter notifications by type
    public function byType($type)
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->where('notifiable_type', $type)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                $data = $this->parseNotificationData($notification->data);
                
                return [
                    'id' => $notification->id,
                    'type' => $notification->notifiable_type,
                    'title' => $data['title'] ?? 'Notification',
                    'message' => $data['message'] ?? '',
                    'read' => (bool)$notification->read,
                    'created_at' => $notification->created_at->diffForHumans(),
                    'raw_created_at' => $notification->created_at->toISOString(),
                    'data' => $data
                ];
            });

        return response()->json($notifications);
    }

    /**
     * Helper method to parse notification data.
     * Handles both JSON strings and arrays.
     */
    private function parseNotificationData($data)
    {
        // If data is null, return empty array
        if (is_null($data)) {
            return [];
        }
        
        // If data is already an array, return it
        if (is_array($data)) {
            return $data;
        }
        
        // If data is a JSON string, decode it
        if (is_string($data)) {
            try {
                $decoded = json_decode($data, true);
                return is_array($decoded) ? $decoded : [];
            } catch (\Exception $e) {
                return [];
            }
        }
        

        return [];
    }

    public function registerDevice(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'device_token' => 'required|string',
            'device_uuid' => 'required|string',
            'platform' => 'required|in:ios,android'
        ]);

        return response()->json(['success' => true]);
    }

    public function logout(Request $request)
    {
        $request->user()->token()->revoke();
        return response()->json([
            'message' => 'Logged out successfully.'
        ]);
    }
}