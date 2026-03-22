<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Group extends Model
{
    protected $fillable = [
        'group_name',
        'group_code',
        'group_color',
        'group_image',
        'created_by'
    ];


    public function approvers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'group_approvers', 'group_id', 'user_id')
            ->withTimestamps();
    }

    /**
     * Get the signatories for the group.
     */
    public function signatories(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'group_signatory', 'group_id', 'user_id')
            ->withTimestamps();
    }


    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'group_details', 'group_id', 'user_id')
            ->withTimestamps();;
            //->withPivot(['status']);
    }
}
