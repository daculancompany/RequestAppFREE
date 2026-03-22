<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index(Request $request)
    {
        $perPage = $request->get('limit', 10);
        $page = $request->get('page', 1);
        $search = $request->get('search', '');
        $role = $request->get('role');
        $status = $request->get('status');

        $query = User::query();

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Apply role filter
        if ($role) {
            $query->where('role', $role);
        }

        // Apply status filter
        if ($status) {
            $query->where('status', $status);
        }

        // Order by latest
        $query->latest();

        // Get paginated results
        $users = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'users' => $users->items(),
            'total' => $users->total(),
            'page' => $users->currentPage(),
            'per_page' => $users->perPage(),
            'last_page' => $users->lastPage(),
        ]);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'min:8'],
            'role' => ['required', 'string', Rule::in(['admin', 'user', 'manager'])],
            'status' => ['sometimes', 'string', Rule::in(['active', 'inactive', 'suspended'])],
            'avatar' => ['sometimes', 'url', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'status' => $request->status ?? 'active',
            'avatar' => $request->avatar,
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user
        ], 201);
    }

    /**
     * Display the specified user
     */
    public function show(User $user)
    {
        return response()->json([
            'user' => $user
        ]);
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['sometimes', 'string', Rule::in(['admin', 'user', 'manager'])],
            'status' => ['sometimes', 'string', Rule::in(['active', 'inactive', 'suspended'])],
            'avatar' => ['sometimes', 'url', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Only admin can change role
        if ($request->has('role') && $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Only administrators can change user roles'
            ], 403);
        }

        $user->update($request->only(['name', 'email', 'role', 'status', 'avatar']));

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user)
    {
        // Prevent self-deletion
        if (auth()->id() === $user->id) {
            return response()->json([
                'message' => 'You cannot delete your own account'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Update user settings
     */
    public function updateSettings(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'settings' => ['required', 'array'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Only allow updating own settings unless admin
        if ($request->user()->id !== $user->id && $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'You can only update your own settings'
            ], 403);
        }

        $currentSettings = $user->settings ?? [];
        $newSettings = array_merge($currentSettings, $request->settings);
        
        $user->settings = $newSettings;
        $user->save();

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $user->settings
        ]);
    }

    /**
     * Get user statistics
     */
    public function statistics()
    {
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'active')->count();
        $admins = User::where('role', 'admin')->count();
        
        $recentUsers = User::where('created_at', '>=', now()->subDays(7))
            ->count();

        return response()->json([
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
            'admin_users' => $admins,
            'recent_users' => $recentUsers,
        ]);
    }
}