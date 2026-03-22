<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequestRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    // In StoreRequestRequest.php
    public function rules()
    { 
        $rules = [
            'type' => 'required|in:leave,travel',
            'date_of_request' => 'required|date',
            'group_id' => 'required|exists:groups,id',
        ];

        if ($this->type === 'leave') {
            $rules['reason'] = 'required|string|max:500';
            $rules['time_out'] = 'required|date_format:H:i:s';
            $rules['expected_time_in'] = 'required|date_format:H:i:s|after:time_out';
            $rules['remarks'] = 'nullable|string|max:200';
        } else {
            //$rules['place_of_travel'] = 'required|string|max:255';
            $rules['purpose'] = 'required|string|max:500';
            $rules['travel_days'] = 'required|array|min:1';
            $rules['travel_days.*.from'] = 'required|date';
            $rules['travel_days.*.to'] = 'required|date|after_or_equal:travel_days.*.from';
            $rules['travel_days.*.transportation'] = 'required|in:company_vehicle,personal_vehicle,public_transport,airline,other';
            $rules['travel_days.*.per_diem'] = 'required|numeric|min:0';
            $rules['travel_days.*.place_of_travel'] = 'required|string';
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'travel_days.*.from.required' => 'Start date is required for each travel day',
            'travel_days.*.to.required' => 'End date is required for each travel day',
            'travel_days.*.to.after_or_equal' => 'End date must be after or equal to start date',
            'travel_days.*.per_diem.numeric' => 'Per diem must be a valid amount',
        ];
    }
}
