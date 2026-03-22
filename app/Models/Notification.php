<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'notifiable_type',
        'data',
        'read',
    ];

    protected $casts = [
        'data' => 'array',
        'read' => 'boolean',
    ];

    /**
     * Mark the notification as read
     */
    public function markAsRead()
    {
        if (is_null($this->read_at)) {
            $this->forceFill([
                'read' => true,
                'read_at' => $this->freshTimestamp()
            ])->save();
        }
    }

    /**
     * Mark the notification as unread
     */
    public function markAsUnread()
    {
        if (!is_null($this->read_at)) {
            $this->forceFill(['read' => false, 'read_at' => null])->save();
        }
    }

    /**
     * Determine if a notification has been read
     */
    public function read()
    {
        return $this->read;
    }

    /**
     * Determine if a notification has not been read
     */
    public function unread()
    {
        return !$this->read;
    }

    /**
     * Scope a query to only include read notifications
     */
    public function scopeRead($query)
    {
        return $query->where('read', true);
    }

    /**
     * Scope a query to only include unread notifications
     */
    public function scopeUnread($query)
    {
        return $query->where('read', false);
    }

    /**
     * Get the user that owns the notification
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }


}
