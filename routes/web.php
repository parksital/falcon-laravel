<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
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

        return Inertia::render('OverviewPage', [
            'vendor' => [
                'id' => $vendor->id,
                'title' => $vendor->name,
                'slug' => $vendor->slug,
                'location' => $vendor->location,
                'short_description' => $vendor->short_description,
                'is_public' => (bool) $vendor->is_public,
                'created_at' => $vendor->created_at?->format('F j, Y'),
            ],
            'services' => $vendor->services
                ->map(fn ($service) => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'category' => $service->category,
                    'category_label' => $service->category === 'other'
                        ? $service->customCategory?->name ?? config('service_categories.other')
                        : config("service_categories.{$service->category}", $service->category),
                    'price_in_minor' => $service->price_in_minor,
                    'unit' => $service->unit,
                    'is_public' => (bool) $service->is_public,
                ])
                ->all(),
            'serviceCategories' => collect(config('service_categories'))
                ->map(fn (string $label, string $value) => [
                    'value' => $value,
                    'label' => $label,
                ])
                ->values()
                ->all(),
        ]);
    })->name('overview');

    Route::redirect('/vendor/profile', '/overview')->name('vendor.profile');

    Route::get('/services', function (Request $request) {
        if (! $request->user()->vendor) {
            return to_route('vendor.onboarding');
        }

        return Inertia::render('ServicesPage');
    })->name('services.index');

    Route::post('/services', function (Request $request) {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return to_route('vendor.onboarding');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'category' => ['required', 'string', Rule::in(array_keys(config('service_categories')))],
            'custom_category' => ['nullable', 'required_if:category,other', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price_in_minor' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'unit' => ['nullable', 'string', Rule::in(['package', 'hour', 'person', 'day', 'event'])],
            'is_public' => ['boolean'],
        ]);

        $baseSlug = Str::slug($validated['name']) ?: 'service';
        $slug = $baseSlug;
        $suffix = 1;

        while ($vendor->services()->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        DB::transaction(function () use ($vendor, $validated, $slug) {
            $service = $vendor->services()->create([
                'name' => $validated['name'],
                'slug' => $slug,
                'category' => $validated['category'],
                'description' => $validated['description'] ?? null,
                'price_in_minor' => $validated['price_in_minor'],
                'unit' => $validated['unit'] ?? null,
                'is_public' => $validated['is_public'] ?? false,
            ]);

            if ($validated['category'] === 'other') {
                $service->customCategory()->create([
                    'name' => $validated['custom_category'],
                ]);
            }
        });

        return to_route('overview');
    })->name('services.store');

    Route::get('/settings', function (Request $request) {
        if (! $request->user()->vendor) {
            return to_route('vendor.onboarding');
        }

        return Inertia::render('SettingsPage');
    })->name('settings');

    Route::get('/products', function (Request $request) {
        if (! $request->user()->vendor) {
            return to_route('vendor.onboarding');
        }

        return to_route('services.index');
    })->name('products.index');

    Route::get('/vendor/onboarding', function (Request $request) {
        $vendor = $request->user()->vendor;

        return Inertia::render('VendorOnboardingPage', [
            'initialValues' => [
                'business_name' => $vendor?->name ?? '',
                'location' => $vendor?->location ?? '',
            ],
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
