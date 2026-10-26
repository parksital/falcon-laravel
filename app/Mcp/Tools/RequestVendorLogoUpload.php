<?php

namespace App\Mcp\Tools;

use App\Models\Vendor;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description(<<<'TEXT'
Start setting or replacing the logo of an unclaimed vendor. Claimed vendors manage their own logo, so this tool refuses them.

Returns a presigned upload_url, valid for 10 minutes, and an upload_key. Upload the logo file yourself with an HTTP PUT of the raw file to upload_url, for example `curl -T logo.png "<upload_url>"`. Then call `set-vendor-logo` with the upload_key to check the file and use it as the logo.

The logo must be an image (JPG, PNG, GIF, BMP or WebP) of at most 2048 KB.
TEXT)]
class RequestVendorLogoUpload extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response|ResponseFactory
    {
        $validated = $request->validate([
            'vendor_slug' => ['required', 'string', Rule::exists('vendors', 'slug')],
        ], [
            'vendor_slug.exists' => 'No vendor has this slug. Use search-vendors to find the vendor, or create-vendor to add it.',
        ]);

        $vendor = Vendor::query()->where('slug', $validated['vendor_slug'])->firstOrFail();

        if ($vendor->isClaimed()) {
            return Response::error("The vendor \"{$vendor->slug}\" is claimed by its owner, who manages its logo. Logos can only be set for unclaimed vendors.");
        }

        $uploadKey = "logo-uploads/{$vendor->uuid}/".Str::uuid();
        $expiresAt = now()->addMinutes(10);

        ['url' => $uploadUrl] = Storage::disk('r2')->temporaryUploadUrl($uploadKey, $expiresAt);

        return Response::structured([
            'upload_url' => $uploadUrl,
            'upload_key' => $uploadKey,
            'expires_at' => $expiresAt->toIso8601String(),
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
            'vendor_slug' => $schema->string()->description('The slug of the unclaimed vendor whose logo to set.')->required(),
        ];
    }
}
