<?php

namespace App\Mcp\Tools;

use App\Models\Service;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description(<<<'TEXT'
Update a service of an unclaimed vendor. Claimed vendors manage their own services, so this tool refuses them.

Only the fields you pass are changed. The category can't be changed; custom_category can only be set on a service in the "other" category.

Passing pricing_options replaces all of the service's pricing options with the ones you pass; pass an empty array to remove them. Use the price feature keys and pricing units from `get-catalog-schema`. Prices are in euro cents: €149.50 is 14950.

Returns the service's ID, public ID and public URL.
TEXT)]
class UpdateService extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response|ResponseFactory
    {
        $category = Service::query()->where('public_id', $request->get('service_public_id'))->value('category');

        $validated = $request->validate([
            'service_public_id' => ['required', 'string', Rule::exists('services', 'public_id')],
            'name' => ['sometimes', 'string', 'max:120'],
            'custom_category' => ['sometimes', Rule::prohibitedIf($category !== 'other'), 'string', 'max:120'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'is_public' => ['sometimes', 'boolean'],
            'pricing_options' => ['sometimes', 'array'],
            'pricing_options.*.name' => ['nullable', 'string', 'max:120'],
            'pricing_options.*.description' => ['nullable', 'string', 'max:2000'],
            'pricing_options.*.price_in_minor' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'pricing_options.*.pricing_mode' => ['required', 'string', Rule::in(['fixed', 'variable'])],
            'pricing_options.*.pricing_unit' => ['nullable', 'required_if:pricing_options.*.pricing_mode,variable', 'string', Rule::in(config('service_pricing_units'))],
            'pricing_options.*.features' => ['sometimes', 'array'],
            'pricing_options.*.features.*.feature_key' => ['required', 'string', Rule::in(config("service_categories.{$category}.price_features", []))],
            'pricing_options.*.features.*.is_included' => ['boolean'],
            'pricing_options.*.features.*.value' => ['nullable', 'string', 'max:120'],
        ], [
            'service_public_id.exists' => 'No service has this public ID. Use the public_id returned by create-service.',
            'custom_category.prohibited' => 'Only a service in the "other" category has a custom_category.',
            'pricing_options.*.pricing_unit.required_if' => 'A variable price needs a pricing_unit.',
            'pricing_options.*.features.*.feature_key.in' => 'This feature key is not allowed for the service\'s category. Use the price_features of the category from get-catalog-schema.',
        ]);

        $service = Service::query()->with('vendor')->where('public_id', $validated['service_public_id'])->firstOrFail();
        $vendor = $service->vendor;

        if ($vendor->isClaimed()) {
            return Response::error("The vendor \"{$vendor->slug}\" is claimed by its owner, who manages its services. Only services of unclaimed vendors can be updated.");
        }

        DB::transaction(function () use ($service, $validated) {
            $service->update(collect($validated)->only(['name', 'description', 'is_public'])->all());

            if (array_key_exists('custom_category', $validated)) {
                $service->customCategory()->updateOrCreate([], [
                    'name' => $validated['custom_category'],
                ]);
            }

            if (array_key_exists('pricing_options', $validated)) {
                $service->prices()->delete();

                foreach ($validated['pricing_options'] as $sortOrder => $pricingOptionData) {
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
            }
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
            'service_public_id' => $schema->string()->description('The public ID of the service to update, such as "svc_xxxxxxxxxx".')->required(),
            'name' => $schema->string()->description('The service name.')->max(120),
            'custom_category' => $schema->string()->description('The category name, only for a service in the "other" category.')->max(120),
            'description' => $schema->string()->description('What the service includes.')->max(2000)->nullable(),
            'is_public' => $schema->boolean()->description('Whether the service is shown on the public booking page.'),
            'pricing_options' => $schema->array()->description('Replaces all of the service\'s pricing options.')->items($schema->object([
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
}
