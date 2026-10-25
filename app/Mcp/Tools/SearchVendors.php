<?php

namespace App\Mcp\Tools;

use App\Models\Vendor;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\JsonSchema\Types\Type;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Description(<<<'TEXT'
Search existing vendors by name, slug or location. Use this before creating a vendor to check the business isn't already in the catalog, and to check a slug is still free.

Matches are case-insensitive and partial. Returns at most 20 vendors, each with whether it is claimed (has an owner account) and its public URL.
TEXT)]
#[IsReadOnly]
class SearchVendors extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): ResponseFactory
    {
        $validated = $request->validate([
            'query' => ['required', 'string', 'max:120'],
        ]);

        $vendors = Vendor::query()
            ->where(fn (Builder $query) => $query
                ->whereLike('name', "%{$validated['query']}%")
                ->orWhereLike('slug', "%{$validated['query']}%")
                ->orWhereLike('location', "%{$validated['query']}%"))
            ->orderBy('name')
            ->limit(20)
            ->get();

        return Response::structured([
            'vendors' => $vendors->map(fn (Vendor $vendor) => [
                'name' => $vendor->name,
                'slug' => $vendor->slug,
                'location' => $vendor->location,
                'is_claimed' => $vendor->isClaimed(),
                'public_url' => route('public.booking.show', $vendor->slug),
            ])->all(),
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
            'query' => $schema->string()->description('Part of the business name, slug or location, such as "fotobooth" or "Utrecht".')->required(),
        ];
    }
}
