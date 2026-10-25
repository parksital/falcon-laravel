<?php

namespace App\Mcp\Tools;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Description(<<<'TEXT'
Get the valid values for the Huurmaar catalog. Call this first, before searching or creating vendors and services.

Returns:
- categories: the service category keys, each with the price feature keys a pricing option in that category may use.
- pricing_units: the units a variable price is charged per.
- max_pricing_options_per_service: how many pricing options a service can have.
- vendor_slug: the rules for a vendor slug, which is also the vendor's public URL path. A slug must match the pattern, be at most max_length characters, be unique across vendors and not be one of the reserved slugs.
TEXT)]
#[IsReadOnly]
class GetCatalogSchema extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): ResponseFactory
    {
        return Response::structured([
            'categories' => collect(config('service_categories'))
                ->map(fn (array $category, string $key) => [
                    'key' => $key,
                    'price_features' => $category['price_features'] ?? [],
                ])
                ->values()
                ->all(),
            'pricing_units' => config('service_pricing_units'),
            'max_pricing_options_per_service' => 3,
            'vendor_slug' => [
                'pattern' => '^[a-z0-9_]+(?:-[a-z0-9_]+)*$',
                'max_length' => 120,
                'reserved' => config('reserved_vendor_slugs'),
            ],
        ]);
    }
}
