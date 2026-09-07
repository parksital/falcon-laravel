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
use Illuminate\Support\Number;
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

        $service->loadMissing(['customCategory', 'media', 'prices.features']);
        $categoryLabel = $service->category === 'other'
            ? $service->customCategory?->name
            : __("config-service-categories.{$service->category}");

        if ($categoryLabel === "config-service-categories.{$service->category}") {
            $categoryLabel = $service->category;
        }

        $priceFeatureLabels = $this->priceFeatureLabels();

        return Inertia::render('ServiceDetailsPage', [
            'vendor' => $vendor->only('name'),
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'category_label' => $categoryLabel ?: $service->category,
                'is_public' => (bool) $service->is_public,
                'media' => $service->media
                    ->map(fn ($media) => [
                        'id' => $media->id,
                        'url' => Storage::disk('r2')->url($media->path),
                        'sort_order' => $media->sort_order,
                    ])
                    ->values()
                    ->all(),
                'pricing_options' => $service->prices
                    ->map(fn ($pricingOption) => [
                        'id' => $pricingOption->id,
                        'name' => $pricingOption->name,
                        'description' => $pricingOption->description,
                        'price_in_minor' => $pricingOption->price_in_minor,
                        'formatted_amount' => Number::currency($pricingOption->price_in_minor / 100, 'EUR', app()->getLocale()),
                        'currency' => $pricingOption->currency,
                        'pricing_mode' => $pricingOption->pricing_mode,
                        'pricing_mode_label' => $this->pricingModeLabel($pricingOption->pricing_mode),
                        'pricing_unit' => $pricingOption->pricing_unit,
                        'pricing_unit_label' => $this->pricingUnitLabel($pricingOption->pricing_unit),
                        'features' => $pricingOption->features
                            ->map(fn ($feature) => [
                                'id' => $feature->id,
                                'feature_key' => $feature->feature_key,
                                'label' => $this->priceFeatureLabels()[$feature->feature_key] ?? $feature->feature_key,
                                'is_included' => $feature->is_included,
                                'value' => $feature->value,
                                'sort_order' => $feature->sort_order,
                            ])
                            ->values()
                            ->all(),
                    ])
                    ->values()
                    ->all(),
                    'formatted_created_at' => $service->created_at->translatedFormat(__('service-details.created_at_date_format'))
            ],
            'priceFeatures' => collect($this->priceFeaturesForCategory($service->category))
                ->map(fn (string $value) => [
                    'value' => $value,
                    'label' => $priceFeatureLabels[$value] ?? $value,
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

        $service = DB::transaction(function () use ($request, $vendor, $validated) {
            $service = $vendor->services()->create([
                'uuid' => Str::uuid(),
                'public_id' => $this->makePublicId(),
                'name' => $validated['name'],
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
                    'name' => $pricingOptionData['name'] ?? 'Price '.($sortOrder + 1),
                    'description' => $pricingOptionData['description'] ?? null,
                    'price_in_minor' => $pricingOptionData['price_in_minor'],
                    'pricing_mode' => $pricingOptionData['pricing_mode'],
                    'pricing_unit' => $pricingOptionData['pricing_mode'] === 'variable'
                        ? $pricingOptionData['pricing_unit']
                        : null,
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
                    'path' => Storage::disk('r2')->putFile("vendors/{$vendor->uuid}/services/{$service->uuid}/images", $media, 'public'),
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

        DB::transaction(function () use ($service, $validated) {
            $service->update([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'is_public' => $validated['is_public'] ?? $service->is_public,
            ]);

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
                        'pricing_mode' => $pricingOptionData['pricing_mode'],
                        'pricing_unit' => $pricingOptionData['pricing_mode'] === 'variable'
                            ? $pricingOptionData['pricing_unit']
                            : null,
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

        if ($service->prices()->count() >= 3) {
            throw ValidationException::withMessages([
                'pricing_mode' => __('service-details.validation_price_limit'),
            ]);
        }

        $sortOrder = ($service->prices()->max('sort_order') ?? -1) + 1;

        DB::transaction(function () use ($service, $validated, $sortOrder) {
            $price = $service->prices()->create([
                'name' => $validated['name'] ?? 'Price '.($sortOrder + 1),
                'description' => $validated['description'] ?? null,
                'price_in_minor' => $validated['price_in_minor'],
                'pricing_mode' => $validated['pricing_mode'],
                'pricing_unit' => $validated['pricing_mode'] === 'variable'
                    ? $validated['pricing_unit']
                    : null,
                'sort_order' => $sortOrder,
            ]);

            foreach ($validated['features'] ?? [] as $featureSortOrder => $featureData) {
                $price->features()->create([
                    'feature_key' => $featureData['feature_key'],
                    'is_included' => $featureData['is_included'] ?? true,
                    'value' => $featureData['value'] ?? null,
                    'sort_order' => $featureSortOrder,
                ]);
            }
        });

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

        DB::transaction(function () use ($pricingOption, $validated) {
            $pricingOption->update([
                'name' => $validated['name'] ?? 'Price '.($pricingOption->sort_order + 1),
                'description' => $validated['description'] ?? null,
                'price_in_minor' => $validated['price_in_minor'],
                'pricing_mode' => $validated['pricing_mode'],
                'pricing_unit' => $validated['pricing_mode'] === 'variable'
                    ? $validated['pricing_unit']
                    : null,
            ]);

            $pricingOption->features()->delete();

            foreach ($validated['features'] ?? [] as $featureSortOrder => $featureData) {
                $pricingOption->features()->create([
                    'feature_key' => $featureData['feature_key'],
                    'is_included' => $featureData['is_included'] ?? true,
                    'value' => $featureData['value'] ?? null,
                    'sort_order' => $featureSortOrder,
                ]);
            }
        });

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

    private function makePublicId(): string
    {
        do {
            $publicId = 'svc_'.Str::lower(Str::random(10));
        } while (Service::query()->where('public_id', $publicId)->exists());

        return $publicId;
    }

    private function pricingModeLabel(?string $mode): ?string
    {
        if (! $mode) {
            return null;
        }

        return match ($mode) {
            'fixed' => __('service-details.pricing_mode_fixed_label'),
            'variable' => __('service-details.pricing_mode_variable_label'),
            default => $mode,
        };
    }

    private function pricingUnitLabel(?string $unit): ?string
    {
        if (! $unit) {
            return null;
        }

        $translation = __("config-service-pricing-units.{$unit}");

        return $translation === "config-service-pricing-units.{$unit}" ? $unit : $translation;
    }

    private function priceFeatureLabels(): array
    {
        return collect(config('service_categories'))
            ->pluck('price_features')
            ->flatten()
            ->filter()
            ->unique()
            ->mapWithKeys(function (string $value) {
                $translation = __("config-service-price-features.{$value}");

                return [
                    $value => $translation === "config-service-price-features.{$value}" ? $value : $translation,
                ];
            })
            ->all();
    }

    private function priceFeaturesForCategory(string $category): array
    {
        return config("service_categories.{$category}.price_features", []);
    }
}
