<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

class RequestSeeder extends Seeder
{
    public function run()
    {
        $data = [];

        for ($i = 1; $i <=  3000; $i++) {

            $type = rand(0, 1) ? 'leave' : 'travel';
            $status = collect(['pending', 'approved', 'rejected'])->random();

            $submittedAt = Carbon::now()->subDays(rand(1, 30));

            $approvedAt = $status === 'approved'
                ? (clone $submittedAt)->addDays(rand(1, 3))
                : null;

            $rejectedAt = $status === 'rejected'
                ? (clone $submittedAt)->addDays(rand(1, 3))
                : null;

            $data[] = [
                'request_id' => 'REQ-' . now()->year . '-' . Str::uuid(), // ✅ guaranteed unique
                'user_id' => 18,
                'group_id' => 35,
                'approver_id' => 5,
                'type' => $type,
                'status' => $status,
                'date_of_request' => Carbon::now()->addDays(rand(1, 20)),

                'comment' => $type === 'leave' ? 'Personal request' : null,
                'reason' => $type === 'leave' ? 'Family matter' : null,
                'purpose' => $type === 'travel' ? 'Client meeting' : null,
                'remarks' => $status !== 'pending'
                    ? ucfirst($status) . ' by approver'
                    : null,

                'time_out' => $type === 'leave' ? '09:00:00' : null,
                'expected_time_in' => $type === 'leave' ? '15:00:00' : null,
                'total_days' => $type === 'travel' ? rand(1, 7) : null,

                'submitted_at' => $submittedAt,
                'approved_at' => $approvedAt,
                'rejected_at' => $rejectedAt,
                'created_at' => $submittedAt,
                'updated_at' => now(),
            ];
        }

        DB::table('requests')->insert($data);
    }
}
