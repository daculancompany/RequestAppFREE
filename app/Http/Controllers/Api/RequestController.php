<?php

namespace App\Http\Controllers\Api;

use App\Traits\AuthorizesRequests;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Request;
use App\Models\TravelDay;
use App\Models\RequestHistory;
use App\Http\Requests\StoreRequestRequest;
use App\Http\Requests\ActionRequestRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use App\Models\Group;
use App\Models\GroupApprover;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use App\Mail\RequestSubmittedMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;



class RequestController extends Controller
{
    use AuthorizesRequests;

    public function index(HttpRequest $request)
    {
        $user = Auth::user();
        $type = $request->query('type');
        $group_id = $request->query('group_id');
        $status = $request->query('status');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $search = $request->query('search');
        $perPage = $request->query('per_page', 10);
        $page = $request->query('page', 1);

        $baseQuery = Request::with([
            'user',
            'approverBy',
            'travelDays',
            'group.approvers',
            'group.signatories'
        ])->where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
                ->orWhereHas('group.approvers', function ($q) use ($user) {
                    $q->where('users.id', $user->id);
                })
                ->orWhereHas('group.signatories', function ($q) use ($user) {
                    $q->where('users.id', $user->id);
                });
        });

    
        if ($group_id) {
            $baseQuery->where('group_id', $group_id);
        }

        if ($startDate && $endDate) {
            $baseQuery->whereBetween('date_of_request', [$startDate, $endDate]);
        }

        if ($search) {
            $baseQuery->where(function ($q) use ($search) {
                $q->where('request_id', 'like', "%{$search}%")
                    ->orWhere('reason', 'like', "%{$search}%")
                    ->orWhere('purpose', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($type) {
            $baseQuery->where('type', $type);
        }

        if ($status) {
            $baseQuery->where('status', $status);
        }

       
        $requests = $baseQuery->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page)
            ->withQueryString();

        $response = [
            'success' => true,
            'data' => $requests->items(),
            'pagination' => [
                'current_page' => $requests->currentPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
                'last_page' => $requests->lastPage(),
                'from' => $requests->firstItem(),
                'to' => $requests->lastItem(),
            ],
            'filters' => [
                'type' => $type,
                'status' => $status,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'search' => $search
            ],
        ];
        if ($page == 1) {

            $countQuery = Request::where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereHas('group.approvers', function ($q) use ($user) {
                        $q->where('users.id', $user->id);
                    })
                    ->orWhereHas('group.signatories', function ($q) use ($user) {
                        $q->where('users.id', $user->id);
                    });
            });

            // Reapply non-type11114R4413324/status filters
            if ($group_id) {
                $countQuery->where('group_id', $group_id);
            }
            if ($startDate && $endDate) {
                $countQuery->whereBetween('date_of_request', [$startDate, $endDate]);
            }
            if ($search) {
                $countQuery->where(function ($q) use ($search) {
                    $q->where('request_id', 'like', "%{$search}%")
                        ->orWhere('reason', 'like', "%{$search}%")
                        ->orWhere('purpose', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        });
                });
            }

            // Get status counts in a single query
            $statusCounts = (clone $countQuery)
                ->selectRaw('COALESCE(status, "pending") as status, COUNT(*) as total')
                ->groupBy('status')
                ->get()
                ->pluck('total', 'status')
                ->toArray();

            // Get type counts in a single query
            $typeCounts = (clone $countQuery)
                ->selectRaw('COALESCE(type, "leave") as type, COUNT(*) as total')
                ->groupBy('type')
                ->get()
                ->pluck('total', 'type')
                ->toArray();

            $response['status_counts'] = [
                'pending' => $statusCounts['pending'] ?? 0,
                'approved' => $statusCounts['approved'] ?? 0,
                'rejected' => $statusCounts['rejected'] ?? 0,
                'cancelled' => $statusCounts['cancelled'] ?? 0,
            ];

            $response['type_counts'] = [
                'all' => array_sum($typeCounts),
                'leave' => $typeCounts['leave'] ?? 0,
                'travel' => $typeCounts['travel'] ?? 0,
            ];
        }

        return response()->json($response);
    }


    public function calendarView(HttpRequest $request)
    {
        $user = Auth::user();
        $type = $request->query('type');
        $group_id = $request->query('group_id');
        $status = $request->query('status');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $search = $request->query('search');

        $query = Request::with(['user', 'approverBy', 'travelDays', 'group'])
            ->where(function ($q) use ($group_id, $user) {
                $q->where('group_id', $group_id)
                    ->orWhereHas(
                        'group.approvers',
                        fn($q) =>
                        $q->where('users.id', $user->id)
                    )
                    ->orWhereHas(
                        'group.signatories',
                        fn($q) =>
                        $q->where('users.id', $user->id)
                    );
            });
        //$query = Request::with(['user', 'approver', 'travelDays', 'group']);

        // if ($group_id) {
        //     $query->where('group_id', $group_id);
        // }

        if ($type && $type !== 'all') {
            $query->where('type', $type);
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        // Fix the date filtering
        if ($startDate && $endDate) {
            $query->where(function ($q) use ($startDate, $endDate) {
                // Requests that start within the date range
                $q->whereBetween('date_of_request', [$startDate, $endDate])
                    // Requests that end within the date range (for multi-day requests)
                    ->orWhere(function ($subQuery) use ($startDate, $endDate) {
                        $subQuery->whereNotNull('total_days')
                            ->whereRaw('DATE_ADD(date_of_request, INTERVAL (total_days - 1) DAY) BETWEEN ? AND ?', [$startDate, $endDate]);
                    })
                    // Travel days that fall within the date range
                    ->orWhereHas('travelDays', function ($subQuery) use ($startDate, $endDate) {
                        $subQuery->where(function ($travelQuery) use ($startDate, $endDate) {
                            $travelQuery->whereBetween('date_of_request', [$startDate, $endDate])
                                ->orWhereBetween('date_from', [$startDate, $endDate])
                                ->orWhereBetween('date_to', [$startDate, $endDate]);
                        });
                    });
            });
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('request_id', 'like', "%{$search}%")
                    ->orWhere('reason', 'like', "%{$search}%")
                    ->orWhere('purpose', 'like', "%{$search}%")
                    ->orWhere('place_of_travel', 'like', "%{$search}%")
                    ->orWhere('remarks', 'like', "%{$search}%")
                    ->orWhereHas('user', fn($q) => $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('employee_id', 'like', "%{$search}%"));
            });
        }

        $requests = $query->orderBy('date_of_request', 'asc')
            ->orderBy('time_out', 'asc')
            ->get();

        $monthStart = $startDate ? date('F Y', strtotime($startDate)) : null;
        $monthEnd = $endDate ? date('F Y', strtotime($endDate)) : null;

        return response()->json([
            'success' => true,
            'data' => $requests,
            'meta' => [
                'total' => $requests->count(),
                'month' => $monthStart,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'filters_applied' => [
                    'type' => $type,
                    'status' => $status,
                    'group_id' => $group_id,
                    'search' => $search
                ]
            ]
        ]);
    }


    public function store(StoreRequestRequest $httpRequest)
    {
        DB::beginTransaction();
        try {
            $user = Auth::user();
            $data = $httpRequest->validated();

            $request = Request::create([
                'user_id' => $user->id,
                'group_id' => $httpRequest->group_id,
                'approver_id' => null,
                'type' => $data['type'],
                'date_of_request' => $data['date_of_request'],
                'reason' => $data['reason'] ?? null,
                'purpose' => $data['purpose'] ?? null,
                'remarks' => $data['remarks'] ?? null,
                'time_out' => isset($data['time_out']) ? Carbon::parse($data['time_out'])->format('H:i:s') : null,
                'expected_time_in' => isset($data['expected_time_in']) ? Carbon::parse($data['expected_time_in'])->format('H:i:s') : null,
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            $typeLabels = [
                'leave' => 'Leave of Office',
                'travel' => 'Travel Order'
            ];
            $typeLabel = $typeLabels[$request->type] ?? ucfirst($request->type);
            $group = $request->group()->with(['approvers', 'signatories'])->first();

            $notifiableUsers = collect()
                ->merge($group->approvers)
                ->merge($group->signatories)
                ->unique('id')
                ->reject(fn($u) => $u->id === $user->id);

            foreach ($notifiableUsers as $notifiableUser) {
                Notification::create([
                    'user_id' => $notifiableUser->id,
                    'notifiable_type' => $request->type,
                    'data' => [
                        'title' => $typeLabel,
                        'message' => 'New ' . $typeLabel . ' request from ' . $user->fname,
                        'id' => $request->id,
                        'type' => $request->type,
                    ],
                    'read' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }


            if ($data['type'] === 'travel' && isset($data['travel_days'])) {
                $totalDays = 0;
                $travelDaysData = [];

                foreach ($data['travel_days'] as $day) {
                    $from = Carbon::parse($day['from']);
                    $to = Carbon::parse($day['to']);
                    $duration = $from->diffInDays($to) + 1;
                    $totalDays += $duration;
                    $place_of_travel = $day['place_of_travel'];

                    $travelDaysData[] = [
                        'request_id' => $request->id,
                        'date_from' => $from,
                        'date_to' => $to,
                        'place_of_travel' => $place_of_travel  ?? null,
                        'transportation' => $day['transportation'],
                        'per_diem' => $day['per_diem'],
                        'notes' => $day['notes'] ?? null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                TravelDay::insert($travelDaysData);
                $request->update(['total_days' => $totalDays]);
            }

            // Handle signature upload
            if ($httpRequest->hasFile('signature')) {
                $signaturePath = $httpRequest->file('signature')->store('signatures', 'public');
                $request->update([
                    'signature_path' => $signaturePath,
                    'uses_default_signature' => false
                ]);
            }

        
            RequestHistory::create([
                'request_id' => $request->id,
                'user_id' => $user->id,
                'action' => 'created',
                'description' => 'Request created and submitted for approval',
                'changes' => [
                    'status' => [
                        'from' => null,
                        'to' => 'pending'
                    ]
                ]
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Request submitted successfully',
                'data' => $request->load(['user', 'travelDays'])
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

   
  


    public function updateStatus222222(ActionRequestRequest $httpRequest, $id) //: JsonResponse
    {
        $model = Request::find($id);
        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Request not found'
            ], Response::HTTP_NOT_FOUND);
        }

        $userId = Auth::id();
        $approver = GroupApprover::where('group_id', $model->group_id)->where('user_id', $userId)->first();
        if (!isset($approver)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not the assigned approver for this request'
            ], Response::HTTP_FORBIDDEN);
        }

        // Check if request is pending
        if ($model->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Request has already been processed'
            ], Response::HTTP_FORBIDDEN);
        }

        $validated = $httpRequest->validated();
        $action = $validated['action']; // 'approve' or 'reject'

        // Prepare update data
        $updateData = [
            'approver_id' => $userId,
            'comment' => $validated['comment'] ?? null,
        ];

        if ($action === 'approve') {
            $updateData['status'] = 'approved';
            $updateData['approved_at'] = now();
            $updateData['approved_by'] = $userId;
            $message = 'Request approved successfully';
        } else {
            $updateData['status'] = 'rejected';
            $updateData['rejected_at'] = now();
            $updateData['rejected_by'] = $userId;
            $updateData['rejection_reason'] = $validated['comment'] ?? null;
            $message = 'Request rejected successfully';
        }

        $model->update($updateData);

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $model->fresh()
        ]);
    }

    public function updateStatus(ActionRequestRequest $httpRequest, $id): JsonResponse
    {
        
        DB::beginTransaction();

        try {
            $model = Request::findOrFail($id);

            // Check authorization
            //$error = $this->checkRequestAuthorization($model->group_id, $model->status);
            $error = false;
            if ($error) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => $error
                ], 403);
            }

            $validated = $httpRequest->validated();
            $userId = Auth::id();
            $approver = Auth::user(); 

            $updateData = [
                'approver_id' => $userId,
                'comment' => $validated['comment'] ?? null,
                'status' => $validated['action'] === 'approve' ? 'approved' : 'rejected',
            ];

            if ($validated['action'] === 'approve') {
                $updateData['approved_at'] = now();
                $updateData['approved_by'] = $userId;
                $message = 'Request approved successfully';
            } else {
                $updateData['rejected_at'] = now();
                $updateData['rejected_by'] = $userId;
                $updateData['rejection_reason'] = $validated['comment'] ?? null;
                $message = 'Request rejected successfully';
            }

            $typeLabels = [
                'leave' => 'Leave of Office',
                'travel' => 'Travel Order',
            ];

            $typeLabel = $typeLabels[$model->type] ?? ucfirst($model->type);

            $actionText = $validated['action'] === 'approve'
                ? 'approved'
                : 'rejected';

            $messageText = $validated['action'] === 'approve'
                ? "Your {$typeLabel} request has been approved."
                : "Your {$typeLabel} request has been rejected.";

            // Create in-app notification
            Notification::create([
                'user_id' => $model->user_id,
                'notifiable_type' => $model->type,
                'data' => [
                    'title' => "{$typeLabel} {$actionText}",
                    'message' => $messageText,
                    'id' => $model->id,
                    'type' => $model->type,
                    'status' => $model->status,
                ],
                'read' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

           

            $model->update($updateData);

   
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $model->fresh(['user', 'approver', 'travelDays'])
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Request not found'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Update status failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to process request',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

   
    public function approve($id)
    {
        $request = Request::findOrFail($id);
        $user = Auth::user();

    
        if ($request->approver_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to approve this request'
            ], 403);
        }

        if ($request->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Request is not pending approval'
            ], 400);
        }

        DB::beginTransaction();

        try {
            $request->update([
                'status' => 'approved',
                'approved_at' => now()
            ]);

  
            RequestHistory::create([
                'request_id' => $request->id,
                'user_id' => $user->id,
                'action' => 'approved',
                'description' => 'Request approved by ' . $user->name,
                'changes' => [
                    'status' => [
                        'from' => 'pending',
                        'to' => 'approved'
                    ]
                ]
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Request approved successfully',
                'data' => $request
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to approve request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

  
    public function reject(HttpRequest $httpRequest, $id)
    {
        $request = Request::findOrFail($id);
        $user = Auth::user();

   
        if ($request->approver_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to reject this request'
            ], 403);
        }

        if ($request->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Request is not pending approval'
            ], 400);
        }

        $rejectionReason = $httpRequest->validate([
            'reason' => 'required|string|max:500'
        ])['reason'];

        DB::beginTransaction();

        try {
            $request->update([
                'status' => 'rejected',
                'rejected_at' => now(),
                'remarks' => $rejectionReason
            ]);

            // Create history record
            RequestHistory::create([
                'request_id' => $request->id,
                'user_id' => $user->id,
                'action' => 'rejected',
                'description' => 'Request rejected: ' . $rejectionReason,
                'changes' => [
                    'status' => [
                        'from' => 'pending',
                        'to' => 'rejected'
                    ]
                ]
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Request rejected successfully',
                'data' => $request
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to reject request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cancel($id)
    {
        $request = Request::findOrFail($id);
        $user = Auth::user();


        if ($request->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to cancel this request'
            ], 403);
        }

        if ($request->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending requests can be cancelled'
            ], 400);
        }

        DB::beginTransaction();

        try {
            $request->update([
                'status' => 'cancelled'
            ]);

            // Create history record
            RequestHistory::create([
                'request_id' => $request->id,
                'user_id' => $user->id,
                'action' => 'cancelled',
                'description' => 'Request cancelled by requester',
                'changes' => [
                    'status' => [
                        'from' => 'pending',
                        'to' => 'cancelled'
                    ]
                ]
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Request cancelled successfully',
                'data' => $request
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard statistics
     */
    public function dashboard()
    {
        $user = Auth::user();

        $stats = [
            'total' => 0,
            'pending' => 0,
            'approved' => 0,
            'rejected' => 0,
            'leave' => 0,
            'travel' => 0,
        ];

        if ($user->role === 'admin') {
            $stats['total'] = Request::count();
            $stats['pending'] = Request::where('status', 'pending')->count();
            $stats['approved'] = Request::where('status', 'approved')->count();
            $stats['rejected'] = Request::where('status', 'rejected')->count();
            $stats['leave'] = Request::where('type', 'leave')->count();
            $stats['travel'] = Request::where('type', 'travel')->count();
            $stats['awaiting_approval'] = Request::where('status', 'pending')->count();
        } else {

            $stats['total'] = $user->submittedRequests()->count();
            $stats['pending'] = $user->submittedRequests()->where('status', 'pending')->count();
            $stats['approved'] = $user->submittedRequests()->where('status', 'approved')->count();
            $stats['rejected'] = $user->submittedRequests()->where('status', 'rejected')->count();
            $stats['leave'] = $user->submittedRequests()->where('type', 'leave')->count();
            $stats['travel'] = $user->submittedRequests()->where('type', 'travel')->count();

            // If user is an approver
            if ($user->subordinates()->exists() || $user->role === 'manager') {
                $stats['awaiting_approval'] = Request::where('approver_id', $user->id)
                    ->where('status', 'pending')
                    ->count();
            }
        }

        // Recent requests
        $recentRequests = Request::with(['user:id,name'])
            ->when($user->role !== 'admin', function ($q) use ($user) {
                return $q->where('user_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Monthly statistics
        $monthlyStats = Request::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('COUNT(*) as total'),
            DB::raw('SUM(CASE WHEN type = "leave" THEN 1 ELSE 0 END) as leave_count'),
            DB::raw('SUM(CASE WHEN type = "travel" THEN 1 ELSE 0 END) as travel_count')
        )
            ->when($user->role !== 'admin', function ($q) use ($user) {
                return $q->where('user_id', $user->id);
            })
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(6)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_requests' => $recentRequests,
                'monthly_stats' => $monthlyStats
            ]
        ]);
    }

  
    public function getApprovers()
    {
        $user = Auth::user();


        $approvers = \App\Models\User::where('role', 'manager')
            ->orWhere('role', 'supervisor')
            ->orWhere('role', 'admin')
            ->where('id', '!=', $user->id)
            ->select('id', 'name', 'email', 'position', 'department')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $approvers
        ]);
    }

    /**
     * Get default approver for user
     */
    private function getDefaultApprover($user)
    {

        $defaultApprover = \App\Models\User::where('department', $user->department)
            ->where('role', 'manager')
            ->first();

        return $defaultApprover ? $defaultApprover->id : null;
    }

   
    public function export(HttpRequest $request)
    {
        $type = $request->query('type', 'pdf');
        $filters = $request->only(['type', 'status', 'start_date', 'end_date']);

        $query = Request::with(['user', 'approver', 'travelDays'])
            ->when(Auth::user()->role !== 'admin', function ($q) {
                return $q->where('user_id', Auth::id());
            });


        foreach ($filters as $key => $value) {
            if ($value) {
                $query->where($key, $value);
            }
        }

        $requests = $query->orderBy('created_at', 'desc')->get();


        return response()->json([
            'success' => true,
            'data' => $requests,
            'filters' => $filters,
            'export_type' => $type
        ]);
    }
}
