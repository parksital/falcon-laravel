<?php

use App\Http\Controllers\Settings\LocaleController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Http\Controllers\PublicBookingPageController;
use App\Http\Controllers\ServiceController;
use App\Models\Service;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

Route::get('/index', function () {
    $serviceCategoryLabels = collect(config('service_categories'))
        ->mapWithKeys(function (string $value) {
            $translation = __("config-service-categories.{$value}");

            return [
                $value => $translation === "config-service-categories.{$value}" ? $value : $translation,
            ];
        })
        ->all();
    $serviceUnitLabels = collect(config('service_units'))
        ->mapWithKeys(function (string $value) {
            $translation = __("config-service-units.{$value}");

            return [
                $value => $translation === "config-service-units.{$value}" ? $value : $translation,
            ];
        })
        ->all();
    $publicServices = Service::query()
        ->with(['customCategory', 'vendor'])
        ->where('is_public', true)
        ->whereHas('vendor', fn ($query) => $query->where('is_public', true))
        ->orderBy('name')
        ->get();
    $copy = __('index');
    $schemaServices = $publicServices
        ->values()
        ->map(function (Service $service, int $index) use ($serviceCategoryLabels) {
            $offer = [
                '@type' => 'Offer',
                'position' => $index + 1,
                'url' => route('public.booking.service.show', [$service->vendor->slug, $service->slug]),
                'itemOffered' => [
                    '@type' => 'Service',
                    'name' => $service->name,
                    'description' => $service->description,
                    'category' => $service->category === 'other'
                        ? ($service->customCategory?->name ?? $serviceCategoryLabels['other'] ?? $service->category)
                        : $serviceCategoryLabels[$service->category] ?? $service->category,
                    'provider' => [
                        '@type' => 'LocalBusiness',
                        'name' => $service->vendor->name,
                        'url' => route('public.booking.show', $service->vendor->slug),
                    ],
                ],
            ];

            if ($service->price_in_minor !== null) {
                $offer['price'] = number_format($service->price_in_minor / 100, 2, '.', '');
                $offer['priceCurrency'] = 'EUR';
            }

            return $offer;
        })
        ->all();

    return Inertia::render('IndexPage', [
        'services' => $publicServices
            ->map(fn (Service $service) => [
                'id' => $service->id,
                'name' => $service->name,
                'category' => $service->category,
                'category_label' => $service->category === 'other'
                    ? ($service->customCategory?->name ?? $serviceCategoryLabels['other'] ?? $service->category)
                    : $serviceCategoryLabels[$service->category] ?? $service->category,
                'description' => $service->description,
                'price_in_minor' => $service->price_in_minor,
                'unit' => $service->unit,
                'unit_label' => $service->unit ? ($serviceUnitLabels[$service->unit] ?? $service->unit) : null,
                'vendor' => [
                    'name' => $service->vendor?->name,
                    'location' => $service->vendor?->location,
                ],
                'url' => route('public.booking.service.show', [$service->vendor->slug, $service->slug]),
            ])
            ->all(),
        'locale' => app()->getLocale(),
        'copy' => $copy,
    ])->withViewData(['seo' => [
        'title' => $copy['title'] ?? config('app.name'),
        'description' => $copy['meta_description'] ?? 'Discover public services from local vendors.',
        'canonical' => route('index'),
        'robots' => 'index, follow',
        'schema' => [
            '@context' => 'https://schema.org',
            '@type' => 'ItemList',
            'name' => $copy['services_heading'] ?? 'Services',
            'url' => route('index'),
            'numberOfItems' => count($schemaServices),
            'itemListElement' => $schemaServices,
        ],
    ]]);
})->name('index');

