<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ActionRequestRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'group_id' => 'required|exists:groups,id',
            'comment' => 'required|string|max:500',
            'action' => 'required|in:approve,reject',
        ];
    }

    public function messages()
    {
        return [
            'comment.required' => 'Please provide a comment for your action',
            'action.required' => 'Please specify an action (approve or reject)',
            'action.in' => 'Action must be either approve or reject',
        ];
    }
}
