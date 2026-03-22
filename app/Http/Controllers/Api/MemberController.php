<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
// use App\Models\UserDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class MemberController extends Controller
{

    ////->where('role', '!=', 'admin')
    public function index()
    {
        $userId = Auth::id();

        try {
            $members = User::with(['department', 'position'])
                ->orderByRaw('id = ? DESC', [$userId]) // current user first
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($user) use ($userId) {
                    $user->is_you = $user->id === $userId;
                    return $user;
                });

            return response()->json([
                'success' => true,
                'message' => 'Members retrieved successfully',
                'data' => $members,
                'count' => $members->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve members',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'department_id' => 'required|exists:departments,id',
            'position_id' => 'required|exists:positions,id',
            'status' => 'nullable|in:active,inactive,pending',
            'password' => 'required|min:4',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {

            // Create the user
            // Handle avatar upload
            $avatarPath = null;
            if ($request->hasFile('avatar')) {
                $avatar = $request->file('avatar');
                $avatarName = 'avatar_' . time() . '.' . $avatar->getClientOriginalExtension();

                // Move to public/avatars folder
                $avatar->move(public_path('avatars'), $avatarName);

                // Save just the filename or relative path
                $avatarPath = 'avatars/' . $avatarName;
            }

            $middleInitial = $request->middleName ?
                ' ' . substr(trim($request->middleName), 0, 1) . '.' :
                '';
            $fullName = trim(
                ($request->title ? $request->title . ' ' : '') . // Title if exists
                    $request->firstName .
                    $middleInitial . ' ' .
                    $request->lastName .
                    ($request->suffix ? ' ' . $request->suffix : '') // Suffix if exists
            );
            // Create user
            $user = User::create([
                'name' => $fullName,
                'fname' => $request->firstName,
                'title' => $request->title,
                'mname' => $request->middleName,
                'lname' => $request->lastName,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'member',
                'status' => $request->status ?? 'active',
                'avatar' => $avatarPath,
                'branch_id' => 1,
                'phone' => $request->phone,
                'department_id' => $request->department_id,
                'position_id' => $request->position_id,
                'address' => $request->address,
                'suffix' => $request->suffix,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Member created successfully',
                'data' => [
                    'user' => $user,
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('Member creation failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create member',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function showAuthUser()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Load relationships
            $user->load(['department', 'position', 'branch']);

            // Add is_you flag (always true for auth user)
            $user->is_you = true;

            return response()->json([
                'success' => true,
                'message' => 'Authenticated user retrieved successfully',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve authenticated user',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Validate the request
            $validator = Validator::make($request->all(), [
                'fname' => 'sometimes|string|max:255',
                'mname' => 'nullable|string|max:255',
                'lname' => 'sometimes|string|max:255',
                'address' => 'nullable|string',
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'esignature' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:1024',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Update user fields - ONLY fname, mname, lname, address
            $updateData = $request->only([
                'fname',
                'mname',
                'lname',
                'address',
            ]);

            // Handle avatar upload
            if ($request->hasFile('avatar')) {
                // Delete old avatar if exists
                if ($user->avatar && file_exists(public_path($user->avatar))) {
                    unlink(public_path($user->avatar));
                }

                $avatar = $request->file('avatar');
                $avatarName = 'avatar_' . time() . '.' . $avatar->getClientOriginalExtension();
                $avatar->move(public_path('avatars'), $avatarName);
                $updateData['avatar'] = 'avatars/' . $avatarName;
            }

            // Handle esignature upload
            if ($request->hasFile('esignature')) {
                // Delete old signature if exists
                if ($user->esignature && file_exists(public_path($user->esignature))) {
                    unlink(public_path($user->esignature));
                }

                $signature = $request->file('esignature');
                $signatureName = 'sig_' . time() . '.' . $signature->getClientOriginalExtension();

                // Create signatures directory if it doesn't exist
                $signaturesPath = public_path('signatures');
                if (!file_exists($signaturesPath)) {
                    mkdir($signaturesPath, 0777, true);
                }

                $signature->move($signaturesPath, $signatureName);
                $updateData['esignature'] = 'signatures/' . $signatureName;
            }

            // Update name if first, middle, or last name changed
            if ($request->has('fname') || $request->has('mname') || $request->has('lname')) {
                $fname = $request->fname ?? $user->fname;
                $mname = $request->mname ?? $user->mname;
                $lname = $request->lname ?? $user->lname;

                $middleInitial = $mname ? ' ' . substr(trim($mname), 0, 1) . '.' : '';
                $updateData['name'] = trim($fname . $middleInitial . ' ' . $lname);
            }

            // Update user
            $user->update($updateData);

            DB::commit();

            // Add full URLs for images
            if ($user->avatar) {
                $user->avatar = url($user->avatar);
            }
            if ($user->esignature) {
                $user->esignature = url($user->esignature);
            }

            // Load relationships
            $user->load(['department', 'position']);
            $user->is_you = true;

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('Profile update failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
