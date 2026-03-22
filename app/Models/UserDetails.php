<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserDetails extends Model
{
    protected $fillable = [
        'branch_id',
        'department_id',
        'position_id',
        'user_id',
        'address',
        'esignature',
    ];

    public function position()
    {
        return $this->belongsTo('App\Models\Position');
    }

    public function user()
    {
        return $this->belongsTo('App\Models\User');
    }

}
