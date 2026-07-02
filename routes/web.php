<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Models\Merchant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

Route::get('/book/{slug}', function (string $slug) {
    return Inertia::render('PublicBookingPage', []);
});

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', function () {
        return to_route('dashboard');
    })->name('home');

    Route::get('/dashboard', function () {
        return Inertia::render('MerchantDashboardPage');
    })->name('dashboard');

    Route::get('/merchant/onboarding', function (Request $request) {
        $merchant = $request->user()->merchant;

        return Inertia::render('MerchantOnboardingPage', [
            'merchantTypes' => collect(config('merchant_types'))
                ->map(fn (string $label, string $value) => [
                    'value' => $value,
                    'label' => $label,
                ])
                ->values(),
            'initialValues' => [
                'business_name' => $merchant?->name ?? '',
                'business_type' => $merchant?->business_type ?? '',
                'contact_email' => $merchant?->contact_email ?? '',
                'short_description' => $merchant?->short_description ?? '',
            ],
        ]);
    })->name('merchant.onboarding');

    Route::post('/merchant/onboarding', function (Request $request) {
        $validated = $request->validate([
            'business_name' => ['required', 'string', 'max:120'],
            'business_type' => [
                'required',
                'string',
                Rule::in(array_keys(config('merchant_types'))),
            ],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'short_description' => ['nullable', 'string', 'max:1000'],
        ]);

        $merchant = $request->user()->merchant;
        $baseSlug = Str::slug($validated['business_name']) ?: 'merchant';
        $slug = $baseSlug;
        $suffix = 1;

        while (
            Merchant::query()
                ->where('slug', $slug)
                ->when(
                    $merchant,
                    fn ($query) => $query->whereKeyNot($merchant->id),
                )
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        $attributes = [
            'name' => $validated['business_name'],
            'slug' => $slug,
            'business_type' => $validated['business_type'],
            'contact_email' => $validated['contact_email'] ?: null,
            'short_description' => $validated['short_description'] ?: null,
        ];

        if ($merchant) {
            $merchant->update($attributes);
        } else {
            Merchant::create([
                'user_id' => $request->user()->id,
                ...$attributes,
            ]);
        }

        return to_route('dashboard');
    })->name('merchant.store');
});
