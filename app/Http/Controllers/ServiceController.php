<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
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

        return Inertia::render('CreateServicePage', [
            'vendor' => $vendor,
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
            'copy' => __('create-service'),
        ]);
    }

    public function store(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return to_route('onboarding');
        }

        $validated = $this->validateService($request);
        $slug = $this->makeSlug($vendor, $validated['name']);

        DB::transaction(function () use ($vendor, $validated, $slug) {
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

            foreach ($validated['pricing_options'] as $sortOrder => $pricingOptionData) {
                $service->pricingOptions()->create([
                    'name' => $pricingOptionData['name'],
                    'description' => $pricingOptionData['description'] ?? null,
                    'price_in_minor' => $pricingOptionData['price_in_minor'],
                    'unit' => $pricingOptionData['unit'],
                    'sort_order' => $sortOrder,
                    'is_public' => $validated['is_public'] ?? false,
                ]);
            }
        });

        return to_route('overview');
    }

    public function update(Request $request, Service $service)
    {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return to_route('onboarding');
        }

        abort_unless($service->vendor_id === $vendor->id, 404);

        $validated = $this->validateServiceUpdate($request);
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
        });

        return to_route('overview');
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

        return to_route('overview');
    }

    private function validateService(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'category' => ['required', 'string', Rule::in(config('service_categories'))],
            'custom_category' => ['nullable', 'required_if:category,other', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'pricing_options' => ['required', 'array', 'min:1', 'max:1'],
            'pricing_options.*.name' => ['required', 'string', 'max:120'],
            'pricing_options.*.description' => ['nullable', 'string', 'max:2000'],
            'pricing_options.*.price_in_minor' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'pricing_options.*.unit' => ['required', 'string', Rule::in(config('service_units'))],
            'is_public' => ['boolean'],
        ]);
    }

    private function validateServiceUpdate(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'category' => ['required', 'string', Rule::in(config('service_categories'))],
            'custom_category' => ['nullable', 'required_if:category,other', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'pricing_options' => ['required', 'array', 'min:1', 'max:1'],
            'pricing_options.*.id' => ['nullable', 'integer', 'distinct'],
            'pricing_options.*.name' => ['nullable', 'string', 'max:120'],
            'pricing_options.*.description' => ['nullable', 'string', 'max:2000'],
            'pricing_options.*.price_in_minor' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'pricing_options.*.unit' => ['required', 'string', Rule::in(config('service_units'))],
            'is_public' => ['boolean'],
        ]);
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
}
