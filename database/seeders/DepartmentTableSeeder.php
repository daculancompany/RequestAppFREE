<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('departments')->insert([
            ['department' => 'Legal & Compliance'],
            ['department' => 'Human Resources (HR)'],
            ['department' => 'Finance / Accounting'],
            ['department' => 'Information Technology'],
            ['department' => 'Operations / Production'],
        ]);
    }
}
