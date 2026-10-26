<?php

namespace App\Mcp\Tools;

use App\Models\Vendor;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Http\UploadedFile;
use Illuminate\JsonSchema\Types\Type;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description(<<<'TEXT'
Set or replace the logo of an unclaimed vendor with a file uploaded through `request-vendor-logo-upload`. Claimed vendors manage their own logo, so this tool refuses them.

The file must be an image (JPG, PNG, GIF, BMP or WebP) of at most 2048 KB. A file that fails this check is deleted; request a new upload to try again.

Returns the logo URL and the vendor's public URL.
TEXT)]
class SetVendorLogo extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response|ResponseFactory
    {
        $validated = $request->validate([
            'vendor_slug' => ['required', 'string', Rule::exists('vendors', 'slug')],
            'upload_key' => ['required', 'string'],
        ], [
            'vendor_slug.exists' => 'No vendor has this slug. Use search-vendors to find the vendor, or create-vendor to add it.',
        ]);

        $vendor = Vendor::query()->where('slug', $validated['vendor_slug'])->firstOrFail();

        if ($vendor->isClaimed()) {
            return Response::error("The vendor \"{$vendor->slug}\" is claimed by its owner, who manages its logo. Logos can only be set for unclaimed vendors.");
        }

        $uploadKey = $validated['upload_key'];

        if (! Str::isUuid(Str::after($uploadKey, "logo-uploads/{$vendor->uuid}/"))) {
            return Response::error("This upload_key does not belong to the vendor \"{$vendor->slug}\". Use the upload_key from request-vendor-logo-upload for this vendor.");
        }

        if (! Storage::disk('r2')->exists($uploadKey)) {
            return Response::error('No file was uploaded to this upload_key. Upload the logo to the upload_url first, or request a new upload if it expired.');
        }

        $logoFile = tmpfile();
        stream_copy_to_stream(Storage::disk('r2')->readStream($uploadKey), $logoFile);
        $logo = new UploadedFile(stream_get_meta_data($logoFile)['uri'], basename($uploadKey), test: true);

        $validator = Validator::make(['logo' => $logo], [
            'logo' => ['image', 'max:2048'],
        ], [
            'logo.image' => 'The uploaded file is not a JPG, PNG, GIF, BMP or WebP image.',
            'logo.max' => 'The uploaded file is larger than 2048 KB.',
        ]);

        if ($validator->fails()) {
            Storage::disk('r2')->delete($uploadKey);

            return Response::error($validator->errors()->first('logo').' The upload was deleted. Request a new upload to try again.');
        }

        $filename = Str::uuid().".{$logo->extension()}";
        $logoPath = Storage::disk('r2')->putFileAs("vendors/{$vendor->uuid}/logo", $logo, $filename, 'public');

        if (! $logoPath) {
            return Response::error('The logo could not be stored. Try set-vendor-logo again.');
        }

        Storage::disk('r2')->delete($uploadKey);

        if ($vendor->logo_path) {
            Storage::disk('r2')->delete($vendor->logo_path);
        }

        $vendor->update([
            'logo_path' => $logoPath,
        ]);

        return Response::structured([
            'logo_url' => Storage::disk('r2')->url($logoPath),
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
            'vendor_slug' => $schema->string()->description('The slug of the unclaimed vendor whose logo to set.')->required(),
            'upload_key' => $schema->string()->description('The upload_key returned by request-vendor-logo-upload.')->required(),
        ];
    }
}