Route::get('/book/{slug}', [PublicBookingPageController::class, 'showVendor'])->name('public.booking.show');
Route::get('/book/{vendorSlug}/services/{serviceSlug}', [PublicBookingPageController::class, 'showService'])->name('public.booking.service.show');
Route::patch('locale', [LocaleController::class, 'update'])->name('locale.update');

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
        if (! $request->user()->vendor()->exists()) {
            return to_route('onboarding');
        }

        if (! $request->user()->vendor->services()->exists()) {
            return to_route('onboarding');
        }

        return to_route('overview');
    })->name('home');

    Route::get('/dashboard', function (Request $request) {
        if (! $request->user()->vendor()->exists()) {
            return to_route('onboarding');
        }

        if (! $request->user()->vendor->services()->exists()) {
            return to_route('onboarding');
        }

        return to_route('overview');
    })->name('dashboard');

    Route::get('/overview', function (Request $request) {
        if (! $request->user()->vendor()->exists()) {
            return to_route('onboarding');
        }

        if (! $request->user()->vendor->services()->exists()) {
            return to_route('onboarding');
        }

        $vendor = $request->user()->vendor()->first();

        $services = Service::query()
            ->where('vendor_id', $vendor->id)
            ->withCount('pricingOptions')
            ->get();

        $serviceCategoryLabels = collect(config('service_categories'))
            ->mapWithKeys(function (string $value) {
                $translation = __("config-service-categories.{$value}");

                return [
                    $value => $translation === "config-service-categories.{$value}" ? $value : $translation,
                ];
            })
            ->all();

        $serviceUnitLabels = collect(config('service_units'))
            ->mapWithKeys(function (string $value) {
                $translation = __("config-service-units.{$value}");

                return [
                    $value => $translation === "config-service-units.{$value}" ? $value : $translation,
                ];
            })
            ->all();

        return Inertia::render('OverviewPage', [
            'vendor' => [
                ...$vendor->toArray(),
                'is_public' => (bool) $vendor->is_public,
                'created_at' => $vendor->created_at?->locale(app()->getLocale())->translatedFormat(__('overview.date_format')),
            ],
            'services' => $services
                ->map(fn ($service) => [
                    ...$service->toArray(),
                    'category_label' => $serviceCategoryLabels[$service->category] ?? $service->category,
                    'pricing_options_label' => trans_choice(
                        "overview.services_table_pricing_value",
                        $service->pricing_options_count,
                        ['value' => $service->pricing_options_count]
                    ),
                    'description' => $service->description,
                    'is_public' => (bool) $service->is_public,
                ]),
            'serviceCategories' => collect(config('service_categories'))
                ->map(fn (string $value) => [
                    'value' => $value,
                    'label' => $serviceCategoryLabels[$value] ?? $value,
                ])
                ->values()
                ->all(),
            'serviceUnits' => collect(config('service_units'))
                ->map(fn (string $value) => [
                    'value' => $value,
                    'label' => $serviceUnitLabels[$value] ?? $value,
                ])
                ->values()
                ->all(),
            'copy' => __('overview'),
        ]);
    })->name('overview');

    Route::redirect('/vendor/profile', '/overview')->name('vendor.profile');

    Route::get('/services/create', [ServiceController::class, 'create'])->name('services.create');
    Route::get('/services/{service}', function (Request $request, Service $service) {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return to_route('onboarding');
        }

        abort_unless($service->vendor_id === $vendor->id, 404);

        return Inertia::render('ServiceDetailsPage');
    })->name('services.show');

    Route::post('/services', [ServiceController::class, 'store'])->name('services.store');
    Route::patch('/services/{service}', [ServiceController::class, 'update'])->name('services.update');
    Route::delete('/services/{service}', [ServiceController::class, 'destroy'])->name('services.destroy');

    Route::get('/settings', function (Request $request) {
        if (! $request->user()->vendor()->exists()) {
            return to_route('onboarding');
        }

        return Inertia::render('SettingsPage', [
            'copy' => __('settings'),
        ]);
    })->name('settings');

    Route::get('/products', function (Request $request) {
        if (! $request->user()->vendor()->exists()) {
            return to_route('onboarding');
        }

        return to_route('overview');
    })->name('products.index');

    Route::get('/onboarding', function (Request $request) {
        if (! $request->user()->vendor()->exists()) {
            return to_route('onboarding.vendor.show');
        }

        if (! $request->user()->vendor->services()->exists()) {
            return to_route('onboarding.service.show');
        }

        return to_route('overview');
    })->name('onboarding');

    Route::get('/onboarding/vendor', function (Request $request) {
        if ($request->user()->vendor()->exists()) {
            return to_route('onboarding');
        }

        return Inertia::render('VendorOnboardingPage', [
            'copy' => __('vendor-onboarding'),
        ]);
    })->name('onboarding.vendor.show');

    Route::post('/onboarding/vendor', function (Request $request) {
        if ($request->user()->vendor()->exists()) {
            return to_route('onboarding');
        }

        $validated = $request->validate([
            'business_name' => ['required', 'string', 'max:120'],
        ]);

        $baseSlug = Str::slug($validated['business_name']) ?: 'vendor';
        $slug = $baseSlug;
        $suffix = 1;

        while (
            Vendor::query()
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        Vendor::create([
            'user_id' => $request->user()->id,
            'name' => $validated['business_name'],
            'slug' => $slug,
            'location' => '',
        ]);

        return to_route('onboarding.service.show');
    })->name('onboarding.vendor.store');

    Route::get('/onboarding/service', function (Request $request) {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return to_route('onboarding.vendor.show');
        }

        if ($vendor->services()->exists()) {
            return to_route('overview');
        }

        $serviceCategoryLabels = collect(config('service_categories'))
            ->mapWithKeys(function (string $value) {
                $translation = __("config-service-categories.{$value}");

                return [
                    $value => $translation === "config-service-categories.{$value}" ? $value : $translation,
                ];
            })
            ->all();
        $serviceUnitLabels = collect(config('service_units'))
            ->mapWithKeys(function (string $value) {
                $translation = __("config-service-units.{$value}");

                return [
                    $value => $translation === "config-service-units.{$value}" ? $value : $translation,
                ];
            })
            ->all();

        return Inertia::render('ServiceOnboardingPage', [
            'vendor' => [
                'name' => $vendor->name,
            ],
            'serviceCategories' => collect(config('service_categories'))
                ->map(fn (string $value) => [
                    'value' => $value,
                    'label' => $serviceCategoryLabels[$value] ?? $value,
                ])
                ->values()
                ->all(),
            'serviceUnits' => collect(config('service_units'))
                ->map(fn (string $value) => [
                    'value' => $value,
                    'label' => $serviceUnitLabels[$value] ?? $value,
                ])
                ->values()
                ->all(),
            'copy' => __('service-onboarding'),
        ]);
    })->name('onboarding.service.show');

    Route::post('/onboarding/service', function (Request $request) {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return to_route('onboarding.vendor.show');
        }

        if ($vendor->services()->exists()) {
            return to_route('overview');
        }

        $validated = $request->validate([
            'service_name' => ['required', 'string', 'max:120'],
            'service_category' => ['required', 'string', Rule::in(config('service_categories'))],
            'service_custom_category' => ['nullable', 'required_if:service_category,other', 'string', 'max:120'],
            'service_description' => ['nullable', 'string', 'max:2000'],
            'service_price_in_minor' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'service_unit' => ['required', 'string', Rule::in(config('service_units'))],
        ]);

        DB::transaction(function () use ($validated, $vendor) {
            $baseSlug = Str::slug($validated['service_name']) ?: 'service';
            $slug = $baseSlug;
            $suffix = 1;

            while (
                $vendor->services()
                    ->where('slug', $slug)
                    ->exists()
            ) {
                $slug = $baseSlug.'-'.$suffix;
                $suffix++;
            }

            $service = $vendor->services()->create([
                'name' => $validated['service_name'],
                'slug' => $slug,
                'category' => $validated['service_category'],
                'description' => $validated['service_description'] ?? null,
            ]);

            if ($validated['service_category'] === 'other') {
                $service->customCategory()->create([
                    'name' => $validated['service_custom_category'],
                ]);
            }

            DB::table('service_pricing_options')->insert([
                'service_id' => $service->id,
                'name' => $validated['service_name'],
                'description' => null,
                'price_in_minor' => $validated['service_price_in_minor'],
                'unit' => $validated['service_unit'],
                'sort_order' => 0,
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return to_route('overview');
    })->name('onboarding.service.store');
});
