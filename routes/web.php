<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Http\Controllers\ServiceController;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Inertia\Inertia;

Route::get('/book/{slug}', function (string $slug) {
    return Inertia::render('PublicBookingPage', []);
});

Route::middleware('auth')->group(function () {
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

        return to_route('overview');
    })->name('home');

    Route::get('/dashboard', function (Request $request) {
        if (! $request->user()->vendor) {
            return to_route('vendor.onboarding');
        }

        return to_route('overview');
    })->name('dashboard');

    Route::get('/overview', function (Request $request) {
        if (! $request->user()->vendor) {
            return to_route('vendor.onboarding');
        }

        $vendor = $request->user()->vendor()->with('services.customCategory')->first();
        $serviceCategoryLabels = collect(config('service_categories'))
            ->mapWithKeys(function (string $value) {
                $translation = __("config-service-categories.{$value}");

                return [
                    $value => $translation === "config-service-categories.{$value}" ? $value : $translation,
                ];
            })
            ->all();

        return Inertia::render('OverviewPage', [
            'vendor' => [
                'id' => $vendor->id,
                'title' => $vendor->name,
                'slug' => $vendor->slug,
                'location' => $vendor->location,
                'short_description' => $vendor->short_description,
                'is_public' => (bool) $vendor->is_public,
                'created_at' => $vendor->created_at?->locale(app()->getLocale())->translatedFormat(__('overview.date_format')),
            ],
            'services' => $vendor->services
                ->map(fn ($service) => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'category' => $service->category,
                    'category_label' => $service->category === 'other'
                        ? ($service->customCategory?->name ?? $serviceCategoryLabels['other'] ?? $service->category)
                        : $serviceCategoryLabels[$service->category] ?? $service->category,
                    'custom_category' => $service->customCategory?->name,
                    'description' => $service->description,
                    'price_in_minor' => $service->price_in_minor,
                    'unit' => $service->unit,
                    'is_public' => (bool) $service->is_public,
                ])
                ->all(),
            'serviceCategories' => collect(config('service_categories'))
                ->map(fn (string $value) => [
                    'value' => $value,
                    'label' => $serviceCategoryLabels[$value] ?? $value,
                ])
                ->values()
                ->all(),
            'copy' => __('overview'),
        ]);
    })->name('overview');

    Route::redirect('/vendor/profile', '/overview')->name('vendor.profile');

    Route::post('/services', [ServiceController::class, 'store'])->name('services.store');
    Route::patch('/services/{service}', [ServiceController::class, 'update'])->name('services.update');
    Route::delete('/services/{service}', [ServiceController::class, 'destroy'])->name('services.destroy');

    Route::get('/settings', function (Request $request) {
        if (! $request->user()->vendor) {
            return to_route('vendor.onboarding');
        }

        return Inertia::render('SettingsPage', [
            'copy' => __('settings'),
        ]);
    })->name('settings');

    Route::get('/products', function (Request $request) {
        if (! $request->user()->vendor) {
            return to_route('vendor.onboarding');
        }

        return to_route('overview');
    })->name('products.index');

    Route::get('/vendor/onboarding', function (Request $request) {
        $vendor = $request->user()->vendor;

        return Inertia::render('VendorOnboardingPage', [
            'initialValues' => [
                'business_name' => $vendor?->name ?? '',
                'location' => $vendor?->location ?? '',
            ],
            'copy' => __('vendor-onboarding'),
        ]);
    })->name('vendor.onboarding');

    Route::post('/vendor/onboarding', function (Request $request) {
        $validated = $request->validate([
            'business_name' => ['required', 'string', 'max:120'],
            'location' => ['required', 'string', 'max:120'],
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
            'location' => $validated['location'],
        ];

        if ($vendor) {
            $vendor->update($attributes);
        } else {
            Vendor::create([
                'user_id' => $request->user()->id,
                ...$attributes,
            ]);
        }

        return to_route('overview');
    })->name('vendor.store');
});
