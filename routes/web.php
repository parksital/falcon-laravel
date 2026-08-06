<?php

use App\Http\Controllers\PublicBookingPageController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\Settings\LocaleController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Models\Service;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
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

    $pricingStructureLabels = collect(config('service_pricing_structures'))
        ->flatten()
        ->unique()
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
                'unit_label' => $service->unit ? ($pricingStructureLabels[$service->unit] ?? $service->unit) : null,
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

Route::get('/book/{vendorSlug}/services/{serviceSlug}', fn (string $vendorSlug, string $serviceSlug) => redirect()->route(
    'public.booking.service.show',
    ['vendorSlug' => $vendorSlug, 'serviceSlug' => $serviceSlug],
    301,
));
Route::get('/book/{vendorSlug}', fn (string $vendorSlug) => redirect()->route(
    'public.booking.show',
    ['vendorSlug' => $vendorSlug],
    301,
));
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

        return to_route('overview');
    })->name('home');

    Route::get('/dashboard', function (Request $request) {
        if (! $request->user()->vendor()->exists()) {
            return to_route('onboarding');
        }

        return to_route('overview');
    })->name('dashboard');

    Route::get('/overview', function (Request $request) {
        if (! $request->user()->vendor()->exists()) {
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

        return Inertia::render('OverviewPage', [
            'vendor' => [
                ...$vendor->toArray(),
                'is_public' => (bool) $vendor->is_public,
                'public_url' => route('public.booking.show', $vendor->slug),
            ],
            'services' => $services
                ->map(fn ($service) => [
                    ...$service->toArray(),
                    'category_label' => $serviceCategoryLabels[$service->category] ?? $service->category,
                    'pricing_options_label' => trans_choice(
                        'overview.services_table_pricing_value',
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
            'pricingStructuresByCategory' => collect(config('service_categories'))
                ->mapWithKeys(fn (string $category) => [
                    $category => collect(config("service_pricing_structures.{$category}", config('service_pricing_structures.default')))
                        ->map(fn (string $value) => [
                            'value' => $value,
                            'label' => __("config-service-units.{$value}"),
                        ])
                        ->values()
                        ->all(),
                ])
                ->all(),
            'copy' => __('overview'),
        ]);
    })->name('overview');

    Route::redirect('/vendor/profile', '/overview')->name('vendor.profile');
    Route::patch('/vendor', [VendorController::class, 'update'])->name('vendor.update');

    Route::get('/services/create', [ServiceController::class, 'create'])->name('services.create');
    Route::get('/services/{service}', [ServiceController::class, 'show'])->name('services.show');

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
            in_array($slug, config('reserved_vendor_slugs'), true)
            || Vendor::query()
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

        return to_route('services.create');
    })->name('onboarding.vendor.store');
});

Route::get('/{vendorSlug}/services/{serviceSlug}', [PublicBookingPageController::class, 'showService'])
    ->where([
        'vendorSlug' => '[a-z0-9]+(?:-[a-z0-9]+)*',
        'serviceSlug' => '[a-z0-9]+(?:-[a-z0-9]+)*',
    ])
    ->name('public.booking.service.show');

Route::get('/{vendorSlug}', [PublicBookingPageController::class, 'showVendor'])
    ->where('vendorSlug', '[a-z0-9]+(?:-[a-z0-9]+)*')
    ->name('public.booking.show');
