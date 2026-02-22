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
                'phone' => '(555) 123-4567',
                'email' => 'events@example.com',
                'is_public' => true,
            ]
        );

        BookingPage::updateOrCreate(
            ['user_id' => $user->id, 'slug' => 'internal-planning'],
            [
                'title' => 'Internal Planning',
                'description' => 'Private planning sessions for internal stakeholders.',
                'phone' => '(555) 555-0101',
                'email' => 'ops@example.com',
                'is_public' => false,
            ]
        );
    }
}
