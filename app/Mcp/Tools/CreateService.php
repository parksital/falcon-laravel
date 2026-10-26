<?php

namespace App\Mcp\Tools;

use App\Models\Service;
use App\Models\Vendor;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description(<<<'TEXT'
Create a service for an unclaimed vendor. Claimed vendors manage their own services, so this tool refuses them.

Use the category keys, price feature keys, pricing units and pricing option limit from `get-catalog-schema`. Use category "other" with a custom_category when no category fits.

Prices are in euro cents: €149.50 is 14950. A fixed price is the total price; a variable price is charged per pricing_unit.

The service is public straight away unless is_public is false. Returns the new service's ID, public ID and public URL.
TEXT)]
class CreateService extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response|ResponseFactory
    {
        $validated = $request->validate([
            'vendor_slug' => ['required', 'string', Rule::exists('vendors', 'slug')],
            'name' => ['required', 'string', 'max:120'],
            'category' => ['required', 'string', Rule::in(array_keys(config('service_categories')))],
            'custom_category' => ['nullable', 'required_if:category,other', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_public' => ['boolean'],
            'pricing_options' => ['sometimes', 'array', 'max:3'],
            'pricing_options.*.name' => ['nullable', 'string', 'max:120'],
            'pricing_options.*.description' => ['nullable', 'string', 'max:2000'],
            'pricing_options.*.price_in_minor' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'pricing_options.*.pricing_mode' => ['required', 'string', Rule::in(['fixed', 'variable'])],
            'pricing_options.*.pricing_unit' => ['nullable', 'required_if:pricing_options.*.pricing_mode,variable', 'string', Rule::in(config('service_pricing_units'))],
            'pricing_options.*.features' => ['sometimes', 'array'],
            'pricing_options.*.features.*.feature_key' => ['required', 'string', Rule::in(config("service_categories.{$request->get('category')}.price_features", []))],
            'pricing_options.*.features.*.is_included' => ['boolean'],
            'pricing_options.*.features.*.value' => ['nullable', 'string', 'max:120'],
        ], [
            'vendor_slug.exists' => 'No vendor has this slug. Use search-vendors to find the vendor, or create-vendor to add it.',
            'pricing_options.*.pricing_unit.required_if' => 'A variable price needs a pricing_unit.',
            'pricing_options.*.features.*.feature_key.in' => 'This feature key is not allowed for the chosen category. Use the price_features of the category from get-catalog-schema.',
        ]);

        $vendor = Vendor::query()->where('slug', $validated['vendor_slug'])->firstOrFail();

        if ($vendor->isClaimed()) {
            return Response::error("The vendor \"{$vendor->slug}\" is claimed by its owner, who manages its services. Services can only be created for unclaimed vendors.");
        }

        $service = DB::transaction(function () use ($vendor, $validated) {
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

        return Response::structured([
            'id' => $service->id,
            'public_id' => $service->public_id,
            'is_public' => $service->is_public,
            'public_url' => route('public.booking.service.show', [$vendor->slug, $service->public_id]),
        ]);
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'vendor_slug' => $schema->string()->description('The slug of the unclaimed vendor that offers the service.')->required(),
            'name' => $schema->string()->description('The service name.')->max(120)->required(),
            'category' => $schema->string()->enum(array_keys(config('service_categories')))->description('The service category key.')->required(),
            'custom_category' => $schema->string()->description('The category name when category is "other".')->max(120),
            'description' => $schema->string()->description('What the service includes.')->max(2000),
            'is_public' => $schema->boolean()->description('Whether the service is shown on the public booking page.')->default(true),
            'pricing_options' => $schema->array()->max(3)->items($schema->object([
                'name' => $schema->string()->description('The pricing option name, such as "Basic" or "3 hours". Defaults to "Price 1", "Price 2", and so on.')->max(120),
                'description' => $schema->string()->description('What this pricing option includes.')->max(2000),
                'price_in_minor' => $schema->integer()->description('The price in euro cents.')->min(0)->required(),
                'pricing_mode' => $schema->string()->enum(['fixed', 'variable'])->description('"fixed" for a total price, "variable" for a price per pricing_unit.')->required(),
                'pricing_unit' => $schema->string()->enum(config('service_pricing_units'))->description('What a variable price is charged per. Required when pricing_mode is "variable".'),
                'features' => $schema->array()->items($schema->object([
                    'feature_key' => $schema->string()->description('A price feature key of the category.')->required(),
                    'is_included' => $schema->boolean()->description('Whether the feature is included in this pricing option.')->default(true),
                    'value' => $schema->string()->description('An optional detail, such as "unlimited" for prints.')->max(120),
                ])),
            ])),
        ];
    }

    private function makePublicId(): string
    {
        do {
            $publicId = 'svc_'.Str::lower(Str::random(10));
        } while (Service::query()->where('public_id', $publicId)->exists());

        return $publicId;
    }
}
