<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Department;
use App\Models\Position;
use App\Models\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class GlobalController extends Controller
{
    public function getRoles()
    {
        return Role::all();
    }

    public function getDepartments()
    {
        return Department::all();
    }

    public function getPositions()
    {
        return Position::all();
    }

    public function printRequest($id)
    {
        //http://127.0.0.1:8000/requests/22/print
        $request = Request::with(['user.position','user.department', 'approverBy', 'approvers.user','travelDays'])->findOrFail($id);
        ///dd( $request->travelDays);
        $data = [
            'request' => $request,
            'title' => 'Request Details - ' . $request->request_id,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];
        $pdf = Pdf::loadView('prints.request', $data);
        $pdf->setPaper('a4', 'portrait');
        return $pdf->stream('request-' . $request->request_id . '.pdf');
    }
}
