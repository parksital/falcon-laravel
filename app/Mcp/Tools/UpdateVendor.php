<?php

namespace App\Mcp\Tools;

use App\Models\Vendor;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Illuminate\Validation\Rule;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description(<<<'TEXT'
Update the details of an unclaimed vendor. Claimed vendors manage their own details, so this tool refuses them.

Only the fields you pass are changed. Pass null for short_description, contact_email, contact_phone or website_url to clear it. The slug can't be changed.

Returns the vendor's ID, slug and public URL.
TEXT)]
class UpdateVendor extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response|ResponseFactory
    {
        $validated = $request->validate([
            'vendor_slug' => ['required', 'string', Rule::exists('vendors', 'slug')],
            'name' => ['sometimes', 'string', 'max:120'],
            'location' => ['sometimes', 'string', 'max:120'],
            'short_description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'contact_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'contact_phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'website_url' => ['sometimes', 'nullable', 'url:http,https', 'max:2048'],
        ], [
            'vendor_slug.exists' => 'No vendor has this slug. Use search-vendors to find the vendor.',
        ]);

        $vendor = Vendor::query()->where('slug', $validated['vendor_slug'])->firstOrFail();

        if ($vendor->isClaimed()) {
            return Response::error("The vendor \"{$vendor->slug}\" is claimed by its owner, who manages its details. Only unclaimed vendors can be updated.");
        }

        unset($validated['vendor_slug']);

        $vendor->update($validated);

        return Response::structured([
            'id' => $vendor->id,
            'slug' => $vendor->slug,
            'public_url' => route('public.booking.show', $vendor->slug),
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
            'vendor_slug' => $schema->string()->description('The slug of the unclaimed vendor to update.')->required(),
            'name' => $schema->string()->description('The business name.')->max(120),
            'location' => $schema->string()->description('The city or region the business operates from, such as "Utrecht".')->max(120),
            'short_description' => $schema->string()->description('A short description of the business.')->max(2000)->nullable(),
            'contact_email' => $schema->string()->description('The business contact email address.')->nullable(),
            'contact_phone' => $schema->string()->description('The business contact phone number.')->nullable(),
            'website_url' => $schema->string()->description('The business website, starting with http:// or https://.')->nullable(),
        ];
    }
}
