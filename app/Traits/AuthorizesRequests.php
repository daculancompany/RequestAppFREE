<?php

namespace App\Traits;

use App\Models\GroupApprover;

trait AuthorizesRequests
{
    /**
     * Check authorization and return specific error message
     * Returns: null if authorized, error message string if not
     */
    protected function checkRequestAuthorization($groupId, $status): ?string
    {
        $userId = auth()->id();
        
        if (!$userId) {
            return 'Not authenticated';
        }
        
        // Check if user is a group approver
        $isApprover = GroupApprover::where('group_id', $groupId)
            ->where('user_id', $userId)
            ->exists();
        
        if (!$isApprover) {
            return 'You are not authorized to process requests for this group';
        }
        
        if ($status !== 'pending') {
            return 'Request has already been processed';
        }
        
        return null; // Authorized - no error
    }
    
    /**
     * Simple boolean check (for backward compatibility)
     */
    protected function canProcessRequest($groupId, $status = 'pending'): bool
    {
        return $this->checkRequestAuthorization($groupId, $status) === null;
    }
    
    /**
     * Check and return proper JSON error
     */
    protected function authorizeWithResponse($groupId, $status)
    {
        $error = $this->checkRequestAuthorization($groupId, $status);
        
        if ($error) {
            return response()->json([
                'success' => false,
                'message' => $error
            ], 403);
        }
        
        return null;
    }
}