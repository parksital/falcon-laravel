<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\StoreServicePriceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Service;
use App\Models\ServicePrice;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function create(Request $request)
    {
        $vendor = $request->user()
            ->vendor()
            ->first(['id', 'name']);

        if (! $vendor) {
            return to_route('onboarding');
        }

        $serviceCategoryLabels = collect(array_keys(config('service_categories')))
            ->mapWithKeys(function (string $value) {
                $translation = __("config-service-categories.{$value}");

                return [
                    $value => $translation === "config-service-categories.{$value}" ? $value : $translation,
                ];
            })
            ->all();

        return Inertia::render('CreateServicePage', [
            'vendor' => $vendor,
            'serviceCategories' => collect(array_keys(config('service_categories')))
                ->map(fn (string $value) => [
                    'value' => $value,
                    'label' => $serviceCategoryLabels[$value] ?? $value,
                ])
                ->values()
                ->all(),
            'priceTypesByCategory' => collect(array_keys(config('service_categories')))
                ->mapWithKeys(function (string $category) {
                    return [
                        $category => collect($this->priceTypesForCategory($category))
                            ->map(fn (string $value) => [
                                'value' => $value,
                                'label' => __("create-service.price_type_{$value}_label"),
                                'priceTypeLabel' => __("config-service-price-types.{$value}"),
                            ])
                            ->values()
                            ->all(),
                    ];
                })
                ->all(),
            'priceFeaturesByCategory' => collect(array_keys(config('service_categories')))
                ->mapWithKeys(function (string $category) {
                    return [
                        $category => collect($this->priceFeaturesForCategory($category))
                            ->map(fn (string $value) => [
                                'value' => $value,
                                'label' => __("config-service-price-features.{$value}") === "config-service-price-features.{$value}"
                                    ? $value
                                    : __("config-service-price-features.{$value}"),
                            ])
                            ->values()
                            ->all(),
                    ];
                })
                ->all(),
            'locale' => app()->getLocale(),
            'copy' => __('create-service'),
        ]);
    }

    public function show(Request $request, Service $service)
    {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return to_route('onboarding');
        }

        abort_unless($service->vendor_id === $vendor->id, 404);

        $service->loadMissing(['customCategory', 'prices']);
        $categoryLabel = $service->category === 'other'
            ? $service->customCategory?->name
            : __("config-service-categories.{$service->category}");

        if ($categoryLabel === "config-service-categories.{$service->category}") {
            $categoryLabel = $service->category;
        }

        return Inertia::render('ServiceDetailsPage', [
            'vendor' => $vendor->only('name'),
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'category' => $service->category,
                'custom_category' => $service->customCategory?->name,
                'description' => $service->description,
                'category_label' => $categoryLabel ?: $service->category,
                'is_public' => (bool) $service->is_public,
                'pricing_options' => $service->prices
                    ->map(fn ($pricingOption) => [
                        'id' => $pricingOption->id,
                        'name' => $pricingOption->name,
                        'description' => $pricingOption->description,
                        'price_in_minor' => $pricingOption->price_in_minor,
                        'pricing_type' => $pricingOption->pricing_type,
                        'price_type_label' => __("config-service-price-types.{$pricingOption->pricing_type}") === "config-service-price-types.{$pricingOption->pricing_type}"
                            ? $pricingOption->pricing_type
                            : __("config-service-price-types.{$pricingOption->pricing_type}"),
                    ])
                    ->values()
                    ->all(),
            ],
            'serviceCategories' => collect(array_keys(config('service_categories')))
                ->map(fn (string $value) => [
                    'value' => $value,
                    'label' => __("config-service-categories.{$value}") === "config-service-categories.{$value}"
                        ? $value
                        : __("config-service-categories.{$value}"),
                ])
                ->values()
                ->all(),
            'locale' => app()->getLocale(),
            'copy' => __('service-details'),
        ]);
    }

    public function store(StoreServiceRequest $request)
    {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return to_route('onboarding');
        }

        $validated = $request->validated();
        $slug = $this->makeSlug($vendor, $validated['name']);

        $service = DB::transaction(function () use ($request, $vendor, $validated, $slug) {
            $service = $vendor->services()->create([
                'name' => $validated['name'],
                'slug' => $slug,
                'category' => $validated['category'],
                'description' => $validated['description'] ?? null,
                'is_public' => $validated['is_public'] ?? true,
            ]);

            if ($validated['category'] === 'other') {
                $service->customCategory()->create([
                    'name' => $validated['custom_category'],
                ]);
            }

            foreach ($validated['pricing_options'] ?? [] as $sortOrder => $pricingOptionData) {
                $price = $service->prices()->create([
                    'name' => $pricingOptionData['name'] ?? $validated['name'],
                    'description' => $pricingOptionData['description'] ?? null,
                    'price_in_minor' => $pricingOptionData['price_in_minor'],
                    'pricing_type' => $pricingOptionData['pricing_type'],
                    'sort_order' => $sortOrder,
                ]);

                foreach ($pricingOptionData['features'] ?? [] as $featureSortOrder => $featureData) {
                    $price->features()->create([
                        'feature_key' => $featureData['feature_key'],
                        'is_included' => $featureData['is_included'] ?? true,
                        'value' => $featureData['value'] ?? null,
                        'sort_order' => $featureSortOrder,
                    ]);
                }
            }

            foreach ($request->file('media', []) as $sortOrder => $media) {
                $service->media()->create([
                    'path' => Storage::disk('r2')->putFile('service-media', $media, 'public'),
                    'sort_order' => $sortOrder,
                ]);
            }

            return $service;
        });

        return to_route('services.show', $service)->with('success', __('create-service.saved'));
    }

    public function update(UpdateServiceRequest $request, Service $service)
    {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return to_route('onboarding');
        }

        abort_unless($service->vendor_id === $vendor->id, 404);

        $validated = $request->validated();
        $slug = $this->makeSlug($vendor, $validated['name'], $service);

        DB::transaction(function () use ($service, $validated, $slug) {
            $service->update([
                'name' => $validated['name'],
                'slug' => $slug,
                'category' => $validated['category'],
                'description' => $validated['description'] ?? null,
                'is_public' => $validated['is_public'] ?? false,
            ]);

            if ($validated['category'] === 'other') {
                $service->customCategory()->updateOrCreate([], [
                    'name' => $validated['custom_category'],
                ]);
            } else {
                $service->customCategory()->delete();
            }

            if (array_key_exists('pricing_options', $validated)) {
                $prices = $service->prices()->get()->keyBy('id');
                $submittedPricingOptionIds = collect($validated['pricing_options'])
                    ->pluck('id')
                    ->filter()
                    ->values();

                foreach ($submittedPricingOptionIds as $pricingOptionId) {
                    abort_unless($prices->has($pricingOptionId), 404);
                }

                if ($submittedPricingOptionIds->isEmpty()) {
                    $service->prices()->delete();
                } else {
                    $service->prices()
                        ->whereNotIn('id', $submittedPricingOptionIds)
                        ->delete();
                }

                foreach ($validated['pricing_options'] as $sortOrder => $pricingOptionData) {
                    $pricingOption = ($pricingOptionData['id'] ?? null)
                        ? $prices->get($pricingOptionData['id'])
                        : null;

                    $pricingOptionAttributes = [
                        'name' => $pricingOptionData['name'] ?? $pricingOption?->name ?? $validated['name'],
                        'description' => array_key_exists('description', $pricingOptionData)
                            ? $pricingOptionData['description']
                            : $pricingOption?->description,
                        'price_in_minor' => $pricingOptionData['price_in_minor'],
                        'pricing_type' => $pricingOptionData['pricing_type'],
                        'sort_order' => $sortOrder,
                    ];

                    if ($pricingOption) {
                        $pricingOption->update($pricingOptionAttributes);
                    } else {
                        $service->prices()->create($pricingOptionAttributes);
                    }
                }
            }
        });

        return to_route('overview');
    }

    public function storePricingOption(StoreServicePriceRequest $request, Service $service)
    {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return to_route('onboarding');
        }

        abort_unless($service->vendor_id === $vendor->id, 404);

        $validated = $request->validated();

        if (
            $validated['pricing_type'] === 'package'
            && $service->prices()->where('pricing_type', 'package')->count() >= 3
        ) {
            throw ValidationException::withMessages([
                'pricing_type' => __('service-details.validation_package_limit'),
            ]);
        }

        $service->prices()->create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price_in_minor' => $validated['price_in_minor'],
            'pricing_type' => $validated['pricing_type'],
            'sort_order' => ($service->prices()->max('sort_order') ?? -1) + 1,
        ]);

        return to_route('services.show', $service)->with('success', __('service-details.price_saved'));
    }

    public function updatePricingOption(StoreServicePriceRequest $request, Service $service, ServicePrice $pricingOption)
    {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return to_route('onboarding');
        }

        abort_unless($service->vendor_id === $vendor->id, 404);
        abort_unless($pricingOption->service_id === $service->id, 404);

        $validated = $request->validated();

        $pricingOption->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price_in_minor' => $validated['price_in_minor'],
            'pricing_type' => $validated['pricing_type'],
        ]);

        return to_route('services.show', $service)->with('success', __('service-details.price_updated'));
    }

    public function destroyPricingOption(Request $request, Service $service, ServicePrice $pricingOption)
    {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return to_route('onboarding');
        }

        abort_unless($service->vendor_id === $vendor->id, 404);
        abort_unless($pricingOption->service_id === $service->id, 404);

        $pricingOption->delete();

        return to_route('services.show', $service)->with('success', __('service-details.price_deleted'));
    }

    public function destroy(Request $request, Service $service)
    {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return to_route('onboarding');
        }

        abort_unless($service->vendor_id === $vendor->id, 404);

        $request->validate([
            'confirmation_name' => ['required', 'string', Rule::in([$service->name])],
        ], [
            'confirmation_name.in' => __('overview.delete_service_confirmation_mismatch'),
        ]);

        $service->delete();

        return to_route('overview')->with('success', __('overview.delete_service_deleted'));
    }

    private function makeSlug(Vendor $vendor, string $name, ?Service $service = null): string
    {
        $baseSlug = Str::slug($name) ?: 'service';
        $slug = $baseSlug;
        $suffix = 1;

        while (
            $vendor->services()
                ->where('slug', $slug)
                ->when($service, fn ($query) => $query->whereKeyNot($service->id))
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }

    private function priceTypesForCategory(string $category): array
    {
        return config("service_categories.{$category}.price_types", []);
    }

    private function priceFeaturesForCategory(string $category): array
    {
        return config("service_categories.{$category}.price_features", []);
    }
}
