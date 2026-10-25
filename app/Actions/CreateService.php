<?php

namespace App\Actions;

use App\Models\Service;
use App\Models\Vendor;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CreateService
{
    /**
     * Get the validation rules used to create a service. Price features depend on the category.
     *
     * @return array<string, array<mixed>>
     */
    public static function rules(string $category): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'category' => ['required', 'string', Rule::in(array_keys(config('service_categories')))],
            'custom_category' => ['nullable', 'required_if:category,other', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'pricing_options' => ['sometimes', 'array', 'max:3'],
            'pricing_options.*.name' => ['nullable', 'string', 'max:120'],
            'pricing_options.*.description' => ['nullable', 'string', 'max:2000'],
            'pricing_options.*.price_in_minor' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'pricing_options.*.pricing_mode' => ['required', 'string', Rule::in(['fixed', 'variable'])],
            'pricing_options.*.pricing_unit' => ['nullable', 'required_if:pricing_options.*.pricing_mode,variable', 'string', Rule::in(config('service_pricing_units'))],
            'pricing_options.*.features' => ['sometimes', 'array'],
            'pricing_options.*.features.*.feature_key' => ['required', 'string', Rule::in(config("service_categories.{$category}.price_features", []))],
            'pricing_options.*.features.*.is_included' => ['boolean'],
            'pricing_options.*.features.*.value' => ['nullable', 'string', 'max:120'],
            'is_public' => ['boolean'],
        ];
    }

    /**
     * Create a service with its custom category, pricing options and their features from validated input.
     *
     * @param  array<string, mixed>  $validated
     */
    public function handle(Vendor $vendor, array $validated): Service
    {
        return DB::transaction(function () use ($vendor, $validated) {
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

            return $service;
        });
    }

    private function makePublicId(): string
    {
        do {
            $publicId = 'svc_'.Str::lower(Str::random(10));
        } while (Service::query()->where('public_id', $publicId)->exists());

        return $publicId;
    }
}
