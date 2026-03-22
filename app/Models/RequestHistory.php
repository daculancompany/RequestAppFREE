<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestHistory extends Model
{
    use HasFactory;

    protected $table = 'request_histories';
    
    protected $fillable = [
        'request_id',
        'user_id',
        'action',
        'description',
        'changes'
    ];

    protected $casts = [
        'changes' => 'array'
    ];

    /**
     * Get the request
     */
    public function request()
    {
        return $this->belongsTo(Request::class);
    }

    /**
     * Get the user who performed the action
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get formatted changes
     */
    public function getFormattedChangesAttribute()
    {
        if (empty($this->changes)) {
            return null;
        }

        $formatted = [];
        foreach ($this->changes as $field => $change) {
            $formatted[] = ucfirst(str_replace('_', ' ', $field)) . ': ' . 
                          $change['from'] . ' → ' . $change['to'];
        }

        return implode(', ', $formatted);
    }
}