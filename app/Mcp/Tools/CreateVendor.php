<?php

namespace App\Mcp\Tools;

use App\Models\Vendor;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description(<<<'TEXT'
Create an unclaimed vendor (a business without an owner account). Check with `search-vendors` first that the business and slug aren't already in the catalog.

The slug becomes the vendor's public URL path and must follow the `vendor_slug` rules from `get-catalog-schema`.

Returns the new vendor's ID, slug and public URL.
TEXT)]
class CreateVendor extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): ResponseFactory
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => [
                'required',
                'string',
                'max:120',
                'regex:/^[a-z0-9_]+(?:-[a-z0-9_]+)*$/',
                Rule::notIn(config('reserved_vendor_slugs')),
                Rule::unique('vendors', 'slug'),
            ],
            'location' => ['nullable', 'string', 'max:120'],
            'short_description' => ['nullable', 'string', 'max:2000'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'website_url' => ['nullable', 'url:http,https', 'max:2048'],
        ], [
            'slug.regex' => 'The slug may only contain lowercase letters, numbers and underscores, separated by single hyphens.',
            'slug.not_in' => 'This slug is reserved. Choose another slug.',
            'slug.unique' => 'This slug is already taken by another vendor. Choose another slug.',
        ]);

        $vendor = Vendor::create([
            'uuid' => (string) Str::uuid(),
            'user_id' => null,
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'location' => $validated['location'] ?? '',
            'short_description' => $validated['short_description'] ?? null,
            'contact_email' => $validated['contact_email'] ?? null,
            'contact_phone' => $validated['contact_phone'] ?? null,
            'website_url' => $validated['website_url'] ?? null,
        ]);

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
            'name' => $schema->string()->description('The business name.')->max(120)->required(),
            'slug' => $schema->string()->description('The public URL path, such as "fotobooth-utrecht".')->max(120)->required(),
            'location' => $schema->string()->description('The city or region the business operates from, such as "Utrecht".')->max(120),
            'short_description' => $schema->string()->description('A short description of the business.')->max(2000),
            'contact_email' => $schema->string()->description('The business contact email address.'),
            'contact_phone' => $schema->string()->description('The business contact phone number.'),
            'website_url' => $schema->string()->description('The business website, starting with http:// or https://.'),
        ];
    }
}
