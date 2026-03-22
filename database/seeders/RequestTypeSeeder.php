<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RequestTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('request_type')->insert([
            ['request_type' => 'LEAVE OF OFFICE'],
            ['request_type' => 'TRAVEL ORDER']
        ]);
    }
}
