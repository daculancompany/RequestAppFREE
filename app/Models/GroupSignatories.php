<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupSignatories extends Model
{
    protected  $table = "group_signatory";
    protected $fillable = [
        'group_id',
        'user_id'
    ];
}
