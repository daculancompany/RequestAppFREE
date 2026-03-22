<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupApprover extends Model
{
    protected $fillable = [
        'group_id',
        'user_id'
    ];

    function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
