<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\User;
use App\Models\GroupDetails;
use App\Models\GroupApprover;
use App\Models\GroupSignatories;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class GroupController extends Controller
{
   
    public function index(Request $request)
    {
        try {
            $userId = Auth::id();

          
            $groups = Group::with(['approvers', 'signatories', 'members'])
                ->whereHas('members', function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                })
                ->orWhereHas('approvers', function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                })
                ->orWhereHas('signatories', function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                })
                ->orderBy('created_at', 'desc')
                ->get();

            // Add full URLs for images
            $groups->each(function ($group) {
                if ($group->group_image) {
                    $group->group_image = url($group->group_image);
                }
            });

            return response()->json([
                'success' => true,
                'data' => $groups,
                'message' => 'Groups retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch groups: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve groups',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

   
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:groups,group_code',
            'color' => 'nullable|string|max:20',
            'capacity' => 'required|integer|min:1|max:1000',
            'coverImage' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            'approvers' => 'required|string', // JSON string
            'signatories' => 'nullable|string', // JSON string
            'members' => 'required|string', // JSON string
            'maxLeaveDuration' => 'nullable|integer|min:1|max:365',
            'autoApprove' => 'nullable|boolean',
            'description' => 'nullable|string',
            'tags' => 'nullable|string',
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
            // Handle cover image upload
            $coverImagePath = null;
            if ($request->hasFile('coverImage')) {
                $coverImage = $request->file('coverImage');
                $coverImageName = 'cover_' . time() . '_' . uniqid() . '.' . $coverImage->getClientOriginalExtension();

                // Create directory if it doesn't exist
                $coversPath = public_path('covers');
                if (!file_exists($coversPath)) {
                    mkdir($coversPath, 0777, true);
                }

                // Move to public/covers folder
                $coverImage->move($coversPath, $coverImageName);
                $coverImagePath = 'covers/' . $coverImageName;
            }

            // Parse JSON strings to arrays
            $approvers = json_decode($request->input('approvers'), true) ?? [];
            $signatories = json_decode($request->input('signatories'), true) ?? [];
            $members = json_decode($request->input('members'), true) ?? [];

            $membersIds = collect($members)->pluck('id')->filter()->toArray();
            $approverIds = collect($approvers)->pluck('id')->filter()->toArray();
            $signatoryIds = collect($signatories)->pluck('id')->filter()->toArray();

            // Create the group
            $group = Group::create([
                'created_by' => Auth::id(),
                'group_name' => $request->input('name'),
                'group_code' => $request->input('code'),
                'description' => $request->input('description'),
                'group_color' => $request->input('color', '#1890ff'),
                'group_image' => $coverImagePath,
                'capacity' => $request->input('capacity', 50),
                'status' => 'active',
                'tags' => $request->input('tags') ? json_encode(explode(',', $request->input('tags'))) : null,
                'settings' => json_encode([
                    'max_leave_duration' => $request->input('maxLeaveDuration', 30),
                    'auto_approve' => filter_var($request->input('autoApprove', false), FILTER_VALIDATE_BOOLEAN),
                ]),
            ]);

            // Add members
            foreach ($membersIds as $memberId) {
                GroupDetails::create([
                    'group_id' => $group->id,
                    'user_id' => $memberId,
                ]);
            }

            // Add approvers
            foreach ($approverIds as $approverId) {
                GroupApprover::create([
                    'group_id' => $group->id,
                    'user_id' => $approverId,
                ]);
            }

            // Add signatories
            foreach ($signatoryIds as $signatoryId) {
                GroupSignatories::create([
                    'group_id' => $group->id,
                    'user_id' => $signatoryId,
                ]);
            }

            DB::commit();

  
            $group->load(['approvers', 'signatories', 'members']);

    
            if ($group->group_image) {
                $group->group_image = url($group->group_image);
            }

            return response()->json([
                'success' => true,
                'message' => 'Group created successfully',
                'data' => $group
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Group creation failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create group',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $group = Group::with(['approvers', 'signatories', 'members'])
                ->findOrFail($id);

 
            if ($group->group_image) {
                $group->group_image = url($group->group_image);
            }

     
            if ($group->members) {
                $group->members->each(function ($member) {
                    if ($member->avatar) {
                        $member->avatar = url($member->avatar);
                    }
                });
            }

          
            if ($group->approvers) {
                $group->approvers->each(function ($approver) {
                    if ($approver->avatar) {
                        $approver->avatar = url($approver->avatar);
                    }
                });
            }

          
            if ($group->signatories) {
                $group->signatories->each(function ($signatory) {
                    if ($signatory->avatar) {
                        $signatory->avatar = url($signatory->avatar);
                    }
                });
            }

            return response()->json([
                'success' => true,
                'data' => $group,
                'message' => 'Group retrieved successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Group not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Failed to fetch group: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve group',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

 
    public function update(Request $request, string $id)
    {
        $group = Group::find($id);

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Group not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:50|unique:groups,group_code,' . $id,
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20',
            'capacity' => 'sometimes|required|integer|min:1|max:1000',
            'coverImage' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'approvers' => 'sometimes|required|string',
            'signatories' => 'nullable|string',
            'members' => 'sometimes|required|string',
            'tags' => 'nullable|string',
            'maxLeaveDuration' => 'nullable|integer|min:1|max:365',
            'autoApprove' => 'nullable|boolean',
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
            if ($request->hasFile('coverImage')) {
             
                if ($group->group_image && file_exists(public_path($group->group_image))) {
                    unlink(public_path($group->group_image));
                }

                $coverImage = $request->file('coverImage');
                $coverImageName = 'cover_' . time() . '_' . uniqid() . '.' . $coverImage->getClientOriginalExtension();

 
                $coversPath = public_path('covers');
                if (!file_exists($coversPath)) {
                    mkdir($coversPath, 0777, true);
                }

                $coverImage->move($coversPath, $coverImageName);
                $group->group_image = 'covers/' . $coverImageName;
            }

            // Parse JSON strings to arrays (if provided)
            if ($request->has('approvers')) {
                $approvers = json_decode($request->input('approvers'), true) ?? [];
                $approverIds = collect($approvers)->pluck('id')->filter()->toArray();
            }

            if ($request->has('signatories')) {
                $signatories = json_decode($request->input('signatories'), true) ?? [];
                $signatoryIds = collect($signatories)->pluck('id')->filter()->toArray();
            }

            if ($request->has('members')) {
                $members = json_decode($request->input('members'), true) ?? [];
                $memberIds = collect($members)->pluck('id')->filter()->toArray();
            }

          
            $updateData = [];

            if ($request->has('name')) {
                $updateData['group_name'] = $request->input('name');
            }

            if ($request->has('code')) {
                $updateData['group_code'] = $request->input('code');
            }

            if ($request->has('description')) {
                $updateData['description'] = $request->input('description');
            }

            if ($request->has('color')) {
                $updateData['group_color'] = $request->input('color');
            }

            if ($request->has('capacity')) {
                $updateData['capacity'] = $request->input('capacity');
            }

            if ($request->has('tags')) {
                $updateData['tags'] = $request->input('tags') ? json_encode(explode(',', $request->input('tags'))) : null;
            }

            // Update settings
            $settings = json_decode($group->settings, true) ?? [];
            if ($request->has('maxLeaveDuration')) {
                $settings['max_leave_duration'] = $request->input('maxLeaveDuration');
            }
            if ($request->has('autoApprove')) {
                $settings['auto_approve'] = filter_var($request->input('autoApprove'), FILTER_VALIDATE_BOOLEAN);
            }
            $updateData['settings'] = json_encode($settings);

            // Update the group
            if (!empty($updateData)) {
                $group->update($updateData);
            }

            // Update members if provided
            if (isset($memberIds)) {
                // Get current member IDs
                $currentMemberIds = $group->members()->pluck('user_id')->toArray();

                // Find members to add and remove
                $membersToAdd = array_diff($memberIds, $currentMemberIds);
                $membersToRemove = array_diff($currentMemberIds, $memberIds);

                // Remove members
                if (!empty($membersToRemove)) {
                    GroupDetails::where('group_id', $group->id)
                        ->whereIn('user_id', $membersToRemove)
                        ->delete();
                }

                // Add new members
                foreach ($membersToAdd as $memberId) {
                    GroupDetails::create([
                        'group_id' => $group->id,
                        'user_id' => $memberId,
                    ]);
                }
            }

            // Update approvers if provided
            if (isset($approverIds)) {
                // Get current approver IDs
                $currentApproverIds = $group->approvers()->pluck('user_id')->toArray();

                // Find approvers to add and remove
                $approversToAdd = array_diff($approverIds, $currentApproverIds);
                $approversToRemove = array_diff($currentApproverIds, $approverIds);

                // Remove approvers
                if (!empty($approversToRemove)) {
                    GroupApprover::where('group_id', $group->id)
                        ->whereIn('user_id', $approversToRemove)
                        ->delete();
                }

                // Add new approvers
                foreach ($approversToAdd as $approverId) {
                    GroupApprover::create([
                        'group_id' => $group->id,
                        'user_id' => $approverId,
                    ]);
                }
            }

            // Update signatories if provided
            if (isset($signatoryIds)) {
                // Get current signatory IDs
                $currentSignatoryIds = $group->signatories()->pluck('user_id')->toArray();

                // Find signatories to add and remove
                $signatoriesToAdd = array_diff($signatoryIds, $currentSignatoryIds);
                $signatoriesToRemove = array_diff($currentSignatoryIds, $signatoryIds);

                // Remove signatories
                if (!empty($signatoriesToRemove)) {
                    GroupSignatories::where('group_id', $group->id)
                        ->whereIn('user_id', $signatoriesToRemove)
                        ->delete();
                }

                // Add new signatories
                foreach ($signatoriesToAdd as $signatoryId) {
                    GroupSignatories::create([
                        'group_id' => $group->id,
                        'user_id' => $signatoryId,
                    ]);
                }
            }

            DB::commit();

            // Load fresh data with relationships
            $group->load(['approvers', 'signatories', 'members']);

            // Add full URL for image
            if ($group->group_image) {
                $group->group_image = url($group->group_image);
            }

            // Add full URLs for member avatars
            if ($group->members) {
                $group->members->each(function ($member) {
                    if ($member->avatar) {
                        $member->avatar = url($member->avatar);
                    }
                });
            }

            // Add full URLs for approver avatars
            if ($group->approvers) {
                $group->approvers->each(function ($approver) {
                    if ($approver->avatar) {
                        $approver->avatar = url($approver->avatar);
                    }
                });
            }

            // Add full URLs for signatory avatars
            if ($group->signatories) {
                $group->signatories->each(function ($signatory) {
                    if ($signatory->avatar) {
                        $signatory->avatar = url($signatory->avatar);
                    }
                });
            }

            return response()->json([
                'success' => true,
                'message' => 'Group updated successfully',
                'data' => $group
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Group update failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'group_id' => $id,
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update group',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $group = Group::find($id);

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Group not found'
            ], 404);
        }

        DB::beginTransaction();
        try {
            // Delete cover image if exists
            if ($group->group_image && file_exists(public_path($group->group_image))) {
                unlink(public_path($group->group_image));
            }

            // Delete all relationships
            GroupDetails::where('group_id', $group->id)->delete();
            GroupApprover::where('group_id', $group->id)->delete();
            GroupSignatories::where('group_id', $group->id)->delete();

            // Delete the group
            $group->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Group deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Group deletion failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'group_id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete group',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get group statistics
     */
    public function stats()
    {
        try {
            $totalGroups = Group::count();
            $activeGroups = Group::where('status', 'active')->count();
            $totalCapacity = Group::sum('capacity');
            $totalMembers = DB::table('group_details')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_groups' => $totalGroups,
                    'active_groups' => $activeGroups,
                    'total_capacity' => $totalCapacity,
                    'total_members' => $totalMembers,
                    'utilization_rate' => $totalCapacity > 0 ? round(($totalMembers / $totalCapacity) * 100, 2) : 0,
                ],
                'message' => 'Group statistics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch group stats: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve group statistics',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}