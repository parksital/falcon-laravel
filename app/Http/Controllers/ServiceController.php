<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\StoreServicePricingOptionRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Service;
use App\Models\ServicePricingOption;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            'pricingStructuresByCategory' => collect(array_keys(config('service_categories')))
                ->mapWithKeys(function (string $category) {
                    return [
                        $category => collect($this->pricingStructuresForCategory($category))
                            ->map(fn (string $value) => [
                                'value' => $value,
                                'label' => __("create-service.pricing_structure_{$value}_label"),
                                'unitLabel' => __("config-service-units.{$value}"),
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

        $service->loadMissing(['customCategory', 'pricingOptions']);
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
                'pricing_options' => $service->pricingOptions
                    ->map(fn ($pricingOption) => [
                        'id' => $pricingOption->id,
                        'name' => $pricingOption->name,
                        'description' => $pricingOption->description,
                        'price_in_minor' => $pricingOption->price_in_minor,
                        'unit' => $pricingOption->unit,
                        'unit_label' => __("config-service-units.{$pricingOption->unit}") === "config-service-units.{$pricingOption->unit}"
                            ? $pricingOption->unit
                            : __("config-service-units.{$pricingOption->unit}"),
                        'is_public' => (bool) $pricingOption->is_public,
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

        $service = DB::transaction(function () use ($vendor, $validated, $slug) {
            $service = $vendor->services()->create([
                'name' => $validated['name'],
                'slug' => $slug,
                'category' => $validated['category'],
                'description' => $validated['description'] ?? null,
                'is_public' => $validated['is_public'] ?? false,
            ]);

            if ($validated['category'] === 'other') {
                $service->customCategory()->create([
                    'name' => $validated['custom_category'],
                ]);
            }

            foreach ($validated['pricing_options'] ?? [] as $sortOrder => $pricingOptionData) {
                $service->pricingOptions()->create([
                    'name' => $pricingOptionData['name'] ?? $validated['name'],
                    'description' => $pricingOptionData['description'] ?? null,
                    'price_in_minor' => $pricingOptionData['price_in_minor'],
                    'unit' => $pricingOptionData['unit'],
                    'sort_order' => $sortOrder,
                    'is_public' => $validated['is_public'] ?? false,
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
                $pricingOptions = $service->pricingOptions()->get()->keyBy('id');
                $submittedPricingOptionIds = collect($validated['pricing_options'])
                    ->pluck('id')
                    ->filter()
                    ->values();

                foreach ($submittedPricingOptionIds as $pricingOptionId) {
                    abort_unless($pricingOptions->has($pricingOptionId), 404);
                }

                if ($submittedPricingOptionIds->isEmpty()) {
                    $service->pricingOptions()->delete();
                } else {
                    $service->pricingOptions()
                        ->whereNotIn('id', $submittedPricingOptionIds)
                        ->delete();
                }

                foreach ($validated['pricing_options'] as $sortOrder => $pricingOptionData) {
                    $pricingOption = ($pricingOptionData['id'] ?? null)
                        ? $pricingOptions->get($pricingOptionData['id'])
                        : null;

                    $pricingOptionAttributes = [
                        'name' => $pricingOptionData['name'] ?? $pricingOption?->name ?? $validated['name'],
                        'description' => array_key_exists('description', $pricingOptionData)
                            ? $pricingOptionData['description']
                            : $pricingOption?->description,
                        'price_in_minor' => $pricingOptionData['price_in_minor'],
                        'unit' => $pricingOptionData['unit'],
                        'sort_order' => $sortOrder,
                        'is_public' => $validated['is_public'] ?? false,
                    ];

                    if ($pricingOption) {
                        $pricingOption->update($pricingOptionAttributes);
                    } else {
                        $service->pricingOptions()->create($pricingOptionAttributes);
                    }
                }
            }
        });

        return to_route('overview');
    }

    public function storePricingOption(StoreServicePricingOptionRequest $request, Service $service)
    {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return to_route('onboarding');
        }

        abort_unless($service->vendor_id === $vendor->id, 404);

        $validated = $request->validated();

        if (
            $validated['unit'] === 'package'
            && $service->pricingOptions()->where('unit', 'package')->count() >= 3
        ) {
            throw ValidationException::withMessages([
                'unit' => __('service-details.validation_package_limit'),
            ]);
        }

        $service->pricingOptions()->create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price_in_minor' => $validated['price_in_minor'],
            'unit' => $validated['unit'],
            'sort_order' => ($service->pricingOptions()->max('sort_order') ?? -1) + 1,
            'is_public' => $validated['is_public'] ?? false,
        ]);

        return to_route('services.show', $service)->with('success', __('service-details.price_saved'));
    }

    public function updatePricingOption(StoreServicePricingOptionRequest $request, Service $service, ServicePricingOption $pricingOption)
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
            'unit' => $validated['unit'],
            'is_public' => $validated['is_public'] ?? false,
        ]);

        return to_route('services.show', $service)->with('success', __('service-details.price_updated'));
    }

    public function destroyPricingOption(Request $request, Service $service, ServicePricingOption $pricingOption)
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

    private function pricingStructuresForCategory(string $category): array
    {
        return config("service_categories.{$category}.pricing_structures", []);
    }
}
