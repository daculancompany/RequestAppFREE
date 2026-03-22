<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupDetails extends Model
{
    protected $fillable = [
        'group_id',
        'user_id'
    ];
}
