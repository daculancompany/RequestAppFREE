<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PositionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('positions')->insert([
            ['position' => 'Legal Counsel'],
            ['position' => 'Compliance Officer'],
            ['position' => 'HR Manager'],
            ['position' => 'Office Administrator'],
            ['position' => 'Chief Financial Officer (CFO)'],
            ['position' => 'Finance Analyst'],
            ['position' => 'Payroll Officer'],
            ['position' => 'IT Manager'],
            ['position' => 'Network Administrator'],
            ['position' => 'Systems Analyst'],
        ]);
    }
}
