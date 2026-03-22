<?php

namespace App\Policies;

use App\Models\Request;
use App\Models\User;
use App\Models\GroupApprover;

class RequestPolicy
{
    /**
     * Determine if the user can view the request.
     */
    public function view(User $user, Request $request): bool
    {
        // User can view if they created it OR they're a group approver
        return $user->id === $request->user_id || 
               $this->isGroupApprover($user, $request->group_id);
    }

    /**
     * Determine if the user can update the request.
     */
    public function update(User $user, Request $request): bool
    {
        // Only the creator can update, and only if pending
        return $user->id === $request->user_id && 
               $request->status === 'pending';
    }

    /**
     * Determine if the user can delete the request.
     */
    public function delete(User $user, Request $request): bool
    {
        // Only the creator can delete, and only if pending
        return $user->id === $request->user_id && 
               $request->status === 'pending';
    }

    /**
     * Determine if the user can approve the request.
     */
    public function approve(User $user, Request $request): bool
    {
        // User can approve if:
        // 1. They're a group approver for the request's group
        // 2. Request is pending
        return $this->isGroupApprover($user, $request->group_id) && 
               $request->status === 'pending';
    }

    /**
     * Determine if the user can reject the request.
     */
    public function reject(User $user, Request $request): bool
    {
        // Same logic as approve
        return $this->approve($user, $request);
    }

    /**
     * Determine if the user can process (approve/reject) the request.
     */
    public function process(User $user, Request $request): bool
    {
        // Alias for approve/reject
        return $this->approve($user, $request);
    }

    /**
     * Helper method to check if user is a group approver.
     */
    private function isGroupApprover(User $user, $groupId): bool
    {
        return GroupApprover::where('group_id', $groupId)
            ->where('user_id', $user->id)
            ->exists();
    }

    /**
     * Determine if the user can view any requests.
     */
    public function viewAny(User $user): bool
    {
        // Any authenticated user can view requests
        return true;
    }

    /**
     * Determine if the user can create requests.
     */
    public function create(User $user): bool
    {
        // Any authenticated user can create requests
        return true;
    }
}