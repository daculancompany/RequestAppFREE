<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
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
            'role' => 'user', // Default role
            'settings' => json_encode([
                'theme' => 'default',
                'dark_mode' => false,
                'notifications' => true,
            ]),
        ]);

        // Create token with device name
        $deviceName = $request->device_name ?? 'web_browser';
        $token = $user->createToken($deviceName);
        $refreshToken = $this->createRefreshToken($user);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token->plainTextToken,
            'refresh_token' => $refreshToken,
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required'],
            'device_name' => ['required'],
        ]);
      

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Check if user is active
        if ($user->status === 'inactive') {
            return response()->json([
                'message' => 'Account is inactive'
            ], 403);
        }

        // Update last login
        $user->last_login_at = now();
        $user->save();

        // Create tokens
        $token = $user->createToken($request->device_name);
        $refreshToken = $this->createRefreshToken($user);

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token->plainTextToken,
            'refresh_token' => $refreshToken,
        ]);
    }

    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            
            return response()->json([
                'message' => 'Logged out successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }

    /**
     * Refresh token
     */
    public function refreshToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'refresh_token' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Find user by refresh token (simplified - you'd use a refresh token table in production)
        $user = User::where('remember_token', $request->refresh_token)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid refresh token'
            ], 401);
        }

        // Check if refresh token is expired (e.g., 30 days)
        if ($user->updated_at->addDays(30)->isPast()) {
            return response()->json([
                'message' => 'Refresh token expired'
            ], 401);
        }

        // Create new token
        $token = $user->createToken('web_browser');

        return response()->json([
            'message' => 'Token refreshed',
            'token' => $token->plainTextToken,
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'avatar' => ['sometimes', 'url', 'max:255'],
            'settings' => ['sometimes', 'array'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only(['name', 'email', 'avatar']));

        // Merge settings if provided
        if ($request->has('settings')) {
            $currentSettings = $user->settings ?? [];
            $newSettings = array_merge($currentSettings, $request->settings);
            $user->settings = $newSettings;
            $user->save();
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => ['required'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 422);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully'
        ]);
    }

    /**
     * Create refresh token
     */
    private function createRefreshToken(User $user): string
    {
        $refreshToken = \Str::random(60);
        
        // Store refresh token in database
        $user->remember_token = hash('sha256', $refreshToken);
        $user->save();

        return $refreshToken;
    }
}