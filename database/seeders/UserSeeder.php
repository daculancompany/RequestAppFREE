<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
            'settings' => json_encode([
                'theme' => 'default',
                'dark_mode' => false,
                'notifications' => true,
            ]),
        ]);

        // Create some test users
        User::factory(10)->create();
    }
}