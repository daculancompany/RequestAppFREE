<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'avatar',
        'branch_id',
        'department_id',
        'position_id',
        'address',
        'esignature',
        'fname',
        'lname',
        'mname',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'settings' => 'array',
    ];

    /**
     * Create a new personal access token for the user.
     */
    public function createToken(string $name, array $abilities = ['*'])
    {
        $token = $this->tokens()->create([
            'name' => $name,
            'token' => hash('sha256', $plainTextToken = \Str::random(40)),
            'abilities' => $abilities,
            'expires_at' => now()->addDays(7), // Token expires in 7 days
        ]);

        return new \Laravel\Sanctum\NewAccessToken($token, $token->getKey() . '|' . $plainTextToken);
    }





    public function position()
    {
        return $this->belongsTo('App\Models\Position');
    }

    public function department()
    {
        return $this->belongsTo('App\Models\Department');
    }

    public function branch()
    {
        return $this->belongsTo('App\Models\Branch');
    }

    /**
     * Get requests submitted by the user
     */
    public function submittedRequests()
    {
        return $this->hasMany(Request::class, 'user_id');
    }

    /**
     * Get requests to be approved by the user
     */
    public function approvalRequests()
    {
        return $this->hasMany(Request::class, 'approver_id');
    }

    /**
     * Get request histories
     */
    public function requestHistories()
    {
        return $this->hasMany(RequestHistory::class);
    }

    // Helper methods
    public function getPendingApprovalCountAttribute()
    {
        return $this->approvalRequests()->where('status', 'pending')->count();
    }

    public function getTotalSubmittedRequestsAttribute()
    {
        return $this->submittedRequests()->count();
    }
}
