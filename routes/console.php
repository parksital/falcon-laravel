<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('falcon:make-admin {email} {--demote : Remove the admin role instead}', function (string $email) {
    $user = User::query()->where('email', $email)->first();

    if (! $user) {
        $this->error("No user found with email {$email}.");

        return 1;
    }

    // is_admin is not mass assignable on purpose, so set it directly.
    $user->is_admin = ! $this->option('demote');
    $user->save();

    $this->info($user->is_admin ? "{$email} is now an admin." : "{$email} is no longer an admin.");

    return 0;
})->purpose('Promote an existing user to admin, or demote with --demote');
