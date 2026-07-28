<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ServiceController extends Controller
{
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

            $service->pricingOptions()->create([
                'name' => $validated['name'],
                'description' => null,
                'price_in_minor' => $validated['price_in_minor'],
                'unit' => $validated['unit'],
                'is_public' => $validated['is_public'] ?? false,
            ]);
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
                $pricingOptionAttributes = [
                    'name' => $validated['name'],
                    'price_in_minor' => $pricingOptionData['price_in_minor'],
                    'unit' => $pricingOptionData['unit'],
                    'sort_order' => $sortOrder,
                    'is_public' => $validated['is_public'] ?? false,
                ];

                if ($pricingOptionData['id']) {
                    $pricingOptions->get($pricingOptionData['id'])->update($pricingOptionAttributes);
                } else {
                    $service->pricingOptions()->create([
                        ...$pricingOptionAttributes,
                        'description' => null,
                    ]);
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
            'price_in_minor' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'unit' => ['required', 'string', Rule::in(config('service_units'))],
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
            'pricing_options' => ['required', 'array', 'min:1'],
            'pricing_options.*.id' => ['nullable', 'integer', 'distinct'],
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
