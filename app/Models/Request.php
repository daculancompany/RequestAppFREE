<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Request extends Model
{
    use HasFactory;

    protected $table = 'requests';

    protected $fillable = [
        'request_id',
        'group_id',
        'user_id',
        'approver_id',
        'type',
        'status',
        'date_of_request',
        'reason',
        'comment',
        'purpose',
        'remarks',
        'time_out',
        'expected_time_in',
        'total_days',
        'signature_path',
        'uses_default_signature',
        'submitted_at',
        'approved_at',
        'rejected_at'
    ];

    protected $casts = [
        'date_of_request' => 'date',
        'time_out' => 'datetime',
        'expected_time_in' => 'datetime',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'total_days' => 'integer',
        'uses_default_signature' => 'boolean'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->request_id)) {
                $model->request_id = 'REQ-' . now()->format('Ymd') . '-' . strtoupper(uniqid());
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }



    public function approvers()
    {
        return $this->belongsTo(GroupApprover::class, 'group_id', 'group_id');
    }

    public function approverBy()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }


    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id');
    }


    public function travelDays()
    {
        return $this->hasMany(TravelDay::class);
    }

    public function histories()
    {
        return $this->hasMany(RequestHistory::class);
    }

    public function scopeLeave($query)
    {
        return $query->where('type', 'leave');
    }

    /**
     * Scope for travel requests
     */
    public function scopeTravel($query)
    {
        return $query->where('type', 'travel');
    }

    /**
     * Scope for pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved requests
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Get formatted date
     */
    public function getFormattedDateOfRequestAttribute()
    {
        return $this->date_of_request->format('F d, Y');
    }

    /**
     * Get formatted time out
     */
    public function getFormattedTimeOutAttribute()
    {
        return $this->time_out ? $this->time_out->format('H:i') : null;
    }

    /**
     * Get formatted expected time in
     */
    public function getFormattedExpectedTimeInAttribute()
    {
        return $this->expected_time_in ? $this->expected_time_in->format('H:i') : null;
    }

    /**
     * Check if request is pending
     */
    public function getIsPendingAttribute()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if request is approved
     */
    public function getIsApprovedAttribute()
    {
        return $this->status === 'approved';
    }

    /**
     * Check if request is travel type
     */
    public function getIsTravelAttribute()
    {
        return $this->type === 'travel';
    }

    /**
     * Check if request is leave type
     */
    public function getIsLeaveAttribute()
    {
        return $this->type === 'leave';
    }
}
