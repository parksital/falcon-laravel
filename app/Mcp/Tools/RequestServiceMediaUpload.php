<?php

namespace App\Mcp\Tools;

use App\Models\Service;
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
Start adding an image to a service of an unclaimed vendor. Claimed vendors manage their own services, so this tool refuses them.

Returns a presigned upload_url, valid for 10 minutes, and an upload_key. Upload the image file yourself with an HTTP PUT of the raw file to upload_url, for example `curl -T photo.jpg "<upload_url>"`. Then call `add-service-media` with the upload_key to check the file and add it to the service.

A service has at most 3 images. Each image must be a JPG, PNG, GIF, BMP or WebP file of at most 4096 KB. Request one upload per image.
TEXT)]
class RequestServiceMediaUpload extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response|ResponseFactory
    {
        $validated = $request->validate([
            'service_public_id' => ['required', 'string', Rule::exists('services', 'public_id')],
        ], [
            'service_public_id.exists' => 'No service has this public ID. Use the public_id returned by create-service.',
        ]);

        $service = Service::query()->with('vendor')->withCount('media')->where('public_id', $validated['service_public_id'])->firstOrFail();
        $vendor = $service->vendor;

        if ($vendor->isClaimed()) {
            return Response::error("The vendor \"{$vendor->slug}\" is claimed by its owner, who manages its services. Images can only be added to services of unclaimed vendors.");
        }

        if ($service->media_count >= 3) {
            return Response::error("The service \"{$service->public_id}\" already has 3 images, the maximum.");
        }

        $uploadKey = "service-media-uploads/{$service->uuid}/".Str::uuid();
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
            'service_public_id' => $schema->string()->description('The public ID of the service to add an image to, like svc_xxxxxxxxxx.')->required(),
        ];
    }
}
