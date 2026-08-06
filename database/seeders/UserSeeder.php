<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'info@huurmaar.nl'],
            [
                'name' => 'Huurmaar',
                'password' => 'password',
                'email_verified_at' => now(),
            ],
        );

        User::firstOrCreate(
            ['email' => 'info@pastadellanonna.nl'],
            [
                'name' => 'Pasta Della Nonna',
                'password' => 'password',
                'email_verified_at' => now(),
            ],
        );
    }
}
