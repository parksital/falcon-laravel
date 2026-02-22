<?php

namespace Database\Seeders;

use App\Models\BookingPage;
use App\Models\User;
use Illuminate\Database\Seeder;

class BookingPageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();

        if (! $user) {
            $user = User::factory()->create();
        }

        BookingPage::updateOrCreate(
            ['user_id' => $user->id, 'slug' => 'consulting-sessions'],
            [
                'title' => 'Consulting Sessions',
                'description' => 'Quick sessions for product strategy, design reviews, and roadmap planning.',
                'is_public' => true,
            ]
        );

        BookingPage::updateOrCreate(
            ['user_id' => $user->id, 'slug' => 'internal-planning'],
            [
                'title' => 'Internal Planning',
                'description' => 'Private planning sessions for internal stakeholders.',
                'is_public' => false,
            ]
        );
    }
}
