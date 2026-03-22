<?php

namespace Database\Seeders;


use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('roles')->insert([
            ['id' => 2, 'name' => 'Research Program Officer (RPO)'],
            ['id' => 3, 'name' => 'Researcher'],
            ['id' => 4, 'name' => 'Other Research Officials (ORO)'],
            ['id' => 5, 'name' => 'Reviewer'],
            ['id' => 6, 'name' => 'Research Admin Officer'],
        ]);
    }
}
