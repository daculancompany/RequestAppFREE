<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TravelDay extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'date_from',
        'date_to',
        'transportation',
        'per_diem',
        'notes',
        'place_of_travel'
    ];

    protected $casts = [
        'date_from' => 'date',
        'date_to' => 'date',
        'per_diem' => 'float'
    ];



    // public function getPerDiemAttribute($value)
    // {
    //     return (float) $value;
    // }

    /**
     * Get the request
     */
    public function request()
    {
        return $this->belongsTo(Request::class);
    }

    /**
     * Get duration in days
     */
    public function getDurationAttribute()
    {
        return $this->date_from->diffInDays($this->date_to) + 1;
    }

    /**
     * Get formatted date range
     */
    public function getFormattedDateRangeAttribute()
    {
        $from = $this->date_from->format('M d');
        $to = $this->date_to->format('M d, Y');
        return "{$from} - {$to}";
    }

    /**
     * Get formatted per diem
     */
    public function getFormattedPerDiemAttribute()
    {
        return '$' . number_format($this->per_diem, 2);
    }
}
