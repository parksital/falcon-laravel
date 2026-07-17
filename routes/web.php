<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Models\Vendor;
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
    Route::get('/', function (Request $request) {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return to_route('vendor.onboarding');
        }

        return to_route('dashboard');
    })->name('home');

    Route::get('/dashboard', function (Request $request) {
        if (! $request->user()->vendor) {
            return to_route('vendor.onboarding');
        }

        $vendor = $request->user()->vendor;

        return Inertia::render('VendorDashboardPage', [
            'vendor' => [
                'name' => $vendor->name,
                'category' => $vendor->category,
                'category_other' => $vendor->category_other,
                'category_label' => $vendor->category === 'other'
                    ? ($vendor->category_other ?: config('vendor_categories.other'))
                    : config("vendor_categories.{$vendor->category}", $vendor->category),
                'based_in' => $vendor->based_in,
                'contact_email' => $vendor->contact_email,
                'short_description' => $vendor->short_description,
                'is_public' => (bool) $vendor->is_public,
                'created_at' => $vendor->created_at?->toDateString(),
                'updated_at' => $vendor->updated_at?->toDateString(),
            ],
        ]);
    })->name('dashboard');

    Route::get('/vendor/onboarding', function (Request $request) {
        $vendor = $request->user()->vendor;

        return Inertia::render('VendorOnboardingPage', [
            'vendorCategories' => collect(config('vendor_categories'))
                ->map(fn (string $label, string $value) => [
                    'value' => $value,
                    'label' => $label,
                ])
                ->values(),
            'initialValues' => [
                'business_name' => $vendor?->name ?? '',
                'category' => $vendor?->category ?? '',
                'category_other' => $vendor?->category_other ?? '',
                'based_in' => $vendor?->based_in ?? '',
            ],
        ]);
    })->name('vendor.onboarding');

    Route::post('/vendor/onboarding', function (Request $request) {
        $validated = $request->validate([
            'business_name' => ['required', 'string', 'max:120'],
            'category' => [
                'required',
                'string',
                Rule::in(array_keys(config('vendor_categories'))),
            ],
            'category_other' => [
                'required_if:category,other',
                'nullable',
                'string',
                'max:120',
            ],
            'based_in' => ['required', 'string', 'max:120'],
        ]);

        $vendor = $request->user()->vendor;
        $baseSlug = Str::slug($validated['business_name']) ?: 'vendor';
        $slug = $baseSlug;
        $suffix = 1;

        while (
            Vendor::query()
                ->where('slug', $slug)
                ->when(
                    $vendor,
                    fn ($query) => $query->whereKeyNot($vendor->id),
                )
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        $attributes = [
            'name' => $validated['business_name'],
            'slug' => $slug,
            'category' => $validated['category'],
            'category_other' => $validated['category'] === 'other'
                ? $validated['category_other']
                : null,
            'based_in' => $validated['based_in'],
        ];

        if ($vendor) {
            $vendor->update($attributes);
        } else {
            Vendor::create([
                'user_id' => $request->user()->id,
                ...$attributes,
            ]);
        }

        return to_route('dashboard');
    })->name('vendor.store');
});
